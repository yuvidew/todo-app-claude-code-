"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const Hero = () => {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12 md:py-20">
      {/* Pill Badge */}
      <Badge
        variant="outline"
        className="mb-6 px-4 py-1 rounded-full text-muted-foreground border-border bg-muted/50"
      >
        New · Built for modern teams
      </Badge>

      {/* Main Heading */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-[1.1] max-w-4xl">
        Elevate Your Team&apos;s <br />
        <span className="text-muted-foreground">Collective Intelligence</span>
      </h1>

      {/* Supporting Paragraph */}
      <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        Everything your team needs to stay synchronized, automate complex workflows,
        and drive meaningful results — all within one intuitive, intelligent workspace.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
        <Link href="/todos">
          <Button size="lg" className="rounded-full px-8 h-12 text-base">
            Get Started Free
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full px-8 h-12 text-base"
        >
          View Demo
        </Button>
      </div>
    </div>
  )
}

export default Hero