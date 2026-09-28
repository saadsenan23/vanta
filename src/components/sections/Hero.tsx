import { lazy, Suspense, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Box, Plus } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { vehicleSpecs } from '../../data/vehicle'
const VehicleScene = lazy(() => import('../three/VehicleScene'))

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  return <section ref={ref} id="models" className="hero" aria-labelledby="hero-title">
    <div className="hero__grid" aria-hidden="true" />
    <div className="hero__heading"><p className="eyebrow"><span className="status-dot" /> INTRODUCING THE VANTA X1</p><h1 id="hero-title">Engineered<br />to move<span className="sage">.</span></h1></div>
    <div className="hero__aside"><p>Electric by nature.<br />Extraordinary by design.</p><a href="#design">Meet the X1 <ArrowUpRight size={16} /></a></div>
    <span className="hero__watermark" aria-hidden="true">X1</span>
    <motion.div className="hero__visual" style={{ y: reduced ? 0 : imageY }}>
      <picture><source media="(max-width: 640px)" srcSet="/images/vanta-hero-mobile.webp" /><img src="/images/vanta-hero.webp" alt="VANTA X1 electric grand tourer in Glacier Silver, illuminated in a graphite studio" width="1920" height="1080" fetchPriority="high" /></picture>
      {live && <div className="hero__live"><Suspense fallback={<div className="scene-loading"><span />Preparing your view</div>}><VehicleScene autoScroll color="#a8aca7" /></Suspense></div>}
    </motion.div>
    <div className="hero__coordinates mono" aria-hidden="true"><Plus size={14} /><span>01 / THE ELECTRIC GRAND TOURER</span></div>
    <button className="hero__3d" onClick={() => setLive(!live)} aria-pressed={live}><Box size={16} />{live ? 'Studio view' : 'Explore in 3D'}<ArrowUpRight size={14} /></button>
    <div className="hero__bottom"><a href="#design" className="hero__explore"><span className="circle-arrow"><ArrowDown size={20} /></span><span>Explore the X1<small>SCROLL TO DISCOVER</small></span></a><div className="hero__specs">{vehicleSpecs.map(spec => <div key={spec.label}><p>{spec.value}<span>{spec.unit}</span></p><span className="mono">{spec.label}</span></div>)}</div><p className="hero__note mono">CONCEPT VEHICLE<br />TARGET SPECIFICATIONS</p></div>
    <div className="hero__foot"><span>PURE ELECTRIC. PURE INTENT.</span><span>VANTA MOTORS © 2026</span></div>
  </section>
}
