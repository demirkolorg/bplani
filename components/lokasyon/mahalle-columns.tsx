"use client"

import { Badge } from "@/components/ui/badge"
import type { Mahalle } from "@/hooks/use-lokasyon"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

export function getMahalleColumns(t: Translations): DataTableColumnDef<Mahalle>[] {
  return [
    {
      accessorKey: "ad",
      header: t.lokasyon.mahalleAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
      meta: {
        filterConfig: {
          columnId: "ad",
          type: "text",
          operators: ["contains", "startsWith", "equals"],
          placeholder: t.lokasyon.mahalleAdi,
          label: t.lokasyon.mahalleAdi,
        },
      },
    },
    {
      id: "ilce",
      header: t.lokasyon.ilce,
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.ilce.ad}</span>
      },
      accessorFn: (row) => row.ilce?.ad || "",
      filterFn: (row, columnId, filterValue) => {
        const ilce = row.original.ilce
        if (!ilce) return false
        const searchStr = String(filterValue).toLowerCase()
        const ilceAd = ilce.ad?.toLowerCase() || ""
        return ilceAd.includes(searchStr)
      },
      meta: {
        filterConfig: {
          columnId: "ilce",
          type: "nested",
          operators: ["contains"],
          placeholder: t.lokasyon.ilce,
          label: t.lokasyon.ilce,
          customFilterFn: (row, filterValue, operator) => {
            const ilce = row.ilce
            if (!ilce) return false

            const searchStr = String(filterValue).toLowerCase()
            const ilceAd = ilce.ad?.toLowerCase() || ""

            return ilceAd.includes(searchStr)
          },
        },
      },
    },
    {
      id: "il",
      header: t.lokasyon.il,
      cell: ({ row }) => {
        const il = row.original.ilce.il
        return (
          <span className="text-sm">
            {il.plaka ? (
              <>
                <span className="font-mono">{il.plaka.toString().padStart(2, "0")}</span>
                {" - "}
              </>
            ) : null}
            {il.ad}
          </span>
        )
      },
      accessorFn: (row) => row.ilce?.il?.ad || "",
      filterFn: (row, columnId, filterValue) => {
        const il = row.original.ilce?.il
        if (!il) return false
        const searchStr = String(filterValue).toLowerCase()
        const ilAd = il.ad?.toLowerCase() || ""
        const plaka = il.plaka ? String(il.plaka) : ""
        return ilAd.includes(searchStr) || plaka.includes(searchStr)
      },
      meta: {
        filterConfig: {
          columnId: "il",
          type: "nested",
          operators: ["contains"],
          placeholder: t.lokasyon.il,
          label: t.lokasyon.il,
          customFilterFn: (row, filterValue, operator) => {
            const il = row.ilce?.il
            if (!il) return false

            const searchStr = String(filterValue).toLowerCase()
            const ilAd = il.ad?.toLowerCase() || ""
            const plaka = il.plaka ? String(il.plaka) : ""

            return ilAd.includes(searchStr) || plaka.includes(searchStr)
          },
        },
      },
    },
    {
      id: "adresSayisi",
      header: t.lokasyon.adresSayisi,
      cell: ({ row }) => {
        const count = row.original._count.adresler
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
      accessorFn: (row) => row._count?.adresler || 0,
      filterFn: (row, columnId, filterValue) => {
        const count = row.original._count?.adresler || 0
        const target = Number(filterValue)
        return count === target
      },
      meta: {
        filterConfig: {
          columnId: "adresSayisi",
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          label: t.lokasyon.adresSayisi,
          customFilterFn: (row, filterValue, operator) => {
            const count = row._count?.adresler || 0
            const target = Number(filterValue)

            switch (operator) {
              case "equals":
                return count === target
              case "greaterThan":
                return count > target
              case "lessThan":
                return count < target
              default:
                return false
            }
          },
        },
      },
    },
  ]
}
