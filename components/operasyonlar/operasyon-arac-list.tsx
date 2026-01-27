"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Car } from "lucide-react"
import { useAddOperasyonArac, useRemoveOperasyonArac, useOperasyon } from "@/hooks/use-operasyonlar"
import { useAraclar } from "@/hooks/use-araclar-vehicles"
import { useLocale } from "@/components/providers/locale-provider"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface OperasyonAracListProps {
  operasyonId: string
}

export function OperasyonAracList({ operasyonId }: OperasyonAracListProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [selectorOpen, setSelectorOpen] = React.useState(false)

  const { data: operasyon } = useOperasyon(operasyonId)
  const { data: araclarData, isLoading: araclarLoading } = useAraclar({ limit: 100 })
  const addArac = useAddOperasyonArac()
  const removeArac = useRemoveOperasyonArac()

  const araclar = operasyon?.araclar || []
  const allAraclar = araclarData?.data || []

  // Araç IDs that are already added
  const existingAracIds = new Set(araclar.map((a) => a.aracId))

  // Available araclar (not yet added)
  const availableAraclar = allAraclar.filter((a) => !existingAracIds.has(a.id))

  const handleAddArac = async (aracId: string) => {
    await addArac.mutateAsync({
      operasyonId,
      data: { aracId },
    })
    setSelectorOpen(false)
  }

  const handleRemoveArac = async () => {
    if (!deleteId) return
    await removeArac.mutateAsync({
      operasyonId,
      aracId: deleteId,
    })
    setDeleteId(null)
  }

  const navigateToArac = (aracId: string) => {
    router.push(`/araclar/vehicles/${aracId}`)
  }

  const getRenkBadge = (renk: string | null) => {
    if (!renk) return null

    const colorMap: Record<string, string> = {
      BEYAZ: "bg-gray-100 text-gray-800 border-gray-300",
      SIYAH: "bg-gray-800 text-white border-gray-900",
      GRI: "bg-gray-400 text-gray-900 border-gray-500",
      GUMUS: "bg-gray-300 text-gray-800 border-gray-400",
      KIRMIZI: "bg-red-100 text-red-800 border-red-300",
      MAVI: "bg-blue-100 text-blue-800 border-blue-300",
      LACIVERT: "bg-blue-900 text-blue-100 border-blue-950",
      YESIL: "bg-green-100 text-green-800 border-green-300",
      SARI: "bg-yellow-100 text-yellow-800 border-yellow-300",
      TURUNCU: "bg-orange-100 text-orange-800 border-orange-300",
      KAHVERENGI: "bg-amber-700 text-amber-100 border-amber-800",
      BEJ: "bg-amber-100 text-amber-800 border-amber-300",
      BORDO: "bg-red-900 text-red-100 border-red-950",
      MOR: "bg-purple-100 text-purple-800 border-purple-300",
      PEMBE: "bg-pink-100 text-pink-800 border-pink-300",
      ALTIN: "bg-yellow-600 text-yellow-100 border-yellow-700",
      BRONZ: "bg-amber-600 text-amber-100 border-amber-700",
    }

    return (
      <Badge variant="outline" className={cn("text-xs", colorMap[renk] || "")}>
        {renk}
      </Badge>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4 text-purple-600" />
              {t.operasyonlar.vehicles}
              {araclar.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({araclar.length})
                </span>
              )}
            </CardTitle>
            <Popover open={selectorOpen} onOpenChange={setSelectorOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.common.add}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="end">
                <Command>
                  <CommandInput placeholder={t.operasyonlar.searchVehicle} />
                  <CommandList>
                    <CommandEmpty>
                      {availableAraclar.length === 0
                        ? t.operasyonlar.allVehiclesAdded
                        : t.operasyonlar.vehicleNotFound}
                    </CommandEmpty>
                    <CommandGroup>
                      {availableAraclar.map((arac) => (
                        <CommandItem
                          key={arac.id}
                          value={`${arac.plaka} ${arac.model.marka.ad} ${arac.model.ad}`}
                          onSelect={() => handleAddArac(arac.id)}
                          disabled={addArac.isPending}
                        >
                          <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-mono font-bold">{arac.plaka}</span>
                            <span className="text-sm text-muted-foreground">
                              {arac.model.marka.ad} {arac.model.ad}
                            </span>
                          </div>
                          {getRenkBadge(arac.renk)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {araclar.length > 0 ? (
            <ul className="space-y-2">
              {araclar.map((operasyonArac) => (
                <li
                  key={operasyonArac.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => navigateToArac(operasyonArac.aracId)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950">
                      <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold">
                          {operasyonArac.arac.plaka}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {operasyonArac.arac.model.marka.ad} {operasyonArac.arac.model.ad}
                        </span>
                        {getRenkBadge(operasyonArac.arac.renk)}
                      </div>
                      {operasyonArac.arac.kisiler && operasyonArac.arac.kisiler.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <span className="text-xs">
                            {operasyonArac.arac.kisiler.map((ak) =>
                              `${ak.kisi.ad} ${ak.kisi.soyad}`
                            ).join(", ")}
                          </span>
                        </div>
                      )}
                      {operasyonArac.aciklama && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {operasyonArac.aciklama}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(operasyonArac.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t.operasyonlar.noVehiclesYet}</p>
              <p className="text-xs">{t.operasyonlar.useAddButtonVehicle}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.operasyonlar.removeVehicle}
        description={t.operasyonlar.removeVehicleConfirm}
        confirmText={t.common.remove}
        onConfirm={handleRemoveArac}
        isLoading={removeArac.isPending}
      />
    </>
  )
}
