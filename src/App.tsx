import { MotionConfig } from 'motion/react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { DesignSection } from './components/sections/DesignSection'
import { AerodynamicsSection } from './components/sections/AerodynamicsSection'
import { PerformanceSection } from './components/sections/PerformanceSection'
import { InteriorSection } from './components/sections/InteriorSection'
import { TechnologySection } from './components/sections/TechnologySection'
import { VehicleExplorer } from './components/sections/VehicleExplorer'
import { FinalReveal } from './components/sections/FinalReveal'
import { useInitialAnchor } from './hooks/useInitialAnchor'

export default function App() {
  useInitialAnchor()
  return <MotionConfig reducedMotion="user"><Navbar /><main id="main"><Hero /><DesignSection /><AerodynamicsSection /><PerformanceSection /><InteriorSection /><TechnologySection /><VehicleExplorer /><FinalReveal /></main><Footer /></MotionConfig>
}
