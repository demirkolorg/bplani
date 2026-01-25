"use client"

import * as React from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

import { useAraclar, useDeleteArac, type Arac } from "@/hooks/use-araclar-vehicles"
import { useDataTablePreferences } from "@/hooks/use-table-preferences"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AracForm } from "./arac-form"
import { getAracColumns, getAracSortOptions } from "./arac-columns"

export function AracTable() {
  const { t } = useLocale()
  const { data, isLoading } = useAraclar()
  const deleteArac = useDeleteArac()

  // Table preferences
  const prefs = useDataTablePreferences("araclar", {
    defaultSort: { column: "createdAt", direction: "desc" },
    defaultPageSize: 20,
  })

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingArac, setEditingArac] = React.useState<Arac | null>(null)
  const [deletingArac, setDeletingArac] = React.useState<Arac | null>(null)

  const columns = React.useMemo(() => getAracColumns(t), [t])
  const sortOptions = React.useMemo(() => getAracSortOptions(t), [t])

  const handleDelete = async () => {
    if (!deletingArac) return
    try {
      await deleteArac.mutateAsync(deletingArac.id)
      setDeletingArac(null)
    } catch {
      // Error handled by mutation
    }
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Arac, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            setEditingArac(row)
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
            setDeletingArac(row)
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
        searchPlaceholder={t.araclar.searchPlaceholder}
        isLoading={isLoading}
        sortOptions={sortOptions}
        defaultSort={prefs.defaultSort}
        pageSize={prefs.pageSize}
        defaultColumnVisibility={prefs.columnVisibility}
        rowWrapper={rowWrapper}
        onColumnVisibilityChange={prefs.setColumnVisibility}
        onSortChange={prefs.setSorting}
        onPageSizeChange={prefs.setPageSize}
        columnVisibilityLabels={{
          plaka: t.araclar.plaka,
          markaModel: t.araclar.markaModel,
          renk: t.araclar.renk,
          kisiler: t.araclar.kisiler,
        }}
        headerActions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t.araclar.newArac}
          </Button>
        }
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.araclar.newArac}</DialogTitle>
          </DialogHeader>
          <AracForm
            inModal
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingArac} onOpenChange={(open) => !open && setEditingArac(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.araclar.editArac}</DialogTitle>
          </DialogHeader>
          {editingArac && (
            <AracForm
              initialData={{
                id: editingArac.id,
                modelId: editingArac.modelId,
                renk: editingArac.renk || undefined,
                plaka: editingArac.plaka,
                kisiIds: editingArac.kisiler.map((ak) => ak.kisi.id),
              }}
              inModal
              onSuccess={() => setEditingArac(null)}
              onCancel={() => setEditingArac(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingArac} onOpenChange={(open) => !open && setDeletingArac(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.araclar.deleteArac}</AlertDialogTitle>
            <AlertDialogDescription>
              {interpolate(t.araclar.deleteAracConfirm, { plaka: deletingArac?.plaka || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArac.isPending ? t.araclar.deleting : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
