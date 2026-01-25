"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, X, User, Check, Search, CalendarIcon, Clock, MapPin, FileText } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { tr } from "date-fns/locale"

import { useKisiler, type Kisi } from "@/hooks/use-kisiler"
import { useCreateTanitim } from "@/hooks/use-tanitimlar"
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

export default function YeniTanitimPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { data: kisilerData, isLoading } = useKisiler({ limit: 100 })
  const createTanitim = useCreateTanitim()

  const [selectedKisiIds, setSelectedKisiIds] = React.useState<Set<string>>(new Set())
  const [searchLeft, setSearchLeft] = React.useState("")
  const [searchRight, setSearchRight] = React.useState("")
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

  const kisiler = kisilerData?.data || []

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

  const handleSubmit = async () => {
    if (selectedKisiIds.size === 0) {
      setError(t.operasyonlar.selectAtLeastOne)
      return
    }

    setError("")

    try {
      await createTanitim.mutateAsync({
        tarih,
        saat: saat || null,
        mahalleId: lokasyon.mahalleId || null,
        adresDetay: adresDetay || null,
        notlar: notlar || null,
        katilimcilar: Array.from(selectedKisiIds).map((kisiId) => ({ kisiId })),
      })
      router.push("/tanitimlar")
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
              <p><span className="text-muted-foreground/70">{t.kisiler.tcLabel}</span> <span className="font-mono">{kisi.tc}</span></p>
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
          <Link href="/tanitimlar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t.tanitimlar.newTanitimPageTitle}</h1>
          <p className="text-muted-foreground">
            {t.tanitimlar.newTanitimPageDescription}
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
                {t.tanitimlar.availablePeople}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {t.tanitimlar.itemsCount.replace("{count}", filteredAvailable.length.toString())}
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.tanitimlar.searchByNameOrTc}
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
                  {searchLeft ? t.tanitimlar.noResultsFound : t.tanitimlar.allPeopleSelected}
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
                {t.tanitimlar.selectedParticipants}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {t.tanitimlar.itemsCount.replace("{count}", selectedKisiler.length.toString())}
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.tanitimlar.searchInSelected}
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
                {t.tanitimlar.removeAll}
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
                    ? t.tanitimlar.noResultsFound
                    : t.tanitimlar.selectPeopleInstructions}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column - Tanıtım Ayarları */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t.tanitimlar.tanitimInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tarih ve Saat */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t.tanitimlar.dateTime}
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
                <span className="text-xs text-muted-foreground">{t.tanitimlar.optional}</span>
              </div>
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

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">{t.tanitimlar.participantCount}</span>
                <span className="font-bold text-lg">{selectedKisiIds.size}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={selectedKisiIds.size === 0 || createTanitim.isPending}
              >
                {createTanitim.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.tanitimlar.creating}
                  </>
                ) : (
                  <>
                    {t.tanitimlar.createTanitimButton}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t.tanitimlar.allSelectedWillBeAdded}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
