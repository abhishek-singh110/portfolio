import { motion } from 'framer-motion'

export default function Reveal({ children, delay = 0, y = 24, className, as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </M>
  )
}

export function SectionHead({ index, label, title, children }) {
  return (
    <Reveal className="section-head">
      <p className="eyebrow"><span>{index}</span> {label}</p>
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </Reveal>
  )
}
