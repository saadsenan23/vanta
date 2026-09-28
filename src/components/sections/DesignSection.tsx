import { useState } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Reveal } from '../motion/Reveal'
import { SectionLabel } from '../ui/Primitives'

const details = [
  { label: 'Silhouette', number: '01', title: 'Nothing added. Everything considered.', text: 'One uninterrupted line, from the leading edge to the rear. Every surface shaped to move with purpose.', position: 'center 53%', scale: '1' },
  { label: 'Light signature', number: '02', title: 'Recognisable before it arrives.', text: 'A fine blade of light traces the body. Precise, adaptive illumination meets an unmistakable presence.', position: '13% 58%', scale: '1.65' },
  { label: 'Aero wheels', number: '03', title: 'Precision, down to the last detail.', text: 'Forged alloy, carefully sculpted. An aerodynamic face directs air cleanly around the wheel.', position: '72% 64%', scale: '1.65' },
]
export function DesignSection() {
  const [selected, setSelected] = useState(0)
  const detail = details[selected]
  return <section id="design" className="design section-shell" aria-labelledby="design-title">
    <Reveal><SectionLabel number="01">Design philosophy</SectionLabel><div className="section-heading"><h2 id="design-title">Form follows<br /><span className="muted">velocity.</span></h2><p>Beauty is the consequence of purpose.<br />The X1 makes that relationship visible.</p></div></Reveal>
    <div className="design__composition"><Reveal className="design__visual"><div className="design__image"><img src="/images/vanta-hero.webp" alt={`VANTA X1 ${detail.label.toLowerCase()} design study`} loading="lazy" width="1920" height="1080" style={{ objectPosition: detail.position, transform: `scale(${detail.scale})`, transformOrigin: detail.position }} /><span className="image-corner mono">X1 — EXTERIOR STUDY</span><Plus className="image-cross" size={18} /><div className="design__annotation"><span /><p className="mono">SCULPTED BY PURPOSE</p></div></div></Reveal><Reveal className="design__editorial" delay={.1}><span className="display-index">0{selected + 1}</span><div aria-live="polite"><h3>{detail.title}</h3><p>{detail.text}</p></div><div className="design__details" aria-label="Design details">{details.map((item, i) => <button key={item.label} aria-pressed={selected === i} onClick={() => setSelected(i)}><span className="mono">{item.number}</span><span>{item.label}</span><ArrowUpRight size={17} /></button>)}</div></Reveal></div>
    <div className="design__baseline mono"><span>4,920 MM / LENGTH</span><span>1,960 MM / WIDTH</span><span>1,390 MM / HEIGHT</span><span>ONE CONTINUOUS IDEA</span></div>
  </section>
}
