"use client"

import * as React from "react"
import { useTabs } from "@/components/providers/tab-provider"
import { TabPanel } from "./tab-panel"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TabContentRenderer() {
  const { tabs, activeTabId, openTab, mounted } = useTabs()

  // Mounted olana kadar loading göster
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Hiç tab yoksa welcome screen
  if (tabs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="rounded-full bg-muted p-6">
          <Home className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Hoş Geldiniz</h2>
          <p className="text-muted-foreground mb-4">
            Başlamak için menüden bir sayfa seçin veya ana sayfayı açın.
          </p>
        </div>
        <Button onClick={() => openTab("/")} size="lg">
          <Home className="mr-2 h-4 w-4" />
          Ana Sayfayı Aç
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative bg-background">
      {tabs.map((tab) => (
        <TabPanel
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
        />
      ))}
    </div>
  )
}
