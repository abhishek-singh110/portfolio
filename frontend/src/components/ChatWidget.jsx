import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { knowledge, profile, suggestions } from '../data/profile'
import { buildIndex } from '../retriever'
import { checkHealth, streamChat } from '../chatApi'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const CONTACT_RE = /(contact|email|mail|phone|call|reach|hire|linkedin|sampark|resume|cv)/i

const GREETING = {
  from: 'bot',
  text: "Hi there! 👋 I'm Abhishek's assistant. Ask me anything about his experience, projects or skills — I answer straight from his resume.",
}

const CONTACT_ACTIONS = [
  { label: '✉ Email', href: `mailto:${profile.email}` },
  { label: 'in LinkedIn', href: profile.linkedin, external: true },
  { label: '↓ Resume', href: profile.resume, download: true },
]

function BotIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="2.6" r="1.2" fill="currentColor" />
      <rect x="4" y="6.5" width="16" height="12" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9.2" cy="12.3" r="1.5" fill="currentColor" />
      <circle cx="14.8" cy="12.3" r="1.5" fill="currentColor" />
      <path d="M9.5 15.6c1.4.9 3.6.9 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 11v3M22 11v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function ChatWidget() {
  const index = useMemo(() => buildIndex(knowledge), [])
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const [unread, setUnread] = useState(true)
  // 'checking' → probing the RAG backend; 'ai' → local Ollama answers; 'offline' → in-browser keyword search
  const [mode, setMode] = useState('checking')
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Show the "Ask about Abhishek" bubble a few seconds after load.
  const [dismissed, setDismissed] = useState(false)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) { wasOpen.current = true; return }
    if (dismissed) return
    // 3s after page load, or 1.5s after the chat is closed
    const t = setTimeout(() => setTeaser(true), wasOpen.current ? 1500 : 3000)
    return () => clearTimeout(t)
  }, [open, dismissed])

  // Let other parts of the page open the chat.
  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('open-chat', onOpen)
    return () => window.removeEventListener('open-chat', onOpen)
  }, [])

  useEffect(() => {
    if (open && mode === 'checking') checkHealth().then((ok) => setMode(ok ? 'ai' : 'offline'))
  }, [open, mode])

  useEffect(() => {
    if (!open) return
    setTeaser(false); setUnread(false)
    const t = setTimeout(() => inputRef.current?.focus(), 250)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const closeTeaser = (e) => {
    e.stopPropagation()
    setTeaser(false)
    setDismissed(true)
  }

  // Instant canned replies for small talk (no need to wait for the LLM).
  function quickReply(q) {
    const t = q.toLowerCase()
    if (/^\s*(hi|hello|hey|hii+|namaste|good (morning|afternoon|evening))\b/.test(t) && t.split(/\s+/).length <= 4) {
      return { text: 'Hello! 😊 You can ask me where Abhishek works, what he has built with AI, his skills, or how to contact him.' }
    }
    if (/\b(thanks|thank you|thx|great|awesome|cool|ok|okay)\b/.test(t) && t.split(/\s+/).length <= 5) {
      return { text: "You're welcome! If you'd like to talk to Abhishek directly, here's how to reach him:", actions: CONTACT_ACTIONS }
    }
    return null
  }

  // Fallback when the RAG backend is unavailable: in-browser keyword search.
  function localReply(q) {
    const hits = index.search(q, 3)
    if (!hits.length) {
      return { text: "Hmm, I couldn't find that in Abhishek's resume. Try asking about his current job, AI projects, skills or education — or reach him directly:", actions: CONTACT_ACTIONS }
    }
    const text = hits[0].text + (hits[1] && hits[1].score > 0.6 ? ' ' + hits[1].text : '')
    const sources = hits.slice(0, hits[1] && hits[1].score > 0.6 ? 2 : 1).map((h) => h.source)
    return { text, sources, actions: hits[0].id === 'contact' ? CONTACT_ACTIONS : null }
  }

  const addBot = (msg) => setMessages((m) => [...m, { from: 'bot', ...msg }])
  const patchLast = (fn) => setMessages((m) => [...m.slice(0, -1), fn(m[m.length - 1])])

  async function send(q) {
    const text = q.trim()
    if (!text || typing) return
    const history = messages.slice(1).map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })).slice(-6)
    setInput('')
    setMessages((m) => [...m, { from: 'user', text }])
    setTyping(true)

    const quick = quickReply(text)
    let useAI = mode === 'ai'
    if (mode === 'checking') useAI = await checkHealth().then((ok) => (setMode(ok ? 'ai' : 'offline'), ok))

    if (quick || !useAI) {
      await wait(500 + Math.random() * 400)
      addBot(quick || localReply(text))
      setTyping(false)
      return
    }

    let sources = []
    let answer = ''
    let started = false
    try {
      await streamChat({
        question: text,
        history,
        onSources: (s) => { sources = s },
        onToken: (t) => {
          answer += t
          if (!started) {
            started = true
            setTyping(false)
            addBot({ text: t, streaming: true })
          } else {
            patchLast((m) => ({ ...m, text: m.text + t }))
          }
        },
      })
      // Contact buttons for contact questions, and when the resume doesn't have the answer.
      const contact = CONTACT_RE.test(text) || sources.some((s) => /contact/i.test(s.source)) || /don't have that information/i.test(answer)
      if (started) {
        patchLast((m) => ({ ...m, streaming: false, sources: sources.length ? sources.map((s) => s.source) : null, actions: contact ? CONTACT_ACTIONS : null }))
      } else {
        addBot(localReply(text))
      }
    } catch (e) {
      if (e.status === 429) {
        addBot({ text: "You're asking quickly! Please wait a minute and try again. 🙂" })
      } else {
        // Backend went away mid-session: switch to the in-browser fallback for the rest of it.
        setMode('offline')
        if (started) patchLast((m) => ({ ...m, streaming: false }))
        else addBot(localReply(text))
      }
    } finally {
      setTyping(false)
    }
  }

  const asked = new Set(messages.filter((m) => m.from === 'user').map((m) => m.text))
  const remaining = suggestions.filter((s) => !asked.has(s))

  return (
    <div className="chatw">
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatw-panel"
            role="dialog"
            aria-label="Chat with Abhishek's assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="chatw-head">
              <span className="chatw-avatar"><BotIcon size={22} /></span>
              <div>
                <b>Ask about Abhishek</b>
                <small><i className={mode === 'ai' ? '' : 'off'} /> {mode === 'ai' ? 'AI-powered · local LLM (Ollama)' : mode === 'checking' ? 'Connecting…' : 'Online · instant answers'}</small>
              </div>
              <button className="chatw-x" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
            </div>

            <div className="chatw-list" ref={listRef}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`msg ${m.from}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {m.from === 'bot' && <span className="msg-avatar"><BotIcon size={16} /></span>}
                  <div className="bubble">
                    <p>{m.text}{m.streaming && <span className="stream-caret" />}</p>
                    {m.sources && <small className="msg-src">Source: {m.sources.join(' · ')}</small>}
                    {m.actions && (
                      <div className="msg-actions">
                        {m.actions.map((a) => (
                          <a key={a.label} href={a.href} {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...(a.download ? { download: true } : {})}>
                            {a.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="msg bot">
                  <span className="msg-avatar"><BotIcon size={16} /></span>
                  <div className="bubble typing"><i /><i /><i /></div>
                </div>
              )}
            </div>

            {remaining.length > 0 && !typing && (
              <div className="chatw-suggest">
                {remaining.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
              </div>
            )}

            <form className="chatw-input" onSubmit={(e) => { e.preventDefault(); send(input) }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Type your question"
              />
              <button type="submit" disabled={!input.trim() || typing} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor" /></svg>
              </button>
            </form>
            <p className="chatw-foot">{mode === 'ai' ? "RAG over Abhishek's resume · runs on a private local model" : "Answers come from Abhishek's resume · private, nothing is sent anywhere"}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {teaser && !open && (
          <div className="chatw-teaser" onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}>
            <span className="wave">👋</span>
            <div>
              <b>Hi! Ask me about Abhishek</b>
              <small>Experience, projects, skills…</small>
            </div>
            <button onClick={closeTeaser} aria-label="Dismiss">✕</button>
          </div>
      )}

      <motion.button
        className={`chatw-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat: ask about Abhishek'}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'bot'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'grid' }}
          >
            {open ? <span className="fab-x">✕</span> : <BotIcon size={28} />}
          </motion.span>
        </AnimatePresence>
        {unread && !open && <span className="fab-dot">1</span>}
      </motion.button>
    </div>
  )
}
