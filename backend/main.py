"""FastAPI backend for the portfolio chat: POST /api/chat streams a RAG answer from local Ollama."""
import json
import logging
import os
import re
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from rag import NOT_FOUND, OFF_TOPIC, ResumeRAG

log = logging.getLogger("uvicorn.error")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173").split(",")
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MIN", "15"))

rag = ResumeRAG()


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        await rag.build_index()
        log.info("Indexed %d chunks from %s", len(rag.chunks), [p[0] for p in rag.indexed])
        await rag.warm_up()
        log.info("Chat model loaded")
    except Exception as e:  # keep serving /api/health so the problem is visible
        log.error("Could not build index — is Ollama running and the embed model pulled? %s", e)
    yield
    await rag.client.aclose()


app = FastAPI(title="Portfolio RAG", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])


class Turn(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(max_length=2000)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    history: list[Turn] = Field(default_factory=list, max_length=12)


_hits: dict[str, deque] = defaultdict(deque)


def _check_rate(ip: str) -> None:
    now, q = time.monotonic(), _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        raise HTTPException(429, "Too many questions — please wait a minute.")
    q.append(now)


@app.get("/api/health")
async def health():
    try:
        return await rag.health()
    except Exception as e:
        raise HTTPException(503, f"Ollama not reachable: {e}")


_YOU = [
    (r"\b(are|were) you\b", r"is Abhishek"), (r"\b(do|did|have) you\b", r"\1 Abhishek"),
    (r"\byourself\b", "Abhishek"), (r"\byours\b", "Abhishek's"), (r"\byour\b", "Abhishek's"),
    (r"\babout you\b", "about Abhishek"),
]


def _you_means_abhishek(q: str) -> str:
    for pattern, repl in _YOU:
        q = re.sub(pattern, repl, q, flags=re.I)
    return q


async def _fixed_reply(text: str):
    yield json.dumps({"type": "sources", "sources": []}) + "\n"
    yield json.dumps({"type": "token", "text": text}) + "\n"
    yield json.dumps({"type": "done"}) + "\n"


@app.post("/api/chat")
async def chat(req: ChatRequest, request: Request):
    _check_rate(request.client.host if request.client else "unknown")
    try:
        if await rag.ensure_fresh():  # first request, or a PDF in data/ changed
            log.info("Re-indexed %d chunks from %s", len(rag.chunks), [p[0] for p in rag.indexed])
    except FileNotFoundError as e:
        raise HTTPException(503, str(e))
    except Exception:
        raise HTTPException(503, "Index not ready — is Ollama running?")

    # In this chat "you" means Abhishek: "tell me about yourself" -> "tell me about Abhishek".
    question = _you_means_abhishek(req.question)
    search_q = rag.correct_typos(question)  # "ecommnerce webstie" -> "ecommerce website", for retrieval only
    history = [t.model_dump() for t in req.history]

    # Clearly not about Abhishek (no person mentioned, no resume word): answer instantly, skip the LLM.
    if not history and rag.is_off_topic(search_q):
        return StreamingResponse(_fixed_reply(OFF_TOPIC), media_type="application/x-ndjson")

    try:
        # Follow-ups like "and before that?" need the previous question to retrieve the right chunks.
        prev = next((t.content for t in reversed(req.history) if t.role == "user"), "")
        query = f"{prev} {search_q}" if prev and len(question.split()) <= 8 else search_q
        hits, cited = await rag.retrieve(query)
        if query != search_q:
            cited = []  # a combined follow-up query can't reliably say which chunk the answer came from
    except Exception as e:
        raise HTTPException(503, f"Embedding failed: {e}")

    sources = [{"id": h["id"], "source": h["source"], "score": round(h["score"], 3)} for h in cited]

    async def events():
        # NDJSON stream: one JSON object per line. Sources go last so they can be dropped for refusals.
        # The first few words are held back: if the model starts a refusal, we send our exact fixed text
        # instead of its copy (a small model once mistyped the email address in it).
        buffer, decided, refused = "", False, False
        gen = rag.stream_answer(question, hits, history)
        try:
            async for token in gen:
                if decided:
                    yield json.dumps({"type": "token", "text": token}) + "\n"
                    continue
                buffer += token
                if len(buffer.strip()) < 24:
                    continue
                decided = True
                start = buffer.strip()
                for fixed in (NOT_FOUND, OFF_TOPIC):
                    if start.startswith(fixed[:20]):
                        refused = True
                        yield json.dumps({"type": "token", "text": fixed}) + "\n"
                        break
                if refused:
                    break  # stop generating; the fixed text is the whole answer
                yield json.dumps({"type": "token", "text": buffer}) + "\n"
            if not decided and buffer:  # very short answer
                refused = buffer.strip().startswith((NOT_FOUND[:20], OFF_TOPIC[:20]))
                yield json.dumps({"type": "token", "text": NOT_FOUND if refused else buffer}) + "\n"
            yield json.dumps({"type": "sources", "sources": [] if refused else sources}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
        except Exception as e:
            log.exception("Generation failed")
            yield json.dumps({"type": "error", "message": str(e)}) + "\n"
        finally:
            await gen.aclose()  # closes the Ollama request too, so it stops generating

    return StreamingResponse(events(), media_type="application/x-ndjson", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
