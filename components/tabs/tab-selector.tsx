"use client"

import * as React from "react"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTabs } from "@/components/providers/tab-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

// Dynamic icon resolver
function getIcon(iconName?: string): LucideIcon | null {
  if (!iconName) return null
  const iconsMap = Icons as unknown as Record<string, LucideIcon>
  const Icon = iconsMap[iconName]
  return Icon || null
}

export function TabSelector() {
  const { tabs, selectSplitTab, splitPrimaryTabId, groups } = useTabs()
  const { t } = useLocale()

  // Primary tab hariç diğer tab'ları göster
  const availableTabs = tabs.filter((tab) => tab.id !== splitPrimaryTabId)

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 p-8">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          {t.tabs.searchTabs || "Sekme Seç"}
        </h2>
        <p className="text-muted-foreground mb-6 text-center">
          Bu bölmede açmak istediğiniz sekmeyi seçin
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {availableTabs.map((tab) => {
            const Icon = getIcon(tab.icon)
            const tabGroup = groups.find((g) => g.id === tab.groupId)

            return (
              <button
                key={tab.id}
                onClick={() => selectSplitTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 border-border",
                  "hover:border-primary hover:bg-muted/50 transition-colors text-left",
                  "focus:outline-none focus:ring-2 focus:ring-primary"
                )}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    {tab.isDirty && <span className="text-primary">•</span>}
                    {tab.title}
                    {tab.isPinned && <span className="text-xs">📌</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {tab.path}
                  </div>
                </div>
                {tabGroup && (
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tabGroup.color }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
