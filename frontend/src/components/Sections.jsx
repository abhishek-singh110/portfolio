import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import Reveal, { SectionHead } from './Reveal'
import { education, extras, jobs, profile, projects, quickFacts, skillGroups, stats } from '../data/profile'

/* ---------- Stats ---------- */
function Counter({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  return <b ref={ref}>{prefix}{n}{suffix}</b>
}

export function Stats() {
  return (
    <section className="stats-band">
      <div className="wrap stats">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="stat">
            <Counter {...s} />
            <span>{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- About ---------- */
export function About() {
  return (
    <section id="about">
      <div className="wrap about">
        <SectionHead index="01" label="About" title={<>Backend engineer who ships <em>AI to production.</em></>} />
        <div className="about-grid">
          <Reveal className="about-text">
            <p>I've spent 4+ years building the parts of software people rarely see but always feel: systems that stay fast, data that stays accurate, and services that keep working at 3 a.m.</p>
            <p>Lately my focus has been <strong>AI that respects data</strong>: chatbots and assistants that run on a company's own machines, so sensitive documents never leave the building. At Iota Analytics I used this to automate patent review and cut manual work by roughly 70%.</p>
            <p>I'm looking for a backend / AI engineering role where reliability and privacy matter as much as the demo.</p>
          </Reveal>
          <Reveal delay={0.1} className="principles">
            {[
              ['Privacy by default', 'Company data stays inside the company unless there is a good reason to share it.'],
              ['Reliable over flashy', 'Well-tested systems that keep working as more people use them.'],
              ['Measure the impact', 'Hours saved, speed gained, accuracy improved: results over adjectives.'],
            ].map(([t, d], i) => (
              <div key={t} className="principle">
                <span>0{i + 1}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- Experience timeline ---------- */
export function Experience() {
  return (
    <section id="experience">
      <div className="wrap">
        <SectionHead index="02" label="Experience" title={<>From building APIs to <em>applied AI.</em></>}>
          Three companies, 4+ years, and a steady move from core backend work into Generative AI.
        </SectionHead>
        <div className="log">
          {jobs.map((j, i) => (
            <Reveal key={j.company} delay={i * 0.05} className={`commit ${j.current ? 'current' : ''}`}>
              <div className="commit-rail"><span className="node" /></div>
              <div className="commit-card">
                <div className="commit-meta">
                  {j.current && <span className="branch">● Current role</span>}
                  <span className="when">{j.when}</span>
                  <span className="when">· {j.place}</span>
                </div>
                <h3>{j.role} <span>at {j.company}</span></h3>
                <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul>
                <div className="tags">{j.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Projects ---------- */
function Spotlight({ children, className }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return <article ref={ref} onMouseMove={onMove} className={className}>{children}</article>
}

export function Projects() {
  return (
    <section id="projects">
      <div className="wrap">
        <SectionHead index="03" label="Selected work" title={<>Projects that made <em>a difference.</em></>}>
          What each project does, who it helped, and the result.
        </SectionHead>
        <div className="projects">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.08} className={p.featured ? 'span-2' : ''}>
              <Spotlight className={`proj ${p.featured ? 'feature' : ''}`}>
                <div className="proj-top">
                  <span className="category">{p.category}</span>
                  <span className="kicker">{p.kicker}</span>
                </div>
                <h3>{p.title}</h3>
                <div className={p.featured ? 'feature-body' : ''}>
                  {p.metric && (
                    <div className="metric"><b>{p.metric.value}</b><span>{p.metric.label}</span></div>
                  )}
                  <div>
                    <p className="desc">{p.desc}</p>
                    {p.flow && (
                      <div className="flow" aria-label="How it works">
                        {p.flow.map((f, k) => (
                          <span key={f} className="flow-step" style={{ '--d': `${k * 0.6}s` }}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="impact"><b>Impact</b>{p.impact}</p>
                <div className="tags" aria-label="Technologies used">{p.stack.map((t) => <span key={t}>{t}</span>)}</div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Skills ---------- */
export function Skills() {
  const [tab, setTab] = useState(skillGroups[0].key)
  const group = skillGroups.find((g) => g.key === tab)
  return (
    <section id="skills">
      <div className="wrap">
        <SectionHead index="04" label="Skills" title={<>What I bring <em>to a team.</em></>} />
        <Reveal className="skills">
          <div className="skill-tabs" role="tablist">
            {skillGroups.map((g) => (
              <button key={g.key} role="tab" aria-selected={tab === g.key} className={tab === g.key ? 'on' : ''} onClick={() => setTab(g.key)}>
                <span>{g.label}</span><small>{g.items.length}</small>
              </button>
            ))}
          </div>
          <motion.div key={tab} className="skill-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h3>{group.label}</h3>
            <p>{group.blurb}</p>
            <div className="skill-items">
              {group.items.map((s, i) => (
                <motion.span key={s} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Education & extras ---------- */
export function Education() {
  return (
    <section id="education">
      <div className="wrap edu-grid">
        <div>
          <SectionHead index="05" label="Education" title={<>Foundations.</>} />
          <div className="edu-list">
            {education.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.06} className="edu">
                <span className="when">{e.when}</span>
                <div><h3>{e.title}</h3><p>{e.org}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
        <div>
          <SectionHead index="06" label="Beyond code" title={<>The rest of <em>the picture.</em></>} />
          <div className="extras">
            {extras.map((x, i) => (
              <Reveal key={x.title} delay={i * 0.06} className="extra">
                <h3>{x.title}</h3><p>{x.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Contact ---------- */
export function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ }
  }
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow"><span>07</span> Contact</p>
          <h2 className="contact-title">Let's build something <em>reliable.</em></h2>
          <p className="lead">Open to backend and AI engineering roles. If your team is working on AI products, chatbots or large-scale web platforms, I'd love to talk.</p>
        </Reveal>
        <Reveal delay={0.1} className="contact-grid">
          <div className="facts">
            <p className="facts-title">Quick facts</p>
            <dl>
              {quickFacts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="contact-links">
            <button className="contact-link big" onClick={copy}>
              <small>Email {copied ? '· copied ✓' : '· click to copy'}</small>
              <span>{profile.email}</span>
            </button>
            <a className="contact-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <small>LinkedIn</small><span>in/abhishek-singh ↗</span>
            </a>
            <a className="contact-link" href={profile.phoneHref}>
              <small>Phone</small><span>{profile.phone}</span>
            </a>
            <a className="contact-link" href={profile.resume} download>
              <small>Resume</small><span>Download PDF ↓</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
