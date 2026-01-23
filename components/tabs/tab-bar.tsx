"use client"

import * as React from "react"
import { Plus, Home } from "lucide-react"
import { useTabs } from "@/components/providers/tab-provider"
import { TabItem } from "./tab-item"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TabBar() {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    openTab,
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
      <div className="flex items-center h-10 border-b bg-muted/30 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={() => openTab("/")}
        >
          <Home className="h-4 w-4" />
          <span>Ana Sayfa</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center h-10 border-b bg-muted/30 px-2 gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          isPinned={tab.path === "/"}
          onActivate={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
          onCloseOthers={() => closeOtherTabs(tab.id)}
          onCloseToRight={() => closeTabsToRight(tab.id)}
        />
      ))}

      {/* Yeni sekme butonu */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 ml-1 shrink-0"
        onClick={() => openTab("/")}
        title="Yeni Sekme (Ana Sayfa)"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
