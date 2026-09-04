"use client"

import React from "react"
import FloatingCard from "./FloatingCard"
import {
  TrendingUp,
  Sparkles,
  Users,
  Zap
} from "lucide-react"

const ProductVisual = () => {
  return (
    <div className="relative w-full max-w-5xl aspect-square md:aspect-video mx-auto mt-20 mb-32 flex items-center justify-center">
      {/* Central Hub Visual */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute size-64 md:size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative size-40 md:size-64 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-2xl flex items-center justify-center overflow-hidden group">
          {/* Internal decorative elements */}
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-foreground/40 to-transparent" />
          </div>
          <div className="relative z-10 size-24 md:size-32 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
            <div className="size-12 md:size-16 rounded-full bg-primary-foreground shadow-inner flex items-center justify-center">
              <div className="size-6 md:size-8 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Connectivity Lines (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M500 300 L250 150" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
        <path d="M500 300 L750 150" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
        <path d="M500 300 L250 450" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
        <path d="M500 300 L750 450" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
      </svg>

      {/* Floating Cards */}
      <FloatingCard
        title="Team Performance"
        value="87%"
        subtitle="↑ 14.8% vs last month"
        icon={<TrendingUp size={14} />}
        className="top-0 left-0 md:left-10"
        delay="0s"
      />
      <FloatingCard
        title="AI Insights"
        value="12 New"
        subtitle="3 recommendations available"
        icon={<Sparkles size={14} />}
        className="top-0 right-0 md:right-10"
        delay="1s"
      />
      <FloatingCard
        title="Team Online"
        value="12 Active"
        subtitle="Collaborating now"
        icon={<Users size={14} />}
        className="bottom-0 left-0 md:left-10"
        delay="2s"
      />
      <FloatingCard
        title="Automation"
        value="Active"
        subtitle="Running smoothly"
        icon={<Zap size={14} />}
        className="bottom-0 right-0 md:right-10"
        delay="3s"
      />
    </div>
  )
}

export default ProductVisual