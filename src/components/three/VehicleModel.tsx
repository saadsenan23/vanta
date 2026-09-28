import { useEffect, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { CatmullRomCurve3, DoubleSide, Vector3 } from 'three'
import type { BufferGeometry } from 'three'
import {
  VEHICLE, bodyPoint, bodyWidth, canopyPoint, createBodySide, createBodyTop,
  createCanopy, createFascia, createFrontInset,
} from './vehicleGeometry'

export interface VehicleFinish {
  color: string
  wheel: 'aero' | 'sport'
  interior: string
  accent: string
}

type Point = [number, number, number]
const DARK = '#101416'

function SculptedMesh({ geometry, color, glass = false, cabinFocus = false }: { geometry: BufferGeometry; color: string; glass?: boolean; cabinFocus?: boolean }) {
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} castShadow receiveShadow>
    <meshPhysicalMaterial color={color} metalness={glass ? 0.42 : 0.65} roughness={glass ? 0.16 : 0.32}
      clearcoat={1} clearcoatRoughness={0.2} envMapIntensity={glass ? 1.3 : 1}
      transparent={glass && cabinFocus} opacity={glass && cabinFocus ? 0.35 : 1} depthWrite={!glass || !cabinFocus} side={DoubleSide} />
  </mesh>
}

function Contour({ points, color = DARK, radius = 0.009, emissive = false, metalness = 0.45 }: {
  points: Point[]; color?: string; radius?: number; emissive?: boolean; metalness?: number
}) {
  const path = useMemo(() => new CatmullRomCurve3(points.map(p => new Vector3(...p))), [points])
  return <mesh>
    <tubeGeometry args={[path, Math.max(20, points.length * 5), radius, 6, false]} />
    <meshStandardMaterial color={color} roughness={emissive ? 0.25 : 0.32} metalness={metalness}
      emissive={emissive ? color : '#000000'} emissiveIntensity={emissive ? 3 : 0} />
  </mesh>
}

function Wheel({ position, side, style, accent }: { position: Point; side: 1 | -1; style: 'aero' | 'sport'; accent: string }) {
  const faceZ = side * 0.147
  const spokes = style === 'aero' ? 5 : 10
  return <group position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.465, 0.465, 0.265, 48, 1]} />
      <meshStandardMaterial color="#101113" roughness={0.91} />
    </mesh>
    {[-1, 1].map(edge => <mesh key={edge} position={[0, 0, edge * 0.129]}>
      <torusGeometry args={[0.401, 0.063, 10, 48]} />
      <meshStandardMaterial color="#17191a" roughness={0.86} />
    </mesh>)}
    {[-0.076, 0, 0.076].map(track => <mesh key={track} position={[0, 0, track]}>
      <torusGeometry args={[0.466, 0.003, 4, 48]} />
      <meshStandardMaterial color="#050708" roughness={1} />
    </mesh>)}
    <group position={[0, 0, faceZ]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.354, 0.354, 0.024, 48]} />
        <meshStandardMaterial color="#25292a" metalness={0.8} roughness={0.33} />
      </mesh>
      <mesh position={[0, 0, side * 0.012]}>
        <torusGeometry args={[0.344, 0.012, 8, 48]} />
        <meshStandardMaterial color="#c3c8c4" metalness={0.96} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, side * 0.018]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.268, 0.268, 0.018, 40]} />
        <meshStandardMaterial color="#616463" metalness={0.94} roughness={0.48} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = i / 16 * Math.PI * 2
        return <mesh key={i} position={[Math.cos(a) * 0.229, Math.sin(a) * 0.229, side * 0.03]}>
          <circleGeometry args={[0.009, 6]} />
          <meshStandardMaterial color="#181a1b" side={DoubleSide} />
        </mesh>
      })}
      <RoundedBox args={[0.08, 0.195, 0.035]} radius={0.026} smoothness={3} position={[-0.21, 0.075, side * 0.04]}>
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
      </RoundedBox>
      {Array.from({ length: spokes }, (_, i) => {
        const angle = i / spokes * Math.PI * 2 + 0.08
        return <group key={i} rotation={[0, 0, angle]}>
          <RoundedBox args={[style === 'aero' ? 0.15 : 0.042, 0.272, 0.035]} radius={0.012} smoothness={2}
            position={[style === 'aero' ? 0.04 : 0.012, 0.189, side * 0.052]} rotation={[0, 0, style === 'aero' ? -0.21 : -0.14]}>
            <meshStandardMaterial color={style === 'aero' ? '#969b98' : '#b6bbb7'} metalness={0.96} roughness={0.27} />
          </RoundedBox>
          {style === 'aero' && <mesh position={[0.052, 0.208, side * 0.075]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.055, 0.197, 0.005]} />
            <meshStandardMaterial color="#222729" metalness={0.8} roughness={0.25} />
          </mesh>}
        </group>
      })}
      <mesh position={[0, 0, side * 0.074]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.083, 0.083, 0.036, 32]} />
        <meshStandardMaterial color="#2b3031" metalness={0.8} roughness={0.22} />
      </mesh>
      <Contour color="#d5ddd7" radius={0.006} points={[[-0.031, 0.023, side * 0.096], [0, -0.025, side * 0.096], [0.03, 0.023, side * 0.096]]} />
    </group>
  </group>
}

