"use client"

import * as React from "react"
import Link from "next/link"
import { Megaphone, Calendar, MapPin, Users, ExternalLink, Plus, ChevronDown, History } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { useTanitimlarByKisi, type Tanitim } from "@/hooks/use-tanitimlar"
import { useKisi } from "@/hooks/use-kisiler"
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
  const tarih = new Date(tanitim.tarih)

  // Build address string
  const lokasyon = tanitim.mahalle
    ? `${tanitim.mahalle.ad} / ${tanitim.mahalle.ilce.ad}`
    : null

  return (
    <Link href={`/tanitimlar/${tanitim.id}`}>
      <div className="border rounded-xl p-4 hover:bg-muted/50 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {format(tarih, "d MMMM yyyy", { locale: tr })}
                </span>
                {tanitim.saat && (
                  <span className="text-xs text-muted-foreground">
                    {tanitim.saat}
                  </span>
                )}
              </div>

              {lokasyon && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lokasyon}</span>
                </div>
              )}

              {tanitim.adresDetay && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {tanitim.adresDetay}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="font-mono text-xs">
              <Users className="h-3 w-3 mr-1" />
              {tanitim.katilimcilar?.length || 0}
            </Badge>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Katılımcılar */}
        {tanitim.katilimcilar && tanitim.katilimcilar.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">Katılımcılar:</p>
            <div className="flex flex-wrap gap-1">
              {tanitim.katilimcilar
                .filter((k) => k.kisi)
                .slice(0, 3)
                .map((k) => (
                  <Badge
                    key={k.id}
                    variant="outline"
                    className={`text-[10px] ${
                      k.kisi?.tt
                        ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                        : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                    }`}
                  >
                    {k.kisi?.ad} {k.kisi?.soyad}
                  </Badge>
                ))}
              {tanitim.katilimcilar.filter((k) => k.kisi).length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{tanitim.katilimcilar.filter((k) => k.kisi).length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export function KisiTanitimList({ kisiId }: KisiTanitimListProps) {
  const { data: tanitimlar, isLoading } = useTanitimlarByKisi(kisiId)
  const { data: kisi } = useKisi(kisiId)

  const [showSeciciModal, setShowSeciciModal] = React.useState(false)
  const [showYeniModal, setShowYeniModal] = React.useState(false)

  const kisiAd = kisi ? `${kisi.ad} ${kisi.soyad}` : ""
  const mevcutTanitimIds = tanitimlar?.map((t) => t.id) || []

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-600" />
              Tanıtımlar
              {tanitimlar && tanitimlar.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({tanitimlar.length})
                </span>
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Tanıtıma Ekle
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowYeniModal(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Yeni Tanıtım Oluştur
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSeciciModal(true)}>
                  <History className="h-4 w-4 mr-2" />
                  Mevcut Tanıtıma Ekle
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
          ) : tanitimlar && tanitimlar.length > 0 ? (
            tanitimlar.map((tanitim) => (
              <TanitimRow key={tanitim.id} tanitim={tanitim} />
            ))
          ) : (
            <div className="text-center py-6">
              <Megaphone className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Henüz tanıtım kaydı yok</p>
              <p className="text-xs text-muted-foreground mt-1">
                Yukarıdaki &quot;Tanıtıma Ekle&quot; butonunu kullanarak kişiyi tanıtıma ekleyebilirsiniz
              </p>
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
    </>
  )
}
