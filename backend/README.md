# Portfolio RAG backend

FastAPI service behind the portfolio chat widget. Answers questions about Abhishek with
retrieval-augmented generation over the resume PDF in `data/`, using a local Ollama model.

```
data/*.pdf ─► PyMuPDF text ─► resume-aware chunks ─► embeddings (nomic-embed-text) + BM25 index

question ─► embed + keywords ─► hybrid top-3 chunks ─► qwen2.5:3b ─► streamed answer
```

Chunking (`ingest.py`): sections are split on ALL-CAPS headings; inside a section every job,
degree or project becomes its own chunk (detected by date ranges or "Title. Description" lines),
and very short entries of one section (e.g. education rows) are merged. Preview the chunks with
`.\.venv\Scripts\python.exe ingest.py`.

## How a question is handled

1. "you/your/yourself" is read as Abhishek ("tell me about yourself" → "tell me about Abhishek").
2. Long misspelt words are corrected against the resume's vocabulary for search only ("ecommnerce" → "ecommerce").
3. **Off-topic gate:** no person mentioned and no resume word matched → instant fixed reply, no LLM call.
4. Hybrid search picks the top-3 chunks; the Summary chunk is always added for vague questions.
   Per-section "overview" chunks (all projects, all jobs) answer broad questions like "what projects has he built?".
5. The LLM answers from those excerpts. If it starts to refuse, the server swaps in the exact fixed text
   (`NOT_FOUND` / `OFF_TOPIC` in `rag.py`) and stops generating, and no sources are shown.

## Run locally

```powershell
# one-time
ollama pull nomic-embed-text
ollama pull qwen2.5:3b
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# every time (Ollama must be running)
.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000
```

Then start the site in another terminal: `cd ..\frontend; npm run dev`.
Vite proxies `/api` to `localhost:8000`. If the backend is down, the widget falls back
to in-browser keyword search automatically.

Check status: http://localhost:8000/api/health

## Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/health` | – | model and index status |
| POST | `/api/chat` | `{"question": "...", "history": [{"role": "user", "content": "..."}]}` | NDJSON stream: `sources`, then `token` events, then `done` (or `error`) |

## Settings (environment variables)

| Variable | Default | Notes |
|---|---|---|
| `CHAT_MODEL` | `qwen2.5:3b` | `qwen2.5:7b` gives better Hinglish, but is ~2–3× slower on CPU |
| `EMBED_MODEL` | `nomic-embed-text` | |
| `OLLAMA_URL` | `http://localhost:11434` | |
| `TOP_K` | `3` | chunks sent to the model |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:4173` | add your live domain when deploying |
| `RATE_LIMIT_PER_MIN` | `15` | per IP |

## Updating the resume

Replace the PDF in `data/` (any file name, several PDFs are fine). The next chat request notices
the change and re-indexes automatically, with no restart needed. After changing `ingest.py` itself,
restart the server.
