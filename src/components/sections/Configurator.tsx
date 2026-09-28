import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { accentOptions, CONFIGURATION_KEY, defaultConfiguration, interiorOptions, resolveConfiguration, vehicleColors, wheelOptions } from '../../data/vehicle'
import type { Configuration } from '../../data/vehicle'
import { Modal } from '../ui/Modal'
import { Brand } from '../ui/Primitives'

const categories = ['Exterior', 'Wheels', 'Interior', 'Accent'] as const
export function Configurator({ config, onChange }: { config: Configuration; onChange: (config: Configuration) => void }) {
  const [category, setCategory] = useState<typeof categories[number]>('Exterior')
  const [saved, setSaved] = useState(false)
  const [storageOk, setStorageOk] = useState(true)
  const selected = resolveConfiguration(config)
  const total = 89000 + selected.exterior.price + selected.wheels.price + selected.interior.price + selected.accent.price
  const update = <K extends keyof Configuration>(key: K, value: Configuration[K]) => onChange({ ...config, [key]: value })
  const save = () => {
    try { localStorage.setItem(CONFIGURATION_KEY, JSON.stringify(config)); setStorageOk(true) } catch { setStorageOk(false) }
    setSaved(true)
  }
  const download = () => {
    const summary = `VANTA X1 — Your concept configuration\n\nExterior: ${selected.exterior.label}\nWheels: ${selected.wheels.label}\nInterior: ${selected.interior.label}\nAccent: ${selected.accent.label}\nIllustrative price: €${total.toLocaleString('en-US')}\n\nConcept vehicle. Fictional specifications and pricing. This is not an order or reservation.\n`
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'VANTA-X1-configuration.txt'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div id="configure" className="configurator">
    <div className="configurator__heading"><span className="eyebrow">YOUR X1, YOUR EXPRESSION</span><h3>A personal statement.</h3><p>Consider every detail. Make it yours.</p></div>
    <div className="configurator__tabs" aria-label="Configuration category">{categories.map(item => <button key={item} aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="configurator__options">
      {category === 'Exterior' && <><div className="swatches">{vehicleColors.map(option => <button key={option.id} aria-label={option.label} aria-pressed={config.exterior === option.id} onClick={() => update('exterior', option.id)} style={{ '--swatch': option.color } as CSSProperties}><span />{config.exterior === option.id && <Check size={17} />}</button>)}</div><div className="selected-option" aria-live="polite"><span>{selected.exterior.label}</span><span>Metallic finish</span></div></>}
      {category === 'Wheels' && <div className="option-list">{wheelOptions.map(option => <button key={option.id} aria-label={option.label} aria-pressed={config.wheels === option.id} onClick={() => update('wheels', option.id)}><span>{option.label}<small>{option.description}</small></span><span className="option-check">{config.wheels === option.id && <Check size={13} />}</span></button>)}</div>}
      {category === 'Interior' && <><div className="swatches">{interiorOptions.map(option => <button key={option.id} aria-label={option.label} aria-pressed={config.interior === option.id} onClick={() => update('interior', option.id)} style={{ '--swatch': option.color } as CSSProperties}><span />{config.interior === option.id && <Check size={17} />}</button>)}</div><div className="selected-option" aria-live="polite"><span>{selected.interior.label}</span><span>{selected.interior.description}</span></div></>}
      {category === 'Accent' && <><div className="swatches">{accentOptions.map(option => <button key={option.id} aria-label={option.label} aria-pressed={config.accent === option.id} onClick={() => update('accent', option.id)} style={{ '--swatch': option.color } as CSSProperties}><span />{config.accent === option.id && <Check size={17} />}</button>)}</div><div className="selected-option" aria-live="polite"><span>{selected.accent.label}</span><span>Ambient lighting & brake finish</span></div></>}
    </div>
    <div className="configuration-summary"><span className="mono">VANTA X1 / DUAL MOTOR AWD</span><p>{selected.exterior.label} <span>·</span> {selected.wheels.label}</p><p>{selected.interior.label} <span>·</span> {selected.accent.label} accent</p><div className="configuration-price"><span>Concept price</span><strong>€{total.toLocaleString('en-US')}</strong></div></div>
    <button className="button button--sage w-full" onClick={save}>Save configuration <ArrowUpRight size={17} /></button><div className="configuration-disclaimer"><span>Concept only. No purchase or reservation.</span><button onClick={() => { onChange(defaultConfiguration); setCategory('Exterior') }} aria-label="Reset configuration"><RotateCcw size={13} />Reset</button></div>
    <Modal open={saved} onClose={() => setSaved(false)} title="Your VANTA X1"><Brand /><p className="eyebrow">INDIVIDUALLY CONSIDERED</p><h2>Your VANTA X1</h2><p className="save-status"><Check size={16} />{storageOk ? 'Configuration saved on this device.' : 'Device storage is unavailable. Download your configuration below.'}</p><dl className="saved-details"><div><dt>Exterior</dt><dd>{selected.exterior.label}</dd></div><div><dt>Wheels</dt><dd>{selected.wheels.label}</dd></div><div><dt>Interior</dt><dd>{selected.interior.label}</dd></div><div><dt>Accent</dt><dd>{selected.accent.label}</dd></div><div><dt>Concept price</dt><dd>€{total.toLocaleString('en-US')}</dd></div></dl><button className="button button--sage w-full" onClick={download}>Download configuration <ArrowDownToLine size={17} /></button><p className="concept-note">VANTA is a fictional automotive concept. This summary is not an order, quote or reservation.</p></Modal>
  </div>
}

