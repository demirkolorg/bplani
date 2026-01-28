"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Trash2 } from "lucide-react"
import type { ColumnFiltersState } from "@tanstack/react-table"

import { useKisiler, useDeleteKisi, type Kisi } from "@/hooks/use-kisiler"
import { useDataTablePreferences } from "@/hooks/use-table-preferences"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getKisiColumns, getKisiSortOptions } from "./musteri-columns"

export function KisiTable() {
  const router = useRouter()
  const { t } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [contextKisi, setContextKisi] = React.useState<Kisi | null>(null)

  const { data, isLoading } = useKisiler()
  const deleteKisi = useDeleteKisi()

  // Table preferences (column visibility, sorting, page size, filters)
  const prefs = useDataTablePreferences("kisiler", {
    defaultSort: { column: "createdAt", direction: "desc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(() => getKisiColumns(t), [t])
  const sortOptions = React.useMemo(() => getKisiSortOptions(t), [t])

  // Faceted filter setup
  const facetedFilterSetup = React.useMemo(() => {
    // Extract unique soyad values from data
    const soyadOptions: { label: string; value: string }[] = []
    const soyadSet = new Set<string>()

    // Extract unique faaliyet values from data
    const faaliyetOptions: { label: string; value: string }[] = []
    const faaliyetSet = new Set<string>()

    // Extract unique il values from data
    const ilOptions: { label: string; value: string }[] = []
    const ilSet = new Set<string>()

    // Extract unique ilce values from data
    const ilceOptions: { label: string; value: string }[] = []
    const ilceSet = new Set<string>()

    // Extract unique mahalle values from data
    const mahalleOptions: { label: string; value: string }[] = []
    const mahalleSet = new Set<string>()

    data?.data?.forEach((kisi: Kisi) => {
      // Soyad
      if (kisi.soyad && !soyadSet.has(kisi.soyad)) {
        soyadSet.add(kisi.soyad)
        soyadOptions.push({ label: kisi.soyad, value: kisi.soyad })
      }

      // Faaliyet alanları
      kisi.faaliyetAlanlari?.forEach((fa) => {
        if (fa.faaliyetAlani.ad && !faaliyetSet.has(fa.faaliyetAlani.ad)) {
          faaliyetSet.add(fa.faaliyetAlani.ad)
          faaliyetOptions.push({
            label: fa.faaliyetAlani.ad,
            value: fa.faaliyetAlani.ad,
          })
        }
      })

      // İl, İlçe, Mahalle
      kisi.adresler?.forEach((adres) => {
        const ilAd = adres.mahalle.ilce.il.ad
        const ilceAd = adres.mahalle.ilce.ad
        const mahalleAd = adres.mahalle.ad

        if (ilAd && !ilSet.has(ilAd)) {
          ilSet.add(ilAd)
          ilOptions.push({ label: ilAd, value: ilAd })
        }

        if (ilceAd && !ilceSet.has(ilceAd)) {
          ilceSet.add(ilceAd)
          ilceOptions.push({ label: ilceAd, value: ilceAd })
        }

        if (mahalleAd && !mahalleSet.has(mahalleAd)) {
          mahalleSet.add(mahalleAd)
          mahalleOptions.push({ label: mahalleAd, value: mahalleAd })
        }
      })
    })

    soyadOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
    faaliyetOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
    ilOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
    ilceOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
    mahalleOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))

    return [
      {
        columnId: "tip",
        title: t.kisiler.tip,
        options: [
          { label: t.kisiler.tipMusteri, value: "true" },
          { label: t.kisiler.tipAday, value: "false" },
        ],
      },
      {
        columnId: "soyad",
        title: t.common.lastName,
        options: soyadOptions,
      },
      {
        columnId: "pio",
        title: t.kisiler.pio,
        options: [
          { label: t.common.yes, value: "true" },
          { label: t.common.no, value: "false" },
        ],
      },
      {
        columnId: "asli",
        title: t.kisiler.asli,
        options: [
          { label: t.common.yes, value: "true" },
          { label: t.common.no, value: "false" },
        ],
      },
      {
        columnId: "faaliyet",
        title: t.kisiler.faaliyet,
        options: faaliyetOptions,
      },
      {
        columnId: "il",
        title: t.lokasyon.il,
        options: ilOptions,
      },
      {
        columnId: "ilce",
        title: t.lokasyon.ilce,
        options: ilceOptions,
      },
      {
        columnId: "mahalle",
        title: t.lokasyon.mahalle,
        options: mahalleOptions,
      },
    ]
  }, [t, data?.data])

  // Load saved filters on mount
  const [initialFilters] = React.useState(() => prefs.filters || [])

  // Handle filter changes with persistence
  const handleFiltersChange = React.useCallback((filters: ColumnFiltersState) => {
    prefs.setFilters(filters)
  }, [prefs.setFilters])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteKisi.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRowClick = (kisi: Kisi) => {
    router.push(`/kisiler/${kisi.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Kisi, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr
          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => handleRowClick(row)}
          onContextMenu={() => setContextKisi(row)}
        >
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/kisiler/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t.common.view}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteId(row.id)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t.common.delete}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder={t.kisiler.searchPlaceholder}
        isLoading={isLoading}
        sortOptions={sortOptions}
        defaultSort={prefs.defaultSort}
        pageSize={prefs.pageSize}
        defaultColumnVisibility={prefs.columnVisibility}
        defaultColumnFilters={initialFilters}
        facetedFilterSetup={facetedFilterSetup}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        onColumnVisibilityChange={prefs.setColumnVisibility}
        onSortChange={prefs.setSorting}
        onPageSizeChange={prefs.setPageSize}
        onColumnFiltersChange={handleFiltersChange}
        columnVisibilityLabels={{
          tip: t.kisiler.tip,
          tc: t.kisiler.tcKimlik,
          adSoyad: t.common.fullName,
          faaliyet: t.kisiler.faaliyet,
          gsm: "GSM",
          adres: t.kisiler.addresses,
          tanitim: "Tanıtım",
          operasyon: "Operasyon",
          arac: "Araç",
          not: t.common.note,
          pio: t.kisiler.pio,
          asli: t.kisiler.asli,
          tt: t.kisiler.tt,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={`${t.navigation.kisiler} ${t.common.delete}`}
        description={t.dialog.deleteDescription}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteKisi.isPending}
      />
    </>
  )
}
