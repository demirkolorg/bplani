"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, Eye, Bell } from "lucide-react"
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
import type { Takip } from "@/hooks/use-takip"
import type { SortOption } from "@/components/shared/data-table"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"

// Takip tablosu için özel sıralama seçenekleri
export const takipSortOptions: SortOption[] = [
  { label: "Bitiş Tarihi (Yakın → Uzak)", value: "bitisTarihi-asc", column: "bitisTarihi", direction: "asc" },
  { label: "Bitiş Tarihi (Uzak → Yakın)", value: "bitisTarihi-desc", column: "bitisTarihi", direction: "desc" },
  { label: "Başlama Tarihi (Eski → Yeni)", value: "baslamaTarihi-asc", column: "baslamaTarihi", direction: "asc" },
  { label: "Başlama Tarihi (Yeni → Eski)", value: "baslamaTarihi-desc", column: "baslamaTarihi", direction: "desc" },
]

// Durum badge variant mapping
const durumVariants: Record<TakipDurum, "default" | "secondary" | "destructive" | "outline"> = {
  UZATILACAK: "default",
  DEVAM_EDECEK: "secondary",
  SONLANDIRILACAK: "destructive",
  UZATILDI: "outline",
}

interface ColumnOptions {
  onEdit?: (takip: Takip) => void
  onDelete?: (id: string) => void
}

export function getTakipColumns({ onEdit, onDelete }: ColumnOptions = {}): ColumnDef<Takip>[] {
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
    {
      accessorKey: "baslamaTarihi",
      header: () => null,
      cell: () => null,
    },
    {
      accessorKey: "bitisTarihi",
      header: () => null,
      cell: () => null,
    },
    // Visible columns
    {
      id: "musteri",
      header: "Müşteri",
      cell: ({ row }) => {
        const musteri = row.original.gsm.musteri
        if (!musteri) return <span className="text-muted-foreground">-</span>
        return (
          <Link
            href={`/musteriler/${musteri.id}`}
            className="font-medium hover:underline"
          >
            {musteri.ad} {musteri.soyad}
          </Link>
        )
      },
    },
    {
      id: "gsm",
      header: "GSM",
      cell: ({ row }) => {
        return <span className="font-mono text-sm">{row.original.gsm.numara}</span>
      },
    },
    {
      id: "baslamaTarihiDisplay",
      header: "Başlama",
      cell: ({ row }) => {
        const date = new Date(row.original.baslamaTarihi)
        return (
          <span className="text-sm">
            {date.toLocaleDateString("tr-TR")}
          </span>
        )
      },
    },
    {
      id: "bitisTarihiDisplay",
      header: "Bitiş",
      cell: ({ row }) => {
        const date = new Date(row.original.bitisTarihi)
        return (
          <span className="text-sm">
            {date.toLocaleDateString("tr-TR")}
          </span>
        )
      },
    },
    {
      id: "kalanGun",
      header: "Kalan Gün",
      cell: ({ row }) => {
        const date = new Date(row.original.bitisTarihi)
        const now = new Date()
        const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
        const isExpired = daysLeft <= 0

        if (isExpired) {
          return (
            <Badge variant="destructive" className="text-xs">
              Süresi Doldu
            </Badge>
          )
        }

        if (isExpiringSoon) {
          return (
            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
              {daysLeft} gün
            </Badge>
          )
        }

        return (
          <span className="text-sm font-medium">
            {daysLeft} gün
          </span>
        )
      },
    },
    {
      id: "durum",
      header: "Durum",
      cell: ({ row }) => {
        const durum = row.original.durum as TakipDurum
        const isActive = row.original.isActive
        return (
          <div className="flex items-center gap-2">
            <Badge variant={durumVariants[durum]}>
              {takipDurumLabels[durum]}
            </Badge>
            {isActive && (
              <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full" title="Aktif takip" />
            )}
          </div>
        )
      },
    },
    {
      id: "alarmlar",
      header: "Alarm",
      cell: ({ row }) => {
        const count = row.original._count?.alarmlar || 0
        if (count === 0) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-1">
            <Bell className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{count}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const takip = row.original

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
                <Link href={`/takipler/${takip.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(takip)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(takip.id)}
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
