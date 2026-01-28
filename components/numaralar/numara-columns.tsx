"use client"

import { Phone, Check, X, ExternalLink } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { tr as trLocale } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTabs } from "@/components/providers/tab-provider"
import type { NumaraWithKisi } from "@/hooks/use-numaralar"
import type { SortOption } from "@/components/shared/data-table"
import type { NumaralarTranslations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

// Numara tablosu için sıralama seçenekleri
export function getNumaraSortOptions(t: NumaralarTranslations): SortOption[] {
  return [
    { label: t.numaraAZ, value: "numara-asc", column: "numara", direction: "asc" },
    { label: t.numaraZA, value: "numara-desc", column: "numara", direction: "desc" },
    { label: t.kisiAdAZ, value: "kisiAd-asc", column: "kisiAd", direction: "asc" },
    { label: t.kisiAdZA, value: "kisiAd-desc", column: "kisiAd", direction: "desc" },
    { label: t.enYeni, value: "createdAt-desc", column: "createdAt", direction: "desc" },
    { label: t.enEski, value: "createdAt-asc", column: "createdAt", direction: "asc" },
  ]
}

export function getNumaraColumns(t: NumaralarTranslations): DataTableColumnDef<NumaraWithKisi>[] {
  return [
    // Hidden columns for sorting
    {
      accessorKey: "createdAt",
      header: () => null,
      cell: () => null,
    },
    // Visible columns
    {
      id: "numara",
      accessorKey: "numara",
      header: () => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-600" />
          <span>{t.numara}</span>
        </div>
      ),
      cell: ({ row }) => {
        const numara = row.original.numara
        const gsmId = row.original.id
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { openTab } = useTabs()

        return (
          <Button
            variant="link"
            className="p-0 h-auto font-mono font-medium hover:text-primary group"
            onClick={() => openTab(`/numaralar/${gsmId}`)}
          >
            {numara}
            <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        )
      },
      meta: {
        filterConfig: {
          columnId: "numara",
          type: "text",
          operators: ["contains", "equals", "inList"],
          placeholder: "555...",
          label: t.numara,
        },
      },
    },
    {
      id: "kisiAdSoyad",
      header: t.kisi,
      cell: ({ row }) => {
        const kisi = row.original.kisi
        return (
          <div>
            <span className="font-medium">
              {kisi.ad} {kisi.soyad}
            </span>
            {kisi.tc && (
              <span className="text-muted-foreground text-sm ml-1">
                ({kisi.tc})
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "kisiTip",
      header: t.tip,
      cell: ({ row }) => {
        const tt = row.original.kisi.tt
        return (
          <Badge
            variant="outline"
            className={
              tt
                ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
            }
          >
            {tt ? t.musteri : t.aday}
          </Badge>
        )
      },
      accessorFn: (row) => row.kisi?.tt,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === "all") return true
        const tt = row.original.kisi?.tt
        return String(tt) === String(filterValue)
      },
      meta: {
        filterConfig: {
          columnId: "kisiTip",
          type: "boolean",
          operators: ["equals"],
          options: [
            { value: "all", label: t.tumu || "Tümü" },
            { value: "true", label: t.musteri },
            { value: "false", label: t.aday },
          ],
          defaultOperator: "equals",
          label: t.tip,
          customFilterFn: (row, filterValue, operator) => {
            if (filterValue === "all") return true
            const tt = row.kisi?.tt
            return String(tt) === String(filterValue)
          },
        },
      },
    },
    {
      id: "takipVar",
      header: t.takip,
      cell: ({ row }) => {
        const takipler = row.original.takipler
        const hasTakip = takipler && takipler.length > 0
        return hasTakip ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">{t.takipVar}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="text-sm">{t.takipYok}</span>
          </div>
        )
      },
      accessorFn: (row) => row.takipler && row.takipler.length > 0,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === "all") return true
        const hasTakip = row.original.takipler && row.original.takipler.length > 0
        return String(hasTakip) === String(filterValue)
      },
      meta: {
        filterConfig: {
          columnId: "takipVar",
          type: "boolean",
          operators: ["equals"],
          options: [
            { value: "all", label: t.tumu || "Tümü" },
            { value: "true", label: t.takipVar },
            { value: "false", label: t.takipYok },
          ],
          defaultOperator: "equals",
          label: t.takip,
          customFilterFn: (row, filterValue, operator) => {
            if (filterValue === "all") return true
            const hasTakip = row.takipler && row.takipler.length > 0
            return String(hasTakip) === String(filterValue)
          },
        },
      },
    },
    {
      id: "baslamaTarihi",
      header: t.baslama,
      cell: ({ row }) => {
        const takipler = row.original.takipler
        if (!takipler || takipler.length === 0 || !takipler[0].baslamaTarihi) {
          return <span className="text-muted-foreground">-</span>
        }
        const baslamaTarihi = new Date(takipler[0].baslamaTarihi)
        if (isNaN(baslamaTarihi.getTime())) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <span className="text-sm">
            {format(baslamaTarihi, "d MMM yyyy", { locale: trLocale })}
          </span>
        )
      },
      accessorFn: (row) => row.takipler?.[0]?.baslamaTarihi || null,
      meta: {
        filterConfig: {
          columnId: "baslamaTarihi",
          type: "date",
          operators: ["before", "after", "between"],
          label: t.baslama,
          customFilterFn: (row, filterValue, operator) => {
            const takipler = row.takipler
            if (!takipler || takipler.length === 0 || !takipler[0].baslamaTarihi) {
              return false
            }
            const baslamaTarihi = new Date(takipler[0].baslamaTarihi)
            if (isNaN(baslamaTarihi.getTime())) return false

            const filterDate = new Date(filterValue as string)
            if (isNaN(filterDate.getTime())) {
              // Handle between
              if (
                operator === "between" &&
                typeof filterValue === "object" &&
                filterValue !== null &&
                "min" in filterValue &&
                "max" in filterValue
              ) {
                const minDate = new Date((filterValue as any).min)
                const maxDate = new Date((filterValue as any).max)
                return baslamaTarihi >= minDate && baslamaTarihi <= maxDate
              }
              return false
            }

            switch (operator) {
              case "before":
                return baslamaTarihi < filterDate
              case "after":
                return baslamaTarihi > filterDate
              case "equals":
                return baslamaTarihi.toDateString() === filterDate.toDateString()
              default:
                return false
            }
          },
        },
      },
    },
    {
      id: "bitisTarihi",
      header: t.bitis,
      cell: ({ row }) => {
        const takipler = row.original.takipler
        if (!takipler || takipler.length === 0 || !takipler[0].bitisTarihi) {
          return <span className="text-muted-foreground">-</span>
        }
        const bitisTarihi = new Date(takipler[0].bitisTarihi)
        if (isNaN(bitisTarihi.getTime())) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <span className="text-sm">
            {format(bitisTarihi, "d MMM yyyy", { locale: trLocale })}
          </span>
        )
      },
    },
    {
      id: "kalanGun",
      header: t.kalanGun,
      cell: ({ row }) => {
        const takipler = row.original.takipler
        if (!takipler || takipler.length === 0 || !takipler[0].bitisTarihi) {
          return <span className="text-muted-foreground">-</span>
        }
        const bitisTarihi = new Date(takipler[0].bitisTarihi)
        if (isNaN(bitisTarihi.getTime())) {
          return <span className="text-muted-foreground">-</span>
        }
        const today = new Date()
        const kalanGun = differenceInDays(bitisTarihi, today)

        if (kalanGun < 0) {
          return (
            <Badge variant="destructive" className="font-mono">
              {Math.abs(kalanGun)} {t.gunGecti}
            </Badge>
          )
        } else if (kalanGun === 0) {
          return (
            <Badge variant="destructive" className="font-mono">
              {t.bugun}
            </Badge>
          )
        } else if (kalanGun <= 7) {
          return (
            <Badge variant="destructive" className="font-mono">
              {kalanGun} {t.gun}
            </Badge>
          )
        } else if (kalanGun <= 30) {
          return (
            <Badge variant="secondary" className="font-mono bg-amber-100 text-amber-800 border-amber-300">
              {kalanGun} {t.gun}
            </Badge>
          )
        } else {
          return (
            <Badge variant="secondary" className="font-mono">
              {kalanGun} {t.gun}
            </Badge>
          )
        }
      },
      accessorFn: (row) => {
        const takipler = row.takipler
        if (!takipler || takipler.length === 0 || !takipler[0].bitisTarihi) return null
        const bitisTarihi = new Date(takipler[0].bitisTarihi)
        if (isNaN(bitisTarihi.getTime())) return null
        const today = new Date()
        return differenceInDays(bitisTarihi, today)
      },
      meta: {
        filterConfig: {
          columnId: "kalanGun",
          type: "computed",
          operators: ["equals", "greaterThan", "lessThan", "between"],
          label: t.kalanGun,
          customFilterFn: (row, filterValue, operator) => {
            const takipler = row.takipler
            if (!takipler || takipler.length === 0 || !takipler[0].bitisTarihi) {
              return false
            }
            const bitisTarihi = new Date(takipler[0].bitisTarihi)
            if (isNaN(bitisTarihi.getTime())) return false

            const today = new Date()
            const kalanGun = differenceInDays(bitisTarihi, today)

            switch (operator) {
              case "equals":
                return kalanGun === Number(filterValue)
              case "greaterThan":
                return kalanGun > Number(filterValue)
              case "lessThan":
                return kalanGun < Number(filterValue)
              case "between":
                if (
                  typeof filterValue === "object" &&
                  filterValue !== null &&
                  "min" in filterValue &&
                  "max" in filterValue
                ) {
                  const min = Number((filterValue as any).min)
                  const max = Number((filterValue as any).max)
                  return kalanGun >= min && kalanGun <= max
                }
                return false
              default:
                return false
            }
          },
        },
      },
    },
  ]
}
