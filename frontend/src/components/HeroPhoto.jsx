import { useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data/profile'

const badges = [
  { cls: 'b1', icon: '💼', title: '4+ years', sub: 'Backend & AI', delay: 0.9 },
  { cls: 'b2', icon: '🏢', title: 'Currently at', sub: 'Iota Analytics', delay: 1.05 },
  { cls: 'b3', icon: '🔒', title: 'Privacy-first AI', sub: 'Data stays in-house', delay: 1.2 },
]

export default function HeroPhoto() {
  // Drop your photo at public/profile.jpg — until then a placeholder is shown.
  const [failed, setFailed] = useState(false)

  return (
    <motion.div
      className="photo-wrap"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="photo-ring" aria-hidden />
      <div className="photo-frame">
        {failed ? (
          <div className="photo-placeholder" role="img" aria-label="Photo of Abhishek Singh (placeholder)">
            <svg viewBox="0 0 200 240" aria-hidden>
              <circle cx="100" cy="88" r="42" />
              <path d="M22 240c4-56 38-86 78-86s74 30 78 86z" />
            </svg>
            <span>AS</span>
          </div>
        ) : (
          <img src={profile.photo} alt="Abhishek Singh" onError={() => setFailed(true)} />
        )}
      </div>

      {badges.map((b) => (
        <motion.div
          key={b.cls}
          className={`photo-badge ${b.cls}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: b.delay, type: 'spring', stiffness: 220, damping: 18 }}
        >
          <span className="pb-icon">{b.icon}</span>
          <div><b>{b.title}</b><small>{b.sub}</small></div>
        </motion.div>
      ))}

      <motion.button
        className="photo-ask"
        onClick={() => window.dispatchEvent(new Event('open-chat'))}
        initial={{ opacity: 0, y: 10, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ delay: 1.4 }}
      >
        💬 Ask me anything
      </motion.button>
    </motion.div>
  )
}
