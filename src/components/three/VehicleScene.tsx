import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentRef, ErrorInfo, ReactNode, RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { ACESFilmicToneMapping, MathUtils, SRGBColorSpace, Vector3 } from 'three'
import type { PerspectiveCamera } from 'three'
import VehicleModel from './VehicleModel'

export interface VehicleSceneProps {
  color?: string
  wheel?: 'aero' | 'sport'
  interior?: string
  accent?: string
  view?: 'front' | 'side' | 'rear' | 'cabin' | 'wheels'
  autoScroll?: boolean
  className?: string
  onReady?: () => void
}

type View = NonNullable<VehicleSceneProps['view']>
type Controls = ComponentRef<typeof OrbitControls>
type Point = [number, number, number]

const VIEWS: Record<View, { position: Point; target: Point }> = {
  front: { position: [-5.6, 2.2, 5], target: [0, 0.82, 0] },
  side: { position: [-0.1, 2.2, 7.5], target: [0, 0.8, 0] },
  rear: { position: [5.8, 2.55, 5.1], target: [0.08, 0.8, 0] },
  cabin: { position: [-2.9, 3.25, 3.2], target: [-0.05, 1.15, 0] },
  wheels: { position: [-2.45, 1.15, 2.85], target: [-1.42, 0.65, 0.71] },
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('Vehicle scene unavailable.', error.message, info.componentStack)
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function VehicleFallback({ unavailable = false }: { unavailable?: boolean }) {
  return <div className="vehicle-scene-fallback" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
    <img src="/images/vanta-hero.webp" alt="VANTA X1 electric grand tourer in silver" draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }} />
    {unavailable && <span role="status" style={{ position: 'absolute', bottom: 24, color: '#bec8c0', background: '#101813df', borderRadius: 24, padding: '9px 16px', fontSize: 11, letterSpacing: '0.035em' }}>
      Vehicle preview · 3D unavailable on this device
    </span>}
  </div>
}

function CameraRig({ view, host, autoScroll, visible, reducedMotion }: {
  view: View; host: RefObject<HTMLDivElement | null>; autoScroll: boolean; visible: boolean; reducedMotion: boolean
}) {
  const controls = useRef<Controls>(null)
  const camera = useThree(state => state.camera) as PerspectiveCamera
  const renderer = useThree(state => state.gl)
  const aspect = useThree(state => state.size.width / Math.max(1, state.size.height))
  const invalidate = useThree(state => state.invalidate)
  const destination = useRef(new Vector3())
  const target = useRef(new Vector3())
  const animating = useRef(false)
  const initialized = useRef(false)
  const interacted = useRef(false)

  useEffect(() => {
    // OrbitControls sets touch-action:none when connecting. Restore vertical
    // page scrolling so a full-width mobile canvas cannot trap the document.
    // Three owns this imperative DOM surface; it is not React state.
    // oxlint-disable-next-line react/immutability
    renderer.domElement.style.touchAction = 'pan-y'
  }, [renderer])

  useLayoutEffect(() => {
    const update = () => {
      const selected = VIEWS[view]
      target.current.set(...selected.target)
      destination.current.set(...selected.position).sub(target.current)
      // The horizontal field of view constrains a long subject on small screens.
      const fit = aspect < 1.4 ? Math.min(1.9, 1 + (1.4 / Math.max(aspect, 0.55) - 1) * 0.66) : 1
      destination.current.multiplyScalar(fit)
      if (autoScroll && !reducedMotion && host.current && !interacted.current) {
        const rect = host.current.getBoundingClientRect()
        const progress = MathUtils.clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1)
        destination.current.applyAxisAngle(new Vector3(0, 1, 0), (progress - 0.5) * 0.22)
      }
      destination.current.add(target.current)
      if (!initialized.current || reducedMotion) {
        camera.position.copy(destination.current)
        camera.lookAt(target.current)
        controls.current?.target.copy(target.current)
        controls.current?.update()
        animating.current = false
        initialized.current = true
      } else animating.current = true
      invalidate()
    }
    interacted.current = false
    update()
    if (!autoScroll || !visible || reducedMotion) return
    let requestedFrame = 0
    const onScroll = () => {
      if (interacted.current || requestedFrame) return
      requestedFrame = requestAnimationFrame(() => { requestedFrame = 0; update() })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(requestedFrame)
    }
  }, [aspect, autoScroll, camera, host, invalidate, reducedMotion, view, visible])

  useFrame((_, delta) => {
    if (!animating.current || !visible || !controls.current) return
    const alpha = 1 - Math.exp(-Math.min(delta, 0.05) * 5.5)
    camera.position.lerp(destination.current, alpha)
    controls.current.target.lerp(target.current, alpha)
    controls.current.update()
    const remaining = camera.position.distanceToSquared(destination.current) + controls.current.target.distanceToSquared(target.current)
    if (remaining < 0.00002) {
      camera.position.copy(destination.current)
      controls.current.target.copy(target.current)
      controls.current.update()
      animating.current = false
    } else invalidate()
  })

  return <OrbitControls ref={controls} makeDefault enabled={visible} enablePan={false} enableZoom={false}
    enableDamping={!reducedMotion} dampingFactor={0.12} rotateSpeed={0.6}
    minPolarAngle={Math.PI / 7} maxPolarAngle={Math.PI / 2.04}
    onStart={() => { animating.current = false; interacted.current = true }} />
}

