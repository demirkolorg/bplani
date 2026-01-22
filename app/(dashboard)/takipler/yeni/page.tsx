"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, X, User, Phone, Check, Search, CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { tr } from "date-fns/locale"

import { useAllGsmler, type GsmWithKisi } from "@/hooks/use-gsm"
import { useBulkCreateTakip } from "@/hooks/use-takip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function YeniTakipPage() {
  const router = useRouter()
  const { data: allGsmler, isLoading } = useAllGsmler()
  const bulkCreateTakip = useBulkCreateTakip()

  const [selectedGsmIds, setSelectedGsmIds] = React.useState<Set<string>>(new Set())
  const [searchLeft, setSearchLeft] = React.useState("")
  const [searchRight, setSearchRight] = React.useState("")
  const [baslamaTarihi, setBaslamaTarihi] = React.useState<Date>(new Date())
  const [bitisTarihi, setBitisTarihi] = React.useState<Date>(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  )
  const [error, setError] = React.useState("")

  // Başlama tarihi değiştiğinde bitiş tarihini +90 gün olarak güncelle
  const handleBaslamaTarihiChange = (date: Date) => {
    setBaslamaTarihi(date)
    setBitisTarihi(new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000))
  }

  // Filter out already selected GSMs from left list
  const availableGsmler = React.useMemo(() => {
    if (!allGsmler) return []
    return allGsmler.filter((gsm) => !selectedGsmIds.has(gsm.id))
  }, [allGsmler, selectedGsmIds])

  // Get selected GSMs for right list
  const selectedGsmler = React.useMemo(() => {
    if (!allGsmler) return []
    return allGsmler.filter((gsm) => selectedGsmIds.has(gsm.id))
  }, [allGsmler, selectedGsmIds])

  // Filter by search
  const filteredAvailable = React.useMemo(() => {
    if (!searchLeft.trim()) return availableGsmler
    const term = searchLeft.toLowerCase()
    return availableGsmler.filter((gsm) => {
      const kisiName = gsm.kisi
        ? `${gsm.kisi.ad} ${gsm.kisi.soyad}`.toLowerCase()
        : ""
      return gsm.numara.includes(term) || kisiName.includes(term)
    })
  }, [availableGsmler, searchLeft])

  const filteredSelected = React.useMemo(() => {
    if (!searchRight.trim()) return selectedGsmler
    const term = searchRight.toLowerCase()
    return selectedGsmler.filter((gsm) => {
      const kisiName = gsm.kisi
        ? `${gsm.kisi.ad} ${gsm.kisi.soyad}`.toLowerCase()
        : ""
      return gsm.numara.includes(term) || kisiName.includes(term)
    })
  }, [selectedGsmler, searchRight])

  const handleSelect = (gsmId: string) => {
    setSelectedGsmIds((prev) => new Set([...prev, gsmId]))
  }

  const handleDeselect = (gsmId: string) => {
    setSelectedGsmIds((prev) => {
      const next = new Set(prev)
      next.delete(gsmId)
      return next
    })
  }

  const handleSelectAll = () => {
    const allIds = filteredAvailable.map((gsm) => gsm.id)
    setSelectedGsmIds((prev) => new Set([...prev, ...allIds]))
  }

  const handleDeselectAll = () => {
    setSelectedGsmIds(new Set())
  }

  const handleSubmit = async () => {
    if (selectedGsmIds.size === 0) {
      setError("En az bir GSM seçmelisiniz")
      return
    }

    if (bitisTarihi < baslamaTarihi) {
      setError("Bitiş tarihi başlama tarihinden önce olamaz")
      return
    }

    setError("")

    try {
      await bulkCreateTakip.mutateAsync({
        gsmIds: Array.from(selectedGsmIds),
        baslamaTarihi,
        bitisTarihi,
      })
      router.push("/takipler")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const GsmItem = ({
    gsm,
    onClick,
    actionIcon,
  }: {
    gsm: GsmWithKisi
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
          {gsm.kisi ? (
            <>
              <p className="font-medium truncate">
                {gsm.kisi.ad} {gsm.kisi.soyad}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {gsm.numara}
              </p>
            </>
          ) : (
            <p className="font-mono">{gsm.numara}</p>
          )}
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
          <Link href="/takipler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Takip Ekle</h1>
          <p className="text-muted-foreground">
            Takip eklemek istediğiniz GSM numaralarını seçin
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
        {/* Left Column - Available GSMs */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mevcut GSM'ler
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {filteredAvailable.length} adet
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="GSM veya müşteri ara..."
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
                Tümünü Seç
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
                  {filteredAvailable.map((gsm) => (
                    <GsmItem
                      key={gsm.id}
                      gsm={gsm}
                      onClick={() => handleSelect(gsm.id)}
                      actionIcon={
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchLeft ? "Sonuç bulunamadı" : "Tüm GSM'ler seçildi"}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Middle Column - Selected GSMs */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-4 w-4" />
                Seçilen GSM'ler
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {selectedGsmler.length} adet
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Seçilenler içinde ara..."
                value={searchRight}
                onChange={(e) => setSearchRight(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedGsmler.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleDeselectAll}
              >
                <X className="mr-2 h-4 w-4" />
                Tümünü Kaldır
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[500px] pr-4">
              {filteredSelected.length > 0 ? (
                <div className="space-y-2">
                  {filteredSelected.map((gsm) => (
                    <GsmItem
                      key={gsm.id}
                      gsm={gsm}
                      onClick={() => handleDeselect(gsm.id)}
                      actionIcon={
                        <X className="h-4 w-4 text-destructive" />
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchRight
                    ? "Sonuç bulunamadı"
                    : "Takip eklemek için sol listeden GSM seçin"}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column - Date Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Takip Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Başlama Tarihi</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="GG.AA.YYYY"
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
                    <Button variant="outline" size="icon">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={baslamaTarihi}
                      onSelect={(date) => date && handleBaslamaTarihiChange(date)}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="GG.AA.YYYY"
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
                    <Button variant="outline" size="icon">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={bitisTarihi}
                      onSelect={(date) => date && setBitisTarihi(date)}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                Varsayılan: Başlama + 90 gün
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">Seçilen GSM:</span>
                <span className="font-bold text-lg">{selectedGsmIds.size}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={selectedGsmIds.size === 0 || bulkCreateTakip.isPending}
              >
                {bulkCreateTakip.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    {selectedGsmIds.size} Takip Oluştur
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Her GSM için ayrı takip kaydı oluşturulacak.
              <br />
              Sonrasında her birinin durumunu ayrı ayrı değiştirebilirsiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
