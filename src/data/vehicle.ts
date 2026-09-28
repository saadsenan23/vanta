export const navigation = [
  { label: 'Models', href: '#models' },
  { label: 'Design', href: '#design' },
  { label: 'Engineering', href: '#engineering' },
  { label: 'Technology', href: '#technology' },
  { label: 'Experience', href: '#experience' },
]

export const vehicleSpecs = [
  { value: '3.2', unit: 's', label: '0–100 km/h', title: 'An immediate connection.', description: 'No hesitation. No interruption. Dual electric motors translate your intention into movement.', detail: 'DUAL-MOTOR ALL-WHEEL DRIVE' },
  { value: '610', unit: 'hp', label: 'Peak power', title: 'Power, with composure.', description: 'A low centre of gravity and precisely balanced torque make every corner feel considered.', detail: 'INTELLIGENT TORQUE VECTORING' },
  { value: '520', unit: 'km', label: 'Target range', title: 'Take the longer way.', description: 'An efficient architecture, shaped around the freedom to keep going. Less stopping. More discovering.', detail: 'CONCEPT RANGE TARGET' },
]

export const vehicleColors = [
  { id: 'silver', label: 'Glacier Silver', color: '#a8aca7', price: 0 },
  { id: 'black', label: 'Obsidian', color: '#272b2b', price: 1200 },
  { id: 'green', label: 'Forest', color: '#425c51', price: 1800 },
] as const
export const wheelOptions = [
  { id: 'aero', label: 'Aero 21', description: '21-inch forged aero', price: 0 },
  { id: 'sport', label: 'Sport 22', description: '22-inch open-spoke', price: 2400 },
] as const
export const interiorOptions = [
  { id: 'charcoal', label: 'Charcoal', color: '#242728', description: 'Recycled microfibre', price: 0 },
  { id: 'limestone', label: 'Limestone', color: '#bdb4a1', description: 'Bio-based upholstery', price: 1600 },
] as const
export const accentOptions = [
  { id: 'sage', label: 'Sage', color: '#b8c9af', price: 0 },
  { id: 'copper', label: 'Copper', color: '#d69d75', price: 400 },
] as const
export type Configuration = { exterior: typeof vehicleColors[number]['id']; wheels: typeof wheelOptions[number]['id']; interior: typeof interiorOptions[number]['id']; accent: typeof accentOptions[number]['id'] }
export const defaultConfiguration: Configuration = { exterior: 'silver', wheels: 'aero', interior: 'charcoal', accent: 'sage' }
export const CONFIGURATION_KEY = 'vanta-x1-configuration'
export function validateConfiguration(value: unknown): Configuration {
  if (!value || typeof value !== 'object') return defaultConfiguration
  const data = value as Record<string, unknown>
  return {
    exterior: vehicleColors.find(option => option.id === data.exterior)?.id ?? defaultConfiguration.exterior,
    wheels: wheelOptions.find(option => option.id === data.wheels)?.id ?? defaultConfiguration.wheels,
    interior: interiorOptions.find(option => option.id === data.interior)?.id ?? defaultConfiguration.interior,
    accent: accentOptions.find(option => option.id === data.accent)?.id ?? defaultConfiguration.accent,
  }
}
export function resolveConfiguration(config: Configuration) {
  return {
    exterior: vehicleColors.find(option => option.id === config.exterior) ?? vehicleColors[0],
    wheels: wheelOptions.find(option => option.id === config.wheels) ?? wheelOptions[0],
    interior: interiorOptions.find(option => option.id === config.interior) ?? interiorOptions[0],
    accent: accentOptions.find(option => option.id === config.accent) ?? accentOptions[0],
  }
}
export const explorerDetails = [
  { id: 'headlights', label: 'Headlights', view: 'front', number: '01', title: 'A signature in a single line.', description: 'An uninterrupted light signature follows the leading edge. Precisely focused illumination, with a quietly unmistakable presence.' },
  { id: 'aerodynamics', label: 'Aerodynamics', view: 'side', number: '02', title: 'Every surface has a purpose.', description: 'A continuous roofline, flush surfaces and active air management work together to reduce resistance through the air.' },
  { id: 'wheels', label: 'Wheels', view: 'wheels', number: '03', title: 'Less resistance. More response.', description: 'Lightweight, 21-inch forged aero wheels balance cooling, efficiency and an assured connection to the road.' },
  { id: 'rear', label: 'Rear', view: 'rear', number: '04', title: 'A lasting impression.', description: 'A full-width rear light sits above an integrated diffuser. Cleanly resolved surfaces guide air beyond the body.' },
  { id: 'cabin', label: 'Cabin', view: 'cabin', number: '05', title: 'Your own sense of space.', description: 'A low seating position, wraparound cockpit and tactile sustainable materials put the driver at the centre of the experience.' },
] as const
