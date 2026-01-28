"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm">
        <Languages className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
      title={locale === "tr" ? t.common.switchToEnglish : t.common.switchToTurkish}
    >
      <Languages className="h-4 w-4" />
    </Button>
  )
}
