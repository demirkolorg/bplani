"use client"

import * as React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useIller, useDeleteIl, type Il } from "@/hooks/use-lokasyon"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getIlColumns } from "./il-columns"
import { IlFormModal } from "./il-form-modal"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function IlTable() {
  const { t } = useLocale()
  const [editingIl, setEditingIl] = React.useState<Il | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useIller()
  const deleteIl = useDeleteIl()

  const columns = React.useMemo(() => getIlColumns(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteIl.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const rowWrapper = (row: Il, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setEditingIl(row)}>
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
        searchPlaceholder={t.lokasyon.searchIlPlaceholder}
        isLoading={isLoading}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          plaka: t.lokasyon.plaka,
          ad: t.lokasyon.ilAdi,
          ilceSayisi: t.lokasyon.ilceSayisi,
        }}
      />

      <IlFormModal
        open={!!editingIl}
        onOpenChange={(open) => !open && setEditingIl(null)}
        initialData={editingIl || undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.lokasyon.deleteIl}
        description={t.lokasyon.deleteIlConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteIl.isPending}
      />
    </>
  )
}
