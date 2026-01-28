"use client"

import * as React from "react"
import { Search } from "lucide-react"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTabs } from "@/components/providers/tab-provider"
import { useLocale } from "@/components/providers/locale-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TabSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Dynamic icon resolver
function getIcon(iconName?: string): LucideIcon | null {
  if (!iconName) return null
  const iconsMap = Icons as unknown as Record<string, LucideIcon>
  const Icon = iconsMap[iconName]
  return Icon || null
}

export function TabSearch({ open, onOpenChange }: TabSearchProps) {
  const { tabs, setActiveTab } = useTabs()
  const { t } = useLocale()
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Filter tabs based on query
  const filteredTabs = React.useMemo(() => {
    if (!query.trim()) return tabs

    const lowerQuery = query.toLowerCase()
    return tabs.filter((tab) =>
      tab.title.toLowerCase().includes(lowerQuery) ||
      tab.path.toLowerCase().includes(lowerQuery)
    )
  }, [tabs, query])

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  // Update selected index when filtered tabs change
  React.useEffect(() => {
    if (selectedIndex >= filteredTabs.length) {
      setSelectedIndex(Math.max(0, filteredTabs.length - 1))
    }
  }, [filteredTabs.length, selectedIndex])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredTabs.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredTabs[selectedIndex]) {
        setActiveTab(filteredTabs[selectedIndex].id)
        onOpenChange(false)
      }
    }
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>{t.tabs.searchTabs || "Sekmelerde Ara"}</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.table?.searchPlaceholder || "Ara..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto pb-4">
          {filteredTabs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t.common?.noData || "Sonuç bulunamadı"}
            </div>
          ) : (
            <div className="px-2">
              {filteredTabs.map((tab, index) => {
                const Icon = getIcon(tab.icon)
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left",
                      "hover:bg-muted transition-colors",
                      index === selectedIndex && "bg-muted"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{tab.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {tab.path}
                      </div>
                    </div>
                    {tab.isPinned && (
                      <div className="text-xs text-muted-foreground">📌</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
