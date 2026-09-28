import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { trapDialogFocus } from '../../lib/dialogFocus'

export function Modal({ open, onClose, title, children, className = '' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const previousFocus = document.activeElement as HTMLElement | null
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [open])
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onKeyDown={trapDialogFocus} onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal__body"><button className="icon-button modal__close" onClick={onClose} aria-label="Close dialog"><X size={23} /></button>{children}</div>
  </dialog>
}
