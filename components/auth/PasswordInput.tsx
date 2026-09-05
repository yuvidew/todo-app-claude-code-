"use client"

import { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder: string
  autoComplete?: string
  ariaInvalid?: boolean
  ariaDescribedBy?: string
  disabled?: boolean
  className?: string
}

/**
 * A password field with an eye toggle inside the input. Visibility state is
 * local to each instance, so a form rendering more than one of these (e.g.
 * password + confirm password) automatically gets independent show/hide
 * state per field — no shared boolean.
 */
export function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  ariaInvalid,
  ariaDescribedBy,
  disabled,
  className,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
