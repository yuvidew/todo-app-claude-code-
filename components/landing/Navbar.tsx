"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/brand/Logo"


const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 mx-auto max-w-7xl backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      {/* Left: Logo and Brand */}
      <Logo />

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Home", "Features", "Solutions", "Pricing", "Resources"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Right: Theme toggle and CTA */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/todos">
          <Button className="rounded-full px-6 py-2">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar