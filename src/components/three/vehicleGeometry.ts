import { BufferGeometry, Float32BufferAttribute, MathUtils } from 'three'

/** Model coordinates: metres; +Y up, −X nose, +Z driver side. */
export const VEHICLE = {
  front: -2.36,
  rear: 2.3,
  axleFront: -1.46,
  axleRear: 1.47,
  wheelY: 0.485,
  wheelRadius: 0.465,
  halfTrack: 0.91,
} as const

type Profile = ReadonlyArray<readonly [number, number]>

// Smooth interpolation between measured stations makes the surface independent
// from the number of geometry segments and avoids a stack of visible primitives.
export function sampleProfile(stations: Profile, x: number): number {
  if (x <= stations[0][0]) return stations[0][1]
  for (let i = 1; i < stations.length; i++) {
    if (x <= stations[i][0]) {
      const a = stations[i - 1]
      const b = stations[i]
      const t = (x - a[0]) / (b[0] - a[0])
      const previous = stations[Math.max(0, i - 2)]
      const next = stations[Math.min(stations.length - 1, i + 1)]
      const span = b[0] - a[0]
      const m0 = (b[1] - previous[1]) / (b[0] - previous[0]) * span
      const m1 = (next[1] - a[1]) / (next[0] - a[0]) * span
      const value = (2 * t ** 3 - 3 * t ** 2 + 1) * a[1] + (t ** 3 - 2 * t ** 2 + t) * m0 + (-2 * t ** 3 + 3 * t ** 2) * b[1] + (t ** 3 - t ** 2) * m1
      return MathUtils.clamp(value, Math.min(a[1], b[1]), Math.max(a[1], b[1]))
    }
  }
  return stations[stations.length - 1][1]
}

const width: Profile = [
  [-2.36, 0.76], [-2.1, 0.875], [-1.46, 0.96], [-0.5, 0.895],
  [0.55, 0.895], [1.47, 0.98], [2.07, 0.925], [2.3, 0.805],
]
const shoulder: Profile = [
  [-2.36, 0.805], [-2.07, 0.955], [-1.46, 1.08], [-0.9, 1.085],
  [0, 1.095], [0.72, 1.115], [1.47, 1.115], [2.08, 1.05], [2.3, 0.985],
]
const roof: Profile = [
  [-1.13, 1.14], [-0.82, 1.43], [-0.43, 1.655], [0.32, 1.69],
  [0.85, 1.59], [1.35, 1.32], [1.72, 1.135],
]
const roofWidth: Profile = [
  [-1.13, 0.755], [-0.43, 0.76], [0.32, 0.79], [0.85, 0.8], [1.72, 0.80],
]

export const bodyWidth = (x: number) => sampleProfile(width, x)
export const bodyShoulder = (x: number) => sampleProfile(shoulder, x)

export function bodyPoint(x: number, across: number): [number, number, number] {
  const edge = Math.abs(across)
  const endRound = x < -2.07 ? (1 - MathUtils.smoothstep(x, -2.36, -2.07)) * 0.155
    : x > 2.07 ? -MathUtils.smoothstep(x, 2.07, 2.3) * 0.11 : 0
  return [x + endRound * edge * edge, bodyShoulder(x) + 0.075 * (1 - edge ** 3), bodyWidth(x) * across]
}

export function wheelArchHeight(x: number): number {
  let bottom = 0.345
  for (const axle of [VEHICLE.axleFront, VEHICLE.axleRear]) {
    const delta = Math.abs(x - axle)
    const radius = 0.525
    if (delta < radius) bottom = Math.max(bottom, VEHICLE.wheelY + Math.sqrt(radius * radius - delta * delta))
  }
  return Math.min(bottom, bodyShoulder(x) - 0.027)
}

function gridGeometry(
  nx: number, ny: number,
  point: (u: number, v: number) => [number, number, number],
  reverse = false,
  cutOut?: (u: number, v: number) => boolean,
): BufferGeometry {
  const positions: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= ny; j++) positions.push(...point(i / nx, j / ny))
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      if (cutOut?.((i + 0.5) / nx, (j + 0.5) / ny)) continue
      const a = i * (ny + 1) + j
      const b = a + ny + 1
      if (reverse) indices.push(a, b, a + 1, b, b + 1, a + 1)
      else indices.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createBodyTop() {
  return gridGeometry(128, 48, (u, v) => bodyPoint(MathUtils.lerp(VEHICLE.front, VEHICLE.rear, u), v * 2 - 1), false, (u, v) => {
    const x = MathUtils.lerp(VEHICLE.front, VEHICLE.rear, u)
    return x > -1.11 && x < 1.70 && Math.abs(bodyWidth(x) * (v * 2 - 1)) < sampleProfile(roofWidth, x) - 0.012
  })
}

export function createBodySide(side: 1 | -1) {
  return gridGeometry(160, 10, (u, v) => {
    const x = MathUtils.lerp(VEHICLE.front, VEHICLE.rear, u)
    const p = bodyPoint(x, side)
    const bottom = wheelArchHeight(x)
    const flare = 0.028 * Math.sin(v * Math.PI) - 0.05 * v ** 2
    return [p[0], MathUtils.lerp(p[1], bottom, v), p[2] + side * flare]
  }, side < 0)
}

export function createFascia(front: boolean) {
  const x = front ? VEHICLE.front : VEHICLE.rear
  return gridGeometry(36, 10, (u, v) => {
    const across = u * 2 - 1
    const p = bodyPoint(x, across)
    return [p[0] + (front ? 1 : -1) * 0.095 * Math.sin(v * Math.PI), MathUtils.lerp(p[1], 0.39, v), p[2] * (1 - 0.04 * v)]
  }, !front)
}

export function canopyPoint(x: number, across: number): [number, number, number] {
  const base = bodyShoulder(x) + 0.018
  const crown = Math.max(0, Math.cos(across * Math.PI / 2)) ** 0.52
  return [x, base + (sampleProfile(roof, x) - base) * crown, sampleProfile(roofWidth, x) * across]
}

export function createCanopy(from: number, to: number, fromAcross = -1, toAcross = 1) {
  return gridGeometry(36, 28, (u, v) => canopyPoint(MathUtils.lerp(from, to, u), MathUtils.lerp(fromAcross, toAcross, v)))
}

export function createFrontInset() {
  return gridGeometry(40, 5, (u, v) => {
    const z = (u * 2 - 1) * 0.705
    const x = -2.365 + 0.18 * (z / 0.805) ** 2 + 0.03 * Math.sin(v * Math.PI)
    return [x, MathUtils.lerp(0.445, 0.62, v) + 0.023 * Math.abs(z), z]
  }, true)
}
