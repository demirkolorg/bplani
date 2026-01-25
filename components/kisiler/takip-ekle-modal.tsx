"use client"

import * as React from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { tr as trLocale, enUS } from "date-fns/locale"
import { useCreateTakip } from "@/hooks/use-takip"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TakipEkleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gsmId: string
  gsmNumara: string
  onSuccess?: () => void
}

export function TakipEkleModal({ open, onOpenChange, gsmId, gsmNumara, onSuccess }: TakipEkleModalProps) {
  const { t, locale } = useLocale()
  const createTakip = useCreateTakip()
  const [baslamaTarihi, setBaslamaTarihi] = React.useState<Date>(new Date())
  const [bitisTarihi, setBitisTarihi] = React.useState<Date>(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  )
  const [error, setError] = React.useState("")

  const dateLocale = locale === "tr" ? trLocale : enUS

  // Başlama tarihi değiştiğinde bitiş tarihini +90 gün olarak güncelle
  const handleBaslamaTarihiChange = (date: Date) => {
    setBaslamaTarihi(date)
    setBitisTarihi(new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (bitisTarihi < baslamaTarihi) {
      setError(t.takipler.endDateBeforeStart)
      return
    }

    setError("")
    try {
      await createTakip.mutateAsync({
        gsmId,
        baslamaTarihi,
        bitisTarihi,
        durum: "UZATILACAK",
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
      // Reset to defaults when closing
      setBaslamaTarihi(new Date())
      setBitisTarihi(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
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
              <Plus className="h-5 w-5" />
              {t.takipler.newTakip}
            </DialogTitle>
            <DialogDescription>
              <span className="font-mono">{gsmNumara}</span>{" "}
              {t.takipler.activeWillBeExtended}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t.takipler.startDate}</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t.common.dateFormatPlaceholder}
                  value={format(baslamaTarihi, "dd.MM.yyyy")}
                  onChange={(e) => {
                    const parsed = parse(e.target.value, "dd.MM.yyyy", new Date())
                    if (isValid(parsed)) {
                      handleBaslamaTarihiChange(parsed)
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
                      selected={baslamaTarihi}
                      onSelect={(date) => date && handleBaslamaTarihiChange(date)}
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.takipler.endDate}</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t.common.dateFormatPlaceholder}
                  value={format(bitisTarihi, "dd.MM.yyyy")}
                  onChange={(e) => {
                    const parsed = parse(e.target.value, "dd.MM.yyyy", new Date())
                    if (isValid(parsed)) {
                      setBitisTarihi(parsed)
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
                      selected={bitisTarihi}
                      onSelect={(date) => date && setBitisTarihi(date)}
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.takipler.auto90Days}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createTakip.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={createTakip.isPending}>
              {createTakip.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t.takipler.addTakip}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
