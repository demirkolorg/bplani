"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { useOperasyonlar, useDeleteOperasyon, type Operasyon } from "@/hooks/use-operasyonlar"
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
import { getOperasyonColumns, getOperasyonSortOptions } from "./operasyon-columns"

export function OperasyonTable() {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useOperasyonlar()
  const deleteOperasyon = useDeleteOperasyon()

  // Table preferences
  const prefs = useDataTablePreferences("operasyonlar", {
    defaultSort: { column: "tarih", direction: "desc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(() => getOperasyonColumns(t, locale), [t, locale])
  const sortOptions = React.useMemo(() => getOperasyonSortOptions(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteOperasyon.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRowClick = (operasyon: Operasyon) => {
    router.push(`/operasyonlar/${operasyon.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Operasyon, children: React.ReactNode) => (
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
            router.push(`/operasyonlar/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t.common.view}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/operasyonlar/${row.id}?edit=true`)
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
        searchPlaceholder={t.operasyonlar.searchPlaceholder}
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
          baslik: t.operasyonlar.title,
          tarih: t.operasyonlar.date,
          adres: t.operasyonlar.address,
          katilimcilar: t.operasyonlar.participants,
          katilimciSayisi: t.operasyonlar.count,
          notlar: t.operasyonlar.notes,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.operasyonlar.deleteOperasyon}
        description={t.operasyonlar.deleteOperasyonConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteOperasyon.isPending}
      />
    </>
  )
}
