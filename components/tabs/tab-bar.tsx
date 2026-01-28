"use client"

import * as React from "react"
import { Home, SplitSquareHorizontal, SplitSquareVertical } from "lucide-react"
import { useTabs } from "@/components/providers/tab-provider"
import { TabItem } from "./tab-item"
import { TabSearch } from "./tab-search"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/providers/locale-provider"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    reopenLastClosedTab,
    sessions,
    saveSession,
    loadSession,
    deleteSession,
    splitActive,
    splitPrimaryTabId,
    splitSecondaryTabId,
    splitOrientation,
    startSplitView,
    closeSplitView,
  } = useTabs()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [saveWorkspaceOpen, setSaveWorkspaceOpen] = React.useState(false)
  const [workspaceName, setWorkspaceName] = React.useState("")

  // Split view'dayken gösterilecek tab'ları filtrele
  const visibleTabs = React.useMemo(() => {
    if (splitActive && splitPrimaryTabId) {
      // Split edilen tab'ları filtrele
      const filtered = tabs.filter((tab) => tab.id !== splitPrimaryTabId)
      if (splitSecondaryTabId) {
        return filtered.filter((tab) => tab.id !== splitSecondaryTabId)
      }
      return filtered
    }
    return tabs
  }, [tabs, splitActive, splitPrimaryTabId, splitSecondaryTabId])

  // Split tab bilgisi
  const splitPrimaryTab = splitPrimaryTabId ? tabs.find((t) => t.id === splitPrimaryTabId) : null
  const splitSecondaryTab = splitSecondaryTabId ? tabs.find((t) => t.id === splitSecondaryTabId) : null

  const handleSaveWorkspace = () => {
    if (workspaceName.trim()) {
      saveSession(workspaceName.trim())
      setSaveWorkspaceOpen(false)
      setWorkspaceName("")
    }
  }

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

      // Not using Ctrl+Shift+T because Chrome uses it - use context menu instead

      // Ctrl+Shift+A - Search tabs (also available in context menu)
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [tabs, activeTabId, closeTab, setActiveTab, reopenLastClosedTab])

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

  // Pinli tabların son index'ini bul (split view'i buraya koyacağız)
  const lastPinnedIndex = React.useMemo(() => {
    let lastIndex = -1
    visibleTabs.forEach((tab, idx) => {
      if (tab.isPinned || tab.path === "/") {
        lastIndex = idx
      }
    })
    return lastIndex
  }, [visibleTabs])

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="sticky top-14 z-10 flex items-center h-10 border-b bg-background px-2 gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
            {/* Eğer pinli tab yoksa split view'i en başta göster */}
            {splitActive && splitPrimaryTab && lastPinnedIndex === -1 && (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    onClick={() => setActiveTab(splitPrimaryTabId!)}
                    className={cn(
                      "group relative flex items-center gap-2 px-3 py-1.5 select-none min-w-[150px] max-w-[250px] rounded-t-md border-b-2 transition-colors cursor-pointer",
                      (activeTabId === splitPrimaryTabId || activeTabId === splitSecondaryTabId)
                        ? "bg-background border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {splitOrientation === "horizontal" ? (
                      <SplitSquareHorizontal className="h-4 w-4 shrink-0" />
                    ) : (
                      <SplitSquareVertical className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate text-sm font-medium">
                      {splitSecondaryTab
                        ? `${splitPrimaryTab.title} + ${splitSecondaryTab.title}`
                        : `${splitPrimaryTab.title} + ...`
                      }
                    </span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={closeSplitView} className="text-destructive focus:text-destructive">
                    {t.tabs.closeSplit}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )}

            {/* Normal tab'lar */}
            {visibleTabs.map((tab, index) => {
              // Pinli tablardan sonra split view tabını göster
              const showSplitAfter = index === lastPinnedIndex && splitActive && splitPrimaryTab

              return (
                <React.Fragment key={tab.id}>
                  <TabItem
                    tab={tab}
                    index={index}
                    isActive={tab.id === activeTabId}
                    isPinned={tab.isPinned || tab.path === "/"}
                    onActivate={() => setActiveTab(tab.id)}
                    onClose={() => closeTab(tab.id)}
                    onCloseOthers={() => closeOtherTabs(tab.id)}
                    onCloseToRight={() => closeTabsToRight(tab.id)}
                    onCloseAll={closeAllExceptHome}
                    onReorder={reorderTabs}
                    onSaveWorkspace={() => setSaveWorkspaceOpen(true)}
                    onSearchTabs={() => setSearchOpen(true)}
                  />

                  {/* Pinli tablardan sonra split view tabını göster */}
                  {showSplitAfter && (
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                          onClick={() => setActiveTab(splitPrimaryTabId!)}
                          className={cn(
                            "group relative flex items-center gap-2 px-3 py-1.5 select-none min-w-[150px] max-w-[250px] rounded-t-md border-b-2 transition-colors cursor-pointer",
                            (activeTabId === splitPrimaryTabId || activeTabId === splitSecondaryTabId)
                              ? "bg-background border-primary text-foreground"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {splitOrientation === "horizontal" ? (
                            <SplitSquareHorizontal className="h-4 w-4 shrink-0" />
                          ) : (
                            <SplitSquareVertical className="h-4 w-4 shrink-0" />
                          )}
                          <span className="truncate text-sm font-medium">
                            {splitSecondaryTab
                              ? `${splitPrimaryTab.title} + ${splitSecondaryTab.title}`
                              : `${splitPrimaryTab.title} + ...`
                            }
                          </span>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={closeSplitView} className="text-destructive focus:text-destructive">
                          {t.tabs.closeSplit}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={reopenLastClosedTab}>
            {t.tabs.reopenClosedTab}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setSearchOpen(true)}>
            {t.tabs.searchTabs}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setSaveWorkspaceOpen(true)}>
            {t.tabs.saveWorkspace}
          </ContextMenuItem>
          {sessions.length > 0 && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>{t.tabs.loadWorkspace}</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {sessions.map((session) => (
                  <ContextMenuItem
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                  >
                    {session.name} ({session.tabs.length} sekme)
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          <ContextMenuSeparator />
          {!splitActive && activeTabId && (
            <>
              <ContextMenuItem onClick={() => startSplitView(activeTabId, "horizontal")}>
                {t.tabs.splitHorizontal}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => startSplitView(activeTabId, "vertical")}>
                {t.tabs.splitVertical}
              </ContextMenuItem>
            </>
          )}
          {splitActive && (
            <ContextMenuItem onClick={closeSplitView}>
              {t.tabs.closeSplit}
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <TabSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <AlertDialog open={saveWorkspaceOpen} onOpenChange={setSaveWorkspaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.tabs.saveWorkspace}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.tabs.workspaceName}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="workspace-name" className="sr-only">
              {t.tabs.workspaceName}
            </Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder={t.tabs.workspaceName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveWorkspace()
                }
              }}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkspaceName("")}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveWorkspace}>
              {t.common.save}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
