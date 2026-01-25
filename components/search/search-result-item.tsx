"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Users,
  Phone,
  MapPin,
  UserCog,
  Megaphone,
  Workflow,
  Bell,
  CalendarClock,
  Car,
  Tag,
  StickyNote,
  Activity,
  Home,
  ChevronRight,
} from "lucide-react"
import { CommandItem } from "@/components/ui/command"
import type { SearchResultItem } from "@/lib/validations"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

// Category icons and colors mapping - keys match the category values from the API
const categoryConfig: Record<string, { icon: LucideIcon; bgColor: string; textColor: string }> = {
  kisiler: { icon: Users, bgColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-600 dark:text-blue-400" },
  gsmler: { icon: Phone, bgColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-600 dark:text-green-400" },
  adresler: { icon: MapPin, bgColor: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-600 dark:text-orange-400" },
  personel: { icon: UserCog, bgColor: "bg-purple-100 dark:bg-purple-900/30", textColor: "text-purple-600 dark:text-purple-400" },
  tanitimlar: { icon: Megaphone, bgColor: "bg-pink-100 dark:bg-pink-900/30", textColor: "text-pink-600 dark:text-pink-400" },
  operasyonlar: { icon: Workflow, bgColor: "bg-indigo-100 dark:bg-indigo-900/30", textColor: "text-indigo-600 dark:text-indigo-400" },
  alarmlar: { icon: Bell, bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-600 dark:text-red-400" },
  takipler: { icon: CalendarClock, bgColor: "bg-cyan-100 dark:bg-cyan-900/30", textColor: "text-cyan-600 dark:text-cyan-400" },
  araclar: { icon: Car, bgColor: "bg-slate-100 dark:bg-slate-900/30", textColor: "text-slate-600 dark:text-slate-400" },
  markalar: { icon: Tag, bgColor: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-600 dark:text-amber-400" },
  modeller: { icon: Tag, bgColor: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-600 dark:text-amber-400" },
  lokasyonlar: { icon: MapPin, bgColor: "bg-teal-100 dark:bg-teal-900/30", textColor: "text-teal-600 dark:text-teal-400" },
  notlar: { icon: StickyNote, bgColor: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-600 dark:text-yellow-400" },
  loglar: { icon: Activity, bgColor: "bg-gray-100 dark:bg-gray-900/30", textColor: "text-gray-600 dark:text-gray-400" },
}

const defaultConfig = { icon: Home, bgColor: "bg-gray-100 dark:bg-gray-900/30", textColor: "text-gray-600 dark:text-gray-400" }

interface SearchResultItemComponentProps {
  item: SearchResultItem
  onSelect: (url: string) => void
}

export function SearchResultItemComponent({ item, onSelect }: SearchResultItemComponentProps) {
  const { t } = useLocale()

  // Map category key to translation
  const getCategoryLabel = (categoryKey: string): string => {
    const keyMap: Record<string, keyof typeof t.search> = {
      kisiler: "kisiler",
      gsmler: "gsmNumaralari",
      adresler: "adresler",
      personel: "personel",
      tanitimlar: "tanitimlar",
      operasyonlar: "operasyonlar",
      alarmlar: "alarmlar",
      takipler: "takipler",
      araclar: "araclar",
      markalar: "markalar",
      modeller: "modeller",
      lokasyonlar: "lokasyonlar",
      notlar: "notlar",
      loglar: "loglar",
    }
    const translationKey = keyMap[categoryKey]
    return translationKey ? t.search[translationKey] : categoryKey
  }

  // Format subtitle based on metadata
  const getFormattedSubtitle = (): string | undefined => {
    if (!item.subtitle && !item.metadata) return undefined

    // Kisiler: Show TC or type
    if (item.metadata?.tc) {
      return `${t.common.tcLabel} ${item.metadata.tc}`
    } else if (item.metadata?.tt !== undefined) {
      return item.metadata.tt ? t.kisiler.tipMusteri : t.kisiler.tipAday
    }

    // Markalar: Show "Marka" label
    if (item.metadata?.isMarka) {
      return t.search.markaLabel
    }

    // Lokasyonlar: Show location type prefix
    if (item.metadata?.locationType) {
      if (item.metadata.locationType === "il") {
        return item.metadata.plaka
          ? interpolate(t.search.ilWithPlaka, { plaka: item.metadata.plaka })
          : t.search.ilLabel
      } else if (item.metadata.locationType === "ilce") {
        return `${t.search.ilceLabel} - ${item.metadata.parentLocation || ""}`
      } else if (item.metadata.locationType === "mahalle") {
        return `${t.search.mahalleLabel} - ${item.metadata.parentLocation || ""}`
      }
    }

    // Default: use subtitle as-is
    return item.subtitle
  }

  const config = categoryConfig[item.category] || defaultConfig
  const Icon = config.icon
  const categoryLabel = getCategoryLabel(item.category)
  const formattedSubtitle = getFormattedSubtitle()

  return (
    <CommandItem
      value={`${item.title} ${item.subtitle || ""} ${item.category}`}
      onSelect={() => onSelect(item.url)}
      className="flex items-center gap-3 px-3 py-2.5 mx-1 my-0.5 rounded-lg cursor-pointer group"
    >
      {/* Icon container */}
      <div className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${config.bgColor}`}>
        <Icon className={`h-5 w-5 ${config.textColor}`} />
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
            {categoryLabel}
          </span>
        </div>
        {formattedSubtitle && (
          <span className="text-xs text-muted-foreground truncate">{formattedSubtitle}</span>
        )}
      </div>

      {/* Arrow indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
    </CommandItem>
  )
}
