"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"

export function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm">
        <span className="text-xs font-semibold">TR</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
      title={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
    >
      <span className="text-xs font-semibold">
        {locale.toUpperCase()}
      </span>
    </Button>
  )
}
