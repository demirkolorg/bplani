"use client"

import { ArrowUpDown, Phone, MapPin, Megaphone, FileText, Shield, Car } from "lucide-react"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Kisi } from "@/hooks/use-kisiler"
import type { SortOption } from "@/components/shared/data-table"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"
import { createOperatorFilterFn, createArrayFilterFn } from "@/lib/data-table/column-filter-fns"
import { ColumnHeaderFilter } from "@/components/shared/column-header-filter"

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
      accessorFn: (row) => row.tt,
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>{t.kisiler.tip}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.kisiler.tip}
            formatValue={(val) => val ? t.kisiler.tipMusteri : t.kisiler.tipAday}
            showBlanks={false}
          />
        </div>
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
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const cellValue = row.getValue<boolean>(columnId)

        // "in" operator for multi-select
        if (operator === "in" && Array.isArray(value)) {
          return value.includes(cellValue)
        }

        return false
      },
    },
    // Ad and Soyad as separate visible columns
    {
      id: "ad",
      accessorKey: "ad",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t.common.firstName}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.common.firstName}
          />
        </div>
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
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t.common.lastName}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.common.lastName}
          />
        </div>
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
      id: "tc",
      accessorKey: "tc",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>{t.kisiler.tcKimlik}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.kisiler.tcKimlik}
          />
        </div>
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
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>{t.kisiler.faaliyet}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.kisiler.faaliyet}
            getFilterValues={(rows) => {
              // Extract all unique faaliyet names from array field
              const faaliyetMap = new Map<string, number>()
              rows.forEach((row: Kisi) => {
                row.faaliyetAlanlari?.forEach(fa => {
                  if (fa.faaliyetAlani.ad) {
                    faaliyetMap.set(fa.faaliyetAlani.ad, (faaliyetMap.get(fa.faaliyetAlani.ad) || 0) + 1)
                  }
                })
              })

              const values: any[] = []
              faaliyetMap.forEach((count, ad) => {
                values.push({ value: ad, label: ad, count })
              })
              values.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
              return values
            }}
          />
        </div>
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
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const faaliyetAlanlari = row.original.faaliyetAlanlari || []

        if (operator === "in" && Array.isArray(value)) {
          return faaliyetAlanlari.some(fa => value.includes(fa.faaliyetAlani.ad))
        }

        return false
      },
    },
    {
      id: "gsm",
      accessorFn: (row) => row.gsmler?.map(g => g.numara).join(", ") || "",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4 text-blue-600" />
          <span>GSM</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title="GSM"
            getFilterValues={(rows) => {
              // Extract all unique GSM numbers from array field
              const gsmMap = new Map<string, number>()
              rows.forEach((row: Kisi) => {
                row.gsmler?.forEach(gsm => {
                  if (gsm.numara) {
                    gsmMap.set(gsm.numara, (gsmMap.get(gsm.numara) || 0) + 1)
                  }
                })
              })

              const values: any[] = []
              gsmMap.forEach((count, numara) => {
                values.push({ value: numara, label: numara, count })
              })
              values.sort((a, b) => a.label.localeCompare(b.label))
              return values
            }}
          />
        </div>
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
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-green-600" />
          <span>{t.lokasyon.il}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.lokasyon.il}
            getFilterValues={(rows) => {
              // Extract all unique il names from array field
              const ilMap = new Map<string, number>()
              rows.forEach((row: Kisi) => {
                row.adresler?.forEach(adres => {
                  const ilAd = adres.mahalle.ilce.il.ad
                  if (ilAd) {
                    ilMap.set(ilAd, (ilMap.get(ilAd) || 0) + 1)
                  }
                })
              })

              const values: any[] = []
              ilMap.forEach((count, ilAd) => {
                values.push({ value: ilAd, label: ilAd, count })
              })
              values.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
              return values
            }}
          />
        </div>
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
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const adresler = row.original.adresler || []

        if (operator === "in" && Array.isArray(value)) {
          return adresler.some(adres => value.includes(adres.mahalle.ilce.il.ad))
        }

        return false
      },
    },
    {
      id: "ilce",
      accessorFn: (row) => row.adresler?.map(a => a.mahalle.ilce.ad).join(", ") || "",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>{t.lokasyon.ilce}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.lokasyon.ilce}
            getFilterValues={(rows) => {
              // Extract all unique ilce names from array field
              const ilceMap = new Map<string, number>()
              rows.forEach((row: Kisi) => {
                row.adresler?.forEach(adres => {
                  const ilceAd = adres.mahalle.ilce.ad
                  if (ilceAd) {
                    ilceMap.set(ilceAd, (ilceMap.get(ilceAd) || 0) + 1)
                  }
                })
              })

              const values: any[] = []
              ilceMap.forEach((count, ilceAd) => {
                values.push({ value: ilceAd, label: ilceAd, count })
              })
              values.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
              return values
            }}
          />
        </div>
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
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const adresler = row.original.adresler || []

        if (operator === "in" && Array.isArray(value)) {
          return adresler.some(adres => value.includes(adres.mahalle.ilce.ad))
        }

        return false
      },
    },
    {
      id: "mahalle",
      accessorFn: (row) => row.adresler?.map(a => a.mahalle.ad).join(", ") || "",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-amber-600" />
          <span>{t.lokasyon.mahalle}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.lokasyon.mahalle}
            getFilterValues={(rows) => {
              // Extract all unique mahalle names from array field
              const mahalleMap = new Map<string, number>()
              rows.forEach((row: Kisi) => {
                row.adresler?.forEach(adres => {
                  const mahalleAd = adres.mahalle.ad
                  if (mahalleAd) {
                    mahalleMap.set(mahalleAd, (mahalleMap.get(mahalleAd) || 0) + 1)
                  }
                })
              })

              const values: any[] = []
              mahalleMap.forEach((count, mahalleAd) => {
                values.push({ value: mahalleAd, label: mahalleAd, count })
              })
              values.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
              return values
            }}
          />
        </div>
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
        if (!filterValue || typeof filterValue !== "object") return true
        const { operator, value } = filterValue as { operator: string; value: any[] }
        const adresler = row.original.adresler || []

        if (operator === "in" && Array.isArray(value)) {
          return adresler.some(adres => value.includes(adres.mahalle.ad))
        }

        return false
      },
    },
    {
      id: "adresDetay",
      accessorFn: (row) => row.adresler?.map(a => a.detay || "").filter(d => d).join(", ") || "",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-purple-600" />
          <span>Adres Detayı</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title="Adres Detayı"
            getFilterValues={(rows) => {
              // Extract all unique address details from array field
              const detayMap = new Map<string, number>()
              rows.forEach((row: Kisi) => {
                row.adresler?.forEach(adres => {
                  const detay = adres.detay
                  if (detay && detay.trim() !== "") {
                    detayMap.set(detay, (detayMap.get(detay) || 0) + 1)
                  }
                })
              })

              const values: any[] = []
              detayMap.forEach((count, detay) => {
                values.push({ value: detay, label: detay, count })
              })
              values.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
              return values
            }}
          />
        </div>
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
      size: 60,
      header: ({ column, table }) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Megaphone className="h-4 w-4 text-purple-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tanıtım</p>
            </TooltipContent>
          </Tooltip>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title="Tanıtım"
            showBlanks={false}
          />
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
      size: 60,
      header: ({ column, table }) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Shield className="h-4 w-4 text-indigo-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Operasyon</p>
            </TooltipContent>
          </Tooltip>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title="Operasyon"
            showBlanks={false}
          />
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
      size: 60,
      header: ({ column, table }) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Car className="h-4 w-4 text-slate-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Araç</p>
            </TooltipContent>
          </Tooltip>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title="Araç"
            showBlanks={false}
          />
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
      size: 60,
      header: ({ column, table }) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.common.note}</p>
            </TooltipContent>
          </Tooltip>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.common.note}
            showBlanks={false}
          />
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
      accessorKey: "pio",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>{t.kisiler.pio}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.kisiler.pio}
            formatValue={(val) => val ? t.common.yes : t.common.no}
            showBlanks={false}
          />
        </div>
      ),
      cell: ({ row }) => {
        const pio = row.getValue("pio") as boolean
        return pio ? (
          <Badge variant="default">{t.common.yes}</Badge>
        ) : (
          <Badge variant="secondary">{t.common.no}</Badge>
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
    {
      accessorKey: "asli",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>{t.kisiler.asli}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.kisiler.asli}
            formatValue={(val) => val ? t.common.yes : t.common.no}
            showBlanks={false}
          />
        </div>
      ),
      cell: ({ row }) => {
        const asli = row.getValue("asli") as boolean
        return asli ? (
          <Badge variant="default">{t.common.yes}</Badge>
        ) : (
          <Badge variant="secondary">{t.common.no}</Badge>
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
    {
      id: "tt",
      accessorKey: "tt",
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>{t.kisiler.tt}</span>
          <ColumnHeaderFilter
            column={column}
            table={table}
            title={t.kisiler.tt}
            formatValue={(val) => val ? t.common.yes : t.common.no}
            showBlanks={false}
          />
        </div>
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
