"use client"

import * as React from "react"
import { Plus, Star, StarOff, MoreHorizontal, Trash2, Phone, RefreshCw, PlusCircle, ChevronDown, ChevronRight, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle2, History, Signal } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { tr as trLocale, enUS } from "date-fns/locale"
import { useGsmlerByKisi, useUpdateGsm, useDeleteGsm, type GsmWithTakipler, type GsmTakip } from "@/hooks/use-gsm"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"
import { useLocale } from "@/components/providers/locale-provider"
import type { Translations } from "@/types/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GsmFormModal } from "./gsm-form-modal"
import { TakipDurumModal } from "./takip-durum-modal"
import { TakipEkleModal } from "./takip-ekle-modal"

interface KisiGsmListProps {
  kisiId: string
}

const durumVariants: Record<TakipDurum, "default" | "secondary" | "destructive" | "outline"> = {
  UZATILACAK: "default",
  DEVAM_EDECEK: "secondary",
  SONLANDIRILACAK: "destructive",
  UZATILDI: "outline",
}

function getKalanGun(bitisTarihi: string): number {
  const date = new Date(bitisTarihi)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function KalanGunBadge({ kalanGun, t }: { kalanGun: number; t: Translations }) {
  if (kalanGun <= 0) {
    return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.takipler.expired}</Badge>
  }
  if (kalanGun <= 7) {
    return <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-orange-500 border-orange-500">{kalanGun}g</Badge>
  }
  return <span className="text-xs text-muted-foreground">{kalanGun}g</span>
}

