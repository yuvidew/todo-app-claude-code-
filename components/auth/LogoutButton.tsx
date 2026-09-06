"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

/**
 * Signs the current user out by clearing the session cookie
 * (POST /api/auth/logout), then sends them back to /sign-in.
 */
export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/sign-in")
    } catch {
      toast.add({
        title: "Something went wrong.",
        description: "Please try again.",
        type: "error",
      })
      setIsLoggingOut(false)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleLogout} disabled={isLoggingOut} aria-label="Log out">
      <LogOut />
    </Button>
  )
}
