"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useChangeRol, type Personel } from "@/hooks/use-personel"
import { personelRolValues, type PersonelRol } from "@/lib/validations"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

interface PersonelRolModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personel: Personel
  onSuccess?: () => void
}

export function PersonelRolModal({
  open,
  onOpenChange,
  personel,
  onSuccess,
}: PersonelRolModalProps) {
  const { t } = useLocale()
  const changeRol = useChangeRol()
  const [selectedRol, setSelectedRol] = React.useState<PersonelRol>(personel.rol)
  const [error, setError] = React.useState<string | null>(null)

  // Localized role labels
  const rolLabels: Record<PersonelRol, string> = React.useMemo(() => ({
    ADMIN: t.personel.rolAdmin,
    YONETICI: t.personel.rolYonetici,
    PERSONEL: t.personel.rolPersonel,
  }), [t])

  React.useEffect(() => {
    if (open) {
      setSelectedRol(personel.rol)
      setError(null)
    }
  }, [open, personel.rol])

  const handleSubmit = async () => {
    if (selectedRol === personel.rol) {
      onOpenChange(false)
      return
    }

    setError(null)

    try {
      await changeRol.mutateAsync({ id: personel.id, data: { rol: selectedRol } })
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.personel.roleChangeFailed)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t.personel.changeRole}</DialogTitle>
          <DialogDescription>
            {interpolate(t.personel.roleDescription, { name: `${personel.ad} ${personel.soyad}` })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t.personel.rol}</Label>
            <Select value={selectedRol} onValueChange={(v) => setSelectedRol(v as PersonelRol)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {personelRolValues.map((rol) => (
                  <SelectItem key={rol} value={rol}>
                    {rolLabels[rol]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border p-3 text-sm space-y-2">
            <p className="font-medium">{t.personel.rolDescriptions}</p>
            <ul className="text-muted-foreground space-y-1">
              <li><strong>{t.personel.rolAdmin}:</strong> {t.personel.adminDescription}</li>
              <li><strong>{t.personel.rolYonetici}:</strong> {t.personel.yoneticiDescription}</li>
              <li><strong>{t.personel.rolPersonel}:</strong> {t.personel.personelDescription}</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeRol.isPending}
          >
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={changeRol.isPending}>
            {changeRol.isPending ? t.common.saving : t.personel.changeRole}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
