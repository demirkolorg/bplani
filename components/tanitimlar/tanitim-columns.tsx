"use client"

import { ArrowUpDown, Users, MapPin, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Tanitim } from "@/hooks/use-tanitimlar"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

// Tanıtım tablosu için özel sıralama seçenekleri
export function getTanitimSortOptions(t: Translations): SortOption[] {
  return [
    { label: t.tanitimlar.dateNewOld, value: "tarih-desc", column: "tarih", direction: "desc" },
    { label: t.tanitimlar.dateOldNew, value: "tarih-asc", column: "tarih", direction: "asc" },
    { label: t.tanitimlar.createdNewOld, value: "createdAt-desc", column: "createdAt", direction: "desc" },
    { label: t.tanitimlar.createdOldNew, value: "createdAt-asc", column: "createdAt", direction: "asc" },
  ]
}

// Legacy export for backwards compatibility
export const tanitimSortOptions: SortOption[] = [
  { label: "Tarih (Yeni → Eski)", value: "tarih-desc", column: "tarih", direction: "desc" },
  { label: "Tarih (Eski → Yeni)", value: "tarih-asc", column: "tarih", direction: "asc" },
  { label: "Oluşturulma (Yeni → Eski)", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "Oluşturulma (Eski → Yeni)", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

export function getTanitimColumns(t: Translations, locale: string): DataTableColumnDef<Tanitim>[] {
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US"

  return [
    // Hidden columns for sorting
    {
      accessorKey: "createdAt",
      header: () => null,
      cell: () => null,
    },
    {
      accessorKey: "updatedAt",
      header: () => null,
      cell: () => null,
    },
    // Visible columns
    {
      id: "baslik",
      accessorKey: "baslik",
      header: t.tanitimlar.title,
      cell: ({ row }) => {
        const baslik = row.original.baslik
        const tarih = new Date(row.original.tarih)
        const displayText = baslik || tarih.toLocaleDateString(dateLocale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
        return (
          <div className="font-semibold max-w-[300px] truncate" title={displayText}>
            {displayText}
          </div>
        )
      },
    },
    {
      id: "tarih",
      accessorKey: "tarih",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t.tanitimlar.date}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const tarih = new Date(row.original.tarih)
        const saat = row.original.saat
        return (
          <div className="font-medium">
            {tarih.toLocaleDateString(dateLocale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {saat && (
              <span className="text-muted-foreground text-xs ml-2">
                {saat}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "adres",
      header: () => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t.tanitimlar.address}
        </div>
      ),
      cell: ({ row }) => {
        const mahalle = row.original.mahalle
        const adresDetay = row.original.adresDetay

        if (!mahalle && !adresDetay) {
          return <span className="text-muted-foreground">-</span>
        }

        // Build full address string
        const lokasyon = mahalle
          ? `${mahalle.ad} / ${mahalle.ilce.ad} / ${mahalle.ilce.il.ad}`
          : ""
        const fullAddress = adresDetay
          ? lokasyon
            ? `${adresDetay}, ${lokasyon}`
            : adresDetay
          : lokasyon

        return (
          <span
            className="text-sm max-w-[250px] truncate block"
            title={fullAddress}
          >
            {fullAddress}
          </span>
        )
      },
    },
    {
      id: "katilimcilar",
      header: () => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t.tanitimlar.participants}
        </div>
      ),
      cell: ({ row }) => {
        const katilimcilar = row.original.katilimcilar
        if (!katilimcilar || katilimcilar.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }

        const displayCount = 3
        const displayedKatilimcilar = katilimcilar.slice(0, displayCount)
        const remainingCount = katilimcilar.length - displayCount

        return (
          <div className="flex flex-wrap gap-1">
            {displayedKatilimcilar.map((k) => (
              <Badge
                key={k.id}
                variant="outline"
                className={
                  k.kisi?.tt
                    ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                    : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                }
              >
                {k.kisi ? `${k.kisi.ad} ${k.kisi.soyad}` : t.tanitimlar.unknownPerson}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="secondary">+{remainingCount}</Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "katilimciSayisi",
      header: t.tanitimlar.count,
      cell: ({ row }) => {
        const count = row.original.katilimcilar?.length || 0
        return (
          <Badge variant="secondary" className="font-mono">
            {count}
          </Badge>
        )
      },
    },
    {
      id: "notlar",
      header: t.tanitimlar.notes,
      cell: ({ row }) => {
        const notlar = row.original.notlar
        if (!notlar) {
          return <span className="text-muted-foreground">-</span>
        }
        // HTML taglerini temizle ve kısalt
        const cleanText = notlar.replace(/<[^>]*>/g, "")
        return (
          <span
            className="text-sm max-w-[200px] truncate block text-muted-foreground"
            title={cleanText}
          >
            {cleanText.length > 50 ? cleanText.substring(0, 50) + "..." : cleanText}
          </span>
        )
      },
    },
  ]
}
