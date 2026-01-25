"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, FileText, MoreHorizontal } from "lucide-react"
import { useNotlarByKisi, useCreateNot, useUpdateNot, useDeleteNot } from "@/hooks/use-not"
import { useLocale } from "@/components/providers/locale-provider"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

interface KisiNotListProps {
  kisiId: string
}

export function KisiNotList({ kisiId }: KisiNotListProps) {
  const { t, locale } = useLocale()
  const { data: notlar, isLoading } = useNotlarByKisi(kisiId)
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
      setError(t.kisiler.noteRequired)
      return
    }

    setError("")
    try {
      await createNot.mutateAsync({
        kisiId,
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
      setError(t.kisiler.noteRequired)
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
    return new Date(date).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            {t.common.notes}
            {notlar && notlar.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({notlar.length})</span>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setShowAddModal(true)
              setIcerik("")
              setError("")
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
                className="rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 shrink-0 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{not.icerik}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatDate(not.createdAt)}</span>
                      </div>
                      {not.createdUser && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="font-medium">{not.createdUser.ad} {not.createdUser.soyad}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal({ id: not.id, icerik: not.icerik })}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(not.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            {t.kisiler.noNotesYet}
          </p>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? t.kisiler.editNote : t.kisiler.newNote}</DialogTitle>
              <DialogDescription>
                {isEditing ? t.kisiler.editNoteDescription : t.kisiler.noteDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="icerik">{t.kisiler.noteContent}</Label>
                <Textarea
                  id="icerik"
                  value={icerik}
                  onChange={(e) => setIcerik(e.target.value)}
                  placeholder={t.kisiler.noteContentPlaceholder}
                  rows={6}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>
                {t.common.cancel}
              </Button>
              <Button
                onClick={isEditing ? handleUpdate : handleAdd}
                disabled={createNot.isPending || updateNot.isPending}
              >
                {(createNot.isPending || updateNot.isPending) && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {isEditing ? t.common.update : t.common.add}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title={t.kisiler.deleteNote}
          description={t.kisiler.deleteNoteConfirm}
          confirmText={t.common.delete}
          onConfirm={handleDelete}
          isLoading={deleteNot.isPending}
        />
      </CardContent>
    </Card>
  )
}
