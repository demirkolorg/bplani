"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, User, Phone, Users } from "lucide-react"
import { useAddOperasyonKatilimci, useRemoveOperasyonKatilimci, useOperasyon } from "@/hooks/use-operasyonlar"
import { useKisiler } from "@/hooks/use-kisiler"
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

interface OperasyonKatilimciListProps {
  operasyonId: string
}

export function OperasyonKatilimciList({ operasyonId }: OperasyonKatilimciListProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [selectorOpen, setSelectorOpen] = React.useState(false)

  const { data: operasyon } = useOperasyon(operasyonId)
  const { data: kisilerData, isLoading: kisilerLoading } = useKisiler({ limit: 100 })
  const addKatilimci = useAddOperasyonKatilimci()
  const removeKatilimci = useRemoveOperasyonKatilimci()

  const katilimcilar = operasyon?.katilimcilar || []
  const kisiler = kisilerData?.data || []

  // Kişi IDs that are already participants
  const existingKisiIds = new Set(
    katilimcilar.filter((k) => k.kisiId).map((k) => k.kisiId)
  )

  // Available kisiler (not yet participants)
  const availableKisiler = kisiler.filter((k) => !existingKisiIds.has(k.id))

  const handleAddKatilimci = async (kisiId: string) => {
    await addKatilimci.mutateAsync({
      operasyonId,
      data: { kisiId },
    })
    setSelectorOpen(false)
  }

  const handleRemoveKatilimci = async () => {
    if (!deleteId) return
    await removeKatilimci.mutateAsync({
      operasyonId,
      katilimciId: deleteId,
    })
    setDeleteId(null)
  }

  const navigateToKisi = (kisiId: string) => {
    router.push(`/kisiler/${kisiId}`)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              {t.operasyonlar.participants}
              {katilimcilar.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({katilimcilar.length})
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
              <PopoverContent className="w-[350px] p-0" align="end">
                <Command>
                  <CommandInput placeholder={t.operasyonlar.searchPerson} />
                  <CommandList>
                    <CommandEmpty>
                      {availableKisiler.length === 0
                        ? t.operasyonlar.allPersonsParticipants
                        : t.operasyonlar.personNotFound}
                    </CommandEmpty>
                    <CommandGroup>
                      {availableKisiler.map((kisi) => (
                        <CommandItem
                          key={kisi.id}
                          value={`${kisi.ad} ${kisi.soyad}`}
                          onSelect={() => handleAddKatilimci(kisi.id)}
                          disabled={addKatilimci.isPending}
                        >
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {kisi.ad} {kisi.soyad}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-auto text-xs",
                              kisi.tt
                                ? "bg-green-50 text-green-700 border-green-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            )}
                          >
                            {kisi.tt ? t.kisiler.tipMusteri : t.kisiler.tipAday}
                          </Badge>
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
          {katilimcilar.length > 0 ? (
            <ul className="space-y-2">
              {katilimcilar.map((katilimci) => (
                <li
                  key={katilimci.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => katilimci.kisiId && navigateToKisi(katilimci.kisiId)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {katilimci.kisi
                            ? `${katilimci.kisi.ad} ${katilimci.kisi.soyad}`
                            : t.operasyonlar.unknownPerson}
                        </span>
                        {katilimci.kisi && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              katilimci.kisi.tt
                                ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                            )}
                          >
                            {katilimci.kisi.tt ? t.kisiler.tipMusteri : t.kisiler.tipAday}
                          </Badge>
                        )}
                      </div>
                      {katilimci.kisi?.gsmler && katilimci.kisi.gsmler.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span className="font-mono text-xs">
                            {katilimci.kisi.gsmler[0].numara}
                          </span>
                          {katilimci.kisi.gsmler.length > 1 && (
                            <span className="text-xs">
                              +{katilimci.kisi.gsmler.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(katilimci.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t.operasyonlar.noParticipantsYet}</p>
              <p className="text-xs">{t.operasyonlar.useAddButton}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.operasyonlar.removeParticipant}
        description={t.operasyonlar.removeParticipantConfirm}
        confirmText={t.common.remove}
        onConfirm={handleRemoveKatilimci}
        isLoading={removeKatilimci.isPending}
      />
    </>
  )
}
