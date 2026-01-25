"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
  type LucideIcon,
} from "lucide-react"
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"
import { useGlobalSearch } from "@/hooks/use-global-search"
import { SearchResultItemComponent } from "./search-result-item"
import type { SearchResultItem } from "@/lib/validations"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

// Category icons mapping
const categoryIcons: Record<string, LucideIcon> = {
  kisiler: Users,
  gsmler: Phone,
  adresler: MapPin,
  personel: UserCog,
  tanitimlar: Megaphone,
  operasyonlar: Workflow,
  alarmlar: Bell,
  takipler: CalendarClock,
  araclar: Car,
  markalar: Tag,
  modeller: Tag,
  lokasyonlar: MapPin,
  notlar: StickyNote,
  loglar: Activity,
}

// Category order for display
const categoryOrder = [
  "kisiler",
  "gsmler",
  "adresler",
  "personel",
  "takipler",
  "tanitimlar",
  "operasyonlar",
  "alarmlar",
  "araclar",
  "markalar",
  "modeller",
  "lokasyonlar",
  "notlar",
  "loglar",
]

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [query, setQuery] = React.useState("")
  const { data, isLoading, isFetching } = useGlobalSearch(query, locale)

  // Get category label from translations
  const getCategoryLabel = React.useCallback((categoryKey: string): string => {
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
  }, [t.search])

  // Reset query when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  const handleSelect = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  // Get non-empty categories in order
  const nonEmptyCategories = React.useMemo(() => {
    if (!data?.results) return []

    return categoryOrder.filter((key) => {
      const items = data.results[key as keyof typeof data.results]
      return items && items.length > 0
    })
  }, [data?.results])

  const showLoading = (isLoading || isFetching) && query.length >= 2
  const showEmpty = !showLoading && query.length >= 2 && data?.totalResults === 0
  const showResults = !showLoading && query.length >= 2 && nonEmptyCategories.length > 0
  const showHint = query.length < 2

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.search.globalSearch}
      description={t.search.searchDescription}
      className="sm:max-w-2xl max-w-[calc(100%-2rem)]"
    >
      <Command shouldFilter={false} className="rounded-xl">
        <CommandInput
          placeholder={t.search.searchPlaceholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          {showHint && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t.search.startTypingToSearch}
            </div>
          )}

          {showLoading && (
            <div className="p-3 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-3 py-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {showEmpty && (
            <CommandEmpty>
              {interpolate(t.search.noResultsFor, { query })}
            </CommandEmpty>
          )}

          {showResults && data && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                {interpolate(t.search.resultsFound, { count: data.totalResults })}
              </div>
              {nonEmptyCategories.map((categoryKey) => {
                const Icon = categoryIcons[categoryKey]
                const items = data.results[categoryKey as keyof typeof data.results] as SearchResultItem[]
                const categoryLabel = getCategoryLabel(categoryKey)

                return (
                  <CommandGroup
                    key={categoryKey}
                    heading={
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        <span>{categoryLabel}</span>
                        <span className="text-muted-foreground/60">({items.length})</span>
                      </div>
                    }
                  >
                    {items.map((item) => (
                      <SearchResultItemComponent
                        key={`${categoryKey}-${item.id}`}
                        item={item}
                        onSelect={handleSelect}
                      />
                    ))}
                  </CommandGroup>
                )
              })}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
