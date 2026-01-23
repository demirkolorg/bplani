"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Car, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Arac } from "@/hooks/use-araclar-vehicles"
import type { SortOption } from "@/components/shared/data-table"
import { aracRenkLabels, type AracRenk } from "@/lib/validations"

// Araç tablosu için sıralama seçenekleri
export const aracSortOptions: SortOption[] = [
  { label: "Plaka (A → Z)", value: "plaka-asc", column: "plaka", direction: "asc" },
  { label: "Plaka (Z → A)", value: "plaka-desc", column: "plaka", direction: "desc" },
  { label: "En Yeni", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "En Eski", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

export function getAracColumns(): ColumnDef<Arac>[] {
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
          <span>Plaka</span>
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
      header: "Marka / Model",
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
      header: "Renk",
      cell: ({ row }) => {
        const renk = row.original.renk
        return renk ? (
          <span>{aracRenkLabels[renk as AracRenk] || renk}</span>
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
          <span>Kişiler</span>
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
              <Badge
                key={ak.kisi.id}
                variant="outline"
                className={
                  ak.kisi.tip === "MUSTERI"
                    ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                    : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                }
              >
                {ak.kisi.ad} {ak.kisi.soyad}
              </Badge>
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
