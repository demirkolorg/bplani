"use client"

import * as React from "react"
import { User } from "lucide-react"
import { useUpdateKisi } from "@/hooks/use-kisiler"
import { useLocale } from "@/components/providers/locale-provider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface KisiDetayEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisi: {
    id: string
    tc: string | null
    ad: string
    soyad: string
    tt: boolean
    pio: boolean
    asli: boolean
  }
}

export function KisiDetayEditModal({ open, onOpenChange, kisi }: KisiDetayEditModalProps) {
  const { t } = useLocale()
  const updateKisi = useUpdateKisi()

  const [tc, setTc] = React.useState(kisi.tc || "")
  const [ad, setAd] = React.useState(kisi.ad)
  const [soyad, setSoyad] = React.useState(kisi.soyad)
  const [tt, setTt] = React.useState(kisi.tt)
  const [pio, setPio] = React.useState(kisi.pio)
  const [asli, setAsli] = React.useState(kisi.asli)
  const [errors, setErrors] = React.useState<{ tc?: string; ad?: string; soyad?: string }>({})

  // Reset form when kisi changes
  React.useEffect(() => {
    if (open) {
      setTc(kisi.tc || "")
      setAd(kisi.ad)
      setSoyad(kisi.soyad)
      setTt(kisi.tt)
      setPio(kisi.pio)
      setAsli(kisi.asli)
      setErrors({})
    }
  }, [open, kisi])

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!ad.trim()) {
      newErrors.ad = t.kisiler.nameRequired
    }

    if (!soyad.trim()) {
      newErrors.soyad = t.kisiler.surnameRequired
    }

    if (tc.trim() && tc.trim().length !== 11) {
      newErrors.tc = t.kisiler.tcInvalid
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await updateKisi.mutateAsync({
        id: kisi.id,
        data: {
          tc: tc.trim() || null,
          ad: ad.trim(),
          soyad: soyad.trim(),
          tt,
          pio,
          asli,
        },
      })
      onOpenChange(false)
    } catch (err) {
      if (err instanceof Error) {
        setErrors({ ad: err.message })
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrors({})
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t.kisiler.editDetails}
            </DialogTitle>
            <DialogDescription>
              {t.kisiler.editDetailsDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* TC Kimlik No */}
            <div className="space-y-2">
              <Label htmlFor="tc">{t.kisiler.tcKimlik}</Label>
              <Input
                id="tc"
                value={tc}
                onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder={t.common.tcFormatPlaceholder}
                maxLength={11}
              />
              {errors.tc && <p className="text-sm text-destructive">{errors.tc}</p>}
            </div>

            {/* Ad */}
            <div className="space-y-2">
              <Label htmlFor="ad">{t.common.firstName} *</Label>
              <Input
                id="ad"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                placeholder={t.common.firstName}
                autoFocus
              />
              {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
            </div>

            {/* Soyad */}
            <div className="space-y-2">
              <Label htmlFor="soyad">{t.common.lastName} *</Label>
              <Input
                id="soyad"
                value={soyad}
                onChange={(e) => setSoyad(e.target.value)}
                placeholder={t.common.lastName}
              />
              {errors.soyad && <p className="text-sm text-destructive">{errors.soyad}</p>}
            </div>

            {/* TT, PIO & Asli */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tt"
                  checked={tt}
                  onCheckedChange={(checked) => setTt(checked === true)}
                />
                <Label htmlFor="tt" className="cursor-pointer font-normal">
                  {t.kisiler.tt} ({tt ? t.kisiler.tipMusteri : t.kisiler.tipAday})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pio"
                  checked={pio}
                  onCheckedChange={(checked) => setPio(checked === true)}
                />
                <Label htmlFor="pio" className="cursor-pointer font-normal">
                  {t.kisiler.pio}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="asli"
                  checked={asli}
                  onCheckedChange={(checked) => setAsli(checked === true)}
                />
                <Label htmlFor="asli" className="cursor-pointer font-normal">
                  {t.kisiler.asli}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateKisi.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={updateKisi.isPending}>
              {updateKisi.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
