"use client"

import * as React from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useNotlarByMusteri, useCreateNot, useUpdateNot, useDeleteNot } from "@/hooks/use-not"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

interface MusteriNotListProps {
  musteriId: string
}

export function MusteriNotList({ musteriId }: MusteriNotListProps) {
  const { data: notlar, isLoading } = useNotlarByMusteri(musteriId)
  const createNot = useCreateNot()
  const updateNot = useUpdateNot()
  const deleteNot = useDeleteNot()

  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingNot, setEditingNot] = React.useState<{ id: string; icerik: string } | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [icerik, setIcerik] = React.useState("")
  const [error, setError] = React.useState("")

  const handleAdd = async () => {
    if (!icerik.trim()) {
      setError("Not içeriği zorunludur")
      return
    }

    setError("")
    try {
      await createNot.mutateAsync({
        musteriId,
        icerik: icerik.trim(),
      })
      setShowAddModal(false)
      setIcerik("")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleUpdate = async () => {
    if (!editingNot || !icerik.trim()) {
      setError("Not içeriği zorunludur")
      return
    }

    setError("")
    try {
      await updateNot.mutateAsync({
        id: editingNot.id,
        data: { icerik: icerik.trim() },
      })
      setEditingNot(null)
      setIcerik("")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteNot.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const openEditModal = (not: { id: string; icerik: string }) => {
    setEditingNot(not)
    setIcerik(not.icerik)
    setError("")
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingNot(null)
    setIcerik("")
    setError("")
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isModalOpen = showAddModal || !!editingNot
  const isEditing = !!editingNot

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notlar</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAddModal(true)
            setIcerik("")
            setError("")
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Not Ekle
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Note List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notlar && notlar.length > 0 ? (
          <ul className="space-y-4">
            {notlar.map((not) => (
              <li
                key={not.id}
                className="rounded-md border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="whitespace-pre-wrap text-sm">{not.icerik}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(not.createdAt)}</span>
                      {not.createdUser && (
                        <>
                          <span>•</span>
                          <span>{not.createdUser.ad} {not.createdUser.soyad}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal({ id: not.id, icerik: not.icerik })}
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(not.id)}
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Henüz not eklenmemiş
          </p>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Notu Düzenle" : "Yeni Not"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Not içeriğini güncelleyin." : "Müşteri için yeni bir not ekleyin."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="icerik">Not İçeriği</Label>
                <Textarea
                  id="icerik"
                  value={icerik}
                  onChange={(e) => setIcerik(e.target.value)}
                  placeholder="Not içeriğini yazın..."
                  rows={6}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>
                İptal
              </Button>
              <Button
                onClick={isEditing ? handleUpdate : handleAdd}
                disabled={createNot.isPending || updateNot.isPending}
              >
                {(createNot.isPending || updateNot.isPending) && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {isEditing ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Notu Sil"
          description="Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          confirmText="Sil"
          onConfirm={handleDelete}
          isLoading={deleteNot.isPending}
        />
      </CardContent>
    </Card>
  )
}
