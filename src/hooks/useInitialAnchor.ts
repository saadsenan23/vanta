import { useEffect } from 'react'

/** Resolve a bookmarked section after React and local fonts establish the layout. */
export function useInitialAnchor() {
  useEffect(() => {
    if (!window.location.hash) return
    let cancelled = false
    let frame = 0
    const hash = window.location.hash.slice(1)
    void document.fonts.ready.then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        if (!cancelled) document.getElementById(hash)?.scrollIntoView({ behavior: 'instant', block: 'start' })
      })
    })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [])
}
