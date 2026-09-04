"use client"

import React from "react"
import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import ProductVisual from "@/components/landing/ProductVisual"

const Home = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen ">
        {/* Main Premium Container */}
        <div className="w-full max-w-7xl overflow-hidden flex flex-col">
          <Navbar />
          <main className="flex flex-col items-center w-full">
            <Hero />
            <ProductVisual />
          </main>

          {/* Simple Footer */}
          <footer className="w-full py-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NexusCore AI. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Home