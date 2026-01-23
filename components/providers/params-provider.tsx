"use client"

import * as React from "react"
import { useParams as useNextParams } from "next/navigation"

// Tab içinde kullanılacak params context
const ParamsContext = React.createContext<Record<string, string>>({})

interface ParamsProviderProps {
  params: Record<string, string>
  children: React.ReactNode
}

export function ParamsProvider({ params, children }: ParamsProviderProps) {
  return (
    <ParamsContext.Provider value={params}>{children}</ParamsContext.Provider>
  )
}

// useParams yerine kullanılacak hook
// Tab context'indeyse tab params'ı, değilse Next.js params'ı döner
export function useTabParams<T extends Record<string, string> = Record<string, string>>(): T {
  const tabParams = React.useContext(ParamsContext)
  const nextParams = useNextParams()

  // Tab params varsa (obje boş değilse) onu kullan
  if (Object.keys(tabParams).length > 0) {
    return tabParams as T
  }

  // Fallback to Next.js params
  return (nextParams || {}) as T
}
