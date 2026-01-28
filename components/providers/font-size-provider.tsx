"use client"

import * as React from "react"

type FontSize = number

interface FontSizeContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
}

const FontSizeContext = React.createContext<FontSizeContextType | undefined>(undefined)

const DEFAULT_FONT_SIZE = 16
const MIN_FONT_SIZE = 10
const MAX_FONT_SIZE = 20
const FONT_SIZE_STEP = 1

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = React.useState<FontSize>(DEFAULT_FONT_SIZE)

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("font-size")
    if (stored) {
      const size = parseInt(stored, 10)
      if (!isNaN(size) && size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
        setFontSizeState(size)
      }
    }
  }, [])

  // Apply font size to document root
  React.useEffect(() => {
    document.documentElement.style.setProperty("--font-size-base", `${fontSize}px`)
  }, [fontSize])

  const setFontSize = React.useCallback((size: FontSize) => {
    const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size))
    setFontSizeState(clampedSize)
    localStorage.setItem("font-size", String(clampedSize))
  }, [])

  const increaseFontSize = React.useCallback(() => {
    setFontSize(fontSize + FONT_SIZE_STEP)
  }, [fontSize, setFontSize])

  const decreaseFontSize = React.useCallback(() => {
    setFontSize(fontSize - FONT_SIZE_STEP)
  }, [fontSize, setFontSize])

  const resetFontSize = React.useCallback(() => {
    setFontSize(DEFAULT_FONT_SIZE)
  }, [setFontSize])

  const value = React.useMemo(
    () => ({
      fontSize,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
    }),
    [fontSize, setFontSize, increaseFontSize, decreaseFontSize, resetFontSize]
  )

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>
}

export function useFontSize() {
  const context = React.useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider")
  }
  return context
}
