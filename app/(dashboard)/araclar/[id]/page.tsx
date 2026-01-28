"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  Car,
  Calendar,
  MapPin,
  Users,
  Megaphone,
  Workflow,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react"

import { useArac, useDeleteArac } from "@/hooks/use-araclar-vehicles"
import { useLocale } from "@/components/providers/locale-provider"
import { useTabs } from "@/components/providers/tab-provider"
import { useCurrentTabId } from "@/components/tabs/tab-panel"
import { interpolate } from "@/locales"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AracForm } from "@/components/araclar/vehicles/arac-form"
import { getAracRenkLabels } from "@/components/araclar/vehicles/arac-columns"
import type { AracRenk } from "@/lib/validations"

export default function AracDetailPage() {
  const params = useParams()
  const { t } = useLocale()
  const { updateTabTitle } = useTabs()
  const currentTabId = useCurrentTabId()
  const aracId = params.id as string

  const { data: arac, isLoading } = useArac(aracId)
  const deleteArac = useDeleteArac()

  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const renkLabels = React.useMemo(() => getAracRenkLabels(t), [t])

  // Update tab title when arac loads
  React.useEffect(() => {
    if (arac && currentTabId) {
      updateTabTitle(currentTabId, arac.plaka, true)
    }
  }, [arac, currentTabId, updateTabTitle])

  const handleDelete = async () => {
    if (!arac) return
    try {
      await deleteArac.mutateAsync(arac.id)
      // Tab will be closed by user or can remain showing "not found" message
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!arac) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.araclar.aracNotFound}</h2>
            <p className="text-muted-foreground">{t.araclar.aracNotFoundDescription}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tanitimlar = arac.tanitimlar?.map((ta) => ta.tanitim) || []
  const operasyonlar = arac.operasyonlar?.map((oa) => oa.operasyon) || []

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="font-mono">{arac.plaka}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {arac.model.marka.ad} {arac.model.ad}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t.common.edit}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t.common.delete}
          </Button>
        </div>
      </div>

      {/* Araç Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {t.araclar.aracDetails}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t.araclar.plaka}</div>
              <div className="font-mono font-bold text-lg">{arac.plaka}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t.araclar.markaModel}</div>
              <div className="font-medium">
                {arac.model.marka.ad} / {arac.model.ad}
              </div>
            </div>
            {arac.renk && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t.araclar.renk}</div>
                <div className="font-medium">{renkLabels[arac.renk as AracRenk] || arac.renk}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sahipler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.araclar.kisiler}
            {arac.kisiler && arac.kisiler.length > 0 && (
              <Badge variant="secondary">{arac.kisiler.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {arac.kisiler && arac.kisiler.length > 0 ? (
            <div className="space-y-3">
              {arac.kisiler.map((ak) => (
                <Link key={ak.id} href={`/kisiler/${ak.kisi.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        ak.kisi.tt
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        <Users className={`h-5 w-5 ${
                          ak.kisi.tt ? "text-green-600" : "text-amber-600"
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">
                          {ak.kisi.ad} {ak.kisi.soyad}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            ak.kisi.tt
                              ? "bg-green-50 text-green-700 border-green-300"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          {ak.kisi.tt ? t.kisiler.ttYes : t.kisiler.ttNo}
                        </Badge>
                      </div>
                    </div>
                    {ak.aciklama && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{ak.aciklama}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t.araclar.noKisiler}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tanıtımlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-600" />
              {t.araclar.tanitimlar}
              {tanitimlar.length > 0 && (
                <Badge variant="secondary">{tanitimlar.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tanitimlar.length > 0 ? (
              <div className="space-y-3">
                {tanitimlar.map((tanitim) => (
                  <Link key={tanitim.id} href={`/tanitimlar/${tanitim.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">
                          {tanitim.baslik || format(new Date(tanitim.tarih), "d MMMM yyyy", { locale: tr })}
                        </div>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(tanitim.tarih), "dd.MM.yyyy")}
                        </Badge>
                      </div>
                      {tanitim.mahalle && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {tanitim.mahalle.ad}, {tanitim.mahalle.ilce.ad}
                          </span>
                        </div>
                      )}
                      {tanitim.katilimcilar && tanitim.katilimcilar.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Users className="h-3 w-3" />
                          <span>
                            {tanitim.katilimcilar.length} {t.common.participants.toLowerCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t.araclar.noTanitimlar}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operasyonlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-violet-600" />
              {t.araclar.operasyonlar}
              {operasyonlar.length > 0 && (
                <Badge variant="secondary">{operasyonlar.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {operasyonlar.length > 0 ? (
              <div className="space-y-3">
                {operasyonlar.map((operasyon) => (
                  <Link key={operasyon.id} href={`/operasyonlar/${operasyon.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">
                          {operasyon.baslik || format(new Date(operasyon.tarih), "d MMMM yyyy", { locale: tr })}
                        </div>
                        <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-300">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(operasyon.tarih), "dd.MM.yyyy")}
                        </Badge>
                      </div>
                      {operasyon.mahalle && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {operasyon.mahalle.ad}, {operasyon.mahalle.ilce.ad}
                          </span>
                        </div>
                      )}
                      {operasyon.katilimcilar && operasyon.katilimcilar.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Users className="h-3 w-3" />
                          <span>
                            {operasyon.katilimcilar.length} {t.common.participants.toLowerCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t.araclar.noOperasyonlar}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.araclar.editArac}</DialogTitle>
          </DialogHeader>
          <AracForm
            initialData={{
              id: arac.id,
              modelId: arac.modelId,
              renk: arac.renk || undefined,
              plaka: arac.plaka,
              kisiIds: arac.kisiler.map((ak) => ak.kisi.id),
            }}
            inModal
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.araclar.deleteArac}</AlertDialogTitle>
            <AlertDialogDescription>
              {interpolate(t.araclar.deleteAracConfirm, { plaka: arac.plaka })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArac.isPending ? t.araclar.deleting : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
