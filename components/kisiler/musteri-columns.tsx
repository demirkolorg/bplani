"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Phone, MapPin, Megaphone, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Kisi } from "@/hooks/use-kisiler"
import type { SortOption } from "@/components/shared/data-table"

// Kişi tablosu için özel sıralama seçenekleri
export const kisiSortOptions: SortOption[] = [
  { label: "Ad (A → Z)", value: "ad-asc", column: "ad", direction: "asc" },
  { label: "Ad (Z → A)", value: "ad-desc", column: "ad", direction: "desc" },
  { label: "Soyad (A → Z)", value: "soyad-asc", column: "soyad", direction: "asc" },
  { label: "Soyad (Z → A)", value: "soyad-desc", column: "soyad", direction: "desc" },
  { label: "TC (Küçük → Büyük)", value: "tc-asc", column: "tc", direction: "asc" },
  { label: "TC (Büyük → Küçük)", value: "tc-desc", column: "tc", direction: "desc" },
]

export function getKisiColumns(): ColumnDef<Kisi>[] {
  return [
    // Hidden columns for sorting (date fields)
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
    // Hidden columns for sorting (ad, soyad)
    {
      accessorKey: "ad",
      header: () => null,
      cell: () => null,
    },
    {
      accessorKey: "soyad",
      header: () => null,
      cell: () => null,
    },
    // Visible columns
    {
      id: "tip",
      accessorKey: "tip",
      header: "Tip",
      cell: ({ row }) => {
        const tip = row.original.tip
        return (
          <Badge
            variant="outline"
            className={
              tip === "MUSTERI"
                ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
            }
          >
            {tip === "MUSTERI" ? "Müşteri" : "Aday"}
          </Badge>
        )
      },
    },
    {
      id: "tc",
      accessorKey: "tc",
      header: "TC Kimlik",
      cell: ({ row }) => {
        const tc = row.original.tc
        return tc ? (
          <span className="font-mono text-sm">{tc}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "adSoyad",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ad Soyad
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const ad = row.original.ad
        const soyad = row.original.soyad
        return (
          <div className="font-medium">
            {ad} {soyad}
          </div>
        )
      },
    },
    {
      id: "faaliyet",
      header: "Faaliyet",
      cell: ({ row }) => {
        const faaliyetAlanlari = row.original.faaliyetAlanlari
        if (!faaliyetAlanlari || faaliyetAlanlari.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        const faaliyetler = faaliyetAlanlari.map(f => f.faaliyetAlani.ad)
        const displayText = faaliyetler.join(", ")
        return (
          <span
            className="text-sm max-w-[200px] truncate block"
            title={displayText}
          >
            {displayText.length > 40 ? displayText.substring(0, 40) + "..." : displayText}
          </span>
        )
      },
    },
    {
      id: "gsm",
      header: () => (
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4 text-blue-600" />
          <span>GSM</span>
        </div>
      ),
      cell: ({ row }) => {
        const gsmler = row.original.gsmler
        if (!gsmler || gsmler.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-col gap-0.5">
            {gsmler.map((gsm) => (
              <span key={gsm.id} className={`font-mono text-sm whitespace-nowrap ${!gsm.isPrimary ? "text-muted-foreground" : ""}`}>
                {gsm.numara}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      id: "adres",
      header: () => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-green-600" />
          <span>Adres</span>
        </div>
      ),
      cell: ({ row }) => {
        const adresler = row.original.adresler
        if (!adresler || adresler.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-col gap-0.5">
            {adresler.map((adres) => (
              <span key={adres.id} className={`text-sm whitespace-nowrap ${!adres.isPrimary ? "text-muted-foreground" : ""}`}>
                {adres.mahalle.ilce.il.ad}/{adres.mahalle.ilce.ad}/{adres.mahalle.ad}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      id: "tanitim",
      header: () => (
        <div className="flex items-center gap-1">
          <Megaphone className="h-4 w-4 text-purple-600" />
          <span>Tanıtım</span>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.tanitimlar ?? 0
        return count > 0 ? (
          <Badge variant="secondary" className="font-mono">
            {count}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "not",
      header: () => (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-orange-600" />
          <span>Not</span>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.notlar ?? row.original.notlar?.length ?? 0
        return count > 0 ? (
          <Badge variant="secondary" className="font-mono">
            {count}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "pio",
      header: "PIO",
      cell: ({ row }) => {
        const pio = row.getValue("pio") as boolean
        return pio ? (
          <Badge variant="default">Evet</Badge>
        ) : (
          <Badge variant="secondary">Hayır</Badge>
        )
      },
    },
    {
      accessorKey: "asli",
      header: "Asli",
      cell: ({ row }) => {
        const asli = row.getValue("asli") as boolean
        return asli ? (
          <Badge variant="default">Evet</Badge>
        ) : (
          <Badge variant="secondary">Hayır</Badge>
        )
      },
    },
  ]
}