function Studio({ onReady, compact }: { onReady: () => void; compact: boolean }) {
  const gl = useThree(state => state.gl)
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    // One frame after environment setup lets the parent remove its loading cover.
    const frame = requestAnimationFrame(() => { invalidate(); onReady() })
    return () => cancelAnimationFrame(frame)
  }, [gl, invalidate, onReady])
  return <>
    <ambientLight intensity={0.42} />
    <directionalLight position={[-3, 6, 5]} intensity={2.15} color="#ebf6ed" />
    <directionalLight position={[3, 2, -4]} intensity={1.2} color="#b5d3df" />
    <Environment resolution={compact ? 128 : 256} frames={1}>
      <Lightformer form="rect" intensity={4} color="#edf6ec" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[7, 3, 1]} />
      <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[-3, 3, 5]} rotation={[0, -Math.PI / 5, 0]} scale={[5, 1.5, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#e8fff3" position={[1, 1.9, -4]} rotation={[0, Math.PI, 0]} scale={[6, 1, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#829eae" position={[4, 3, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 3, 1]} />
      <Lightformer form="rect" intensity={2} color="#ffffff" position={[-5, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[2, 1, 1]} />
    </Environment>
    <ContactShadows position={[0, 0.012, 0]} opacity={0.65} scale={10} blur={2.8} far={3.5} resolution={compact ? 256 : 512} frames={1} color="#050a07" />
  </>
}

export default function VehicleScene({
  color = '#a8aca7', wheel = 'aero', interior = '#b8a28b', accent = '#bdf578',
  view = 'front', autoScroll = false, className = '', onReady,
}: VehicleSceneProps) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [lowPower] = useState(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    return (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) || (device.deviceMemory !== undefined && device.deviceMemory <= 4) || device.connection?.saveData === true
  })
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [failed, setFailed] = useState(() => {
    try {
      const probe = document.createElement('canvas')
      const context = probe.getContext('webgl2')
      if (!context) return true
      context.getExtension('WEBGL_lose_context')?.loseContext()
      return false
    } catch { return true }
  })
  const [ready, setReady] = useState(false)
  const contextCleanup = useRef<(() => void) | undefined>(undefined)
  const notifyReady = useCallback(() => { setReady(true); onReady?.() }, [onReady])

  useEffect(() => {
    const compact = window.matchMedia('(max-width: 767px)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setMobile(compact.matches); setReducedMotion(motion.matches) }
    update()
    compact.addEventListener('change', update)
    motion.addEventListener('change', update)
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { rootMargin: '180px' })
    if (host.current) observer.observe(host.current)
    return () => {
      compact.removeEventListener('change', update)
      motion.removeEventListener('change', update)
      observer.disconnect()
      contextCleanup.current?.()
    }
  }, [])

  const fallback = <VehicleFallback unavailable />
  return <div ref={host} className={`vehicle-scene ${failed ? 'vehicle-scene--fallback' : ''} ${className}`} role="group"
    aria-label={failed ? 'VANTA X1 studio preview' : `Interactive VANTA X1, ${view} view. Drag to rotate the vehicle, or use the detail buttons to change views.`}
    style={{ position: 'relative', width: '100%', height: '100%', minHeight: 260, isolation: 'isolate' }}>
    {failed ? fallback : <SceneBoundary fallback={fallback}>
      {!ready && <VehicleFallback />}
      <Canvas camera={{ position: VIEWS.front.position, fov: 30, near: 0.1, far: 50 }}
        frameloop={visible ? 'demand' : 'never'} dpr={mobile || lowPower ? 1 : [1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        fallback={fallback} style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = SRGBColorSpace
          gl.setClearColor('#07100c', 0)
          const onLost = (event: Event) => { event.preventDefault(); setFailed(true) }
          gl.domElement.addEventListener('webglcontextlost', onLost, false)
          contextCleanup.current = () => gl.domElement.removeEventListener('webglcontextlost', onLost)
        }}>
        <Suspense fallback={null}>
          <Studio onReady={notifyReady} compact={mobile || lowPower} />
          <VehicleModel color={color} wheel={wheel} interior={interior} accent={accent} cabinFocus={view === 'cabin'} />
          <CameraRig view={view} host={host} autoScroll={autoScroll} visible={visible} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </SceneBoundary>}
  </div>
}
