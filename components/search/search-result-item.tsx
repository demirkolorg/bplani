"use client"

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

// Category icons and colors mapping
const categoryConfig: Record<string, { icon: LucideIcon; bgColor: string; textColor: string }> = {
  "Kişiler": { icon: Users, bgColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-600 dark:text-blue-400" },
  "GSM": { icon: Phone, bgColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-600 dark:text-green-400" },
  "Adresler": { icon: MapPin, bgColor: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-600 dark:text-orange-400" },
  "Personel": { icon: UserCog, bgColor: "bg-purple-100 dark:bg-purple-900/30", textColor: "text-purple-600 dark:text-purple-400" },
  "Tanıtımlar": { icon: Megaphone, bgColor: "bg-pink-100 dark:bg-pink-900/30", textColor: "text-pink-600 dark:text-pink-400" },
  "Operasyonlar": { icon: Workflow, bgColor: "bg-indigo-100 dark:bg-indigo-900/30", textColor: "text-indigo-600 dark:text-indigo-400" },
  "Alarmlar": { icon: Bell, bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-600 dark:text-red-400" },
  "Takipler": { icon: CalendarClock, bgColor: "bg-cyan-100 dark:bg-cyan-900/30", textColor: "text-cyan-600 dark:text-cyan-400" },
  "Araçlar": { icon: Car, bgColor: "bg-slate-100 dark:bg-slate-900/30", textColor: "text-slate-600 dark:text-slate-400" },
  "Markalar": { icon: Tag, bgColor: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-600 dark:text-amber-400" },
  "Modeller": { icon: Tag, bgColor: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-600 dark:text-amber-400" },
  "Lokasyonlar": { icon: MapPin, bgColor: "bg-teal-100 dark:bg-teal-900/30", textColor: "text-teal-600 dark:text-teal-400" },
  "Notlar": { icon: StickyNote, bgColor: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-600 dark:text-yellow-400" },
  "Loglar": { icon: Activity, bgColor: "bg-gray-100 dark:bg-gray-900/30", textColor: "text-gray-600 dark:text-gray-400" },
}

const defaultConfig = { icon: Home, bgColor: "bg-gray-100 dark:bg-gray-900/30", textColor: "text-gray-600 dark:text-gray-400" }

interface SearchResultItemComponentProps {
  item: SearchResultItem
  onSelect: (url: string) => void
}

export function SearchResultItemComponent({ item, onSelect }: SearchResultItemComponentProps) {
  const config = categoryConfig[item.category] || defaultConfig
  const Icon = config.icon

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
            {item.category}
          </span>
        </div>
        {item.subtitle && (
          <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
        )}
      </div>

      {/* Arrow indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
    </CommandItem>
  )
}
