import type { KeyboardEvent } from 'react'

/** Keep Tab inside a modal, including the browser's final-tab-to-chrome case. */
export function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return
  const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]')).filter(node => node.getClientRects().length > 0)
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (!first) { event.preventDefault(); return }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
