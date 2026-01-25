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
import { useChangePassword, type Personel } from "@/hooks/use-personel"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

interface PersonelPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personel: Personel
  onSuccess?: () => void
}

export function PersonelPasswordModal({
  open,
  onOpenChange,
  personel,
  onSuccess,
}: PersonelPasswordModalProps) {
  const { t } = useLocale()
  const changePassword = useChangePassword()

  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (open) {
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!newPassword) {
      newErrors.newPassword = t.personel.passwordRequired
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t.personel.passwordMin6
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t.personel.passwordRepeatRequired
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t.personel.passwordsDoNotMatch
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await changePassword.mutateAsync({
        id: personel.id,
        data: { newPassword, confirmPassword },
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : t.personel.passwordChangeFailed,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t.personel.changePassword}</DialogTitle>
          <DialogDescription>
            {interpolate(t.personel.passwordDescription, { name: `${personel.ad} ${personel.soyad}` })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t.personel.newPassword}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.personel.passwordMin6}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.personel.passwordRepeat}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.personel.passwordRepeat}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={changePassword.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? t.common.saving : t.personel.setNewPassword}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
