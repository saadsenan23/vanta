import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Brand } from '../ui/Primitives'
import { Modal } from '../ui/Modal'
import { navigation } from '../../data/vehicle'

const information = {
  'About this concept': 'VANTA MOTORS and the X1 are a fictional automotive brand and vehicle created as a frontend engineering and design portfolio project. Images are original generated campaign concepts; the interactive model is a procedural design study. All performance figures, engineering specifications and prices are illustrative, unverified design targets. No vehicle is offered for sale.',
  Privacy: 'This demo has no analytics, advertising cookies, account system or data collection service. Selecting Save configuration stores only your vehicle choices in this browser’s local storage. To remove them, clear site data in your browser settings. Downloaded configurations remain on your device. The site does not send your selections to a server.',
  Terms: 'This website is a non-commercial fictional portfolio demonstration. Vehicle design, pricing, range, performance, sustainability and technology descriptions are conceptual and are not verified real-world claims. Configuration does not constitute an order, quote or reservation. No real manufacturer affiliation is claimed.',
  Contact: 'VANTA MOTORS is a fictional portfolio brand and has no sales or customer service department. For project enquiries, contact the developer through the portfolio or repository where you found this demonstration.',
}
export function Footer() {
  const [topic, setTopic] = useState<keyof typeof information | null>(null)
  return <footer className="footer section-shell"><div className="footer__top"><div><Brand /><p>Movement, with meaning.</p></div><nav aria-label="Footer navigation">{navigation.slice(0, 4).map(link => <a key={link.href} href={link.href}>{link.label}</a>)}<button onClick={() => setTopic('Contact')}>Contact</button></nav><a className="footer__share" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href.split('#')[0])}`} target="_blank" rel="noreferrer">Share on LinkedIn <ArrowUpRight size={15} /></a></div><div className="footer__bottom"><span>© 2026 VANTA MOTORS. A fictional automotive concept.</span><div>{(['About this concept', 'Privacy', 'Terms'] as const).map(item => <button key={item} onClick={() => setTopic(item)}>{item}</button>)}</div><a href="#models">Back to top ↑</a></div><Modal open={!!topic} onClose={() => setTopic(null)} title={topic ?? 'Information'}><span className="eyebrow">VANTA MOTORS</span><h2>{topic}</h2><p className="legal-copy">{topic && information[topic]}</p><button className="button button--sage" onClick={() => setTopic(null)}>Understood <ArrowUpRight size={17} /></button></Modal></footer>
}
