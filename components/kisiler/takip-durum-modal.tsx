"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { useUpdateTakip } from "@/hooks/use-takip"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"
import type { GsmTakip } from "@/hooks/use-gsm"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TakipDurumModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  takip: GsmTakip | null
  gsmNumara?: string
  onSuccess?: () => void
}

// Durum seçenekleri (UZATILDI hariç - o otomatik atanır)
const durumOptions: TakipDurum[] = ["UZATILACAK", "DEVAM_EDECEK", "SONLANDIRILACAK"]

export function TakipDurumModal({ open, onOpenChange, takip, gsmNumara, onSuccess }: TakipDurumModalProps) {
  const { t } = useLocale()
  const updateTakip = useUpdateTakip()
  const [durum, setDurum] = React.useState<TakipDurum>("UZATILACAK")
  const [error, setError] = React.useState("")

  // Set initial durum when takip changes
  React.useEffect(() => {
    if (takip) {
      setDurum(takip.durum as TakipDurum)
    }
  }, [takip])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!takip) return

    setError("")
    try {
      await updateTakip.mutateAsync({
        id: takip.id,
        data: { durum },
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError("")
    }
    onOpenChange(open)
  }

  if (!takip) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              {t.takipler.updateStatusTitle}
            </DialogTitle>
            <DialogDescription>
              {gsmNumara && <span className="font-mono">{gsmNumara}</span>}{" "}
              {interpolate(t.takipler.updateStatusDescription, { gsm: gsmNumara || "" })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>{t.takipler.currentStatus}</Label>
              <p className="text-sm text-muted-foreground">
                {takipDurumLabels[takip.durum as TakipDurum]}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durum">{t.takipler.newStatus}</Label>
              <Select value={durum} onValueChange={(value) => setDurum(value as TakipDurum)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.takipler.selectStatus} />
                </SelectTrigger>
                <SelectContent>
                  {durumOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {takipDurumLabels[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateTakip.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={updateTakip.isPending || durum === takip.durum}
            >
              {updateTakip.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t.common.update}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
