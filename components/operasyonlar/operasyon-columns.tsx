"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Users, MapPin, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Operasyon } from "@/hooks/use-operasyonlar"
import type { SortOption } from "@/components/shared/data-table"

// Operasyon tablosu için özel sıralama seçenekleri
export const operasyonSortOptions: SortOption[] = [
  { label: "Tarih (Yeni → Eski)", value: "tarih-desc", column: "tarih", direction: "desc" },
  { label: "Tarih (Eski → Yeni)", value: "tarih-asc", column: "tarih", direction: "asc" },
  { label: "Oluşturulma (Yeni → Eski)", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "Oluşturulma (Eski → Yeni)", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

export function getOperasyonColumns(): ColumnDef<Operasyon>[] {
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
      id: "tarih",
      accessorKey: "tarih",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Tarih
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const tarih = new Date(row.original.tarih)
        const saat = row.original.saat
        return (
          <div className="font-medium">
            {tarih.toLocaleDateString("tr-TR", {
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
          Adres
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
          Katılımcılar
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
                  k.kisi?.tip === "MUSTERI"
                    ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                    : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                }
              >
                {k.kisi ? `${k.kisi.ad} ${k.kisi.soyad}` : "Bilinmeyen"}
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
      header: "Sayı",
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
      header: "Notlar",
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
