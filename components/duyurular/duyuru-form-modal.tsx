"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateDuyuru, useUpdateDuyuru, type Duyuru } from "@/hooks/use-duyurular"
import { useLocale } from "@/components/providers/locale-provider"
import { format } from "date-fns"

interface DuyuruFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Duyuru>
  onSuccess?: () => void
}

export function DuyuruFormModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: DuyuruFormModalProps) {
  const { t } = useLocale()
  const createDuyuru = useCreateDuyuru()
  const updateDuyuru = useUpdateDuyuru()
  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState({
    baslik: "",
    icerik: "",
    oncelik: "NORMAL" as "NORMAL" | "ONEMLI" | "KRITIK",
    publishedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    hasExpiryDate: false,
    expiresAt: "",
    isActive: true,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (open) {
      setFormData({
        baslik: initialData?.baslik || "",
        icerik: initialData?.icerik || "",
        oncelik: initialData?.oncelik || "NORMAL",
        publishedAt: initialData?.publishedAt
          ? format(new Date(initialData.publishedAt), "yyyy-MM-dd'T'HH:mm")
          : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        hasExpiryDate: !!initialData?.expiresAt,
        expiresAt: initialData?.expiresAt
          ? format(new Date(initialData.expiresAt), "yyyy-MM-dd'T'HH:mm")
          : "",
        isActive: initialData?.isActive ?? true,
      })
      setErrors({})
    }
  }, [open, initialData])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.baslik || formData.baslik.trim().length === 0) {
      newErrors.baslik = t.duyurular.titleRequired
    } else if (formData.baslik.length > 200) {
      newErrors.baslik = t.duyurular.titleMaxLength
    }

    if (!formData.icerik || formData.icerik.trim().length === 0) {
      newErrors.icerik = t.duyurular.contentRequired
    } else if (formData.icerik.length > 10000) {
      newErrors.icerik = t.duyurular.contentMaxLength
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const data = {
        baslik: formData.baslik,
        icerik: formData.icerik,
        oncelik: formData.oncelik,
        publishedAt: new Date(formData.publishedAt),
        expiresAt: formData.hasExpiryDate && formData.expiresAt
          ? new Date(formData.expiresAt)
          : null,
        isActive: formData.isActive,
      }

      if (isEditing && initialData?.id) {
        await updateDuyuru.mutateAsync({
          id: initialData.id,
          data,
        })
      } else {
        await createDuyuru.mutateAsync(data)
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message :
        (isEditing ? t.duyurular.updateError : t.duyurular.createError)

      setErrors({
        submit: errorMessage,
      })
    }
  }

  const isLoading = createDuyuru.isPending || updateDuyuru.isPending

  const charCount = formData.icerik.length
  const charLimit = 10000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t.duyurular.editDuyuru : t.duyurular.newDuyuru}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.duyurular.editDuyuru
              : t.duyurular.newDuyuru}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="baslik">{t.duyurular.title}</Label>
            <Input
              id="baslik"
              value={formData.baslik}
              onChange={(e) => handleChange("baslik", e.target.value)}
              placeholder={t.duyurular.titlePlaceholder}
              maxLength={200}
            />
            {errors.baslik && (
              <p className="text-sm text-destructive">{errors.baslik}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icerik">{t.duyurular.content}</Label>
            <Textarea
              id="icerik"
              value={formData.icerik}
              onChange={(e) => handleChange("icerik", e.target.value)}
              placeholder={t.duyurular.contentPlaceholder}
              rows={6}
              maxLength={10000}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.icerik && (
                <p className="text-destructive">{errors.icerik}</p>
              )}
              <span className={`ml-auto ${charCount > charLimit * 0.9 ? 'text-orange-600' : ''}`}>
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oncelik">{t.duyurular.priority}</Label>
              <Select
                value={formData.oncelik}
                onValueChange={(value: "NORMAL" | "ONEMLI" | "KRITIK") => handleChange("oncelik", value)}
              >
                <SelectTrigger id="oncelik">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">{t.duyurular.priorityNormal}</SelectItem>
                  <SelectItem value="ONEMLI">{t.duyurular.priorityImportant}</SelectItem>
                  <SelectItem value="KRITIK">{t.duyurular.priorityCritical}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">{t.duyurular.publishDate}</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) => handleChange("publishedAt", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasExpiryDate">{t.duyurular.hasExpiryDate}</Label>
              <Switch
                id="hasExpiryDate"
                checked={formData.hasExpiryDate}
                onCheckedChange={(checked) => handleChange("hasExpiryDate", checked)}
              />
            </div>

            {formData.hasExpiryDate && (
              <div className="space-y-2">
                <Label htmlFor="expiresAt">{t.duyurular.expiryDate}</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleChange("expiresAt", e.target.value)}
                  placeholder={t.duyurular.expiryDatePlaceholder}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">{t.duyurular.status}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formData.isActive ? t.duyurular.active : t.duyurular.inactive}
              </span>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.duyurular.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? (isEditing ? t.duyurular.updating : t.duyurular.creating)
                : t.duyurular.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