function Cabin({ interior, accent }: Pick<VehicleFinish, 'interior' | 'accent'>) {
  return <group>
    <RoundedBox args={[2.82, 0.17, 1.50]} radius={0.07} smoothness={3} position={[0.2, 0.655, 0]}>
      <meshStandardMaterial color="#181b1b" roughness={0.85} />
    </RoundedBox>
    {[-0.34, 0.34].map(z => <group key={z} position={[0.15, 0.85, z]}>
      <RoundedBox args={[0.55, 0.145, 0.45]} radius={0.068} smoothness={3}>
        <meshStandardMaterial color={interior} roughness={0.84} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.47, 0.44]} radius={0.06} smoothness={3} position={[0.235, 0.24, 0]} rotation={[0, 0, -0.12]}>
        <meshStandardMaterial color={interior} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.16, 0.25]} radius={0.06} smoothness={3} position={[0.268, 0.535, 0]}>
        <meshStandardMaterial color={interior} roughness={0.8} />
      </RoundedBox>
    </group>)}
    <RoundedBox args={[0.26, 0.16, 1.42]} radius={0.056} smoothness={3} position={[-0.78, 1.08, 0]}>
      <meshStandardMaterial color="#242b2a" roughness={0.65} />
    </RoundedBox>
    <RoundedBox args={[0.025, 0.175, 0.38]} radius={0.014} smoothness={2} position={[-0.63, 1.225, -0.015]} rotation={[0, 0, -0.2]}>
      <meshStandardMaterial color="#091916" emissive={accent} emissiveIntensity={0.25} roughness={0.23} />
    </RoundedBox>
    <mesh position={[-0.57, 1.17, 0.37]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[0.13, 0.018, 8, 28]} />
      <meshStandardMaterial color="#161b1a" roughness={0.7} />
    </mesh>
    <Contour points={[[-0.67, 1.155, -0.62], [-0.625, 1.165, 0], [-0.67, 1.155, 0.62]]} color={accent} radius={0.007} emissive />
  </group>
}

/**
 * Replaceable model adapter. Keep the dimensions/axes above and this finish
 * interface when replacing this procedural concept with a licensed GLB.
 * Procedural content is original and does not reproduce a production vehicle.
 */
