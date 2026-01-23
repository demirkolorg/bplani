"use client"

import * as React from "react"
import { X } from "lucide-react"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tab } from "@/types/tabs"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface TabItemProps {
  tab: Tab
  isActive: boolean
  isPinned?: boolean
  onActivate: () => void
  onClose: () => void
  onCloseOthers: () => void
  onCloseToRight: () => void
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
  isActive,
  isPinned = false,
  onActivate,
  onClose,
  onCloseOthers,
  onCloseToRight,
}: TabItemProps) {
  const Icon = getIcon(tab.icon)

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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group relative flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none",
            "min-w-[100px] max-w-[200px] rounded-t-md border-b-2",
            "hover:bg-muted/50 transition-colors",
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
              Sekmeyi Kapat
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={onCloseOthers}>
          Diğer Sekmeleri Kapat
        </ContextMenuItem>
        <ContextMenuItem onClick={onCloseToRight}>
          Sağdaki Sekmeleri Kapat
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => navigator.clipboard.writeText(window.location.origin + tab.path)}
        >
          URL Kopyala
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
