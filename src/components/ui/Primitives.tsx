import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

export function SectionLabel({ number, children, light = false }: { number: string; children: ReactNode; light?: boolean }) {
  return <p className={`section-label ${light ? 'section-label--light' : ''}`}><span className="section-label__square" /><span>{children}</span><span className="section-label__number">{number}</span></p>
}
export function TextLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={`text-link ${className}`} href={href}><span>{children}</span><ArrowUpRight size={17} aria-hidden="true" /></a>
}
export function Brand({ className = '' }: { className?: string }) {
  return <a className={`brand ${className}`} href="#models" aria-label="Vanta Motors home"><svg width="25" height="24" viewBox="0 0 25 24" fill="none" aria-hidden="true"><path d="M1 3h6l6 12 5-12h6L13 24 1 3Z" fill="currentColor"/><path d="m8 3 4.5 8L16 3H8Z" fill="currentColor" opacity=".4"/></svg><span>VANTA</span></a>
}
