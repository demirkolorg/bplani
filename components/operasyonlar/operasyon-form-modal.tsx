"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { tr as trLocale, enUS } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin, FileText } from "lucide-react"

import { useUpdateOperasyon } from "@/hooks/use-operasyonlar"
import type { OperasyonMahalle } from "@/hooks/use-operasyonlar"
import { useLocale } from "@/components/providers/locale-provider"
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

interface OperasyonFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id?: string
    tarih?: string | Date
    saat?: string | null
    mahalleId?: string | null
    mahalle?: OperasyonMahalle | null
    adresDetay?: string | null
    notlar?: string | null
    katilimcilar?: { kisiId: string | null }[]
  }
}

export function OperasyonFormModal({
  open,
  onOpenChange,
  initialData,
}: OperasyonFormModalProps) {
  const { t, locale } = useLocale()
  const updateOperasyon = useUpdateOperasyon()
  const dateLocale = locale === "tr" ? trLocale : enUS

  const isEditing = !!initialData?.id

  // Form state
  const [tarih, setTarih] = React.useState<Date>(
    initialData?.tarih ? new Date(initialData.tarih) : new Date()
  )
  const [saat, setSaat] = React.useState<string>(initialData?.saat || "")
  const [lokasyon, setLokasyon] = React.useState<{
    ilId?: string
    ilceId?: string
    mahalleId?: string
  }>(() => {
    if (initialData?.mahalle) {
      return {
        ilId: initialData.mahalle.ilce.il.id,
        ilceId: initialData.mahalle.ilce.id,
        mahalleId: initialData.mahalle.id,
      }
    }
    return {}
  })
  const [adresDetay, setAdresDetay] = React.useState(initialData?.adresDetay || "")
  const [notlar, setNotlar] = React.useState(initialData?.notlar || "")
  const [error, setError] = React.useState("")

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (open && initialData) {
      setTarih(initialData.tarih ? new Date(initialData.tarih) : new Date())
      setSaat(initialData.saat || "")
      setLokasyon(
        initialData.mahalle
          ? {
              ilId: initialData.mahalle.ilce.il.id,
              ilceId: initialData.mahalle.ilce.id,
              mahalleId: initialData.mahalle.id,
            }
          : {}
      )
      setAdresDetay(initialData.adresDetay || "")
      setNotlar(initialData.notlar || "")
      setError("")
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isEditing || !initialData?.id) return

    try {
      await updateOperasyon.mutateAsync({
        id: initialData.id,
        data: {
          tarih,
          saat: saat || null,
          mahalleId: lokasyon.mahalleId || null,
          adresDetay: adresDetay || null,
          notlar: notlar || null,
        },
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
            <DialogTitle>{t.operasyonlar.editOperasyon}</DialogTitle>
            <DialogDescription>
              {t.operasyonlar.editOperasyonDescription}
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
                {t.operasyonlar.dateTime}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t.common.dateFormatPlaceholder}
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
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2 items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  placeholder={t.common.timeFormatPlaceholder}
                  value={saat}
                  onChange={(e) => setSaat(e.target.value)}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">({t.common.optional})</span>
              </div>
            </div>

            {/* Lokasyon */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                {t.operasyonlar.operasyonAddress}
              </Label>
              <LokasyonSelector
                value={lokasyon}
                onChange={setLokasyon}
                compact
              />
            </div>

            {/* Adres Detay */}
            <div className="space-y-2">
              <Label htmlFor="adresDetay">{t.operasyonlar.addressDetail}</Label>
              <Textarea
                id="adresDetay"
                value={adresDetay}
                onChange={(e) => setAdresDetay(e.target.value)}
                placeholder={t.operasyonlar.addressDetailPlaceholder}
                rows={2}
              />
            </div>

            {/* Notlar */}
            <div className="space-y-2">
              <Label htmlFor="notlar" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                {t.common.notes}
              </Label>
              <Textarea
                id="notlar"
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
                placeholder={t.operasyonlar.notesPlaceholder}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateOperasyon.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={updateOperasyon.isPending}>
              {updateOperasyon.isPending && (
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
