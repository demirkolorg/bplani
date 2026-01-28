"use client"

import * as React from "react"
import Link from "next/link"
import { Megaphone, Calendar, MapPin, Users, ExternalLink, Plus, ChevronDown, History, Clock, FileText, Car } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { useTanitimlarByKisi, type Tanitim } from "@/hooks/use-tanitimlar"
import { useKisi } from "@/hooks/use-kisiler"
import { useLocale } from "@/components/providers/locale-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TanitimSeciciModal } from "./tanitim-secici-modal"
import { YeniTanitimModal } from "./yeni-tanitim-modal"

interface KisiTanitimListProps {
  kisiId: string
}

function TanitimRow({ tanitim }: { tanitim: Tanitim }) {
  const { t } = useLocale()
  const tarih = new Date(tanitim.tarih)

  // Build address string
  const lokasyon = tanitim.mahalle
    ? `${tanitim.mahalle.ad}, ${tanitim.mahalle.ilce.ad}, ${tanitim.mahalle.ilce.il.ad}`
    : null

  const katilimcilar = tanitim.katilimcilar?.filter((k) => k.kisi) || []
  const visibleKatilimcilar = katilimcilar.slice(0, 3)
  const remainingCount = katilimcilar.length - 3

  const araclar = tanitim.araclar?.filter((a) => a.arac) || []
  const visibleAraclar = araclar.slice(0, 3)
  const remainingAracCount = araclar.length - 3

  // Combined address (location + detail)
  const fullAddress = [lokasyon, tanitim.adresDetay].filter(Boolean).join(" - ")

  return (
    <Card className="p-0 overflow-hidden transition-all duration-200">
      {/* Tanitim Header */}
      <div className="p-6 bg-muted/30 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <Megaphone className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl">
                  {tanitim.baslik || format(tarih, "d MMMM yyyy", { locale: tr })}
                </span>
              </div>
            </div>
          </div>
          <Link href={`/tanitimlar/${tanitim.id}`}>
            <Button size="sm" variant="secondary" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              {t.common.detail}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tanitim Detayları */}
      <CardContent className="p-6 space-y-4">
        {/* Tarih ve Saat */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{t.common.date}</div>
            <div className="font-semibold">
              {format(tarih, "d MMMM yyyy", { locale: tr })}
              {tanitim.saat && (
                <span className="text-sm text-muted-foreground ml-2">• {tanitim.saat}</span>
              )}
            </div>
          </div>
        </div>

        {/* Konum ve Adres */}
        {fullAddress && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">{t.common.location}</div>
              <div className="text-sm">{fullAddress}</div>
            </div>
          </div>
        )}

        {/* Araçlar */}
        {araclar.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Car className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">{t.common.vehicles}</div>
              <div className="flex flex-wrap gap-2">
                {visibleAraclar.map((a) => (
                  <Badge
                    key={a.id}
                    variant="outline"
                    className="text-xs bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-700"
                  >
                    <span className="font-mono font-bold">{a.arac?.plaka}</span>
                    <span className="text-muted-foreground ml-1">
                      {a.arac?.model?.marka?.ad} {a.arac?.model?.ad}
                    </span>
                  </Badge>
                ))}
                {remainingAracCount > 0 && (
                  <Link href={`/tanitimlar/${tanitim.id}`}>
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted transition-colors"
                    >
                      +{remainingAracCount}
                    </Badge>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Katılımcılar */}
        {katilimcilar.length > 0 && (
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-2">{t.common.participants}</div>
            <div className="flex flex-wrap gap-2">
              {visibleKatilimcilar.map((k) => (
                <Link key={k.id} href={`/kisiler/${k.kisi?.id}`}>
                  <Badge
                    variant="outline"
                    className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                      k.kisi?.tt
                        ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                        : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                    }`}
                  >
                    {k.kisi?.ad} {k.kisi?.soyad} ({k.kisi?.tc})
                  </Badge>
                </Link>
              ))}
              {remainingCount > 0 && (
                <Link href={`/tanitimlar/${tanitim.id}`}>
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-muted transition-colors"
                  >
                    +{remainingCount}
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function KisiTanitimList({ kisiId }: KisiTanitimListProps) {
  const { data: tanitimlar, isLoading } = useTanitimlarByKisi(kisiId)
  const { data: kisi } = useKisi(kisiId)
  const { t } = useLocale()

  const [showSeciciModal, setShowSeciciModal] = React.useState(false)
  const [showYeniModal, setShowYeniModal] = React.useState(false)

  const kisiAd = kisi ? `${kisi.ad} ${kisi.soyad}` : ""
  const mevcutTanitimIds = tanitimlar?.map((t) => t.id) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            {t.kisiler.introductions}
            {tanitimlar && tanitimlar.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">{tanitimlar.length}</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.kisiler.introductionsDescription}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              {t.kisiler.addToIntroduction}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowYeniModal(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              {t.kisiler.createNewIntroduction}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSeciciModal(true)}>
              <History className="h-4 w-4 mr-2" />
              {t.kisiler.addToExistingIntroduction}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          {/* Tanıtım List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : tanitimlar && tanitimlar.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {tanitimlar.map((tanitim) => (
                <TanitimRow key={tanitim.id} tanitim={tanitim} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t.kisiler.noIntroductionsYet}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {t.kisiler.noIntroductionsYetDescription}
              </p>
              <Button onClick={() => setShowYeniModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t.kisiler.addFirstIntroduction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mevcut Tanıtıma Ekle Modal */}
      <TanitimSeciciModal
        open={showSeciciModal}
        onOpenChange={setShowSeciciModal}
        kisiId={kisiId}
        kisiAd={kisiAd}
        mevcutTanitimIds={mevcutTanitimIds}
      />

      {/* Yeni Tanıtım Oluştur Modal */}
      <YeniTanitimModal
        open={showYeniModal}
        onOpenChange={setShowYeniModal}
        kisiId={kisiId}
        kisiAd={kisiAd}
      />
    </div>
  )
}
