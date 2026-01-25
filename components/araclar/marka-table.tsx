"use client"

import * as React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useMarkalar, useDeleteMarka, type Marka } from "@/hooks/use-araclar"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getMarkaColumns } from "./marka-columns"
import { MarkaFormModal } from "./marka-form-modal"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function MarkaTable() {
  const { t } = useLocale()
  const [editingMarka, setEditingMarka] = React.useState<Marka | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useMarkalar()
  const deleteMarka = useDeleteMarka()

  const columns = React.useMemo(() => getMarkaColumns(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMarka.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const rowWrapper = (row: Marka, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setEditingMarka(row)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t.common.edit}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setDeleteId(row.id)}
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
        data={data || []}
        searchPlaceholder={t.araclar.searchMarkaPlaceholder}
        isLoading={isLoading}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          ad: t.araclar.markaAdi,
          modelSayisi: t.araclar.modelSayisi,
        }}
      />

      <MarkaFormModal
        open={!!editingMarka}
        onOpenChange={(open) => !open && setEditingMarka(null)}
        initialData={editingMarka || undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.araclar.deleteMarka}
        description={t.araclar.deleteMarkaConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteMarka.isPending}
      />
    </>
  )
}
