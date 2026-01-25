"use client"

import * as React from "react"
import { getTranslations, type Locale, type Translations } from "@/locales"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LOCALE_STORAGE_KEY = "altay_locale"
const DEFAULT_LOCALE: Locale = "tr"

const LocaleContext = React.createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = React.useState(false)

  // Hydrate from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (stored === "tr" || stored === "en") {
      setLocaleState(stored)
    }
    setMounted(true)
  }, [])

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const t = React.useMemo(
    () => getTranslations(mounted ? locale : DEFAULT_LOCALE),
    [locale, mounted]
  )

  return (
    <LocaleContext.Provider value={{ locale: mounted ? locale : DEFAULT_LOCALE, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return context
}
