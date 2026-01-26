"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, FileText, MoreHorizontal, User, Clock } from "lucide-react"
import { useNotlarByKisi, useCreateNot, useUpdateNot, useDeleteNot } from "@/hooks/use-not"
import { useLocale } from "@/components/providers/locale-provider"
import { Badge } from "@/components/ui/badge"
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

  const [editingNot, setEditingNot] = React.useState<{ id: string; icerik: string } | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [icerik, setIcerik] = React.useState("")
  const [editIcerik, setEditIcerik] = React.useState("")
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
      setIcerik("")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleUpdate = async () => {
    if (!editingNot || !editIcerik.trim()) {
      setError(t.kisiler.noteRequired)
      return
    }

    setError("")
    try {
      await updateNot.mutateAsync({
        id: editingNot.id,
        data: { icerik: editIcerik.trim() },
      })
      setEditingNot(null)
      setEditIcerik("")
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
    setEditIcerik(not.icerik)
    setError("")
  }

  const closeModal = () => {
    setEditingNot(null)
    setEditIcerik("")
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

  const isEditModalOpen = !!editingNot

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            {t.common.notes}
            {notlar && notlar.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">{notlar.length}</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.kisiler.notesAndDescriptions}
          </p>
        </div>
      </div>

      {/* Yeni Not Ekleme Alanı */}
      <div className="flex gap-3 items-start">
        <Textarea
          id="new-note"
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          placeholder={t.kisiler.noteContentPlaceholder}
          rows={2}
          className="resize-none flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={createNot.isPending || !icerik.trim()}
          className="gap-2 shrink-0"
          size="lg"
        >
          {createNot.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {t.kisiler.addNote}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive -mt-4">{error}</p>}

      <Card className="w-full">
        <CardContent className="p-8">
          {/* Note Timeline */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : notlar && notlar.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-orange-500 via-orange-300 to-orange-100 dark:from-orange-600 dark:via-orange-800 dark:to-orange-950" />

              {/* Notes */}
              <div className="space-y-8">
                {notlar.map((not, index) => (
                  <div key={not.id} className="relative flex gap-6 group">
                    {/* Avatar/Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 flex items-center justify-center ring-4 ring-background">
                        {not.createdUser ? (
                          <span className="text-white font-bold text-sm">
                            {not.createdUser.ad.charAt(0)}{not.createdUser.soyad.charAt(0)}
                          </span>
                        ) : (
                          <FileText className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="flex-1 pb-2">
                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {not.createdUser && (
                            <span className="font-semibold text-sm">
                              {not.createdUser.ad} {not.createdUser.soyad}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(not.createdAt)}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
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

                      {/* Note Bubble */}
                      <div className="relative bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                        {/* Triangle pointer */}
                        <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-orange-200 dark:border-r-orange-800/50 border-b-8 border-b-transparent" />
                        <div className="absolute -left-1.5 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-orange-50 dark:border-r-orange-950/30 border-b-8 border-b-transparent" />

                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                          {not.icerik}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm text-muted-foreground">{t.kisiler.noNotesYet}</p>
              <p className="text-xs text-muted-foreground mt-1">Yukarıdaki alandan ilk notunuzu ekleyebilirsiniz</p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.kisiler.editNote}</DialogTitle>
            <DialogDescription>
              {t.kisiler.editNoteDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-icerik">{t.kisiler.noteContent}</Label>
              <Textarea
                id="edit-icerik"
                value={editIcerik}
                onChange={(e) => setEditIcerik(e.target.value)}
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
              onClick={handleUpdate}
              disabled={updateNot.isPending}
            >
              {updateNot.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t.common.update}
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
    </div>
  )
}
