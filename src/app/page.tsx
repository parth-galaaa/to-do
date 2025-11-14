import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero-section'
import FeaturesSection from '@/components/landing/features-section'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}