function TakipRow({
  takip,
  isActive,
  onDurumChange,
  locale,
}: {
  takip: GsmTakip
  isActive?: boolean
  onDurumChange?: () => void
  locale: "tr" | "en"
}) {
  const kalanGun = getKalanGun(takip.bitisTarihi)
  const { t } = useLocale()
  const dateLocale = locale === "tr" ? trLocale : enUS

  return (
    <div className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-200 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-800/50' : 'bg-muted/30 border border-transparent'}`}>
      <Badge variant={durumVariants[takip.durum as TakipDurum]} className="text-xs px-2 py-0.5 shrink-0 font-medium">
        {takipDurumLabels[takip.durum as TakipDurum]}
      </Badge>

      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 flex-1">
        <span className="whitespace-nowrap font-medium">
          {format(new Date(takip.baslamaTarihi), "dd.MM.yy", { locale: dateLocale })}
        </span>
        <span className="text-muted-foreground/50">→</span>
        <span className="whitespace-nowrap font-medium">
          {format(new Date(takip.bitisTarihi), "dd.MM.yy", { locale: dateLocale })}
        </span>
      </div>

      <KalanGunBadge kalanGun={kalanGun} t={t} />

      {isActive && onDurumChange && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          onClick={onDurumChange}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

function GsmRow({
  gsm,
  onSetPrimary,
  onDelete,
  onDurumChange,
  onTakipEkle,
  isUpdating,
  t,
  locale,
}: {
  gsm: GsmWithTakipler
  onSetPrimary: (id: string) => void
  onDelete: (id: string) => void
  onDurumChange: (takip: GsmTakip) => void
  onTakipEkle: (gsm: GsmWithTakipler) => void
  isUpdating: boolean
  t: Translations
  locale: "tr" | "en"
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const activeTakip = gsm.takipler.find((t) => t.isActive)
  const pastTakipler = gsm.takipler.filter((t) => !t.isActive)
  const hasPastTakipler = pastTakipler.length > 0

  const kalanGun = activeTakip ? getKalanGun(activeTakip.bitisTarihi) : 0
  const isExpiringSoon = kalanGun > 0 && kalanGun <= 7
  const isExpired = kalanGun < 0

  const progress = activeTakip
    ? (() => {
        const total = differenceInDays(new Date(activeTakip.bitisTarihi), new Date(activeTakip.baslamaTarihi))
        const passed = total - kalanGun
        return Math.min(100, Math.max(0, (passed / total) * 100))
      })()
    : 0

  return (
    <Card className={`p-0 overflow-hidden transition-all duration-200 ${gsm.isPrimary ? 'border-primary/50 shadow-lg' : ''}`}>
      {/* GSM Header */}
      <div className="p-4 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
              <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xl truncate">{gsm.numara}</span>
                {gsm.isPrimary && (
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                )}
              </div>
              {gsm.isPrimary && (
                <span className="text-xs font-medium text-muted-foreground">{t.common.primary}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTakip && (
              <div className="text-right mr-2">
                <div className={`text-2xl font-bold ${isExpired ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                  {Math.abs(kalanGun)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t.kisiler.daysShort}
                </div>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTakipEkle(gsm)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t.kisiler.takipEkle}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onSetPrimary(gsm.id)}
                  disabled={gsm.isPrimary || isUpdating}
                >
                  {gsm.isPrimary ? (
                    <Star className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ) : (
                    <StarOff className="mr-2 h-4 w-4" />
                  )}
                  {gsm.isPrimary ? t.common.alreadyPrimary : t.common.makePrimary}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(gsm.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Aktif Takip - Detaylı Görünüm */}
        {activeTakip ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {t.kisiler.activeTracking}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDurumChange(activeTakip)}
                className="h-8"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                {t.kisiler.updateStatus}
              </Button>
            </div>

            {/* Takip Bilgileri */}
            <div className={`p-4 rounded-lg border-2 ${
              isExpired ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' :
              isExpiringSoon ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' :
              'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={durumVariants[activeTakip.durum as TakipDurum]}>
                    {takipDurumLabels[activeTakip.durum as TakipDurum]}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t.kisiler.expired}
                    </Badge>
                  )}
                  {isExpiringSoon && (
                    <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700">
                      <Clock className="h-3 w-3" />
                      {kalanGun} {t.kisiler.daysRemaining}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tarih Bilgileri */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{t.kisiler.startDate}</span>
                  </div>
                  <div className="font-semibold">
                    {format(new Date(activeTakip.baslamaTarihi), "dd MMMM yyyy", { locale: locale === "tr" ? trLocale : enUS })}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{t.kisiler.endDate}</span>
                  </div>
                  <div className="font-semibold">
                    {format(new Date(activeTakip.bitisTarihi), "dd MMMM yyyy", { locale: locale === "tr" ? trLocale : enUS })}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.kisiler.progress}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isExpired ? 'bg-red-500' :
                      isExpiringSoon ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onTakipEkle(gsm)}
            className="w-full flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-medium">{t.kisiler.takipEkle}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.kisiler.noActiveTrackingForGsm}</div>
            </div>
          </button>
        )}

        {/* Geçmiş Takipler */}
        {hasPastTakipler && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors mb-3"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <History className="h-4 w-4" />
              {t.kisiler.history} ({pastTakipler.length})
            </button>
            {isExpanded && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                {pastTakipler.map((takip) => (
                  <div key={takip.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[25px] top-3 h-3 w-3 rounded-full border-2 border-muted-foreground bg-background" />

                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={durumVariants[takip.durum as TakipDurum]} className="text-xs">
                          {takipDurumLabels[takip.durum as TakipDurum]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {differenceInDays(new Date(takip.bitisTarihi), new Date(takip.baslamaTarihi))} gün
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(takip.baslamaTarihi), "dd.MM.yy", { locale: locale === "tr" ? trLocale : enUS })}</span>
                        <span>→</span>
                        <span>{format(new Date(takip.bitisTarihi), "dd.MM.yy", { locale: locale === "tr" ? trLocale : enUS })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function KisiGsmList({ kisiId }: KisiGsmListProps) {
  const { t, locale } = useLocale()
  const { data: gsmler, isLoading } = useGsmlerByKisi(kisiId)
  const updateGsm = useUpdateGsm()
  const deleteGsm = useDeleteGsm()

  const [showGsmModal, setShowGsmModal] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [durumTakip, setDurumTakip] = React.useState<{ takip: GsmTakip; gsmNumara: string } | null>(null)
  const [takipEkleGsm, setTakipEkleGsm] = React.useState<GsmWithTakipler | null>(null)

  const handleSetPrimary = async (id: string) => {
    await updateGsm.mutateAsync({ id, data: { isPrimary: true } })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteGsm.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            {t.kisiler.gsmNumbers}
            {gsmler && gsmler.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">{gsmler.length}</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.kisiler.gsmTrackingDescription}
          </p>
        </div>
        <Button size="lg" onClick={() => setShowGsmModal(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          {t.kisiler.addNewGsm}
        </Button>
      </div>

      <Card className="w-full">

      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : gsmler && gsmler.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {gsmler.map((gsm) => (
              <GsmRow
                key={gsm.id}
                gsm={gsm}
                onSetPrimary={handleSetPrimary}
                onDelete={setDeleteId}
                onDurumChange={(takip) => setDurumTakip({ takip, gsmNumara: gsm.numara })}
                onTakipEkle={setTakipEkleGsm}
                isUpdating={updateGsm.isPending}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Phone className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t.kisiler.noGsmNumber}</p>
            <Button onClick={() => setShowGsmModal(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t.kisiler.addFirstGsm}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

      <GsmFormModal
        open={showGsmModal}
        onOpenChange={setShowGsmModal}
        kisiId={kisiId}
        isFirstGsm={!gsmler || gsmler.length === 0}
      />

      <TakipDurumModal
        open={!!durumTakip}
        onOpenChange={(open) => !open && setDurumTakip(null)}
        takip={durumTakip?.takip ?? null}
        gsmNumara={durumTakip?.gsmNumara}
      />

      {takipEkleGsm && (
        <TakipEkleModal
          open={!!takipEkleGsm}
          onOpenChange={(open) => !open && setTakipEkleGsm(null)}
          gsmId={takipEkleGsm.id}
          gsmNumara={takipEkleGsm.numara}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.kisiler.deleteGsm}
        description={t.kisiler.deleteGsmConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteGsm.isPending}
      />
    </div>
  )
}
