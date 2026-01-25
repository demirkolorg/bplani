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
import { useCreatePersonel, useUpdatePersonel, type Personel } from "@/hooks/use-personel"
import { useLocale } from "@/components/providers/locale-provider"

interface PersonelFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Personel>
  onSuccess?: () => void
}

export function PersonelFormModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: PersonelFormModalProps) {
  const { t } = useLocale()
  const createPersonel = useCreatePersonel()
  const updatePersonel = useUpdatePersonel()
  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState({
    visibleId: "",
    ad: "",
    soyad: "",
    parola: "",
    fotograf: "",
    isActive: true,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (open) {
      setFormData({
        visibleId: initialData?.visibleId || "",
        ad: initialData?.ad || "",
        soyad: initialData?.soyad || "",
        parola: "",
        fotograf: initialData?.fotograf || "",
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

    if (!formData.visibleId) {
      newErrors.visibleId = t.personel.userIdRequired
    } else if (!/^\d{6}$/.test(formData.visibleId)) {
      newErrors.visibleId = t.personel.userIdMustBe6Digits
    }

    if (!formData.ad) {
      newErrors.ad = t.personel.firstNameRequired
    }
    if (!formData.soyad) {
      newErrors.soyad = t.personel.lastNameRequired
    }

    if (!isEditing) {
      if (!formData.parola) {
        newErrors.parola = t.personel.passwordRequired
      } else if (formData.parola.length < 6) {
        newErrors.parola = t.personel.passwordMin6
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      if (isEditing && initialData?.id) {
        await updatePersonel.mutateAsync({
          id: initialData.id,
          data: {
            visibleId: formData.visibleId,
            ad: formData.ad,
            soyad: formData.soyad,
            fotograf: formData.fotograf || null,
            isActive: formData.isActive,
          },
        })
      } else {
        await createPersonel.mutateAsync({
          visibleId: formData.visibleId,
          ad: formData.ad,
          soyad: formData.soyad,
          parola: formData.parola,
          fotograf: formData.fotograf || null,
          isActive: formData.isActive,
          rol: "PERSONEL",
        })
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : t.personel.operationFailed,
      })
    }
  }

  const isLoading = createPersonel.isPending || updatePersonel.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.personel.editPersonel : t.personel.newPersonel}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.personel.editPersonelDescription
              : t.personel.createNewAccount}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="visibleId">{t.personel.userId6Digit}</Label>
            <Input
              id="visibleId"
              value={formData.visibleId}
              onChange={(e) => handleChange("visibleId", e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="font-mono"
            />
            {errors.visibleId && (
              <p className="text-sm text-destructive">{errors.visibleId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad">{t.common.firstName}</Label>
              <Input
                id="ad"
                value={formData.ad}
                onChange={(e) => handleChange("ad", e.target.value)}
                placeholder={t.common.firstName}
              />
              {errors.ad && (
                <p className="text-sm text-destructive">{errors.ad}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="soyad">{t.common.lastName}</Label>
              <Input
                id="soyad"
                value={formData.soyad}
                onChange={(e) => handleChange("soyad", e.target.value)}
                placeholder={t.common.lastName}
              />
              {errors.soyad && (
                <p className="text-sm text-destructive">{errors.soyad}</p>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="parola">{t.personel.password}</Label>
              <Input
                id="parola"
                type="password"
                value={formData.parola}
                onChange={(e) => handleChange("parola", e.target.value)}
                placeholder={t.personel.passwordMin6}
              />
              {errors.parola && (
                <p className="text-sm text-destructive">{errors.parola}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fotograf">{t.personel.photoUrl}</Label>
            <Input
              id="fotograf"
              value={formData.fotograf}
              onChange={(e) => handleChange("fotograf", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>{t.personel.activeAccount}</Label>
              <p className="text-sm text-muted-foreground">
                {t.personel.inactiveAccountHint}
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t.common.saving : isEditing ? t.common.update : t.common.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
