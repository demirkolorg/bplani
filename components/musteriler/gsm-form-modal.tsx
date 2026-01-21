"use client"

import * as React from "react"
import { Phone } from "lucide-react"
import { useCreateGsm } from "@/hooks/use-gsm"

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
  musteriId: string
  isFirstGsm?: boolean
}

export function GsmFormModal({ open, onOpenChange, musteriId, isFirstGsm }: GsmFormModalProps) {
  const createGsm = useCreateGsm()
  const [numara, setNumara] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!numara.trim()) {
      setError("GSM numarası gerekli")
      return
    }

    setError("")
    try {
      await createGsm.mutateAsync({
        numara: numara.trim(),
        musteriId,
        isPrimary: isFirstGsm ?? false,
      })
      setNumara("")
      onOpenChange(false)
    } catch (err) {
      if (err instanceof Error) {
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
              Yeni GSM Ekle
            </DialogTitle>
            <DialogDescription>
              Müşteriye yeni bir GSM numarası ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numara">GSM Numarası</Label>
              <Input
                id="numara"
                value={numara}
                onChange={(e) => setNumara(e.target.value)}
                placeholder="05XX XXX XX XX"
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
              İptal
            </Button>
            <Button type="submit" disabled={createGsm.isPending || !numara.trim()}>
              {createGsm.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
