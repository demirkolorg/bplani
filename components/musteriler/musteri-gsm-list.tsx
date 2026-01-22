"use client"

import * as React from "react"
import { Plus, Star, StarOff, MoreHorizontal, Trash2, Phone, RefreshCw, PlusCircle, ChevronDown, ChevronRight, Clock } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useGsmlerByKisi, useUpdateGsm, useDeleteGsm, type GsmWithTakipler, type GsmTakip } from "@/hooks/use-gsm"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"

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

function KalanGunBadge({ kalanGun }: { kalanGun: number }) {
  if (kalanGun <= 0) {
    return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Doldu</Badge>
  }
  if (kalanGun <= 7) {
    return <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-orange-500 border-orange-500">{kalanGun}g</Badge>
  }
  return <span className="text-xs text-muted-foreground">{kalanGun}g</span>
}

function TakipRow({
  takip,
  isActive,
  onDurumChange
}: {
  takip: GsmTakip
  isActive?: boolean
  onDurumChange?: () => void
}) {
  const kalanGun = getKalanGun(takip.bitisTarihi)

  return (
    <div className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-200 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-800/50' : 'bg-muted/30 border border-transparent'}`}>
      <Badge variant={durumVariants[takip.durum as TakipDurum]} className="text-xs px-2 py-0.5 shrink-0 font-medium">
        {takipDurumLabels[takip.durum as TakipDurum]}
      </Badge>

      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 flex-1">
        <span className="whitespace-nowrap font-medium">
          {format(new Date(takip.baslamaTarihi), "dd.MM.yy", { locale: tr })}
        </span>
        <span className="text-muted-foreground/50">→</span>
        <span className="whitespace-nowrap font-medium">
          {format(new Date(takip.bitisTarihi), "dd.MM.yy", { locale: tr })}
        </span>
      </div>

      <KalanGunBadge kalanGun={kalanGun} />

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
}: {
  gsm: GsmWithTakipler
  onSetPrimary: (id: string) => void
  onDelete: (id: string) => void
  onDurumChange: (takip: GsmTakip) => void
  onTakipEkle: (gsm: GsmWithTakipler) => void
  isUpdating: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const activeTakip = gsm.takipler.find((t) => t.isActive)
  const pastTakipler = gsm.takipler.filter((t) => !t.isActive)
  const hasPastTakipler = pastTakipler.length > 0

  return (
    <div className={`border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${gsm.isPrimary ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10' : 'border-border/50 bg-card'}`}>
      {/* GSM Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-semibold text-base">{gsm.numara}</span>
            {gsm.isPrimary && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-medium text-amber-600">Birincil</span>
              </div>
            )}
          </div>
        </div>

        {/* Aktif Takip Özeti */}
        {activeTakip ? (
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant={durumVariants[activeTakip.durum as TakipDurum]} className="text-[10px] px-1.5 py-0">
              {takipDurumLabels[activeTakip.durum as TakipDurum]}
            </Badge>
            <KalanGunBadge kalanGun={getKalanGun(activeTakip.bitisTarihi)} />
          </div>
        ) : (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground hidden sm:flex">
            Takip Yok
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onTakipEkle(gsm)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Takip Ekle
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
              {gsm.isPrimary ? "Zaten Birincil" : "Birincil Yap"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(gsm.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Takip Detayları */}
      <div className="px-4 pb-4 space-y-2">
        {activeTakip ? (
          <TakipRow
            takip={activeTakip}
            isActive
            onDurumChange={() => onDurumChange(activeTakip)}
          />
        ) : (
          <button
            onClick={() => onTakipEkle(gsm)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Takip Ekle
          </button>
        )}

        {/* Geçmiş Takipler */}
        {hasPastTakipler && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground py-1"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Geçmiş ({pastTakipler.length})
            </button>
            {isExpanded && (
              <div className="space-y-1 mt-1">
                {pastTakipler.map((takip) => (
                  <TakipRow key={takip.id} takip={takip} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function KisiGsmList({ kisiId }: KisiGsmListProps) {
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            GSM Numaraları
            {gsmler && gsmler.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({gsmler.length})</span>
            )}
          </CardTitle>
          <Button size="sm" onClick={() => setShowGsmModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : gsmler && gsmler.length > 0 ? (
          gsmler.map((gsm) => (
            <GsmRow
              key={gsm.id}
              gsm={gsm}
              onSetPrimary={handleSetPrimary}
              onDelete={setDeleteId}
              onDurumChange={(takip) => setDurumTakip({ takip, gsmNumara: gsm.numara })}
              onTakipEkle={setTakipEkleGsm}
              isUpdating={updateGsm.isPending}
            />
          ))
        ) : (
          <div className="text-center py-6">
            <Phone className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">GSM numarası yok</p>
          </div>
        )}
      </CardContent>

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
        title="GSM Sil"
        description="Bu GSM ve tüm takip kayıtları silinecek. Devam edilsin mi?"
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteGsm.isPending}
      />
    </Card>
  )
}
