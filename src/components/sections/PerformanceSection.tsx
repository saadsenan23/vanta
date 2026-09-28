import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { vehicleSpecs } from '../../data/vehicle'
import { SectionLabel } from '../ui/Primitives'

export function PerformanceSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const lineX = useTransform(scrollYProgress, [0, 1], ['-60%', '30%'])
  useMotionValueEvent(scrollYProgress, 'change', (value) => { if (!reduced) setActive(Math.min(2, Math.floor(value * 3))) })
  const spec = vehicleSpecs[active]
  return <section id="performance" ref={ref} className={`performance ${reduced ? 'performance--reduced' : ''}`} aria-labelledby="performance-title"><div className="performance__sticky section-shell">
    <SectionLabel number="03" light>Electric performance</SectionLabel><div className="performance__top"><h2 id="performance-title">A feeling.<br />Beyond numbers.</h2><div className="performance__tabs" aria-label="Performance specifications">{vehicleSpecs.map((item, i) => <button key={item.label} aria-pressed={i === active} onClick={() => setActive(i)}>{item.label}</button>)}</div></div>
    <div className="performance__number" aria-live="off"><motion.span key={spec.value} initial={reduced ? false : { opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>{spec.value}</motion.span><span className="performance__unit">{spec.unit}</span></div><motion.div className="performance__road" style={{ x: reduced ? 0 : lineX }} aria-hidden="true"><i /><i /><i /></motion.div>
    <div className="performance__bottom"><div><span className="eyebrow">{spec.detail}</span><h3>{spec.title}</h3></div><p>{spec.description}</p><div className="performance__counter mono"><span>0{active + 1}</span> / 03</div></div><p className="concept-note">VANTA X1 concept specifications. Acceleration, output and range are illustrative design targets.</p>
  </div></section>
}
