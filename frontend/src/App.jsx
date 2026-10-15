import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import HeroPhoto from './components/HeroPhoto'
import ChatWidget from './components/ChatWidget'
import { About, Contact, Education, Experience, Projects, Skills, Stats } from './components/Sections'
import { profile } from './data/profile'

const NAV = [['about', 'About'], ['experience', 'Experience'], ['projects', 'Work'], ['skills', 'Skills'], ['contact', 'Contact']]

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || null)
  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme
      try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
    }
  }, [theme])
  const isDark = theme ? theme === 'dark' : !window.matchMedia('(prefers-color-scheme: light)').matches
  return [isDark, () => setTheme(isDark ? 'light' : 'dark')]
}

function Nav() {
  const [isDark, toggle] = useTheme()
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <header className="nav">
      <motion.div className="progress" style={{ scaleX: progress }} />
      <div className="wrap nav-inner">
        <a className="logo" href="#top">Abhishek Singh<span>.</span></a>
        <nav className={open ? 'open' : ''}>
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} aria-label="Toggle colour theme">{isDark ? '☀' : '☾'}</button>
          <a className="btn small" href={profile.resume} download>Resume</a>
          <button className="icon-btn menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? '✕' : '☰'}</button>
        </div>
      </div>
    </header>
  )
}

const word = {
  hidden: { y: '110%' },
  show: (i) => ({ y: 0, transition: { delay: 0.1 + i * 0.12, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } }),
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="grid-bg" aria-hidden />
      <div className="glow" aria-hidden />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <motion.p className="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <b /> Available for backend / AI roles · {profile.location}
          </motion.p>
          <h1>
            {['Abhishek', 'Singh.'].map((w, i) => (
              <span className="line" key={w}>
                <motion.span custom={i} variants={word} initial="hidden" animate="show" className={i ? 'serif' : ''}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="hero-tag" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }}>
            {profile.role}. I build <mark>secure RAG systems</mark>, local LLM pipelines and production Django / FastAPI services that keep private data private.
          </motion.p>
          <motion.div className="btns" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }}>
            <a className="btn primary" href="#projects">See my work →</a>
            <a className="btn ghost" href={`mailto:${profile.email}`}>Get in touch</a>
            <button className="btn ghost" onClick={() => window.dispatchEvent(new Event('open-chat'))}>💬 Chat with my assistant</button>
          </motion.div>
          <motion.p className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            ↳ Have a question? Chat with my assistant anytime from the button in the bottom corner.
          </motion.p>
        </div>
        <HeroPhoto />
      </div>
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              Python ✦ Django ✦ FastAPI ✦ RAG ✦ Ollama ✦ LangChain ✦ FAISS ✦ PostgreSQL ✦ Redis ✦ Celery ✦ WebSockets ✦ Docker ✦ AWS ✦&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <footer className="footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Designed &amp; built by Abhishek Singh.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
      <ChatWidget />
    </>
  )
}
