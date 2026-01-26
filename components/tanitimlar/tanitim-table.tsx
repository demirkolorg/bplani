"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { useTanitimlar, useDeleteTanitim, type Tanitim } from "@/hooks/use-tanitimlar"
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
import { getTanitimColumns, getTanitimSortOptions } from "./tanitim-columns"

export function TanitimTable() {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useTanitimlar()
  const deleteTanitim = useDeleteTanitim()

  // Table preferences
  const prefs = useDataTablePreferences("tanitimlar", {
    defaultSort: { column: "tarih", direction: "desc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(() => getTanitimColumns(t, locale), [t, locale])
  const sortOptions = React.useMemo(() => getTanitimSortOptions(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteTanitim.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRowClick = (tanitim: Tanitim) => {
    router.push(`/tanitimlar/${tanitim.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Tanitim, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr
          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => handleRowClick(row)}
        >
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/tanitimlar/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t.common.view}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/tanitimlar/${row.id}?edit=true`)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t.common.edit}
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
        searchPlaceholder={t.tanitimlar.searchPlaceholder}
        isLoading={isLoading}
        sortOptions={sortOptions}
        defaultSort={prefs.defaultSort}
        pageSize={prefs.pageSize}
        defaultColumnVisibility={prefs.columnVisibility}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        onColumnVisibilityChange={prefs.setColumnVisibility}
        onSortChange={prefs.setSorting}
        onPageSizeChange={prefs.setPageSize}
        columnVisibilityLabels={{
          baslik: t.tanitimlar.title,
          tarih: t.tanitimlar.date,
          adres: t.tanitimlar.address,
          katilimcilar: t.tanitimlar.participants,
          katilimciSayisi: t.tanitimlar.count,
          notlar: t.tanitimlar.notes,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.tanitimlar.deleteTanitim}
        description={t.tanitimlar.deleteTanitimConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteTanitim.isPending}
      />
    </>
  )
}
