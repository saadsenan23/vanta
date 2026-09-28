import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '../motion/Reveal'

export function FinalReveal() {
  return <section className="final-reveal" aria-labelledby="final-title"><div className="final-reveal__image"><img src="/images/vanta-hero.webp" loading="lazy" width="1920" height="1080" alt="The VANTA X1 emerging from the dark studio" /></div><Reveal className="final-reveal__content"><p className="eyebrow">THE VANTA X1</p><h2 id="final-title">Some things<br />are better <em>felt.</em></h2><div className="final-reveal__actions"><a className="button button--sage" href="#configure">Configure your X1 <ArrowUpRight size={17} /></a><a className="text-link" href="#engineering">Discover the engineering <ArrowUpRight size={16} /></a></div></Reveal><p className="final-reveal__baseline mono">PURE ELECTRIC. PURE INTENT.</p></section>
}
