// Client for the RAG backend (backend/main.py). In dev, Vite proxies /api to localhost:8000.
const API = (import.meta.env.VITE_CHAT_API || '/api').replace(/\/$/, '')

export async function checkHealth() {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 3000)
  try {
    const r = await fetch(`${API}/health`, { signal: ctrl.signal })
    if (!r.ok) return false
    const h = await r.json()
    return Boolean(h.chat_model_ready && h.embed_model_ready && h.indexed_chunks > 0)
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}

/** Streams an answer. Calls onSources once, then onToken for each chunk of text. Throws on failure. */
export async function streamChat({ question, history, onSources, onToken }) {
  const r = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  })
  if (!r.ok || !r.body) {
    const detail = await r.json().catch(() => ({}))
    throw Object.assign(new Error(detail.detail || `HTTP ${r.status}`), { status: r.status })
  }
  const reader = r.body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += value
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      if (!line.trim()) continue
      const ev = JSON.parse(line)
      if (ev.type === 'sources') onSources(ev.sources)
      else if (ev.type === 'token') onToken(ev.text)
      else if (ev.type === 'error') throw new Error(ev.message)
    }
  }
}
