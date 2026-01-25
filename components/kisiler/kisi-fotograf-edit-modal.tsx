"use client"

import * as React from "react"
import { Camera, Upload, Trash2, User } from "lucide-react"
import { useUpdateKisi } from "@/hooks/use-kisiler"
import { useLocale } from "@/components/providers/locale-provider"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface KisiFotografEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisiId: string
  fotograf: string | null
  ad: string
  soyad: string
}

export function KisiFotografEditModal({
  open,
  onOpenChange,
  kisiId,
  fotograf,
  ad,
  soyad,
}: KisiFotografEditModalProps) {
  const { t } = useLocale()
  const updateKisi = useUpdateKisi()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(fotograf)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setPreviewUrl(fotograf)
      setError("")
      setPendingFile(null)
    }
  }, [open, fotograf])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError(t.api.invalidFileType)
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t.api.fileTooLarge)
      return
    }

    setError("")
    setPendingFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    setPendingFile(null)
    setError("")
  }

  const handleSave = async () => {
    setError("")
    setIsUploading(true)

    try {
      let newFotografUrl: string | null = previewUrl

      // If there's a pending file, upload it first
      if (pendingFile) {
        const formData = new FormData()
        formData.append("file", pendingFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || t.api.uploadError)
        }

        const { url } = await uploadResponse.json()
        newFotografUrl = url
      }

      // Update kisi with new/removed photo URL
      await updateKisi.mutateAsync({
        id: kisiId,
        data: { fotograf: newFotografUrl },
      })

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.api.genericError)
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = isUploading || updateKisi.isPending
  const hasChanges = previewUrl !== fotograf || pendingFile !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t.kisiler.editPhoto}
          </DialogTitle>
          <DialogDescription>
            {t.kisiler.editPhotoDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center gap-4">
          {/* Preview */}
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`${ad} ${soyad}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
              id="kisi-fotograf-modal-input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {previewUrl ? t.kisiler.changePhoto : t.kisiler.uploadPhoto}
            </Button>

            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemovePhoto}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t.common.remove}
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Help text */}
          <p className="text-xs text-muted-foreground text-center">
            {t.kisiler.photoFormats}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
          >
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
