"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Bell, User, Phone, Pause, Play, Clock } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { tr } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import type { Alarm } from "@/hooks/use-alarmlar"
import type { SortOption } from "@/components/shared/data-table"

// Alarm tablosu için sıralama seçenekleri
export const alarmSortOptions: SortOption[] = [
  { label: "Tetik Tarihi (Yakın)", value: "tetikTarihi-asc", column: "tetikTarihi", direction: "asc" },
  { label: "Tetik Tarihi (Uzak)", value: "tetikTarihi-desc", column: "tetikTarihi", direction: "desc" },
  { label: "Oluşturma (Yeni)", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "Oluşturma (Eski)", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

// Tip labels
const tipLabels: Record<string, string> = {
  TAKIP_BITIS: "Takip Bitiş",
  ODEME_HATIRLATMA: "Ödeme Hatırlatma",
  OZEL: "Özel",
}

// Durum labels and colors
const durumConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  BEKLIYOR: { label: "Bekliyor", variant: "secondary" },
  TETIKLENDI: { label: "Tetiklendi", variant: "destructive" },
  GORULDU: { label: "Görüldü", variant: "outline" },
  IPTAL: { label: "İptal", variant: "outline" },
}

export function getAlarmColumns(): ColumnDef<Alarm>[] {
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
      header: "Durum",
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
                Duraklı
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "tip",
      header: "Tip",
      cell: ({ row }) => {
        const tip = row.original.tip
        return (
          <Badge variant="outline">
            {tipLabels[tip] || tip}
          </Badge>
        )
      },
    },
    {
      id: "baslik",
      header: "Başlık / Mesaj",
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
    },
    {
      id: "kisi",
      header: "Kişi",
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
      header: "Tetik Tarihi",
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
              {format(tetikTarihi, "d MMM yyyy", { locale: tr })}
            </div>
            <div className="text-xs text-muted-foreground">
              {diff < 0
                ? `${Math.abs(diff)} gün geçti`
                : diff === 0
                ? "Bugün"
                : `${diff} gün kaldı`}
            </div>
          </div>
        )
      },
    },
    {
      id: "gunOnce",
      header: "Gün Önce",
      cell: ({ row }) => {
        return (
          <Badge variant="secondary" className="font-mono">
            {row.original.gunOnce} gün
          </Badge>
        )
      },
    },
    {
      id: "olusturan",
      header: "Oluşturan",
      cell: ({ row }) => {
        const user = row.original.createdUser
        if (!user) {
          return <span className="text-muted-foreground text-sm">Sistem</span>
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
