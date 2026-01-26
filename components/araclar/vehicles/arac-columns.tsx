"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Car, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import type { Arac } from "@/hooks/use-araclar-vehicles"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import type { AracRenk } from "@/lib/validations"

// Helper to get translated color labels
export function getAracRenkLabels(t: Translations): Record<AracRenk, string> {
  return {
    BEYAZ: t.araclar.renkBeyaz,
    SIYAH: t.araclar.renkSiyah,
    GRI: t.araclar.renkGri,
    GUMUS: t.araclar.renkGumus,
    KIRMIZI: t.araclar.renkKirmizi,
    MAVI: t.araclar.renkMavi,
    LACIVERT: t.araclar.renkLacivert,
    YESIL: t.araclar.renkYesil,
    SARI: t.araclar.renkSari,
    TURUNCU: t.araclar.renkTuruncu,
    KAHVERENGI: t.araclar.renkKahverengi,
    BEJ: t.araclar.renkBej,
    BORDO: t.araclar.renkBordo,
    MOR: t.araclar.renkMor,
    PEMBE: t.araclar.renkPembe,
    ALTIN: t.araclar.renkAltin,
    BRONZ: t.araclar.renkBronz,
    DIGER: t.araclar.renkDiger,
  }
}

// Araç tablosu için sıralama seçenekleri
export function getAracSortOptions(t: Translations): SortOption[] {
  return [
    { label: t.araclar.sortPlateAsc, value: "plaka-asc", column: "plaka", direction: "asc" },
    { label: t.araclar.sortPlateDesc, value: "plaka-desc", column: "plaka", direction: "desc" },
    { label: t.araclar.sortNewest, value: "createdAt-desc", column: "createdAt", direction: "desc" },
    { label: t.araclar.sortOldest, value: "createdAt-asc", column: "createdAt", direction: "asc" },
  ]
}

export function getAracColumns(t: Translations): ColumnDef<Arac>[] {
  const renkLabels = getAracRenkLabels(t)

  return [
    // Hidden columns for sorting
    {
      accessorKey: "createdAt",
      header: () => null,
      cell: () => null,
    },
    // Visible columns
    {
      id: "plaka",
      accessorKey: "plaka",
      header: () => (
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-blue-600" />
          <span>{t.araclar.plaka}</span>
        </div>
      ),
      cell: ({ row }) => {
        const plaka = row.original.plaka
        return (
          <span className="font-mono font-medium">{plaka}</span>
        )
      },
    },
    {
      id: "markaModel",
      header: t.araclar.markaModel,
      cell: ({ row }) => {
        const model = row.original.model
        return (
          <div>
            <span className="font-medium">{model.marka.ad}</span>
            <span className="text-muted-foreground"> / {model.ad}</span>
          </div>
        )
      },
    },
    {
      id: "renk",
      accessorKey: "renk",
      header: t.araclar.renk,
      cell: ({ row }) => {
        const renk = row.original.renk
        return renk ? (
          <span>{renkLabels[renk as AracRenk] || renk}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "kisiler",
      header: () => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{t.araclar.kisiler}</span>
        </div>
      ),
      cell: ({ row }) => {
        const kisiler = row.original.kisiler
        if (!kisiler || kisiler.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }

        const displayCount = 2
        const displayedKisiler = kisiler.slice(0, displayCount)
        const remainingCount = kisiler.length - displayCount

        return (
          <div className="flex flex-wrap gap-1">
            {displayedKisiler.map((ak) => (
              <Link
                key={ak.kisi.id}
                href={`/kisiler/${ak.kisi.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="outline"
                  className={`cursor-pointer hover:opacity-80 transition-opacity ${
                    ak.kisi.tt
                      ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                      : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                  }`}
                >
                  {ak.kisi.ad} {ak.kisi.soyad}
                </Badge>
              </Link>
            ))}
            {remainingCount > 0 && (
              <Badge variant="secondary">+{remainingCount}</Badge>
            )}
          </div>
        )
      },
    },
  ]
}
