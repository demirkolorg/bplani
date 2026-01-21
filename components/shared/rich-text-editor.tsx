"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  id?: string
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
  rows?: number
}

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  className,
  rows = 4,
}: RichTextEditorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(error && "border-destructive")}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
