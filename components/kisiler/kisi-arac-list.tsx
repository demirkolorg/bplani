"use client"

import * as React from "react"
import { Car, Plus, X, ExternalLink, Palette, FileText, Users, Trash2, MoreHorizontal } from "lucide-react"
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
  DialogDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            {t.kisiler.vehicles}
            {araclar.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">{araclar.length}</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.kisiler.vehicleInfoAndSharing}
          </p>
        </div>
        <Button size="lg" onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          Araç Ekle
        </Button>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          {/* Vehicle List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : araclar.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {araclar.map((arac, index) => {
                const currentKisiRelation = arac.kisiler.find(ak => ak.kisi.id === kisiId)
                const otherUsers = arac.kisiler.filter(ak => ak.kisi.id !== kisiId)

                return (
                  <Card key={arac.id} className="p-0 overflow-hidden transition-all duration-200">
                    {/* Araç Header */}
                    <div className="p-6 bg-muted/30 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                            <Car className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-2xl">
                                {arac.plaka}
                              </span>
                              <Link href="/araclar">
                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Link>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                {arac.model.marka.ad} {arac.model.ad}
                              </span>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setRemovingArac(arac)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t.kisiler.remove}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* İstatistikler */}
                      {otherUsers.length > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {otherUsers.length} {t.kisiler.sharedWithPersons}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Araç Detayları */}
                    <CardContent className="p-6 space-y-4">
                      {/* Renk */}
                      {arac.renk && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                            <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">{t.kisiler.color}</div>
                            <div className="font-semibold">{aracRenkLabels[arac.renk as AracRenk] || arac.renk}</div>
                          </div>
                        </div>
                      )}

                      {/* Açıklama */}
                      {currentKisiRelation?.aciklama && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">{t.kisiler.description}</div>
                            <div className="text-sm">{currentKisiRelation.aciklama}</div>
                          </div>
                        </div>
                      )}

                      {/* Diğer Kullanıcılar */}
                      {otherUsers.length > 0 && (
                        <div className="pt-3 border-t">
                          <div className="text-xs text-muted-foreground mb-2">{t.kisiler.sharedPersons}</div>
                          <div className="flex flex-wrap gap-2">
                            {otherUsers.map(ak => (
                              <Badge key={ak.kisi.id} variant="outline" className="text-xs">
                                {ak.kisi.ad} {ak.kisi.soyad}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Car className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Henüz araç eklenmemiş</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                İlk Aracı Ekle
              </Button>
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
            <DialogDescription>
              Mevcut araçlardan seçin veya yeni araç oluşturun
            </DialogDescription>
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
    </div>
  )
}
