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
import { personelRolLabels, personelRolValues, type PersonelRol } from "@/lib/validations"

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
  const changeRol = useChangeRol()
  const [selectedRol, setSelectedRol] = React.useState<PersonelRol>(personel.rol)
  const [error, setError] = React.useState<string | null>(null)

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
      setError(err instanceof Error ? err.message : "Rol değiştirilemedi")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Rol Değiştir</DialogTitle>
          <DialogDescription>
            {personel.ad} {personel.soyad} için yeni rol seçin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={selectedRol} onValueChange={(v) => setSelectedRol(v as PersonelRol)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {personelRolValues.map((rol) => (
                  <SelectItem key={rol} value={rol}>
                    {personelRolLabels[rol]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border p-3 text-sm space-y-2">
            <p className="font-medium">Rol Açıklamaları:</p>
            <ul className="text-muted-foreground space-y-1">
              <li><strong>Admin:</strong> Tüm yetkilere sahip, kullanıcı yönetimi yapabilir</li>
              <li><strong>Yönetici:</strong> Personel listesini görüntüleyebilir, düzenleme yapabilir</li>
              <li><strong>Personel:</strong> Temel işlemleri yapabilir, personel modülünü göremez</li>
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
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={changeRol.isPending}>
            {changeRol.isPending ? "Kaydediliyor..." : "Rolü Değiştir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
