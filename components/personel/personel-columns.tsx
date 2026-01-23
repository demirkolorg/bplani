"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User, FileText, CalendarClock, Megaphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Personel } from "@/hooks/use-personel"
import type { SortOption } from "@/components/shared/data-table"
import { personelRolLabels, personelRolColors } from "@/lib/validations"

// Personel tablosu için özel sıralama seçenekleri
export const personelSortOptions: SortOption[] = [
  { label: "Ad (A → Z)", value: "ad-asc", column: "ad", direction: "asc" },
  { label: "Ad (Z → A)", value: "ad-desc", column: "ad", direction: "desc" },
  { label: "Soyad (A → Z)", value: "soyad-asc", column: "soyad", direction: "asc" },
  { label: "Soyad (Z → A)", value: "soyad-desc", column: "soyad", direction: "desc" },
  { label: "Son Giriş (Yeni → Eski)", value: "lastLoginAt-desc", column: "lastLoginAt", direction: "desc" },
  { label: "Son Giriş (Eski → Yeni)", value: "lastLoginAt-asc", column: "lastLoginAt", direction: "asc" },
  { label: "Oluşturma (Yeni → Eski)", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "Oluşturma (Eski → Yeni)", value: "createdAt-asc", column: "createdAt", direction: "asc" },
]

export function getPersonelColumns(): ColumnDef<Personel>[] {
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
      accessorKey: "lastLoginAt",
      header: () => null,
      cell: () => null,
    },
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
      id: "visibleId",
      accessorKey: "visibleId",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.visibleId}</span>
      ),
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
        const fotograf = row.original.fotograf
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted overflow-hidden">
              {fotograf ? (
                <img src={fotograf} alt={`${ad} ${soyad}`} className="h-8 w-8 object-cover" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="font-medium">{ad} {soyad}</span>
          </div>
        )
      },
    },
    {
      id: "rol",
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => {
        const rol = row.original.rol
        return (
          <Badge variant="outline" className={personelRolColors[rol]}>
            {personelRolLabels[rol]}
          </Badge>
        )
      },
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return isActive ? (
          <Badge variant="default" className="bg-green-600">Aktif</Badge>
        ) : (
          <Badge variant="secondary">Pasif</Badge>
        )
      },
    },
    {
      id: "aktivite",
      header: "Aktivite",
      cell: ({ row }) => {
        const count = row.original._count
        if (!count) return <span className="text-muted-foreground">-</span>

        return (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1" title="Oluşturulan Kişiler">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>{count.createdKisiler}</span>
            </div>
            <div className="flex items-center gap-1" title="Oluşturulan Takipler">
              <CalendarClock className="h-3.5 w-3.5 text-purple-600" />
              <span>{count.createdTakipler}</span>
            </div>
            <div className="flex items-center gap-1" title="Oluşturulan Notlar">
              <FileText className="h-3.5 w-3.5 text-orange-600" />
              <span>{count.createdNotlar}</span>
            </div>
            <div className="flex items-center gap-1" title="Oluşturulan Tanıtımlar">
              <Megaphone className="h-3.5 w-3.5 text-green-600" />
              <span>{count.createdTanitimlar}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "sonGiris",
      header: "Son Giriş",
      cell: ({ row }) => {
        const lastLoginAt = row.original.lastLoginAt
        if (!lastLoginAt) {
          return <span className="text-muted-foreground">Hiç giriş yapmadı</span>
        }
        const date = new Date(lastLoginAt)
        return (
          <span className="text-sm">
            {date.toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      },
    },
  ]
}
