# Abhishek Singh · Portfolio

Personal portfolio of **Abhishek Singh**, Backend & GenAI Engineer. Built with React, and it has a built-in
**RAG chatbot** that answers recruiters' questions about him from his resume PDF, using a **local LLM (Ollama)**.
No external AI API is called, so the data stays private.

```
port/
├── frontend/   React + Vite site (portfolio pages + chat widget)
└── backend/    FastAPI RAG service (resume PDF → chunks → embeddings → Ollama answers)
```

## Features

- **Portfolio site:** hero with photo, impact stats, experience timeline, projects, skills, education and contact,
  in light and dark themes, responsive, with motion that respects "reduce motion".
- **"Ask about Abhishek" chat widget:** floating button with a greeting bubble; answers stream word by word with sources.
- **RAG over the resume PDF:** drop a PDF in `backend/data/` and it is parsed, chunked by section and entry, embedded,
  and searched with hybrid retrieval (embeddings + keywords).
- **Graceful fallback:** if the backend is offline, the widget switches to an in-browser keyword search, so the site never breaks.
- **Guardrails:** off-topic questions get a short fixed reply, "not in resume" answers point to contact details,
  plus typo-tolerant search, rate limiting and CORS.

## Tech stack

| Part | Tech |
|---|---|
| Frontend | React 18, Vite, Framer Motion, plain CSS |
| Backend | Python, FastAPI, httpx, PyMuPDF |
| AI | Ollama, `nomic-embed-text` (embeddings), `qwen2.5` (chat), BM25 + cosine hybrid search |

## Quick start (local)

**Prerequisites:** Node.js 18+, Python 3.11+, [Ollama](https://ollama.com) running.

```powershell
# 1) Models (one time)
ollama pull nomic-embed-text
ollama pull qwen2.5:7b          # or qwen2.5:3b for faster answers on CPU (set CHAT_MODEL)

# 2) Backend  → http://localhost:8000
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000

# 3) Frontend → http://localhost:5173  (in a second terminal)
cd frontend
npm install
npm run dev
```

In development, Vite forwards `/api` requests to the backend on port 8000. Open the chat: the header shows
**"AI-powered · local LLM (Ollama)"** when the backend is connected.

> macOS/Linux: use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.

## Configuration

Both apps work without any configuration. To change settings, copy the example files:

| File | What it controls |
|---|---|
| [`backend/.env.example`](backend/.env.example) | model names, Ollama URL, allowed origins (CORS), rate limit. Run with `--env-file .env` |
| [`frontend/.env.example`](frontend/.env.example) | `VITE_CHAT_API`: backend URL when it is hosted somewhere else |

`.env` files are git-ignored. Never commit real secrets.

## Updating the content

| To change… | Edit |
|---|---|
| Chatbot knowledge | Replace the PDF in `backend/data/`. It re-indexes automatically on the next question |
| Website text (jobs, projects, skills) | [`frontend/src/data/profile.js`](frontend/src/data/profile.js) |
| Photo | `frontend/public/profile.png` |
| Downloadable resume | `frontend/public/Abhishek_Singh_Resume.pdf` |

The website text and the chatbot's PDF are separate. Update both when the resume changes.

## Build & deploy

```powershell
cd frontend
npm run build        # static site in frontend/dist/
```

- **Frontend:** deploy `frontend/dist/` to any static host (Netlify, Vercel, GitHub Pages).
- **Backend:** needs a machine running Ollama, such as a VPS or your own PC exposed through a tunnel. Set
  `ALLOWED_ORIGINS` to your site's URL, and build the frontend with `VITE_CHAT_API` pointing to the backend.
- Without a hosted backend, the live site still works: the chat uses the in-browser fallback.

More backend details (how a question is handled, API endpoints, chunking): [`backend/README.md`](backend/README.md).


