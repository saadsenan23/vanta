import { useState } from 'react'
import { Play, Pause, Plus } from 'lucide-react'
import { Reveal } from '../motion/Reveal'
import { SectionLabel } from '../ui/Primitives'

export function AerodynamicsSection() {
  const [flow, setFlow] = useState(true)
  return <section id="engineering" className={`aero section-shell ${flow ? 'aero--flowing' : ''}`} aria-labelledby="aero-title">
    <Reveal><SectionLabel number="02">Aerodynamics</SectionLabel><div className="section-heading"><h2 id="aero-title">Shaped by air.</h2><p>You can’t see the force.<br />You can feel the difference.</p></div></Reveal>
    <div className="aero__study"><img src="/images/vanta-hero.webp" loading="lazy" alt="Aerodynamic study of the VANTA X1, with conceptual streamlines around the body" width="1920" height="1080" /><svg className="airflow" viewBox="0 0 1200 600" fill="none" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-40 ${210 + i * 30} C200 ${205 + i * 28},250 ${135 + i * 12},460 ${110 + i * 16} S820 ${110 + i * 20},1240 ${220 + i * 31}`} />)}</svg><div className="aero__axis" aria-hidden="true"><Plus size={17} /><span className="mono">AIRFLOW STUDY / X1</span><Plus size={17} /></div><button className="aero__toggle" aria-pressed={flow} onClick={() => setFlow(!flow)}>{flow ? <Pause size={12} /> : <Play size={12} />} {flow ? 'Pause airflow' : 'Resume airflow'}</button></div>
    <Reveal className="aero__information"><div className="aero__coefficient"><strong>0.21<span>Cd</span></strong><p className="mono">TARGET DRAG COEFFICIENT</p></div><div className="aero__copy"><h3>Efficiency is in the details.</h3><p>Flush handles. A closed underbody. Active front shutters and a deployable rear spoiler. Small decisions that make a measurable difference.</p></div><div className="aero__elements"><span className="mono">ACTIVE AERO</span><strong>04</strong><span>Integrated elements</span></div></Reveal><p className="concept-note">Conceptual airflow visualisation. Engineering values are design targets, not verified test results.</p>
  </section>
}
