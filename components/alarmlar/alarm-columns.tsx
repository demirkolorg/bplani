"use client"

import { User, Phone, Pause, Clock } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { tr as trLocale, enUS } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import type { Alarm } from "@/hooks/use-alarmlar"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import { interpolate } from "@/locales"
import type { DataTableColumnDef } from "@/lib/data-table/types"
import { createOperatorFilterFn } from "@/lib/data-table/column-filter-fns"

// Alarm tablosu için sıralama seçenekleri
export function getAlarmSortOptions(t: Translations): SortOption[] {
  return [
    { label: t.alarmlar.tetikDateNear, value: "tetikTarihi-asc", column: "tetikTarihi", direction: "asc" },
    { label: t.alarmlar.tetikDateFar, value: "tetikTarihi-desc", column: "tetikTarihi", direction: "desc" },
    { label: t.alarmlar.createdNew, value: "createdAt-desc", column: "createdAt", direction: "desc" },
    { label: t.alarmlar.createdOld, value: "createdAt-asc", column: "createdAt", direction: "asc" },
  ]
}

// Legacy export for backwards compatibility
export const alarmSortOptions: SortOption[] = [
  { label: "Tetik Tarihi (Yakın)", value: "tetikTarihi-asc", column: "tetikTarihi", direction: "asc" },
  { label: "Tetik Tarihi (Uzak)", value: "tetikTarihi-desc", column: "tetikTarihi", direction: "desc" },
  { label: "Oluşturma (Yeni)", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "Oluşturma (Eski)", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

export function getAlarmColumns(t: Translations, locale: string): DataTableColumnDef<Alarm>[] {
  const dateLocale = locale === "tr" ? trLocale : enUS

  // Tip labels
  const tipLabels: Record<string, string> = {
    TAKIP_BITIS: t.alarmlar.tipTakipBitis,
    ODEME_HATIRLATMA: t.alarmlar.tipOdemeHatirlatma,
    OZEL: t.alarmlar.tipOzel,
  }

  // Durum labels and colors
  const durumConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    BEKLIYOR: { label: t.alarmlar.durumBekliyor, variant: "secondary" },
    TETIKLENDI: { label: t.alarmlar.durumTetiklendi, variant: "destructive" },
    GORULDU: { label: t.alarmlar.durumGoruldu, variant: "outline" },
    IPTAL: { label: t.alarmlar.durumIptal, variant: "outline" },
  }

  return [
    // Hidden columns for sorting
    {
      accessorKey: "createdAt",
      header: () => null,
      cell: () => null,
    },
    // Visible columns
    {
      id: "durum",
      accessorKey: "durum",
      header: t.alarmlar.durum,
      cell: ({ row }) => {
        const durum = row.original.durum
        const isPaused = row.original.isPaused
        const config = durumConfig[durum] || { label: durum, variant: "secondary" as const }

        return (
          <div className="flex items-center gap-2">
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
            {isPaused && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <Pause className="h-3 w-3 mr-1" />
                {t.alarmlar.paused}
              </Badge>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: string | string[] }
        const cellValue = row.getValue<string>(columnId)

        if (operator === "equals") return cellValue === value
        if (operator === "in") return Array.isArray(value) && value.includes(cellValue)
        return false
      },
      meta: {
        filterConfig: {
          type: "enum",
          operators: ["equals", "in"],
          defaultOperator: "in",
          options: [
            { value: "BEKLIYOR", label: t.alarmlar.durumBekliyor },
            { value: "TETIKLENDI", label: t.alarmlar.durumTetiklendi },
            { value: "GORULDU", label: t.alarmlar.durumGoruldu },
            { value: "IPTAL", label: t.alarmlar.durumIptal },
          ],
          placeholder: t.alarmlar.durum,
        }
      },
    },
    {
      id: "tip",
      accessorKey: "tip",
      header: t.alarmlar.tip,
      cell: ({ row }) => {
        const tip = row.original.tip
        return (
          <Badge variant="outline">
            {tipLabels[tip] || tip}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: string | string[] }
        const cellValue = row.getValue<string>(columnId)

        if (operator === "equals") return cellValue === value
        if (operator === "in") return Array.isArray(value) && value.includes(cellValue)
        return false
      },
      meta: {
        filterConfig: {
          type: "enum",
          operators: ["equals", "in"],
          defaultOperator: "in",
          options: [
            { value: "TAKIP_BITIS", label: t.alarmlar.tipTakipBitis },
            { value: "ODEME_HATIRLATMA", label: t.alarmlar.tipOdemeHatirlatma },
            { value: "OZEL", label: t.alarmlar.tipOzel },
          ],
          placeholder: t.alarmlar.tip,
        }
      },
    },
    {
      id: "baslik",
      accessorFn: (row) => `${row.baslik || ""} ${row.mesaj || ""}`,
      header: t.alarmlar.baslikMesaj,
      cell: ({ row }) => {
        const baslik = row.original.baslik
        const mesaj = row.original.mesaj
        return (
          <div>
            {baslik && <div className="font-medium">{baslik}</div>}
            {mesaj && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {mesaj}
              </div>
            )}
            {!baslik && !mesaj && (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        )
      },
      filterFn: createOperatorFilterFn<Alarm>(
        (row) => `${row.baslik || ""} ${row.mesaj || ""}`,
        "text"
      ),
      meta: {
        filterConfig: {
          type: "text",
          operators: ["contains"],
          defaultOperator: "contains",
          placeholder: t.alarmlar.baslikMesaj,
        }
      },
    },
    {
      id: "kisi",
      header: t.alarmlar.person,
      cell: ({ row }) => {
        const kisi = row.original.takip?.gsm?.kisi
        const numara = row.original.takip?.gsm?.numara

        if (!kisi) {
          return <span className="text-muted-foreground">-</span>
        }

        return (
          <div>
            <div className="flex items-center gap-1 font-medium">
              <User className="h-3 w-3" />
              {kisi.ad} {kisi.soyad}
            </div>
            {numara && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="font-mono">{numara}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "tetikTarihi",
      accessorKey: "tetikTarihi",
      header: t.alarmlar.tetikTarihi,
      cell: ({ row }) => {
        const tetikTarihi = new Date(row.original.tetikTarihi)
        const today = new Date()
        const diff = differenceInDays(tetikTarihi, today)

        let color = ""
        if (diff < 0) {
          color = "text-destructive"
        } else if (diff === 0) {
          color = "text-destructive font-medium"
        } else if (diff <= 7) {
          color = "text-orange-600"
        }

        return (
          <div className={color}>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(tetikTarihi, "d MMM yyyy", { locale: dateLocale })}
            </div>
            <div className="text-xs text-muted-foreground">
              {diff < 0
                ? interpolate(t.alarmlar.daysAgo, { days: Math.abs(diff) })
                : diff === 0
                ? t.alarmlar.today
                : interpolate(t.alarmlar.daysLeft, { days: diff })}
            </div>
          </div>
        )
      },
      filterFn: createOperatorFilterFn<Alarm>(
        (row) => row.tetikTarihi,
        "date"
      ),
      meta: {
        filterConfig: {
          type: "date",
          operators: ["before", "after", "between"],
          defaultOperator: "before",
          placeholder: t.alarmlar.tetikTarihi,
        }
      },
    },
    {
      id: "gunOnce",
      accessorKey: "gunOnce",
      header: t.alarmlar.gunOnce,
      cell: ({ row }) => {
        return (
          <Badge variant="secondary" className="font-mono">
            {row.original.gunOnce} {t.alarmlar.days}
          </Badge>
        )
      },
      filterFn: createOperatorFilterFn<Alarm>(
        (row) => row.gunOnce,
        "number"
      ),
      meta: {
        filterConfig: {
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          defaultOperator: "equals",
          placeholder: t.alarmlar.gunOnce,
        }
      },
    },
    {
      id: "olusturan",
      header: t.alarmlar.olusturan,
      cell: ({ row }) => {
        const user = row.original.createdUser
        if (!user) {
          return <span className="text-muted-foreground text-sm">{t.alarmlar.sistem}</span>
        }
        return (
          <span className="text-sm">
            {user.ad} {user.soyad}
          </span>
        )
      },
    },
  ]
}
