"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin, FileText } from "lucide-react"

import { useCreateOperasyon } from "@/hooks/use-operasyonlar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { LokasyonSelector } from "@/components/lokasyon/lokasyon-selector"

interface YeniOperasyonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisiId: string
  kisiAd: string
}

export function YeniOperasyonModal({
  open,
  onOpenChange,
  kisiId,
  kisiAd,
}: YeniOperasyonModalProps) {
  const createOperasyon = useCreateOperasyon()

  // Form state
  const [tarih, setTarih] = React.useState<Date>(new Date())
  const [saat, setSaat] = React.useState<string>("")
  const [lokasyon, setLokasyon] = React.useState<{
    ilId?: string
    ilceId?: string
    mahalleId?: string
  }>({})
  const [adresDetay, setAdresDetay] = React.useState("")
  const [notlar, setNotlar] = React.useState("")
  const [error, setError] = React.useState("")

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setTarih(new Date())
      setSaat("")
      setLokasyon({})
      setAdresDetay("")
      setNotlar("")
      setError("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await createOperasyon.mutateAsync({
        tarih,
        saat: saat || null,
        mahalleId: lokasyon.mahalleId || null,
        adresDetay: adresDetay || null,
        notlar: notlar || null,
        katilimcilar: [{ kisiId }],
      })
      onOpenChange(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Operasyon Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir operasyon oluşturun. <span className="font-medium">{kisiAd}</span> otomatik olarak katılımcı olarak eklenecek.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Tarih ve Saat */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Operasyon Tarihi ve Saati
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="GG.AA.YYYY"
                  value={format(tarih, "dd.MM.yyyy")}
                  onChange={(e) => {
                    const parsed = parse(e.target.value, "dd.MM.yyyy", new Date())
                    if (isValid(parsed)) {
                      setTarih(parsed)
                    }
                  }}
                  className="flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" type="button">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={tarih}
                      onSelect={(date) => date && setTarih(date)}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2 items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  placeholder="SS:DD"
                  value={saat}
                  onChange={(e) => setSaat(e.target.value)}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">(Opsiyonel)</span>
              </div>
            </div>

            {/* Lokasyon */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Operasyon Adresi
              </Label>
              <LokasyonSelector
                value={lokasyon}
                onChange={setLokasyon}
                compact
              />
            </div>

            {/* Adres Detay */}
            <div className="space-y-2">
              <Label htmlFor="adresDetay">Adres Detayı</Label>
              <Textarea
                id="adresDetay"
                value={adresDetay}
                onChange={(e) => setAdresDetay(e.target.value)}
                placeholder="Sokak, bina no, daire..."
                rows={2}
              />
            </div>

            {/* Notlar */}
            <div className="space-y-2">
              <Label htmlFor="notlar" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Notlar
              </Label>
              <Textarea
                id="notlar"
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
                placeholder="Operasyon hakkında notlar..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createOperasyon.isPending}
            >
              İptal
            </Button>
            <Button type="submit" disabled={createOperasyon.isPending}>
              {createOperasyon.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
