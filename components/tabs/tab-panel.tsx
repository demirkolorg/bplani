"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTabs } from "@/components/providers/tab-provider"
import { ParamsProvider } from "@/components/providers/params-provider"
import { getPageComponent } from "@/lib/page-registry"
import type { Tab } from "@/types/tabs"

// Tab ID context - her tab kendi ID'sini bilir
const TabIdContext = React.createContext<string | null>(null)

export function useCurrentTabId() {
  return React.useContext(TabIdContext)
}

interface TabPanelProps {
  tab: Tab
  isActive: boolean
}

export function TabPanel({ tab, isActive }: TabPanelProps) {
  const { updateScrollPosition } = useTabs()
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [hasBeenActive, setHasBeenActive] = React.useState(isActive)

  // İlk kez aktif olunca render et
  React.useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true)
    }
  }, [isActive, hasBeenActive])

  // Scroll pozisyonu kaydet (tab pasif olunca)
  React.useEffect(() => {
    if (!isActive && panelRef.current) {
      const currentScroll = panelRef.current.scrollTop
      if (currentScroll > 0) {
        updateScrollPosition(tab.id, currentScroll)
      }
    }
  }, [isActive, tab.id, updateScrollPosition])

  // Scroll pozisyonu geri yükle (tab aktif olunca)
  React.useEffect(() => {
    if (isActive && panelRef.current && tab.scrollPosition > 0) {
      // Small delay to ensure content is rendered
      const timeoutId = setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.scrollTop = tab.scrollPosition
        }
      }, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [isActive, tab.scrollPosition])

  // Lazy render - henüz aktif olmadıysa render etme
  if (!hasBeenActive) {
    return null
  }

  // Page component'i bul
  const pageInfo = getPageComponent(tab.path)

  if (!pageInfo) {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-auto bg-background",
          isActive ? "block" : "hidden"
        )}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Sayfa bulunamadı: {tab.path}</p>
        </div>
      </div>
    )
  }

  const { Component, params } = pageInfo

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute inset-0 overflow-auto bg-background",
        isActive ? "block" : "hidden"
      )}
    >
      <TabIdContext.Provider value={tab.id}>
        <ParamsProvider params={params}>
          <Component />
        </ParamsProvider>
      </TabIdContext.Provider>
    </div>
  )
}
