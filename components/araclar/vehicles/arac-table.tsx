"use client"

import * as React from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

import { useAraclar, useDeleteArac, type Arac } from "@/hooks/use-araclar-vehicles"
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
import { getAracColumns, aracSortOptions } from "./arac-columns"

export function AracTable() {
  const { data, isLoading } = useAraclar()
  const deleteArac = useDeleteArac()

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingArac, setEditingArac] = React.useState<Arac | null>(null)
  const [deletingArac, setDeletingArac] = React.useState<Arac | null>(null)

  const columns = React.useMemo(() => getAracColumns(), [])

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
          Düzenle
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
          Sil
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder="Plaka ile ara..."
        isLoading={isLoading}
        sortOptions={aracSortOptions}
        defaultSort={{ column: "createdAt", direction: "desc" }}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          plaka: "Plaka",
          markaModel: "Marka / Model",
          renk: "Renk",
          kisiler: "Kişiler",
        }}
        headerActions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Araç
          </Button>
        }
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Yeni Araç</DialogTitle>
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
            <DialogTitle>Araç Düzenle</DialogTitle>
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
            <AlertDialogTitle>Aracı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingArac?.plaka}</strong> plakalı aracı silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArac.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
