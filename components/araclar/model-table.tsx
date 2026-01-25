"use client"

import * as React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useModeller, useDeleteModel, type Model } from "@/hooks/use-araclar"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getModelColumns } from "./model-columns"
import { ModelFormModal } from "./model-form-modal"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function ModelTable() {
  const { t } = useLocale()
  const [editingModel, setEditingModel] = React.useState<Model | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useModeller()
  const deleteModel = useDeleteModel()

  const columns = React.useMemo(() => getModelColumns(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteModel.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const rowWrapper = (row: Model, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setEditingModel(row)}>
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
        searchPlaceholder={t.araclar.searchModelPlaceholder}
        isLoading={isLoading}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          ad: t.araclar.modelAdi,
          marka: t.araclar.marka,
        }}
      />

      <ModelFormModal
        open={!!editingModel}
        onOpenChange={(open) => !open && setEditingModel(null)}
        initialData={editingModel ? { ...editingModel, markaId: editingModel.marka.id } : undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.araclar.deleteModel}
        description={t.araclar.deleteModelConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteModel.isPending}
      />
    </>
  )
}
