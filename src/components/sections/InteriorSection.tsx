import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Reveal } from '../motion/Reveal'
import { SectionLabel } from '../ui/Primitives'

const interiorDetails = [
  { title: 'A cockpit with clarity', text: 'Essential driving information sits directly in your line of sight. Physical controls keep the most important actions within reach.', x: '47%', y: '45%' },
  { title: 'Materials with meaning', text: 'Soft recycled microfibre meets responsibly sourced surfaces. Comfort you can feel, with a lighter material footprint as the design ambition.', x: '77%', y: '72%' },
  { title: 'Your own atmosphere', text: 'A subtle ribbon of ambient light and a carefully positioned spatial audio concept create a space that feels entirely yours.', x: '74%', y: '38%' },
]
export function InteriorSection() {
  const [selected, setSelected] = useState(0)
  return <section id="interior" className="interior" aria-labelledby="interior-title"><div className="section-shell"><Reveal><SectionLabel number="04">The inner world</SectionLabel><div className="section-heading"><h2 id="interior-title">Designed around<br /><span className="muted">the driver.</span></h2><p>The outside moves you.<br />The inside makes you feel at home.</p></div></Reveal></div><div className="interior__image"><picture><source media="(max-width: 640px)" srcSet="/images/vanta-interior-mobile.webp" /><img src="/images/vanta-interior.webp" width="1920" height="1080" loading="lazy" alt="VANTA X1 driver-focused cockpit with a sculptural steering wheel, charcoal seats and subtle ambient lighting" /></picture>{interiorDetails.map((item, i) => <button key={item.title} className={`interior__hotspot ${i === selected ? 'is-active' : ''}`} style={{ left: item.x, top: item.y }} aria-label={item.title} aria-pressed={selected === i} onClick={() => setSelected(i)}>{selected === i ? <Minus size={17} /> : <Plus size={17} />}</button>)}<span className="interior__image-label mono">A PRIVATE WORLD. A PERSONAL CONNECTION.</span></div><div className="interior__details section-shell">{interiorDetails.map((item, i) => <button key={item.title} className={selected === i ? 'is-active' : ''} onClick={() => setSelected(i)} aria-pressed={selected === i}><span className="mono">0{i + 1}</span><h3>{item.title}</h3><p>{item.text}</p></button>)}</div></section>
}
