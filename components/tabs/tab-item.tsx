"use client"

import * as React from "react"
import { X } from "lucide-react"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tab } from "@/types/tabs"
import { useLocale } from "@/components/providers/locale-provider"
import { useTabs } from "@/components/providers/tab-provider"
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

interface TabItemProps {
  tab: Tab
  index: number
  isActive: boolean
  isPinned?: boolean
  onActivate: () => void
  onClose: () => void
  onCloseOthers: () => void
  onCloseToRight: () => void
  onCloseAll: () => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onSaveWorkspace: () => void
  onSearchTabs: () => void
}

// Dynamic icon resolver
function getIcon(iconName?: string): LucideIcon | null {
  if (!iconName) return null
  const iconsMap = Icons as unknown as Record<string, LucideIcon>
  const Icon = iconsMap[iconName]
  return Icon || null
}

export function TabItem({
  tab,
  index,
  isActive,
  isPinned = false,
  onActivate,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onCloseAll,
  onReorder,
  onSaveWorkspace,
  onSearchTabs,
}: TabItemProps) {
  const { t } = useLocale()
  const { closedTabHistory, reopenLastClosedTab, pinTab, unpinTab, sessions, loadSession, splitActive, startSplitView, closeSplitView, groups } = useTabs()
  const Icon = getIcon(tab.icon)
  const tabGroup = groups.find((g) => g.id === tab.groupId)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isPinned) {
      onClose()
    }
  }

  const handleAuxClick = (e: React.MouseEvent) => {
    // Middle click to close (but not pinned tabs)
    if (e.button === 1 && !isPinned) {
      e.preventDefault()
      onClose()
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (isPinned) {
      e.preventDefault()
      return
    }
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Ana sayfa tabına sürükleme yapılamaz
    if (isPinned) {
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    // Ana sayfa tabına sürükleme yapılamaz
    if (isPinned) {
      return
    }

    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"))
    const toIndex = index

    if (fromIndex !== toIndex && !isNaN(fromIndex)) {
      // Ana sayfa tabı (index 0) sabit kalacak
      // Eğer home tab varsa ve to/from index'ler bunu etkiliyorsa düzelt
      if (fromIndex === 0 || toIndex === 0) {
        return // Ana sayfa taşınamaz
      }
      onReorder(fromIndex, toIndex)
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable={!isPinned}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex items-center gap-2 py-1.5 select-none rounded-t-md border-b-2",
            "hover:bg-muted/50 transition-colors",
            // Ana sayfa (home) sadece ikon
            tab.path === "/" && "cursor-pointer px-2 w-9",
            // Diğer pinli tab'lar
            tab.path !== "/" && isPinned && "cursor-pointer px-2 min-w-[80px] max-w-[120px]",
            // Normal tab'lar
            !isPinned && tab.path !== "/" && "cursor-move px-3 min-w-[100px] max-w-[200px]",
            isDragging && "opacity-40",
            isDragOver && !isPinned && "bg-muted border-primary/50",
            tabGroup && "border-l-4",
            isActive
              ? "bg-background border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          style={tabGroup ? { borderLeftColor: tabGroup.color } : undefined}
          onClick={onActivate}
          onAuxClick={handleAuxClick}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {tab.path !== "/" && (
            <span className="truncate text-sm">
              {tab.isDirty && "• "}
              {tab.title}
            </span>
          )}
          {!isPinned && (
            <button
              className={cn(
                "ml-auto p-0.5 rounded-sm hover:bg-muted-foreground/20",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isActive && "opacity-60"
              )}
              onClick={handleClose}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={reopenLastClosedTab}
          disabled={closedTabHistory.length === 0}
        >
          {t.tabs.reopenClosedTab}
        </ContextMenuItem>
        <ContextMenuItem onClick={onSearchTabs}>
          {t.tabs.searchTabs}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {tab.path !== "/" && (
          <>
            {isPinned ? (
              <ContextMenuItem onClick={() => unpinTab(tab.id)}>
                {t.tabs.unpinTab}
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={() => pinTab(tab.id)}>
                {t.tabs.pinTab}
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={onSaveWorkspace}>
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
        {!splitActive && (
          <>
            <ContextMenuItem onClick={() => startSplitView(tab.id, "horizontal")}>
              {t.tabs.splitHorizontal}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => startSplitView(tab.id, "vertical")}>
              {t.tabs.splitVertical}
            </ContextMenuItem>
          </>
        )}
        {splitActive && (
          <ContextMenuItem onClick={closeSplitView}>
            {t.tabs.closeSplit}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {!isPinned && (
          <ContextMenuItem onClick={onClose} className="text-destructive focus:text-destructive">
            {t.tabs.closeTab}
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={onCloseOthers} className="text-destructive focus:text-destructive">
          {t.tabs.closeOtherTabs}
        </ContextMenuItem>
        <ContextMenuItem onClick={onCloseToRight} className="text-destructive focus:text-destructive">
          {t.tabs.closeTabsToRight}
        </ContextMenuItem>
        <ContextMenuItem onClick={onCloseAll} className="text-destructive focus:text-destructive">
          {t.tabs.closeAllTabs}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
