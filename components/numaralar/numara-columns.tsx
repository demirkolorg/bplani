"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Phone, Check, X } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { tr } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import type { NumaraWithKisi } from "@/hooks/use-numaralar"
import type { SortOption } from "@/components/shared/data-table"

// Numara tablosu için sıralama seçenekleri
export const numaraSortOptions: SortOption[] = [
  { label: "Numara (A → Z)", value: "numara-asc", column: "numara", direction: "asc" },
  { label: "Numara (Z → A)", value: "numara-desc", column: "numara", direction: "desc" },
  { label: "Kişi Adı (A → Z)", value: "kisiAd-asc", column: "kisiAd", direction: "asc" },
  { label: "Kişi Adı (Z → A)", value: "kisiAd-desc", column: "kisiAd", direction: "desc" },
  { label: "En Yeni", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "En Eski", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

export function getNumaraColumns(): ColumnDef<NumaraWithKisi>[] {
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
          <span>Numara</span>
        </div>
      ),
      cell: ({ row }) => {
        const numara = row.original.numara
        return (
          <span className="font-mono font-medium">{numara}</span>
        )
      },
    },
    {
      id: "kisiAdSoyad",
      header: "Kişi",
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
      header: "Tip",
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
            {tt ? "Müşteri" : "Aday"}
          </Badge>
        )
      },
    },
    {
      id: "takipVar",
      header: "Takip",
      cell: ({ row }) => {
        const takipler = row.original.takipler
        const hasTakip = takipler && takipler.length > 0
        return hasTakip ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">Var</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="text-sm">Yok</span>
          </div>
        )
      },
    },
    {
      id: "baslamaTarihi",
      header: "Başlama",
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
            {format(baslamaTarihi, "d MMM yyyy", { locale: tr })}
          </span>
        )
      },
    },
    {
      id: "bitisTarihi",
      header: "Bitiş",
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
            {format(bitisTarihi, "d MMM yyyy", { locale: tr })}
          </span>
        )
      },
    },
    {
      id: "kalanGun",
      header: "Kalan Gün",
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
              {Math.abs(kalanGun)} gün geçti
            </Badge>
          )
        } else if (kalanGun === 0) {
          return (
            <Badge variant="destructive" className="font-mono">
              Bugün
            </Badge>
          )
        } else if (kalanGun <= 7) {
          return (
            <Badge variant="destructive" className="font-mono">
              {kalanGun} gün
            </Badge>
          )
        } else if (kalanGun <= 30) {
          return (
            <Badge variant="secondary" className="font-mono bg-amber-100 text-amber-800 border-amber-300">
              {kalanGun} gün
            </Badge>
          )
        } else {
          return (
            <Badge variant="secondary" className="font-mono">
              {kalanGun} gün
            </Badge>
          )
        }
      },
    },
  ]
}
