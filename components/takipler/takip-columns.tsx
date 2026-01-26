"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Bell } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { GsmWithActiveTakip } from "@/hooks/use-takip"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"
import { interpolate } from "@/locales"

// Takip tablosu için özel sıralama seçenekleri
export function getTakipSortOptions(t: Translations): SortOption[] {
  return [
    { label: t.takipler.endDateNearFar, value: "bitisTarihi-asc", column: "bitisTarihi", direction: "asc" },
    { label: t.takipler.endDateFarNear, value: "bitisTarihi-desc", column: "bitisTarihi", direction: "desc" },
    { label: t.takipler.startDateOldNew, value: "baslamaTarihi-asc", column: "baslamaTarihi", direction: "asc" },
    { label: t.takipler.startDateNewOld, value: "baslamaTarihi-desc", column: "baslamaTarihi", direction: "desc" },
  ]
}

// Legacy export for backwards compatibility
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

export function getTakipColumns(t: Translations): ColumnDef<GsmWithActiveTakip>[] {
  return [
    // Hidden columns for sorting
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
      id: "gsm",
      header: "GSM",
      cell: ({ row }) => {
        return <span className="font-mono text-sm font-medium">{row.original.gsm}</span>
      },
    },
    {
      id: "kisi",
      header: t.takipler.person,
      cell: ({ row }) => {
        const { kisi, kisiId } = row.original
        if (!kisi || !kisiId) return <span className="text-muted-foreground">-</span>
        return (
          <Link
            href={`/kisiler/${kisiId}`}
            className="font-medium hover:underline"
          >
            {kisi}
          </Link>
        )
      },
    },
    {
      id: "baslamaTarihiDisplay",
      header: t.takipler.startDate,
      cell: ({ row }) => {
        const { baslamaTarihi } = row.original
        if (!baslamaTarihi) return <span className="text-muted-foreground">-</span>
        const date = new Date(baslamaTarihi)
        return (
          <span className="text-sm">
            {date.toLocaleDateString("tr-TR")}
          </span>
        )
      },
    },
    {
      id: "bitisTarihiDisplay",
      header: t.takipler.endDate,
      cell: ({ row }) => {
        const { bitisTarihi } = row.original
        if (!bitisTarihi) return <span className="text-muted-foreground">-</span>
        const date = new Date(bitisTarihi)
        return (
          <span className="text-sm">
            {date.toLocaleDateString("tr-TR")}
          </span>
        )
      },
    },
    {
      id: "kalanGun",
      header: t.takipler.remainingDays,
      cell: ({ row }) => {
        const { kalanGun } = row.original
        if (kalanGun === null) return <span className="text-muted-foreground">-</span>

        const isExpiringSoon = kalanGun <= 7 && kalanGun > 0
        const isExpired = kalanGun <= 0

        if (isExpired) {
          const daysPassed = Math.abs(kalanGun)
          return (
            <Badge variant="destructive" className="text-xs">
              {interpolate(t.takipler.daysPassed, { days: daysPassed })}
            </Badge>
          )
        }

        if (isExpiringSoon) {
          return (
            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
              {interpolate(t.takipler.daysRemaining, { days: kalanGun })}
            </Badge>
          )
        }

        return (
          <span className="text-sm font-medium">
            {interpolate(t.takipler.daysRemaining, { days: kalanGun })}
          </span>
        )
      },
    },
    {
      id: "durum",
      header: t.takipler.durum,
      cell: ({ row }) => {
        const { durum, activeTakip } = row.original
        if (!durum) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <Badge variant={durumVariants[durum as TakipDurum]}>
              {takipDurumLabels[durum as TakipDurum]}
            </Badge>
            {activeTakip && (
              <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full" title={t.takipler.activeTakip} />
            )}
          </div>
        )
      },
    },
    {
      id: "alarmlar",
      header: t.takipler.alarm,
      cell: ({ row }) => {
        const count = row.original.alarmCount
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
        const gsm = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t.common.actions}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/takipler/${gsm.gsmId}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t.common.view}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
