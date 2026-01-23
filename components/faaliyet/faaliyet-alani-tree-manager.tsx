"use client"

import * as React from "react"
import {
  Briefcase,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import {
  useFaaliyetAlaniTree,
  useDeleteFaaliyetAlani,
  type FaaliyetAlani,
} from "@/hooks/use-faaliyet-alani"
import { TreeView, type TreeDataItem } from "@/components/tree-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { FaaliyetAlaniFormModal } from "./faaliyet-alani-form-modal"
import { cn } from "@/lib/utils"

// Convert FaaliyetAlani to TreeDataItem format
function convertToTreeData(items: FaaliyetAlani[]): TreeDataItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.ad,
    icon: item.children?.length ? Folder : Briefcase,
    openIcon: FolderOpen,
    children: item.children?.length ? convertToTreeData(item.children) : undefined,
    className: !item.isActive ? "opacity-50" : undefined,
  }))
}

export function FaaliyetAlaniTreeManager() {
  const { data: tree = [], isLoading, error } = useFaaliyetAlaniTree()
  const deleteMutation = useDeleteFaaliyetAlani()

  const [selectedItem, setSelectedItem] = React.useState<FaaliyetAlani | null>(null)
  const [formModalOpen, setFormModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<FaaliyetAlani | null>(null)
  const [addingChildTo, setAddingChildTo] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<FaaliyetAlani | null>(null)

  // Flatten tree for lookup
  const flatItems = React.useMemo(() => {
    const result: FaaliyetAlani[] = []
    const flatten = (items: FaaliyetAlani[]) => {
      for (const item of items) {
        result.push(item)
        if (item.children?.length) {
          flatten(item.children)
        }
      }
    }
    flatten(tree)
    return result
  }, [tree])

  const treeData = React.useMemo(() => convertToTreeData(tree), [tree])

  const handleSelectChange = (item: TreeDataItem | undefined) => {
    if (!item) {
      setSelectedItem(null)
      return
    }
    const found = flatItems.find((f) => f.id === item.id)
    setSelectedItem(found || null)
  }

  const handleAddRoot = () => {
    setEditingItem(null)
    setAddingChildTo(null)
    setFormModalOpen(true)
  }

  const handleAddChild = (parentId: string) => {
    setEditingItem(null)
    setAddingChildTo(parentId)
    setFormModalOpen(true)
  }

  const handleEdit = (item: FaaliyetAlani) => {
    setEditingItem(item)
    setAddingChildTo(null)
    setFormModalOpen(true)
  }

  const handleDeleteClick = (item: FaaliyetAlani) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      setSelectedItem(null)
    } catch (error) {
      console.error("Silme hatası:", error)
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Faaliyet alanları yüklenirken bir hata oluştu.
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Tree View */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-medium">Faaliyet Alanları Hiyerarşisi</h3>
            <Button size="sm" onClick={handleAddRoot}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kök Alan
            </Button>
          </div>

          {tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Henüz faaliyet alanı tanımlanmamış.
              </p>
              <Button variant="outline" className="mt-4" onClick={handleAddRoot}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Faaliyet Alanını Ekle
              </Button>
            </div>
          ) : (
            <TreeView
              data={treeData}
              expandAll
              onSelectChange={handleSelectChange}
              className="p-2"
              defaultNodeIcon={Folder}
              defaultLeafIcon={Briefcase}
            />
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border bg-card sticky top-4">
          <div className="border-b p-4">
            <h3 className="font-medium">
              {selectedItem ? "Seçili Alan" : "Detaylar"}
            </h3>
          </div>

          {selectedItem ? (
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  {selectedItem._count.children > 0 ? (
                    <Folder className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Briefcase className="h-5 w-5 text-blue-500" />
                  )}
                  <h4 className="font-semibold text-lg">{selectedItem.ad}</h4>
                </div>
                {!selectedItem.isActive && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                    Pasif
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{selectedItem._count.kisiler} kişi</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Folder className="h-4 w-4" />
                  <span>{selectedItem._count.children} alt kategori</span>
                </div>
                {selectedItem.parent && (
                  <div className="text-muted-foreground">
                    Üst: <span className="font-medium">{selectedItem.parent.ad}</span>
                  </div>
                )}
                <div className="text-muted-foreground">
                  Sıra: <span className="font-medium">{selectedItem.sira}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddChild(selectedItem.id)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Alt Kategori
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(selectedItem)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteClick(selectedItem)}
                  disabled={selectedItem._count.children > 0}
                  title={
                    selectedItem._count.children > 0
                      ? "Alt kategorileri olan alan silinemez"
                      : undefined
                  }
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Sil
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Detayları görmek için bir faaliyet alanı seçin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <FaaliyetAlaniFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        initialData={
          editingItem
            ? {
                id: editingItem.id,
                ad: editingItem.ad,
                parentId: editingItem.parentId,
                sira: editingItem.sira,
                isActive: editingItem.isActive,
              }
            : undefined
        }
        defaultParentId={addingChildTo}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Faaliyet Alanını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{itemToDelete?.ad}</strong> faaliyet alanını silmek
              istediğinizden emin misiniz?
              {itemToDelete && itemToDelete._count.kisiler > 0 && (
                <span className="block mt-2 text-amber-600">
                  Bu alana bağlı {itemToDelete._count.kisiler} kişi var. Silme
                  işlemi bu bağlantıları kaldıracaktır.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
