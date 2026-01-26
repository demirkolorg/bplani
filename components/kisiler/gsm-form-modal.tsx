"use client"

import * as React from "react"
import { Phone } from "lucide-react"
import { useCreateGsm, DuplicateGsmError } from "@/hooks/use-gsm"
import { useLocale } from "@/components/providers/locale-provider"
import { useTabs } from "@/components/providers/tab-provider"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GsmFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisiId: string
  isFirstGsm?: boolean
}

export function GsmFormModal({ open, onOpenChange, kisiId, isFirstGsm }: GsmFormModalProps) {
  const { t } = useLocale()
  const { openTab } = useTabs()
  const createGsm = useCreateGsm()
  const [numara, setNumara] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!numara.trim()) {
      setError(t.kisiler.gsmRequired)
      return
    }

    setError("")
    try {
      await createGsm.mutateAsync({
        numara: numara.trim(),
        kisiId,
        isPrimary: isFirstGsm ?? false,
      })
      setNumara("")
      onOpenChange(false)
      toast.success(t.kisiler.gsmAddedSuccess || "GSM başarıyla eklendi")
    } catch (err) {
      // Check if it's a duplicate GSM error
      if (err instanceof DuplicateGsmError) {
        const { ad, soyad, id } = err.existingKisi
        const kisiAdi = `${ad} ${soyad}`

        // Close modal
        setNumara("")
        setError("")
        onOpenChange(false)

        // Show toast message
        toast.error(
          t.kisiler.gsmAlreadyExists
            ? t.kisiler.gsmAlreadyExists.replace("{kisi}", kisiAdi)
            : `Bu GSM numarası ${kisiAdi} adlı kişiye kayıtlı. İlgili kişinin sayfası açılıyor...`
        )

        // Open the existing kisi's page in a new tab
        openTab(`/kisiler/${id}`)
      } else if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNumara("")
      setError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t.kisiler.addGsmTitle}
            </DialogTitle>
            <DialogDescription>
              {t.kisiler.addGsmDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numara">{t.kisiler.gsmNumbers}</Label>
              <Input
                id="numara"
                value={numara}
                onChange={(e) => setNumara(e.target.value)}
                placeholder={t.kisiler.gsmPlaceholder}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createGsm.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={createGsm.isPending || !numara.trim()}>
              {createGsm.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t.common.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
