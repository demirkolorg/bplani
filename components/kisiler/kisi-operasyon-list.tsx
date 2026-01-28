"use client"

import * as React from "react"
import Link from "next/link"
import { Workflow, Calendar, MapPin, Users, ExternalLink, Plus, ChevronDown, History, Clock, FileText, Car } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { useOperasyonlarByKisi, type Operasyon } from "@/hooks/use-operasyonlar"
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
import { OperasyonSeciciModal } from "./operasyon-secici-modal"
import { YeniOperasyonModal } from "./yeni-operasyon-modal"

interface KisiOperasyonListProps {
  kisiId: string
}

function OperasyonRow({ operasyon }: { operasyon: Operasyon }) {
  const { t } = useLocale()
  const tarih = new Date(operasyon.tarih)

  // Build address string
  const lokasyon = operasyon.mahalle
    ? `${operasyon.mahalle.ad}, ${operasyon.mahalle.ilce.ad}, ${operasyon.mahalle.ilce.il.ad}`
    : null

  const katilimcilar = operasyon.katilimcilar?.filter((k) => k.kisi) || []
  const visibleKatilimcilar = katilimcilar.slice(0, 3)
  const remainingCount = katilimcilar.length - 3

  const araclar = operasyon.araclar?.filter((a) => a.arac) || []
  const visibleAraclar = araclar.slice(0, 3)
  const remainingAracCount = araclar.length - 3

  // Combined address (location + detail)
  const fullAddress = [lokasyon, operasyon.adresDetay].filter(Boolean).join(" - ")

  return (
    <Card className="p-0 overflow-hidden transition-all duration-200">
      {/* Operasyon Header */}
      <div className="p-6 bg-muted/30 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
              <Workflow className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl">
                  {operasyon.baslik || format(tarih, "d MMMM yyyy", { locale: tr })}
                </span>
              </div>
            </div>
          </div>
          <Link href={`/operasyonlar/${operasyon.id}`}>
            <Button size="sm" variant="secondary" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              {t.common.detail}
            </Button>
          </Link>
        </div>
      </div>

      {/* Operasyon Detayları */}
      <CardContent className="p-6 space-y-4">
        {/* Tarih ve Saat */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{t.common.date}</div>
            <div className="font-semibold">
              {format(tarih, "d MMMM yyyy", { locale: tr })}
              {operasyon.saat && (
                <span className="text-sm text-muted-foreground ml-2">• {operasyon.saat}</span>
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
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Car className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">{t.common.vehicles}</div>
              <div className="flex flex-wrap gap-2">
                {visibleAraclar.map((a) => (
                  <Badge
                    key={a.id}
                    variant="outline"
                    className="text-xs bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700"
                  >
                    <span className="font-mono font-bold">{a.arac?.plaka}</span>
                    <span className="text-muted-foreground ml-1">
                      {a.arac?.model?.marka?.ad} {a.arac?.model?.ad}
                    </span>
                  </Badge>
                ))}
                {remainingAracCount > 0 && (
                  <Link href={`/operasyonlar/${operasyon.id}`}>
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
                <Link href={`/operasyonlar/${operasyon.id}`}>
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

export function KisiOperasyonList({ kisiId }: KisiOperasyonListProps) {
  const { data: operasyonlar, isLoading } = useOperasyonlarByKisi(kisiId)
  const { data: kisi } = useKisi(kisiId)
  const { t } = useLocale()

  const [showSeciciModal, setShowSeciciModal] = React.useState(false)
  const [showYeniModal, setShowYeniModal] = React.useState(false)

  const kisiAd = kisi ? `${kisi.ad} ${kisi.soyad}` : ""
  const mevcutOperasyonIds = operasyonlar?.map((t) => t.id) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            {t.kisiler.operations}
            {operasyonlar && operasyonlar.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">{operasyonlar.length}</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.kisiler.operationsDescription}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              {t.kisiler.addToOperation}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowYeniModal(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              {t.kisiler.createNewOperation}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSeciciModal(true)}>
              <History className="h-4 w-4 mr-2" />
              {t.kisiler.addToExistingOperation}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          {/* Operasyon List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : operasyonlar && operasyonlar.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {operasyonlar.map((operasyon) => (
                <OperasyonRow key={operasyon.id} operasyon={operasyon} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Workflow className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t.kisiler.noOperationsYet}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {t.kisiler.noOperationsYetDescription}
              </p>
              <Button onClick={() => setShowYeniModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t.kisiler.addFirstOperation}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mevcut Operasyona Ekle Modal */}
      <OperasyonSeciciModal
        open={showSeciciModal}
        onOpenChange={setShowSeciciModal}
        kisiId={kisiId}
        kisiAd={kisiAd}
        mevcutOperasyonIds={mevcutOperasyonIds}
      />

      {/* Yeni Operasyon Oluştur Modal */}
      <YeniOperasyonModal
        open={showYeniModal}
        onOpenChange={setShowYeniModal}
        kisiId={kisiId}
        kisiAd={kisiAd}
      />
    </div>
  )
}
