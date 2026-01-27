"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, User, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Duyuru } from "@/hooks/use-duyurular"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"

// Duyuru tablosu için sıralama seçenekleri
export function getDuyuruSortOptions(t: Translations): SortOption[] {
  return [
    { label: t.duyurular.prioritySort, value: "oncelik-desc", column: "oncelik", direction: "desc" },
    { label: t.duyurular.publishDateNewOld, value: "publishedAt-desc", column: "publishedAt", direction: "desc" },
    { label: t.duyurular.publishDateOldNew, value: "publishedAt-asc", column: "publishedAt", direction: "asc" },
    { label: t.duyurular.createdNewOld, value: "createdAt-desc", column: "createdAt", direction: "desc" },
    { label: t.duyurular.createdOldNew, value: "createdAt-asc", column: "createdAt", direction: "asc" },
  ]
}

export function getDuyuruColumns(t: Translations, locale: string): ColumnDef<Duyuru>[] {
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US"

  // Priority badge config
  const priorityConfig = {
    KRITIK: { color: "bg-red-500 text-white hover:bg-red-600", label: t.duyurular.priorityCritical },
    ONEMLI: { color: "bg-orange-500 text-white hover:bg-orange-600", label: t.duyurular.priorityImportant },
    NORMAL: { color: "bg-blue-500 text-white hover:bg-blue-600", label: t.duyurular.priorityNormal },
  }

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
      id: "oncelik",
      accessorKey: "oncelik",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {t.duyurular.priority}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const oncelik = row.original.oncelik
        const config = priorityConfig[oncelik]
        return (
          <Badge className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "baslik",
      accessorKey: "baslik",
      header: t.duyurular.title,
      cell: ({ row }) => {
        const baslik = row.original.baslik
        return (
          <div className="font-semibold max-w-[300px] truncate" title={baslik}>
            {baslik}
          </div>
        )
      },
    },
    {
      id: "icerik",
      accessorKey: "icerik",
      header: t.duyurular.content,
      cell: ({ row }) => {
        const icerik = row.original.icerik
        return (
          <div className="max-w-[400px] line-clamp-2 text-sm text-muted-foreground" title={icerik}>
            {icerik}
          </div>
        )
      },
    },
    {
      id: "publishedAt",
      accessorKey: "publishedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t.duyurular.publishDate}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const publishedAt = new Date(row.original.publishedAt)
        return (
          <div className="font-medium">
            {publishedAt.toLocaleDateString(dateLocale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
        )
      },
    },
    {
      id: "expiresAt",
      accessorKey: "expiresAt",
      header: t.duyurular.expiryDate,
      cell: ({ row }) => {
        const expiresAt = row.original.expiresAt
        if (!expiresAt) {
          return <span className="text-muted-foreground text-sm">{t.duyurular.noExpiry}</span>
        }

        const expiryDate = new Date(expiresAt)
        const isExpired = expiryDate < new Date()

        return (
          <div className={`font-medium ${isExpired ? "text-red-600 dark:text-red-400" : ""}`}>
            {expiryDate.toLocaleDateString(dateLocale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {isExpired && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {t.duyurular.expired}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: t.duyurular.status,
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? t.duyurular.active : t.duyurular.inactive}
          </Badge>
        )
      },
    },
    {
      id: "createdUser",
      accessorKey: "createdUser",
      header: () => {
        return (
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            {t.duyurular.createdBy}
          </div>
        )
      },
      cell: ({ row }) => {
        const createdUser = row.original.createdUser
        if (!createdUser) {
          return <span className="text-muted-foreground text-sm">{t.duyurular.unknownUser}</span>
        }
        return (
          <div className="text-sm">
            {createdUser.ad} {createdUser.soyad}
          </div>
        )
      },
    },
  ]
}
