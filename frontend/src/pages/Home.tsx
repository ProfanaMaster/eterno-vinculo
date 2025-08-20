import { useState } from 'react'
import Header from '../components/layout/Header'
import Hero from '../components/sections/Hero'
import Features from '../components/sections/Features'
import Pricing from '../components/sections/Pricing'
import Examples from '../components/sections/Examples'
import Testimonials from '../components/sections/Testimonials'
import FAQ from '../components/sections/FAQ'
import Footer from '../components/layout/Footer'
import CartSidebar from '../components/cart/CartSidebar'

function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Examples />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  )
}

export default Home