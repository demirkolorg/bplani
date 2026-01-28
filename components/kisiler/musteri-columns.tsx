"use client"

import { Megaphone, FileText, Shield, Car } from "lucide-react"
import type { Table } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { ColumnHeaderMenu } from "@/components/shared/column-header-menu"
import type { Kisi } from "@/hooks/use-kisiler"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"
import { createOperatorFilterFn, createArrayFilterFn } from "@/lib/data-table/column-filter-fns"

// Kişi tablosu için özel sıralama seçenekleri
export function getKisiSortOptions(t: Translations): SortOption[] {
  return [
    { label: `${t.common.firstName} (A → Z)`, value: "ad-asc", column: "ad", direction: "asc" },
    { label: `${t.common.firstName} (Z → A)`, value: "ad-desc", column: "ad", direction: "desc" },
    { label: `${t.common.lastName} (A → Z)`, value: "soyad-asc", column: "soyad", direction: "asc" },
    { label: `${t.common.lastName} (Z → A)`, value: "soyad-desc", column: "soyad", direction: "desc" },
    { label: `TC (↑)`, value: "tc-asc", column: "tc", direction: "asc" },
    { label: `TC (↓)`, value: "tc-desc", column: "tc", direction: "desc" },
  ]
}

export function getKisiColumns(t: Translations): DataTableColumnDef<Kisi>[] {
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
    // Tip column (first visible column)
    {
      id: "tip",
      accessorFn: (row) => String(row.tt),
      header: ({ column }) => (
        <ColumnHeaderMenu
          column={column}
          title={t.kisiler.tip}
          enableSorting={true}
        />
      ),
      cell: ({ row }) => {
        const tt = row.original.tt
        return (
          <Badge
            variant="outline"
            className={
              tt
                ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
            }
          >
            {tt ? t.kisiler.tipMusteri : t.kisiler.tipAday}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        // Support both object-based and array-based filter values
        if (!filterValue) return true

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          const cellValue = String(row.original.tt)
          return filterValue.includes(cellValue)
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }
          const cellValue = row.original.tt

          if (operator === "in" && Array.isArray(value)) {
            return value.includes(cellValue)
          }
        }

        return false
      },
    },
    // Ad and Soyad as separate visible columns
    {
      id: "ad",
      accessorKey: "ad",
      header: ({ column }) => (
        <ColumnHeaderMenu
          column={column}
          title={t.common.firstName}
          enableSorting={true}
        />
      ),
      cell: ({ row }) => {
        const ad = row.original.ad
        return ad ? (
          <span className="font-medium">{ad}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<string>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    {
      id: "soyad",
      accessorKey: "soyad",
      header: ({ column }) => (
        <ColumnHeaderMenu
          column={column}
          title={t.common.lastName}
          enableSorting={true}
        />
      ),
      cell: ({ row }) => {
        const soyad = row.original.soyad
        return soyad ? (
          <span className="font-medium">{soyad}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        const cellValue = row.getValue<string>(columnId)

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          return filterValue.includes(cellValue)
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }

          if (operator === "in" && Array.isArray(value)) {
            return value.includes(cellValue)
          }
        }

        return false
      },
    },
    {
      id: "tc",
      accessorKey: "tc",
      header: ({ column }) => (
        <ColumnHeaderMenu
          column={column}
          title={t.kisiler.tcKimlik}
          enableSorting={true}
        />
      ),
      cell: ({ row }) => {
        const tc = row.original.tc
        return tc ? (
          <span className="font-mono text-sm">{tc}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<string>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    {
      id: "faaliyet",
      accessorFn: (row) => row.faaliyetAlanlari?.map(f => f.faaliyetAlani.ad).join(", ") || "",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.kisiler.faaliyet} enableSorting={true} />
      ),
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
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        const faaliyetAlanlari = row.original.faaliyetAlanlari || []

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          return faaliyetAlanlari.some(fa => filterValue.includes(fa.faaliyetAlani.ad))
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }

          if (operator === "in" && Array.isArray(value)) {
            return faaliyetAlanlari.some(fa => value.includes(fa.faaliyetAlani.ad))
          }
        }

        return false
      },
    },
    {
      id: "gsm",
      accessorFn: (row) => row.gsmler?.map(g => g.numara).join(", ") || "",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title="GSM" enableSorting={true} />
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
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const gsmler = row.original.gsmler || []

        if (operator === "in" && Array.isArray(value)) {
          return gsmler.some(gsm => value.includes(gsm.numara))
        }

        return false
      },
    },
    {
      id: "il",
      accessorFn: (row) => row.adresler?.map(a => a.mahalle.ilce.il.ad).join(", ") || "",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.lokasyon.il} enableSorting={true} />
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
                {adres.mahalle.ilce.il.ad}
              </span>
            ))}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        const adresler = row.original.adresler || []

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          return adresler.some(adres => filterValue.includes(adres.mahalle.ilce.il.ad))
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }

          if (operator === "in" && Array.isArray(value)) {
            return adresler.some(adres => value.includes(adres.mahalle.ilce.il.ad))
          }
        }

        return false
      },
    },
    {
      id: "ilce",
      accessorFn: (row) => row.adresler?.map(a => a.mahalle.ilce.ad).join(", ") || "",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.lokasyon.ilce} enableSorting={true} />
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
                {adres.mahalle.ilce.ad}
              </span>
            ))}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        const adresler = row.original.adresler || []

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          return adresler.some(adres => filterValue.includes(adres.mahalle.ilce.ad))
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }

          if (operator === "in" && Array.isArray(value)) {
            return adresler.some(adres => value.includes(adres.mahalle.ilce.ad))
          }
        }

        return false
      },
    },
    {
      id: "mahalle",
      accessorFn: (row) => row.adresler?.map(a => a.mahalle.ad).join(", ") || "",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.lokasyon.mahalle} enableSorting={true} />
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
                {adres.mahalle.ad}
              </span>
            ))}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        const adresler = row.original.adresler || []

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          return adresler.some(adres => filterValue.includes(adres.mahalle.ad))
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }

          if (operator === "in" && Array.isArray(value)) {
            return adresler.some(adres => value.includes(adres.mahalle.ad))
          }
        }

        return false
      },
    },
    {
      id: "adresDetay",
      accessorFn: (row) => row.adresler?.map(a => a.detay || "").filter(d => d).join(", ") || "",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title="Adres Detayı" enableSorting={true} />
      ),
      cell: ({ row }) => {
        const adresler = row.original.adresler
        if (!adresler || adresler.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-col gap-0.5">
            {adresler.map((adres) => (
              <span key={adres.id} className={`text-sm max-w-[250px] truncate block ${!adres.isPrimary ? "text-muted-foreground" : ""}`} title={adres.detay || "-"}>
                {adres.detay || "-"}
              </span>
            ))}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const adresler = row.original.adresler || []

        if (operator === "in" && Array.isArray(value)) {
          return adresler.some(adres => adres.detay && value.includes(adres.detay))
        }

        return false
      },
    },
    {
      id: "tanitim",
      accessorFn: (row) => row._count?.tanitimlar ?? 0,
      size: 45,
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <ColumnHeaderMenu column={column} enableSorting={true}>
            <Megaphone className="h-4 w-4 text-purple-600" />
          </ColumnHeaderMenu>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.tanitimlar ?? 0
        return (
          <div className="text-center">
            {count > 0 ? (
              <span className="text-sm font-semibold">{count}</span>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<number>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    {
      id: "operasyon",
      accessorFn: (row) => row._count?.operasyonlar ?? 0,
      size: 45,
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <ColumnHeaderMenu column={column} enableSorting={true}>
            <Shield className="h-4 w-4 text-indigo-600" />
          </ColumnHeaderMenu>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.operasyonlar ?? 0
        return (
          <div className="text-center">
            {count > 0 ? (
              <span className="text-sm font-semibold">{count}</span>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<number>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    {
      id: "arac",
      accessorFn: (row) => row._count?.araclar ?? 0,
      size: 45,
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <ColumnHeaderMenu column={column} enableSorting={true}>
            <Car className="h-4 w-4 text-slate-600" />
          </ColumnHeaderMenu>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.araclar ?? 0
        return (
          <div className="text-center">
            {count > 0 ? (
              <span className="text-sm font-semibold">{count}</span>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<number>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    {
      id: "not",
      accessorFn: (row) => row._count?.notlar ?? row.notlar?.length ?? 0,
      size: 45,
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <ColumnHeaderMenu column={column} enableSorting={true}>
            <FileText className="h-4 w-4 text-orange-600" />
          </ColumnHeaderMenu>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.notlar ?? row.original.notlar?.length ?? 0
        return (
          <div className="text-center">
            {count > 0 ? (
              <span className="text-sm font-semibold">{count}</span>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<number>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    {
      id: "pio",
      accessorFn: (row) => String(row.pio),
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.kisiler.pio} enableSorting={true} />
      ),
      cell: ({ row }) => {
        const pio = row.original.pio
        return pio ? (
          <Badge variant="default">{t.common.yes}</Badge>
        ) : (
          <Badge variant="secondary">{t.common.no}</Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          const cellValue = String(row.original.pio)
          return filterValue.includes(cellValue)
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }
          const cellValue = row.original.pio

          if (operator === "in" && Array.isArray(value)) {
            return value.includes(cellValue)
          }
        }

        return false
      },
    },
    {
      id: "asli",
      accessorFn: (row) => String(row.asli),
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.kisiler.asli} enableSorting={true} />
      ),
      cell: ({ row }) => {
        const asli = row.original.asli
        return asli ? (
          <Badge variant="default">{t.common.yes}</Badge>
        ) : (
          <Badge variant="secondary">{t.common.no}</Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true

        // Faceted filter passes array directly
        if (Array.isArray(filterValue)) {
          const cellValue = String(row.original.asli)
          return filterValue.includes(cellValue)
        }

        // Column header filter passes object
        if (typeof filterValue === "object") {
          const { operator, value } = filterValue as { operator: string; value: any[] }
          const cellValue = row.original.asli

          if (operator === "in" && Array.isArray(value)) {
            return value.includes(cellValue)
          }
        }

        return false
      },
    },
    {
      id: "tt",
      accessorKey: "tt",
      header: ({ column }) => (
        <ColumnHeaderMenu column={column} title={t.kisiler.tt} enableSorting={true} />
      ),
      cell: ({ row }) => {
        const tt = row.original.tt
        return (
          <Badge variant={tt ? "default" : "secondary"}>
            {tt ? t.common.yes : t.common.no}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<boolean>(columnId)

        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
  ]
}
