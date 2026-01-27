"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, X, User, Check, Search, CalendarIcon, Clock, MapPin, FileText, Car, Plus, ChevronsUpDown } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { tr } from "date-fns/locale"

import { useKisiler, type Kisi } from "@/hooks/use-kisiler"
import { useAraclar, type Arac } from "@/hooks/use-araclar-vehicles"
import { useCreateOperasyon } from "@/hooks/use-operasyonlar"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { LokasyonSelector } from "@/components/lokasyon/lokasyon-selector"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { AracForm } from "@/components/araclar/vehicles"

export default function YeniOperasyonPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { data: kisilerData, isLoading } = useKisiler({ limit: 100 })
  const { data: araclarData } = useAraclar({ limit: 100 })
  const createOperasyon = useCreateOperasyon()

  const [selectedKisiIds, setSelectedKisiIds] = React.useState<Set<string>>(new Set())
  const [selectedAracIds, setSelectedAracIds] = React.useState<Set<string>>(new Set())
  const [searchLeft, setSearchLeft] = React.useState("")
  const [searchRight, setSearchRight] = React.useState("")
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

  // Araç modal states
  const [isAracDialogOpen, setIsAracDialogOpen] = React.useState(false)
  const [isNewAracDialogOpen, setIsNewAracDialogOpen] = React.useState(false)
  const [aracSelectorOpen, setAracSelectorOpen] = React.useState(false)
  const [selectedAracId, setSelectedAracId] = React.useState("")

  const kisiler = kisilerData?.data || []
  const araclar = araclarData?.data || []

  // Available araçlar (not yet selected)
  const availableAraclar = React.useMemo(() => {
    return araclar.filter((a) => !selectedAracIds.has(a.id))
  }, [araclar, selectedAracIds])

  // Selected araçlar
  const selectedAraclar = React.useMemo(() => {
    return araclar.filter((a) => selectedAracIds.has(a.id))
  }, [araclar, selectedAracIds])

  // Filter out already selected kişiler from left list
  const availableKisiler = React.useMemo(() => {
    return kisiler.filter((kisi) => !selectedKisiIds.has(kisi.id))
  }, [kisiler, selectedKisiIds])

  // Get selected kişiler for right list
  const selectedKisiler = React.useMemo(() => {
    return kisiler.filter((kisi) => selectedKisiIds.has(kisi.id))
  }, [kisiler, selectedKisiIds])

  // Filter by search
  const filteredAvailable = React.useMemo(() => {
    if (!searchLeft.trim()) return availableKisiler
    const term = searchLeft.toLowerCase()
    return availableKisiler.filter((kisi) => {
      const fullName = `${kisi.ad} ${kisi.soyad}`.toLowerCase()
      return fullName.includes(term) || kisi.tc?.includes(term)
    })
  }, [availableKisiler, searchLeft])

  const filteredSelected = React.useMemo(() => {
    if (!searchRight.trim()) return selectedKisiler
    const term = searchRight.toLowerCase()
    return selectedKisiler.filter((kisi) => {
      const fullName = `${kisi.ad} ${kisi.soyad}`.toLowerCase()
      return fullName.includes(term)
    })
  }, [selectedKisiler, searchRight])

  const handleSelect = (kisiId: string) => {
    setSelectedKisiIds((prev) => new Set([...prev, kisiId]))
  }

  const handleDeselect = (kisiId: string) => {
    setSelectedKisiIds((prev) => {
      const next = new Set(prev)
      next.delete(kisiId)
      return next
    })
  }

  const handleSelectAll = () => {
    const allIds = filteredAvailable.map((kisi) => kisi.id)
    setSelectedKisiIds((prev) => new Set([...prev, ...allIds]))
  }

  const handleDeselectAll = () => {
    setSelectedKisiIds(new Set())
  }

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

  const handleSubmit = async () => {
    if (selectedKisiIds.size === 0) {
      setError(t.operasyonlar.selectAtLeastOne)
      return
    }

    setError("")

    try {
      await createOperasyon.mutateAsync({
        baslik: baslik || null,
        tarih,
        saat: saat || null,
        mahalleId: lokasyon.mahalleId || null,
        adresDetay: adresDetay || null,
        notlar: notlar || null,
        katilimcilar: Array.from(selectedKisiIds).map((kisiId) => ({ kisiId })),
        araclar: selectedAracIds.size > 0 ? Array.from(selectedAracIds).map((aracId) => ({ aracId })) : undefined,
      })
      router.push("/operasyonlar")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const KisiItem = ({
    kisi,
    onClick,
    actionIcon,
  }: {
    kisi: Kisi
    onClick: () => void
    actionIcon: React.ReactNode
  }) => (
    <div
      className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {kisi.ad} {kisi.soyad}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "text-xs shrink-0",
                kisi.tt
                  ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                  : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
              )}
            >
              {kisi.tt ? t.kisiler.tipMusteri : t.kisiler.tipAday}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {kisi.tc && (
              <p><span className="text-muted-foreground/70">TC:</span> <span className="font-mono">{kisi.tc}</span></p>
            )}
            {kisi.gsmler && kisi.gsmler.length > 0 && (
              <p><span className="text-muted-foreground/70">GSM:</span> <span className="font-mono">{kisi.gsmler[0].numara}</span></p>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 ml-2">{actionIcon}</div>
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/operasyonlar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t.operasyonlar.newOperasyonPageTitle}</h1>
          <p className="text-muted-foreground">
            {t.operasyonlar.newOperasyonPageDescription}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Available Kişiler */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {t.operasyonlar.availablePeople}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {t.operasyonlar.itemsCount.replace("{count}", filteredAvailable.length.toString())}
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.operasyonlar.searchByNameOrTc}
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredAvailable.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleSelectAll}
              >
                {t.common.selectAll}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredAvailable.length > 0 ? (
                <div className="space-y-2">
                  {filteredAvailable.map((kisi) => (
                    <KisiItem
                      key={kisi.id}
                      kisi={kisi}
                      onClick={() => handleSelect(kisi.id)}
                      actionIcon={
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchLeft ? t.operasyonlar.noResultsFound : t.operasyonlar.allPeopleSelected}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Middle Column - Selected Kişiler */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-4 w-4" />
                {t.operasyonlar.selectedParticipants}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {t.operasyonlar.itemsCount.replace("{count}", selectedKisiler.length.toString())}
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.operasyonlar.searchInSelected}
                value={searchRight}
                onChange={(e) => setSearchRight(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedKisiler.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleDeselectAll}
              >
                <X className="mr-2 h-4 w-4" />
                {t.operasyonlar.removeAll}
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[500px] pr-4">
              {filteredSelected.length > 0 ? (
                <div className="space-y-2">
                  {filteredSelected.map((kisi) => (
                    <KisiItem
                      key={kisi.id}
                      kisi={kisi}
                      onClick={() => handleDeselect(kisi.id)}
                      actionIcon={
                        <X className="h-4 w-4 text-destructive" />
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchRight
                    ? t.operasyonlar.noResultsFound
                    : t.operasyonlar.selectPeopleInstructions}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column - Operasyon Ayarları */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t.operasyonlar.operasyonInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Başlık */}
            <div className="space-y-2">
              <Label htmlFor="baslik">{t.operasyonlar.title}</Label>
              <Input
                id="baslik"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder={t.operasyonlar.titlePlaceholder}
                maxLength={200}
              />
            </div>

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
                    <Button variant="outline" size="icon">
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
                  placeholder={t.common.timeFormatPlaceholder}
                  value={saat}
                  onChange={(e) => setSaat(e.target.value)}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">{t.operasyonlar.optional}</span>
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
                rows={3}
              />
            </div>

            {/* Araçlar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-purple-600" />
                  {t.operasyonlar.vehicles}
                  <span className="text-xs text-muted-foreground font-normal">({t.operasyonlar.optional})</span>
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
                      className="flex items-center justify-between p-2 rounded-md border bg-purple-50 border-purple-300 dark:bg-purple-950 dark:border-purple-700"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Car className="h-4 w-4 text-purple-600 shrink-0" />
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

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">{t.operasyonlar.participantCount}</span>
                <span className="font-bold text-lg">{selectedKisiIds.size}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={selectedKisiIds.size === 0 || createOperasyon.isPending}
              >
                {createOperasyon.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.operasyonlar.creating}
                  </>
                ) : (
                  <>
                    {t.operasyonlar.createOperasyonButton}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t.operasyonlar.allSelectedWillBeAdded}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Araç Ekleme Modal */}
      <Dialog open={isAracDialogOpen} onOpenChange={(open) => {
        setIsAracDialogOpen(open)
        if (!open) {
          setSelectedAracId("")
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.operasyonlar.vehicles}</DialogTitle>
            <DialogDescription>
              Operasyona eklenecek aracı seçin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.operasyonlar.searchVehicle}</Label>
              <Popover open={aracSelectorOpen} onOpenChange={setAracSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={aracSelectorOpen}
                    className="w-full justify-between"
                  >
                    {selectedAracId
                      ? availableAraclar.find(a => a.id === selectedAracId)?.plaka
                      : t.operasyonlar.searchVehicle}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <Command>
                    <CommandInput placeholder={t.operasyonlar.searchVehicle} />
                    <CommandList>
                      <CommandEmpty>
                        {availableAraclar.length === 0
                          ? t.operasyonlar.allVehiclesAdded
                          : t.operasyonlar.vehicleNotFound}
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

            {/* New Araç Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsAracDialogOpen(false)
                setIsNewAracDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.common.createNewVehicle}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Araç Form Dialog */}
      <Dialog open={isNewAracDialogOpen} onOpenChange={setIsNewAracDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.operasyonlar.newVehicleModalTitle}</DialogTitle>
            <DialogDescription>
              {t.operasyonlar.newVehicleModalDescription}
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
    </div>
  )
}
