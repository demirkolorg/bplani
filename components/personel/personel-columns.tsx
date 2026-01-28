"use client"

import { ArrowUpDown, User, FileText, CalendarClock, Megaphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Personel } from "@/hooks/use-personel"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

// Personel tablosu için özel sıralama seçenekleri
export function getPersonelSortOptions(t: Translations): SortOption[] {
  return [
    { label: t.personel.nameAZ, value: "ad-asc", column: "ad", direction: "asc" },
    { label: t.personel.nameZA, value: "ad-desc", column: "ad", direction: "desc" },
    { label: t.personel.surnameAZ, value: "soyad-asc", column: "soyad", direction: "asc" },
    { label: t.personel.surnameZA, value: "soyad-desc", column: "soyad", direction: "desc" },
    { label: t.personel.lastLoginNewOld, value: "lastLoginAt-desc", column: "lastLoginAt", direction: "desc" },
    { label: t.personel.lastLoginOldNew, value: "lastLoginAt-asc", column: "lastLoginAt", direction: "asc" },
    { label: t.personel.createdNewOld, value: "createdAt-desc", column: "createdAt", direction: "desc" },
    { label: t.personel.createdOldNew, value: "createdAt-asc", column: "createdAt", direction: "asc" },
  ]
}


export function getPersonelColumns(t: Translations, locale: string): DataTableColumnDef<Personel>[] {
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US"

  // Rol labels
  const rolLabels: Record<string, string> = {
    ADMIN: t.personel.rolAdmin,
    YONETICI: t.personel.rolYonetici,
    PERSONEL: t.personel.rolPersonel,
  }

  // Rol colors
  const rolColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700",
    YONETICI: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
    PERSONEL: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
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
      meta: {
        filterConfig: {
          columnId: "visibleId",
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          placeholder: "ID...",
          label: "ID",
        },
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
            {t.personel.fullName}
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
      accessorFn: (row) => `${row.ad || ""} ${row.soyad || ""}`,
      filterFn: (row, columnId, filterValue) => {
        const fullName = `${row.original.ad || ""} ${row.original.soyad || ""}`.toLowerCase()
        const filterStr = String(filterValue).toLowerCase()
        return fullName.includes(filterStr)
      },
      meta: {
        filterConfig: {
          columnId: "adSoyad",
          type: "text",
          operators: ["contains", "startsWith"],
          placeholder: "Ad Soyad...",
          label: t.personel.fullName,
          customFilterFn: (row, filterValue, operator) => {
            const fullName = `${row.ad || ""} ${row.soyad || ""}`.toLowerCase()
            const filterStr = String(filterValue).toLowerCase()

            switch (operator) {
              case "contains":
                return fullName.includes(filterStr)
              case "startsWith":
                return fullName.startsWith(filterStr)
              default:
                return fullName.includes(filterStr)
            }
          },
        },
      },
    },
    {
      id: "rol",
      accessorKey: "rol",
      header: t.personel.rol,
      cell: ({ row }) => {
        const rol = row.original.rol
        return (
          <Badge variant="outline" className={rolColors[rol]}>
            {rolLabels[rol] || rol}
          </Badge>
        )
      },
      meta: {
        filterConfig: {
          columnId: "rol",
          type: "enum",
          operators: ["equals", "in"],
          defaultOperator: "in",
          options: [
            { value: "ADMIN", label: t.personel.rolAdmin },
            { value: "YONETICI", label: t.personel.rolYonetici },
            { value: "PERSONEL", label: t.personel.rolPersonel },
          ],
          label: t.personel.rol,
        },
      },
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: t.personel.status,
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return isActive ? (
          <Badge variant="default" className="bg-green-600">{t.personel.active}</Badge>
        ) : (
          <Badge variant="secondary">{t.personel.inactive}</Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === "all") return true
        return String(row.original.isActive) === String(filterValue)
      },
      meta: {
        filterConfig: {
          columnId: "isActive",
          type: "boolean",
          operators: ["equals"],
          options: [
            { value: "all", label: t.common.all },
            { value: "true", label: t.personel.active },
            { value: "false", label: t.personel.inactive },
          ],
          defaultOperator: "equals",
          label: t.personel.status,
          customFilterFn: (row, filterValue, operator) => {
            if (filterValue === "all") return true
            return String(row.isActive) === String(filterValue)
          },
        },
      },
    },
    {
      id: "aktivite",
      header: t.personel.activity,
      cell: ({ row }) => {
        const count = row.original._count
        if (!count) return <span className="text-muted-foreground">-</span>

        return (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1" title={t.personel.createdPersons}>
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>{count.createdKisiler}</span>
            </div>
            <div className="flex items-center gap-1" title={t.personel.createdFollowups}>
              <CalendarClock className="h-3.5 w-3.5 text-purple-600" />
              <span>{count.createdTakipler}</span>
            </div>
            <div className="flex items-center gap-1" title={t.personel.createdNotes}>
              <FileText className="h-3.5 w-3.5 text-orange-600" />
              <span>{count.createdNotlar}</span>
            </div>
            <div className="flex items-center gap-1" title={t.personel.createdIntroductions}>
              <Megaphone className="h-3.5 w-3.5 text-green-600" />
              <span>{count.createdTanitimlar}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "sonGiris",
      header: t.personel.lastLogin,
      cell: ({ row }) => {
        const lastLoginAt = row.original.lastLoginAt
        if (!lastLoginAt) {
          return <span className="text-muted-foreground">{t.personel.neverLoggedIn}</span>
        }
        const date = new Date(lastLoginAt)
        return (
          <span className="text-sm">
            {date.toLocaleDateString(dateLocale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      },
      accessorFn: (row) => row.lastLoginAt || null,
      meta: {
        filterConfig: {
          columnId: "sonGiris",
          type: "date",
          operators: ["before", "after", "between"],
          label: t.personel.lastLogin,
          customFilterFn: (row, filterValue, operator) => {
            const lastLoginAt = row.lastLoginAt
            if (!lastLoginAt) return false

            const lastLogin = new Date(lastLoginAt)
            if (isNaN(lastLogin.getTime())) return false

            const filterDate = new Date(filterValue as string)
            if (isNaN(filterDate.getTime())) {
              // Handle between
              if (
                operator === "between" &&
                typeof filterValue === "object" &&
                filterValue !== null &&
                "min" in filterValue &&
                "max" in filterValue
              ) {
                const minDate = new Date((filterValue as any).min)
                const maxDate = new Date((filterValue as any).max)
                return lastLogin >= minDate && lastLogin <= maxDate
              }
              return false
            }

            switch (operator) {
              case "before":
                return lastLogin < filterDate
              case "after":
                return lastLogin > filterDate
              case "equals":
                return lastLogin.toDateString() === filterDate.toDateString()
              default:
                return false
            }
          },
        },
      },
    },
  ]
}
