import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Move, Plus } from 'lucide-react'
import { CONFIGURATION_KEY, defaultConfiguration, explorerDetails, resolveConfiguration, validateConfiguration } from '../../data/vehicle'
import type { Configuration } from '../../data/vehicle'
import { SectionLabel } from '../ui/Primitives'
import { Reveal } from '../motion/Reveal'
import { Configurator } from './Configurator'
const VehicleScene = lazy(() => import('../three/VehicleScene'))

function readConfiguration(): Configuration {
  try { return validateConfiguration(JSON.parse(localStorage.getItem(CONFIGURATION_KEY) ?? 'null')) } catch { return defaultConfiguration }
}
export function VehicleExplorer() {
  const [config, setConfig] = useState(readConfiguration)
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const selected = resolveConfiguration(config)
  const detail = explorerDetails[active]
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } }, { rootMargin: '400px' })
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  return <section id="experience" className="showroom section-shell" aria-labelledby="showroom-title"><Reveal><SectionLabel number="06">The digital atelier</SectionLabel><div className="section-heading"><h2 id="showroom-title">Every angle.<br /><span className="muted">Every possibility.</span></h2><p>Explore the details.<br />Find your expression of the X1.</p></div></Reveal><div className="showroom__layout"><div className="showroom__explorer"><div className="showroom__scene" ref={container}><div className="showroom__scene-label mono"><span className="status-dot" />VANTA X1 — {selected.exterior.label}</div><span className="showroom__ghost" aria-hidden="true">X1</span>{visible ? <Suspense fallback={<div className="scene-loading"><span />Preparing your view</div>}><VehicleScene color={selected.exterior.color} wheel={config.wheels} interior={selected.interior.color} accent={selected.accent.color} view={detail.view} /></Suspense> : <img className="showroom__fallback" src="/images/vanta-hero.webp" alt="Silver VANTA X1 studio view" loading="lazy" />}<span className="showroom__drag mono"><Move size={13} /> DRAG TO EXPLORE</span><Plus className="showroom__cross" size={17} /></div><div className="explorer-tabs" role="group" aria-label="Vehicle details">{explorerDetails.map((item, i) => <button key={item.id} aria-label={item.label} aria-pressed={i === active} onClick={() => setActive(i)}><span className="mono">{item.number}</span>{item.label}</button>)}</div><div className="explorer-description" aria-live="polite"><span className="mono">DETAIL {detail.number}</span><div><h3>{detail.title}</h3><p>{detail.description}</p></div></div><p className="concept-note">Interactive design study. Campaign imagery and the 3D concept express the same design direction; final production geometry may vary.</p></div><Configurator config={config} onChange={setConfig} /></div></section>
}

