"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/components/providers/locale-provider"

interface CombinatorToggleProps {
  value: "AND" | "OR"
  onChange: (value: "AND" | "OR") => void
  disabled?: boolean
}

export function CombinatorToggle({ value, onChange, disabled = false }: CombinatorToggleProps) {
  const { t } = useLocale()

  const handleToggle = () => {
    onChange(value === "AND" ? "OR" : "AND")
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t.queryBuilder.combinator}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={disabled}
        className="gap-2"
      >
        <Badge variant={value === "AND" ? "default" : "outline"}>
          {t.queryBuilder.and}
        </Badge>
        <span className="text-xs text-muted-foreground">/</span>
        <Badge variant={value === "OR" ? "default" : "outline"}>
          {t.queryBuilder.or}
        </Badge>
      </Button>
    </div>
  )
}
