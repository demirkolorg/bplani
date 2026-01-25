"use client"

import * as React from "react"
import { Car, Plus, X, ExternalLink } from "lucide-react"
import Link from "next/link"

import { useAraclarByKisi, useAddKisiToArac, useRemoveKisiFromArac, useAraclar, type Arac } from "@/hooks/use-araclar-vehicles"
import { useLocale } from "@/components/providers/locale-provider"
import { aracRenkLabels, type AracRenk } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { AracForm } from "@/components/araclar/vehicles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface KisiAracListProps {
  kisiId: string
}

export function KisiAracList({ kisiId }: KisiAracListProps) {
  const { t } = useLocale()
  const { data, isLoading } = useAraclarByKisi(kisiId)
  const { data: allAraclar } = useAraclar({ limit: 100 })
  const addKisiToArac = useAddKisiToArac()
  const removeKisiFromArac = useRemoveKisiFromArac()

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isNewAracDialogOpen, setIsNewAracDialogOpen] = React.useState(false)
  const [selectedAracId, setSelectedAracId] = React.useState("")
  const [aciklama, setAciklama] = React.useState("")
  const [aracOpen, setAracOpen] = React.useState(false)
  const [removingArac, setRemovingArac] = React.useState<Arac | null>(null)

  const araclar = data?.data || []

  // Filter out araçlar that are already associated with this kişi
  const availableAraclar = React.useMemo(() => {
    const existingIds = new Set(araclar.map(a => a.id))
    return allAraclar?.data.filter(a => !existingIds.has(a.id)) || []
  }, [allAraclar?.data, araclar])

  const handleAddExisting = async () => {
    if (!selectedAracId) return

    try {
      await addKisiToArac.mutateAsync({
        aracId: selectedAracId,
        data: { kisiId, aciklama: aciklama || null },
      })
      setSelectedAracId("")
      setAciklama("")
      setIsAddDialogOpen(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleRemove = async () => {
    if (!removingArac) return

    try {
      await removeKisiFromArac.mutateAsync({
        aracId: removingArac.id,
        kisiId,
      })
      setRemovingArac(null)
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {t.kisiler.vehicles}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-5 w-5 text-indigo-600" />
              {t.kisiler.vehicles}
              <Badge variant="secondary" className="ml-1">
                {araclar.length}
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.kisiler.addVehicle}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {araclar.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.kisiler.noVehiclesAdded}
            </p>
          ) : (
            <div className="space-y-2">
              {araclar.map((arac) => (
                <div
                  key={arac.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{arac.plaka}</span>
                      <Link href="/araclar">
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {arac.model.marka.ad} {arac.model.ad}
                      {arac.renk && ` - ${aracRenkLabels[arac.renk as AracRenk] || arac.renk}`}
                    </div>
                    {/* Açıklama - bu kişi için */}
                    {(() => {
                      const currentKisiRelation = arac.kisiler.find(ak => ak.kisi.id === kisiId)
                      return currentKisiRelation?.aciklama ? (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {currentKisiRelation.aciklama}
                        </p>
                      ) : null
                    })()}
                    {arac.kisiler.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {arac.kisiler
                          .filter(ak => ak.kisi.id !== kisiId)
                          .slice(0, 2)
                          .map(ak => (
                            <Badge key={ak.kisi.id} variant="outline" className="text-xs">
                              {ak.kisi.ad} {ak.kisi.soyad}
                            </Badge>
                          ))}
                        {arac.kisiler.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{arac.kisiler.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setRemovingArac(arac)}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Araç Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) {
          setSelectedAracId("")
          setAciklama("")
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.kisiler.addVehicleTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing Araç Selection */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t.kisiler.selectFromExisting}</p>
              <Popover open={aracOpen} onOpenChange={setAracOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={aracOpen}
                    className="w-full justify-between"
                  >
                    {selectedAracId
                      ? availableAraclar.find(a => a.id === selectedAracId)?.plaka
                      : t.kisiler.selectVehicle}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder={t.kisiler.searchPlate} />
                    <CommandList>
                      <CommandEmpty>{t.kisiler.vehicleNotFound}</CommandEmpty>
                      <CommandGroup>
                        {availableAraclar.map((arac) => (
                          <CommandItem
                            key={arac.id}
                            value={arac.plaka}
                            onSelect={() => {
                              setSelectedAracId(arac.id)
                              setAracOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAracId === arac.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <span className="font-mono">{arac.plaka}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {arac.model.marka.ad} {arac.model.ad}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Açıklama */}
            {selectedAracId && (
              <div className="space-y-2">
                <Label htmlFor="aciklama">{t.kisiler.descriptionOptional}</Label>
                <Textarea
                  id="aciklama"
                  placeholder={t.kisiler.vehicleDescriptionPlaceholder}
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {/* Ekle Butonu */}
            {selectedAracId && (
              <Button
                onClick={handleAddExisting}
                disabled={!selectedAracId || addKisiToArac.isPending}
                className="w-full"
              >
                {addKisiToArac.isPending ? t.kisiler.adding : t.kisiler.addVehicle}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t.kisiler.or}
                </span>
              </div>
            </div>

            {/* New Araç Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsNewAracDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.kisiler.createNewVehicle}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Araç Form Dialog */}
      <Dialog open={isNewAracDialogOpen} onOpenChange={setIsNewAracDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.kisiler.newVehicle}</DialogTitle>
          </DialogHeader>
          <AracForm
            inModal
            defaultKisiId={kisiId}
            onSuccess={() => setIsNewAracDialogOpen(false)}
            onCancel={() => setIsNewAracDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!removingArac} onOpenChange={(open) => !open && setRemovingArac(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.kisiler.removeVehicle}</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removingArac?.plaka}</strong> {t.kisiler.removeVehicleConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeKisiFromArac.isPending ? t.kisiler.removing : t.kisiler.remove}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
