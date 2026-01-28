"use client"

import * as React from "react"
import Link from "next/link"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import { useLocale } from "@/components/providers/locale-provider"
import { Pencil, Calendar, MapPin, FileText, Info, Users, Car } from "lucide-react"

import { useTanitim } from "@/hooks/use-tanitimlar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TanitimFormModal } from "@/components/tanitimlar/tanitim-form-modal"
import { TanitimKatilimciList } from "@/components/tanitimlar/tanitim-katilimci-list"
import { TanitimAracList } from "@/components/tanitimlar/tanitim-arac-list"

export default function TanitimDetayPage() {
  const { t } = useLocale()
  const params = useTabParams<{ id: string }>()
  const id = params.id

  const [showEditModal, setShowEditModal] = React.useState(false)

  const { data: tanitim, isLoading, error } = useTanitim(id)

  // Tab title'ı dinamik güncelle
  const tanitimTitle = tanitim
    ? tanitim.baslik || `Tanıtım - ${new Date(tanitim.tarih).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}`
    : undefined
  useTabTitle(tanitimTitle)

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !tanitim) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : t.tanitimlar.notFound}
            </p>
            <Button asChild className="mt-4">
              <Link href="/tanitimlar">{t.common.backToIntroductions}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const tanitimTarihi = new Date(tanitim.tarih)

  // Build full address string
  const lokasyon = tanitim.mahalle
    ? `${tanitim.mahalle.ad} / ${tanitim.mahalle.ilce.ad} / ${tanitim.mahalle.ilce.il.ad}`
    : ""
  const fullAddress = tanitim.adresDetay
    ? lokasyon
      ? `${tanitim.adresDetay}, ${lokasyon}`
      : tanitim.adresDetay
    : lokasyon

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
            <Calendar className="h-7 w-7 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {tanitim.baslik || `Tanıtım - ${tanitimTarihi.toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">
                {tanitimTarihi.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {tanitim.saat && (
                <>
                  <span>•</span>
                  <span className="text-sm font-medium">
                    {tanitim.saat}
                  </span>
                </>
              )}
              {fullAddress && (
                <>
                  <span>•</span>
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm truncate max-w-xs" title={fullAddress}>
                    {fullAddress}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sistem Bilgileri Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Bilgi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sistem Bilgileri</DialogTitle>
                <DialogDescription>
                  Tanıtım kaydı ve güncellemeler hakkında teknik bilgiler
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Oluşturulma
                  </p>
                  <p className="mt-1">{formatDate(tanitim.createdAt)}</p>
                  {tanitim.createdUser && (
                    <p className="text-sm text-muted-foreground">
                      {tanitim.createdUser.ad} {tanitim.createdUser.soyad}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </p>
                  <p className="mt-1">{formatDate(tanitim.updatedAt)}</p>
                  {tanitim.updatedUser && (
                    <p className="text-sm text-muted-foreground">
                      {tanitim.updatedUser.ad} {tanitim.updatedUser.soyad}
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={() => setShowEditModal(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Katılımcılar */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-blue-50/80 dark:bg-blue-950/20">
          <Users className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-blue-500 dark:text-blue-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-blue-500 dark:text-blue-400">
              {(tanitim.katilimcilar?.length || 0).toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">{t.tanitimlar.participants}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tanitim.katilimcilar?.filter(k => k.kisi?.tt === true).length || 0} {t.kisiler.tipMusteri}, {tanitim.katilimcilar?.filter(k => k.kisi?.tt === false).length || 0} {t.kisiler.tipAday}
            </p>
          </div>
        </div>

        {/* Araçlar */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-indigo-50/80 dark:bg-indigo-950/20">
          <Car className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-indigo-500 dark:text-indigo-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-indigo-500 dark:text-indigo-400">
              {(tanitim.araclar?.length || 0).toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">{t.tanitimlar.vehicles}</p>
          </div>
        </div>

        {/* Lokasyon */}
        {fullAddress && (
          <div className="relative overflow-hidden rounded-2xl p-4 bg-green-50/80 dark:bg-green-950/20 lg:col-span-1 col-span-2">
            <MapPin className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-green-500 dark:text-green-400" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500 dark:text-green-400" />
                Lokasyon
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2" title={fullAddress}>
                {fullAddress}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sol Sütun - Katılımcılar */}
        <TanitimKatilimciList tanitimId={id} />

        {/* Orta Sütun - Araçlar */}
        <TanitimAracList tanitimId={id} />

        {/* Sağ Sütun - Notlar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tanitim.notlar ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: tanitim.notlar }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Henüz not eklenmedi</p>
                <p className="text-xs">Düzenle butonunu kullanarak not ekleyebilirsiniz</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <TanitimFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialData={{
          id: tanitim.id,
          baslik: tanitim.baslik,
          tarih: tanitim.tarih,
          saat: tanitim.saat,
          mahalleId: tanitim.mahalleId,
          mahalle: tanitim.mahalle,
          adresDetay: tanitim.adresDetay,
          notlar: tanitim.notlar,
          katilimcilar: tanitim.katilimcilar,
        }}
      />
    </div>
  )
}