export function VehicleModel({ color, wheel, interior, accent, cabinFocus = false }: VehicleFinish & { cabinFocus?: boolean }) {
  const body = useMemo(() => ({
    top: createBodyTop(), left: createBodySide(1), right: createBodySide(-1),
    front: createFascia(true), rear: createFascia(false), inset: createFrontInset(),
    windshield: createCanopy(-1.13, -0.43), roof: createCanopy(-0.43, 0.78), hatch: createCanopy(0.78, 1.72),
  }), [])
  useEffect(() => () => body.inset.dispose(), [body])
  return <group name="vanta-x1-model-adapter">
    <SculptedMesh geometry={body.top} color={color} />
    <SculptedMesh geometry={body.left} color={color} />
    <SculptedMesh geometry={body.right} color={color} />
    <SculptedMesh geometry={body.front} color={color} />
    <SculptedMesh geometry={body.rear} color={color} />
    <Cabin interior={interior} accent={accent} />
    <SculptedMesh geometry={body.windshield} color="#1c2b2b" glass cabinFocus={cabinFocus} />
    <SculptedMesh geometry={body.roof} color="#172122" glass cabinFocus={cabinFocus} />
    <SculptedMesh geometry={body.hatch} color="#203032" glass cabinFocus={cabinFocus} />

    {/* Hood creases, precise glazing surrounds and genuine wheel cut-outs. */}
    {([-1, 1] as const).map(side => <group key={side}>
      <Contour points={[-2.11, -1.92, -1.61, -1.3, -1.11].map(x => {
        const p = bodyPoint(x, side * 0.58)
        return [p[0], p[1] + 0.002, p[2]]
      })} color={color} radius={0.008} />
      <Contour points={[-1.13, -0.83, -0.43, 0, 0.4, 0.78, 1.15, 1.5, 1.72].map(x => canopyPoint(x, side))}
        color="#717c77" radius={0.012} />
      <Contour points={[-1.13, -0.83, -0.43, 0, 0.4, 0.78, 1.15, 1.5, 1.72].map(x => canopyPoint(x, side * 0.8))}
        color={color} radius={0.025} />
      <Contour points={[canopyPoint(-0.04, side), canopyPoint(0.1, side * 0.96), canopyPoint(0.2, side * 0.87), canopyPoint(0.22, side * 0.8)]}
        color="#182122" radius={0.025} />
      <Contour points={[[-0.925, 1.076, side * 0.865], [-0.91, 0.8, side * 0.91], [-0.78, 0.442, side * 0.854], [0.76, 0.444, side * 0.858], [0.89, 0.78, side * 0.92], [0.9, 1.113, side * 0.92]]}
        color="#252d2a" radius={0.0045} />
      <Contour points={[[-0.96, 0.385, side * 0.86], [-0.66, 0.372, side * 0.866], [0.6, 0.38, side * 0.882], [0.96, 0.43, side * 0.914]]}
        color="#1b2221" radius={0.036} />
      <Contour points={[[0.5, 1.03, side * 0.904], [0.64, 1.034, side * 0.913], [0.75, 1.036, side * 0.922]]}
        color="#4b5651" radius={0.013} />
      {[VEHICLE.axleFront, VEHICLE.axleRear].map(axle => <group key={axle}>
        <Contour points={Array.from({ length: 29 }, (_, index) => {
          const angle = -0.02 + index / 28 * (Math.PI + 0.04)
          const x = axle + Math.cos(angle) * 0.526
          return [x, VEHICLE.wheelY + Math.sin(angle) * 0.526, side * (bodyWidth(x) + 0.011)]
        })} color={color} radius={0.018} />
        <Wheel position={[axle, VEHICLE.wheelY, side * VEHICLE.halfTrack]} side={side} style={wheel} accent={accent} />
      </group>)}
      <group position={[-0.77, 1.155, side * 0.918]}>
        <Contour points={[[0, -0.017, -side * 0.12], [-0.017, 0.005, 0], [0.023, 0.015, side * 0.07]]} color="#18211f" radius={0.019} />
        <RoundedBox args={[0.205, 0.065, 0.13]} radius={0.031} smoothness={3} position={[0.006, 0.034, side * 0.072]}>
          <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.23} clearcoat={1} />
        </RoundedBox>
      </group>
    </group>)}
    {[-1.13, 1.72].map(x => <Contour key={x} points={Array.from({ length: 19 }, (_, i) => canopyPoint(x, i / 9 - 1))} color={color} radius={0.013} />)}

    {/* A narrow illuminated signature follows the actual nose surface. */}
    <mesh geometry={body.inset}>
      <meshStandardMaterial color="#101617" roughness={0.52} metalness={0.35} side={DoubleSide} />
    </mesh>
    <Contour color="#10191a" radius={0.037} points={Array.from({ length: 15 }, (_, i) => {
      const z = (i / 14 * 2 - 1) * 0.731
      return [-2.366 + 0.21 * (z / 0.84) ** 2, 0.773 + 0.025 * Math.abs(z), z]
    })} />
    <Contour color="#e9fff9" radius={0.012} emissive points={Array.from({ length: 15 }, (_, i) => {
      const z = (i / 14 * 2 - 1) * 0.726
      return [-2.391 + 0.205 * (z / 0.84) ** 2, 0.78 + 0.025 * Math.abs(z), z]
    })} />
    {([-1, 1] as const).map(side => <group key={side}>
      <Contour color="#d4eee5" radius={0.018} emissive points={[[ -2.255, 0.774, side * 0.637], [-2.242, 0.73, side * 0.666], [-2.23, 0.688, side * 0.68]]} />
      <Contour color="#09110f" radius={0.027} points={[[-2.14, 0.66, side * 0.78], [-2.14, 0.56, side * 0.79], [-2.095, 0.46, side * 0.79]]} />
      <Contour color="#293330" radius={0.021} points={[[1.89, 0.49, side * 0.81], [2.05, 0.39, side * 0.79], [2.24, 0.38, side * 0.63]]} />
    </group>)}
    <Contour color="#25312d" radius={0.028} points={[[-2.105, 0.38, -0.775], [-2.28, 0.362, -0.49], [-2.365, 0.35, 0], [-2.28, 0.362, 0.49], [-2.105, 0.38, 0.775]]} />
    <Contour color="#aa1621" radius={0.029} points={[[2.205, 0.928, -0.787], [2.289, 0.949, -0.5], [2.316, 0.955, 0], [2.289, 0.949, 0.5], [2.205, 0.928, 0.787]]} />
    <Contour color="#ff4751" radius={0.012} emissive points={[[2.22, 0.938, -0.774], [2.299, 0.957, -0.5], [2.327, 0.963, 0], [2.299, 0.957, 0.5], [2.22, 0.938, 0.774]]} />
    <Contour color="#17231e" radius={0.04} points={[[2.13, 0.412, -0.76], [2.26, 0.397, -0.46], [2.295, 0.389, 0], [2.26, 0.397, 0.46], [2.13, 0.412, 0.76]]} />
    <Contour color="#d8ded8" radius={0.007} points={[[-2.316, 0.889, -0.043], [-2.337, 0.851, 0], [-2.316, 0.889, 0.043]]} />
  </group>
}

export default VehicleModel
