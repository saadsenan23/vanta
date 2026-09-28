import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react'
import { navigation } from '../../data/vehicle'
import { Brand } from '../ui/Primitives'
import { trapDialogFocus } from '../../lib/dialogFocus'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 150, damping: 30 })
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const trigger = triggerRef.current
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = overflow; trigger?.focus({ preventScroll: true }) }
  }, [open])
  useEffect(() => {
    const query = matchMedia('(min-width: 1024px)')
    const close = () => { if (query.matches) setOpen(false) }
    query.addEventListener('change', close)
    return () => query.removeEventListener('change', close)
  }, [])
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      <div className="header-actions"><a className="header-configure" href="#configure">Configure <ArrowUpRight size={16} /></a><button ref={triggerRef} className="menu-trigger" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}><span /><span /></button></div>
      <motion.div className="reading-progress" style={{ scaleX: reduced ? scrollYProgress : progress }} />
    </header>
    <dialog id="mobile-menu" className="mobile-menu" ref={dialogRef} aria-label="Navigation menu" onKeyDown={trapDialogFocus} onCancel={(e) => { e.preventDefault(); setOpen(false) }}>
      <div className="mobile-menu__top"><Brand /><button className="icon-button" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
      <p className="eyebrow">A different kind of drive.</p>
      <nav aria-label="Mobile navigation">{[...navigation, { label: 'Configure', href: '#configure' }].map((link, i) => <a href={link.href} key={link.href} aria-label={link.label} onClick={() => setOpen(false)}><span className="mono">0{i + 1}</span><span>{link.label}</span><ArrowUpRight size={26} /></a>)}</nav>
      <div className="mobile-menu__bottom"><span>VANTA X1</span><span>PURE ELECTRIC. PURE INTENT.</span></div>
    </dialog>
  </>
}

