
import Header from '../components/layout/Header'
import Hero from '../components/sections/Hero'
import Features from '../components/sections/Features'
import AdvertisingSection from '../components/sections/AdvertisingSection'
import Pricing from '../components/sections/Pricing'
import ModernSections from '../components/sections/ModernSections'
import Testimonials from '../components/sections/Testimonials'
import FAQ from '../components/sections/FAQ'
import Footer from '../components/layout/Footer'
import CartSidebar from '../components/cart/CartSidebar'
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton'

function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <AdvertisingSection />
        <ModernSections />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppFloatingButton />
    </div>
  )
}

export default Home