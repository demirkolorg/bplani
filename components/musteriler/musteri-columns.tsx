"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Musteri } from "@/hooks/use-musteriler"
import type { SortOption } from "@/components/shared/data-table"

// Müşteri tablosu için özel sıralama seçenekleri
export const musteriSortOptions: SortOption[] = [
  { label: "Ad (A → Z)", value: "ad-asc", column: "ad", direction: "asc" },
  { label: "Ad (Z → A)", value: "ad-desc", column: "ad", direction: "desc" },
  { label: "Soyad (A → Z)", value: "soyad-asc", column: "soyad", direction: "asc" },
  { label: "Soyad (Z → A)", value: "soyad-desc", column: "soyad", direction: "desc" },
  { label: "TC (Küçük → Büyük)", value: "tc-asc", column: "tc", direction: "asc" },
  { label: "TC (Büyük → Küçük)", value: "tc-desc", column: "tc", direction: "desc" },
]

interface ColumnOptions {
  onDelete?: (id: string) => void
}

export function getMusteriColumns({ onDelete }: ColumnOptions = {}): ColumnDef<Musteri>[] {
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
      id: "tc",
      accessorKey: "tc",
      header: "TC Kimlik",
      cell: ({ row }) => {
        const tc = row.original.tc
        return tc || <span className="text-muted-foreground">-</span>
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
      id: "gsm",
      header: "GSM",
      cell: ({ row }) => {
        const gsmler = row.original.gsmler
        if (!gsmler || gsmler.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        // Sort: primary first
        const sorted = [...gsmler].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        return (
          <div className="flex flex-col gap-0.5">
            {sorted.map((gsm, index) => (
              <span
                key={gsm.id}
                className={`font-mono text-sm ${index > 0 ? "text-muted-foreground" : ""}`}
              >
                {gsm.numara}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      id: "adres",
      header: "Adres",
      cell: ({ row }) => {
        const adresler = row.original.adresler
        if (!adresler || adresler.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        // Sort: primary first
        const sorted = [...adresler].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        return (
          <div className="flex flex-col gap-0.5">
            {sorted.map((adres, index) => (
              <span
                key={adres.id}
                className={`text-sm ${index > 0 ? "text-muted-foreground" : ""}`}
              >
                {adres.mahalle.ad} / {adres.mahalle.ilce.ad} / {adres.mahalle.ilce.il.ad}
              </span>
            ))}
          </div>
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const musteri = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/musteriler/${musteri.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/musteriler/${musteri.id}?edit=true`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Düzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(musteri.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
