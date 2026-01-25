"use client"

import * as React from "react"
import Link from "next/link"
import { Workflow, Calendar, MapPin, Users, ExternalLink, Plus, ChevronDown, History } from "lucide-react"
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
    ? `${operasyon.mahalle.ad} / ${operasyon.mahalle.ilce.ad}`
    : null

  return (
    <Link href={`/operasyonlar/${operasyon.id}`}>
      <div className="border rounded-xl p-4 hover:bg-muted/50 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400 shrink-0">
              <Workflow className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {format(tarih, "d MMMM yyyy", { locale: tr })}
                </span>
                {operasyon.saat && (
                  <span className="text-xs text-muted-foreground">
                    {operasyon.saat}
                  </span>
                )}
              </div>

              {lokasyon && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lokasyon}</span>
                </div>
              )}

              {operasyon.adresDetay && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {operasyon.adresDetay}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="font-mono text-xs">
              <Users className="h-3 w-3 mr-1" />
              {operasyon.katilimcilar?.length || 0}
            </Badge>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Katılımcılar */}
        {operasyon.katilimcilar && operasyon.katilimcilar.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">{t.kisiler.participants}</p>
            <div className="flex flex-wrap gap-1">
              {operasyon.katilimcilar
                .filter((k) => k.kisi)
                .slice(0, 3)
                .map((k) => (
                  <Badge
                    key={k.id}
                    variant="outline"
                    className={`text-[10px] ${k.kisi?.tt
                        ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                        : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                      }`}
                  >
                    {k.kisi?.ad} {k.kisi?.soyad}
                  </Badge>
                ))}
              {operasyon.katilimcilar.filter((k) => k.kisi).length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{operasyon.katilimcilar.filter((k) => k.kisi).length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
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
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Workflow className="h-5 w-5 text-violet-600" />
              {t.kisiler.operations}
              {operasyonlar && operasyonlar.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({operasyonlar.length})
                </span>
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.kisiler.addToOperation}
                  <ChevronDown className="h-3 w-3 ml-1" />
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
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : operasyonlar && operasyonlar.length > 0 ? (
            operasyonlar.map((operasyon) => (
              <OperasyonRow key={operasyon.id} operasyon={operasyon} />
            ))
          ) : (
            <div className="text-center py-6">
              <Workflow className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">{t.kisiler.noOperationsYet}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.kisiler.noOperationsYetDescription}
              </p>
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
    </>
  )
}
