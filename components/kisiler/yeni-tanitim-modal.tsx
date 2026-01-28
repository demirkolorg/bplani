"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin, FileText, Car, Plus, X, Check, ChevronsUpDown } from "lucide-react"

import { useCreateTanitim } from "@/hooks/use-tanitimlar"
import { useAraclar, type Arac } from "@/hooks/use-araclar-vehicles"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { LokasyonSelector } from "@/components/lokasyon/lokasyon-selector"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"
import { cn } from "@/lib/utils"
import { AracForm } from "@/components/araclar/vehicles"

interface YeniTanitimModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisiId: string
  kisiAd: string
}

export function YeniTanitimModal({
  open,
  onOpenChange,
  kisiId,
  kisiAd,
}: YeniTanitimModalProps) {
  const { t } = useLocale()
  const createTanitim = useCreateTanitim()
  const { data: araclarData } = useAraclar({ limit: 100 })

  // Form state
  const [baslik, setBaslik] = React.useState<string>("")
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

  // Araç states
  const [selectedAracIds, setSelectedAracIds] = React.useState<Set<string>>(new Set())
  const [isAracDialogOpen, setIsAracDialogOpen] = React.useState(false)
  const [isNewAracDialogOpen, setIsNewAracDialogOpen] = React.useState(false)
  const [aracSelectorOpen, setAracSelectorOpen] = React.useState(false)
  const [selectedAracId, setSelectedAracId] = React.useState("")

  const araclar = araclarData?.data || []
  const availableAraclar = React.useMemo(() => {
    return araclar.filter((a) => !selectedAracIds.has(a.id))
  }, [araclar, selectedAracIds])

  const selectedAraclar = React.useMemo(() => {
    return araclar.filter((a) => selectedAracIds.has(a.id))
  }, [araclar, selectedAracIds])

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setBaslik("")
      setTarih(new Date())
      setSaat("")
      setLokasyon({})
      setAdresDetay("")
      setNotlar("")
      setError("")
      setSelectedAracIds(new Set())
      setSelectedAracId("")
    }
  }, [open])

  const handleAddArac = () => {
    if (!selectedAracId) return
    setSelectedAracIds((prev) => new Set([...prev, selectedAracId]))
    setSelectedAracId("")
    setIsAracDialogOpen(false)
  }

  const handleRemoveArac = (aracId: string) => {
    setSelectedAracIds((prev) => {
      const next = new Set(prev)
      next.delete(aracId)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await createTanitim.mutateAsync({
        baslik: baslik || null,
        tarih,
        saat: saat || null,
        mahalleId: lokasyon.mahalleId || null,
        adresDetay: adresDetay || null,
        notlar: notlar || null,
        katilimcilar: [{ kisiId }],
        araclar: selectedAracIds.size > 0 ? Array.from(selectedAracIds).map((aracId) => ({ aracId })) : undefined,
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
            <DialogTitle>{t.tanitimlar.createModalTitle}</DialogTitle>
            <DialogDescription>
              {interpolate(t.tanitimlar.createModalDescription, { name: kisiAd })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Başlık */}
            <div className="space-y-2">
              <Label htmlFor="baslik">{t.tanitimlar.title}</Label>
              <Input
                id="baslik"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder={t.tanitimlar.titlePlaceholder}
                maxLength={200}
              />
            </div>

            {/* Tarih ve Saat */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t.tanitimlar.dateTime}
              </Label>
              <div className="flex gap-2 items-center">
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
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="time"
                  placeholder={t.common.timeFormatPlaceholder}
                  value={saat}
                  onChange={(e) => setSaat(e.target.value)}
                  className="w-32"
                />
              </div>
              <span className="text-xs text-muted-foreground">{t.tanitimlar.optional}</span>
            </div>

            {/* Lokasyon */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                {t.tanitimlar.tanitimAddress}
              </Label>
              <LokasyonSelector
                value={lokasyon}
                onChange={setLokasyon}
                compact
              />
            </div>

            {/* Adres Detay */}
            <div className="space-y-2">
              <Label htmlFor="adresDetay">{t.tanitimlar.addressDetail}</Label>
              <Textarea
                id="adresDetay"
                value={adresDetay}
                onChange={(e) => setAdresDetay(e.target.value)}
                placeholder={t.tanitimlar.addressDetailPlaceholder}
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
                placeholder={t.tanitimlar.notesPlaceholder}
                rows={3}
              />
            </div>

            {/* Araçlar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-indigo-600" />
                  {t.tanitimlar.vehicles}
                  <span className="text-xs text-muted-foreground font-normal">({t.tanitimlar.optional})</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAracDialogOpen(true)}
                  disabled={availableAraclar.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t.common.add}
                </Button>
              </div>
              {selectedAraclar.length > 0 ? (
                <div className="space-y-2">
                  {selectedAraclar.map((arac) => (
                    <div
                      key={arac.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-indigo-50 border-indigo-300 dark:bg-indigo-950 dark:border-indigo-700"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Car className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="font-mono font-bold text-sm">{arac.plaka}</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {arac.model.marka.ad} {arac.model.ad}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveArac(arac.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Araç eklenmedi
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTanitim.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={createTanitim.isPending}>
              {createTanitim.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {createTanitim.isPending ? t.tanitimlar.creating : t.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Araç Ekleme Dialog */}
      <Dialog open={isAracDialogOpen} onOpenChange={(open) => {
        setIsAracDialogOpen(open)
        if (!open) {
          setSelectedAracId("")
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.tanitimlar.vehicles}</DialogTitle>
            <DialogDescription>
              Etkinliğe eklenecek aracı seçin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.tanitimlar.searchVehicle}</Label>
              <Popover open={aracSelectorOpen} onOpenChange={setAracSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={aracSelectorOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedAracId
                      ? availableAraclar.find(a => a.id === selectedAracId)?.plaka
                      : t.tanitimlar.searchVehicle}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <Command>
                    <CommandInput placeholder={t.tanitimlar.searchVehicle} />
                    <CommandList>
                      <CommandEmpty>
                        {availableAraclar.length === 0
                          ? t.tanitimlar.allVehiclesAdded
                          : t.tanitimlar.vehicleNotFound}
                      </CommandEmpty>
                      <CommandGroup>
                        {availableAraclar.map((arac) => (
                          <CommandItem
                            key={arac.id}
                            value={`${arac.plaka} ${arac.model.marka.ad} ${arac.model.ad}`}
                            onSelect={() => {
                              setSelectedAracId(arac.id)
                              setAracSelectorOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAracId === arac.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <span className="font-mono font-bold">{arac.plaka}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {arac.model.marka.ad} {arac.model.ad}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedAracId && (
              <Button
                onClick={handleAddArac}
                disabled={!selectedAracId}
                className="w-full"
                type="button"
              >
                {t.common.add}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t.common.or}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsAracDialogOpen(false)
                setIsNewAracDialogOpen(true)
              }}
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.common.createNewVehicle}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Yeni Araç Form Dialog */}
      <Dialog open={isNewAracDialogOpen} onOpenChange={setIsNewAracDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.tanitimlar.newVehicleModalTitle}</DialogTitle>
            <DialogDescription>
              {t.tanitimlar.newVehicleModalDescription}
            </DialogDescription>
          </DialogHeader>
          <AracForm
            inModal
            onSuccess={() => {
              setIsNewAracDialogOpen(false)
              setIsAracDialogOpen(true)
            }}
            onCancel={() => {
              setIsNewAracDialogOpen(false)
              setIsAracDialogOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
