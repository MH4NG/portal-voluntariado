import { FeaturedRequests } from '../components/home/FeaturedRequests'
import { Hero } from '../components/home/Hero'
import { HowItWorks } from '../components/home/HowItWorks'
import { ImpactSection } from '../components/home/ImpactSection'
import { usePageTitle } from '../lib/usePageTitle'

export function HomePage() {
  usePageTitle()
  return (
    <>
      <Hero />
      <ImpactSection />
      <HowItWorks />
      <FeaturedRequests />
    </>
  )
}
