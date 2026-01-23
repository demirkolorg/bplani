"use client"

import * as React from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Search, MapPin, Users, Check, Calendar } from "lucide-react"

import { useTanitimlar, useAddKatilimci, type Tanitim } from "@/hooks/use-tanitimlar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface TanitimSeciciModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisiId: string
  kisiAd: string
  mevcutTanitimIds?: string[]
}

function TanitimSeciciItem({
  tanitim,
  isSelected,
  isDisabled,
  onToggle,
}: {
  tanitim: Tanitim
  isSelected: boolean
  isDisabled: boolean
  onToggle: () => void
}) {
  const tarih = new Date(tanitim.tarih)
  const lokasyon = tanitim.mahalle
    ? `${tanitim.mahalle.ad} / ${tanitim.mahalle.ilce.ad}`
    : null

  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all ${
        isDisabled
          ? "opacity-50 cursor-not-allowed bg-muted"
          : isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-primary/50 hover:bg-muted/50"
      }`}
      onClick={() => !isDisabled && onToggle()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Checkbox area */}
          <div
            className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              isDisabled
                ? "border-muted-foreground/30 bg-muted"
                : isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/50"
            }`}
          >
            {(isSelected || isDisabled) && (
              <Check className={`h-3 w-3 ${isDisabled ? "text-muted-foreground/50" : "text-primary-foreground"}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="font-medium">
                {format(tarih, "d MMMM yyyy", { locale: tr })}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(tarih, "HH:mm", { locale: tr })}
              </span>
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
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {tanitim.katilimcilar?.length || 0}
          </Badge>
          {isDisabled && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
              Eklendi
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function TanitimSeciciModal({
  open,
  onOpenChange,
  kisiId,
  kisiAd,
  mevcutTanitimIds = [],
}: TanitimSeciciModalProps) {
  const [search, setSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: tanitimlarData, isLoading } = useTanitimlar({
    search: search || undefined,
    limit: 50,
    sortBy: "tarih",
    sortOrder: "desc",
  })

  const addKatilimci = useAddKatilimci()

  const tanitimlar = tanitimlarData?.data || []

  // Reset selection when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set())
      setSearch("")
      setError("")
    }
  }, [open])

  const handleToggle = (tanitimId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tanitimId)) {
        newSet.delete(tanitimId)
      } else {
        newSet.add(tanitimId)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return
    setError("")
    setIsSubmitting(true)

    try {
      // Add to all selected tanitimlar sequentially
      for (const tanitimId of selectedIds) {
        await addKatilimci.mutateAsync({
          tanitimId,
          data: { kisiId },
        })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Katılımcı eklenirken hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCount = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mevcut Tanıtıma Ekle</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{kisiAd}</span> kişisini eklemek istediğiniz tanıtımları seçin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tanıtım ara (adres, tarih...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected count */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{selectedCount}</span> tanıtım seçildi
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={() => setSelectedIds(new Set())}
              >
                Seçimi Temizle
              </Button>
            </div>
          )}

          {/* Tanitim List */}
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : tanitimlar.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Tanıtım bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tanitimlar.map((tanitim) => {
                  const isDisabled = mevcutTanitimIds.includes(tanitim.id)
                  return (
                    <TanitimSeciciItem
                      key={tanitim.id}
                      tanitim={tanitim}
                      isSelected={selectedIds.has(tanitim.id)}
                      isDisabled={isDisabled}
                      onToggle={() => handleToggle(tanitim.id)}
                    />
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCount === 0 || isSubmitting}
          >
            {isSubmitting && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {selectedCount > 0 ? `${selectedCount} Tanıtıma Ekle` : "Ekle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
