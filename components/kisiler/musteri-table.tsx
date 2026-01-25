"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Trash2 } from "lucide-react"

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

  // Table preferences (column visibility, sorting, page size)
  const prefs = useDataTablePreferences("kisiler", {
    defaultSort: { column: "createdAt", direction: "desc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(() => getKisiColumns(t), [t])
  const sortOptions = React.useMemo(() => getKisiSortOptions(t), [t])

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
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        onColumnVisibilityChange={prefs.setColumnVisibility}
        onSortChange={prefs.setSorting}
        onPageSizeChange={prefs.setPageSize}
        columnVisibilityLabels={{
          tip: t.kisiler.tip,
          tc: t.kisiler.tcKimlik,
          adSoyad: t.common.fullName,
          faaliyet: t.kisiler.faaliyet,
          gsm: "GSM",
          adres: t.kisiler.addresses,
          tanitim: t.navigation.tanitimlar,
          not: t.common.note,
          pio: t.kisiler.pio,
          asli: t.kisiler.asli,
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
