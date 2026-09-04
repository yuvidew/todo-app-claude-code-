"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FloatingCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
  delay?: string
}

const FloatingCard = ({
  title,
  value,
  subtitle,
  icon,
  className,
  delay = "0s",
}: FloatingCardProps) => {
  return (
    <div
      className={cn(
        "absolute transition-all duration-300 hover:-translate-y-1 animate-float",
        className
      )}
      style={{ animationDelay: delay }}
    >
      <Card className="w-48 md:w-56 shadow-xl overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </CardTitle>
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-foreground mb-1">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {subtitle}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FloatingCard