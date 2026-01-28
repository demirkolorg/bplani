"use client"

import * as React from "react"
import { Home } from "lucide-react"
import { useTabs } from "@/components/providers/tab-provider"
import { TabItem } from "./tab-item"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/providers/locale-provider"

export function TabBar() {
  const { t } = useLocale()
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllExceptHome,
    openTab,
    reorderTabs,
  } = useTabs()

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+W - Close current tab
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault()
        if (activeTabId) {
          closeTab(activeTabId)
        }
      }

      // Ctrl+Tab - Next tab
      if (e.ctrlKey && e.key === "Tab" && !e.shiftKey) {
        e.preventDefault()
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId)
        if (currentIndex !== -1 && tabs.length > 1) {
          const nextIndex = (currentIndex + 1) % tabs.length
          setActiveTab(tabs[nextIndex].id)
        }
      }

      // Ctrl+Shift+Tab - Previous tab
      if (e.ctrlKey && e.shiftKey && e.key === "Tab") {
        e.preventDefault()
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId)
        if (currentIndex !== -1 && tabs.length > 1) {
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
          setActiveTab(tabs[prevIndex].id)
        }
      }

      // Ctrl+1-9 - Go to tab by number
      if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
        e.preventDefault()
        const tabIndex = parseInt(e.key) - 1
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [tabs, activeTabId, closeTab, setActiveTab])

  if (tabs.length === 0) {
    return (
      <div className="sticky top-14 z-10 flex items-center h-10 border-b bg-background px-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={() => openTab("/")}
        >
          <Home className="h-4 w-4" />
          <span>{t.tabs.home}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="sticky top-14 z-10 flex items-center h-10 border-b bg-background px-2 gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
      {tabs.map((tab, index) => (
        <TabItem
          key={tab.id}
          tab={tab}
          index={index}
          isActive={tab.id === activeTabId}
          isPinned={tab.path === "/"}
          onActivate={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
          onCloseOthers={() => closeOtherTabs(tab.id)}
          onCloseToRight={() => closeTabsToRight(tab.id)}
          onCloseAll={closeAllExceptHome}
          onReorder={reorderTabs}
        />
      ))}
    </div>
  )
}
