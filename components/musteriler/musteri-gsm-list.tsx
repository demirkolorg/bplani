"use client"

import * as React from "react"
import { Plus, Star, StarOff, MoreHorizontal, Trash2, Phone, RefreshCw, PlusCircle, ChevronDown, ChevronRight, Clock } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useGsmlerByMusteri, useUpdateGsm, useDeleteGsm, type GsmWithTakipler, type GsmTakip } from "@/hooks/use-gsm"
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

interface MusteriGsmListProps {
  musteriId: string
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
    <div className={`flex items-center gap-3 py-2 px-3 rounded-md ${isActive ? 'bg-muted/50' : 'bg-muted/20'}`}>
      <Badge variant={durumVariants[takip.durum as TakipDurum]} className="text-[10px] px-1.5 py-0 shrink-0">
        {takipDurumLabels[takip.durum as TakipDurum]}
      </Badge>

      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-1">
        <span className="whitespace-nowrap">
          {format(new Date(takip.baslamaTarihi), "dd.MM.yy", { locale: tr })}
        </span>
        <span>→</span>
        <span className="whitespace-nowrap">
          {format(new Date(takip.bitisTarihi), "dd.MM.yy", { locale: tr })}
        </span>
      </div>

      <KalanGunBadge kalanGun={kalanGun} />

      {isActive && onDurumChange && takip.durum !== "UZATILDI" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-[10px]"
          onClick={onDurumChange}
        >
          <RefreshCw className="h-3 w-3" />
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
  const activeTakip = gsm.takipler.find((t) => t.durum !== "UZATILDI")
  const pastTakipler = gsm.takipler.filter((t) => t.durum === "UZATILDI")
  const hasPastTakipler = pastTakipler.length > 0

  return (
    <div className={`border rounded-lg ${gsm.isPrimary ? 'border-primary/50 bg-primary/5' : ''}`}>
      {/* GSM Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-mono font-medium">{gsm.numara}</span>
          {gsm.isPrimary && (
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 shrink-0" />
          )}
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
      <div className="px-3 pb-3 space-y-1.5">
        {activeTakip ? (
          <TakipRow
            takip={activeTakip}
            isActive
            onDurumChange={() => onDurumChange(activeTakip)}
          />
        ) : (
          <button
            onClick={() => onTakipEkle(gsm)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Plus className="h-3 w-3" />
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

export function MusteriGsmList({ musteriId }: MusteriGsmListProps) {
  const { data: gsmler, isLoading } = useGsmlerByMusteri(musteriId)
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
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            GSM Numaraları
            {gsmler && gsmler.length > 0 && (
              <Badge variant="secondary" className="text-xs">{gsmler.length}</Badge>
            )}
          </CardTitle>
          <Button size="sm" onClick={() => setShowGsmModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Ekle
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
        musteriId={musteriId}
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
