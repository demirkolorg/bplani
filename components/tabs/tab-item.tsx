"use client"

import * as React from "react"
import { X } from "lucide-react"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tab } from "@/types/tabs"
import { useLocale } from "@/components/providers/locale-provider"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
}: TabItemProps) {
  const { t } = useLocale()
  const Icon = getIcon(tab.icon)
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
            "group relative flex items-center gap-2 px-3 py-1.5 select-none",
            "min-w-[100px] max-w-[200px] rounded-t-md border-b-2",
            "hover:bg-muted/50 transition-colors",
            !isPinned && "cursor-move",
            isPinned && "cursor-pointer",
            isDragging && "opacity-40",
            isDragOver && !isPinned && "bg-muted border-primary/50",
            isActive
              ? "bg-background border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={onActivate}
          onAuxClick={handleAuxClick}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="truncate text-sm">{tab.title}</span>
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
        {!isPinned && (
          <>
            <ContextMenuItem onClick={onClose}>
              {t.tabs.closeTab}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={onCloseOthers}>
          {t.tabs.closeOtherTabs}
        </ContextMenuItem>
        <ContextMenuItem onClick={onCloseToRight}>
          {t.tabs.closeTabsToRight}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onCloseAll}>
          {t.tabs.closeAllTabs}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
