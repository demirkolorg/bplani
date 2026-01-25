"use client"

import * as React from "react"
import Link from "next/link"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import { Pencil, Calendar, MapPin, FileText, Info, Users } from "lucide-react"

import { useOperasyon } from "@/hooks/use-operasyonlar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { OperasyonFormModal } from "@/components/operasyonlar/operasyon-form-modal"
import { OperasyonKatilimciList } from "@/components/operasyonlar/operasyon-katilimci-list"

export default function OperasyonDetayPage() {
  const params = useTabParams<{ id: string }>()
  const id = params.id

  const [showEditModal, setShowEditModal] = React.useState(false)

  const { data: operasyon, isLoading, error } = useOperasyon(id)

  // Tab title'ı dinamik güncelle
  const operasyonTitle = operasyon
    ? `Operasyon - ${new Date(operasyon.tarih).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}`
    : undefined
  useTabTitle(operasyonTitle)

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

  if (error || !operasyon) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Operasyon bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/operasyonlar">Operasyonlara Dön</Link>
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

  const operasyonTarihi = new Date(operasyon.tarih)

  // Build full address string
  const lokasyon = operasyon.mahalle
    ? `${operasyon.mahalle.ad} / ${operasyon.mahalle.ilce.ad} / ${operasyon.mahalle.ilce.il.ad}`
    : ""
  const fullAddress = operasyon.adresDetay
    ? lokasyon
      ? `${operasyon.adresDetay}, ${lokasyon}`
      : operasyon.adresDetay
    : lokasyon

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
            <Calendar className="h-7 w-7 text-purple-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Operasyon - {operasyonTarihi.toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              {operasyon.saat && (
                <span className="text-sm font-medium">
                  {operasyon.saat}
                </span>
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
                  Operasyon kaydı ve güncellemeler hakkında teknik bilgiler
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Oluşturulma
                  </p>
                  <p className="mt-1">{formatDate(operasyon.createdAt)}</p>
                  {operasyon.createdUser && (
                    <p className="text-sm text-muted-foreground">
                      {operasyon.createdUser.ad} {operasyon.createdUser.soyad}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </p>
                  <p className="mt-1">{formatDate(operasyon.updatedAt)}</p>
                  {operasyon.updatedUser && (
                    <p className="text-sm text-muted-foreground">
                      {operasyon.updatedUser.ad} {operasyon.updatedUser.soyad}
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

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-muted-foreground">Katılımcı:</span>
          <Badge variant="secondary" className="font-mono">
            {operasyon.katilimcilar?.length || 0}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({operasyon.katilimcilar?.filter(k => k.kisi?.tt === true).length || 0} Müşteri, {operasyon.katilimcilar?.filter(k => k.kisi?.tt === false).length || 0} Aday)
          </span>
        </div>
        {fullAddress && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm text-muted-foreground shrink-0">Adres:</span>
              <span className="text-sm truncate" title={fullAddress}>{fullAddress}</span>
            </div>
          </>
        )}
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sol Sütun - Katılımcılar */}
        <OperasyonKatilimciList operasyonId={id} />

        {/* Sağ Sütun - Notlar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {operasyon.notlar ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: operasyon.notlar }}
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
      <OperasyonFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialData={{
          id: operasyon.id,
          tarih: operasyon.tarih,
          saat: operasyon.saat,
          mahalleId: operasyon.mahalleId,
          mahalle: operasyon.mahalle,
          adresDetay: operasyon.adresDetay,
          notlar: operasyon.notlar,
          katilimcilar: operasyon.katilimcilar,
        }}
      />
    </div>
  )
}
