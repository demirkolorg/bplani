"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Phone,
  User,
  Calendar,
  Bell,
  Clock,
  Trash2,
} from "lucide-react"

import { useTakip, useDeleteTakip } from "@/hooks/use-takip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TakipFormModal } from "@/components/takipler/takip-form-modal"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"

// Durum badge variant mapping
const durumVariants: Record<TakipDurum, "default" | "secondary" | "destructive"> = {
  UZATILACAK: "default",
  DEVAM_EDECEK: "secondary",
  SONLANDIRILACAK: "destructive",
}

export default function TakipDetayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const { data: takip, isLoading, error } = useTakip(id)
  const deleteTakip = useDeleteTakip()

  const handleDelete = async () => {
    await deleteTakip.mutateAsync(id)
    router.push("/takipler")
  }

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

  if (error || !takip) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Takip bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/takipler">Takiplere Dön</Link>
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
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const bitisTarihi = new Date(takip.bitisTarihi)
  const now = new Date()
  const daysLeft = Math.ceil((bitisTarihi.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysLeft <= 0
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/takipler">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Takip #{takip.id.slice(-6).toUpperCase()}
              </h1>
              <Badge variant={durumVariants[takip.durum as TakipDurum]}>
                {takipDurumLabels[takip.durum as TakipDurum]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {takip.gsm.musteri
                ? `${takip.gsm.musteri.ad} ${takip.gsm.musteri.soyad} - ${takip.gsm.numara}`
                : takip.gsm.numara}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Başlama</span>
            </div>
            <p className="text-xl font-bold mt-2">
              {formatDate(takip.baslamaTarihi)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bitiş</span>
            </div>
            <p className={`text-xl font-bold mt-2 ${isExpired ? "text-destructive" : isExpiringSoon ? "text-orange-500" : ""}`}>
              {formatDate(takip.bitisTarihi)}
            </p>
            {isExpired && (
              <Badge variant="destructive" className="mt-1">Süresi Doldu</Badge>
            )}
            {isExpiringSoon && !isExpired && (
              <Badge variant="outline" className="mt-1 text-orange-500 border-orange-500">
                {daysLeft} gün kaldı
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Alarm</span>
            </div>
            <p className="text-xl font-bold mt-2">
              {takip.alarmlar?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">GSM</span>
            </div>
            <p className="text-xl font-bold mt-2 font-mono">
              {takip.gsm.numara}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Müşteri Bilgileri */}
        {takip.gsm.musteri && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
                  {takip.gsm.musteri.fotograf ? (
                    <img
                      src={takip.gsm.musteri.fotograf}
                      alt={`${takip.gsm.musteri.ad} ${takip.gsm.musteri.soyad}`}
                      className="h-16 w-16 object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {takip.gsm.musteri.ad} {takip.gsm.musteri.soyad}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {takip.gsm.numara}
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto mt-1">
                    <Link href={`/musteriler/${takip.gsm.musteri.id}`}>
                      Müşteri Detayına Git →
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Kayıt Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Oluşturulma
                </p>
                <p className="mt-1">{formatDateTime(takip.createdAt)}</p>
                {takip.createdUser && (
                  <p className="text-sm text-muted-foreground">
                    {takip.createdUser.ad} {takip.createdUser.soyad}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Son Güncelleme
                </p>
                <p className="mt-1">{formatDateTime(takip.updatedAt)}</p>
                {takip.updatedUser && (
                  <p className="text-sm text-muted-foreground">
                    {takip.updatedUser.ad} {takip.updatedUser.soyad}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alarmlar */}
      {takip.alarmlar && takip.alarmlar.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alarmlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {takip.alarmlar.map((alarm) => (
                <li
                  key={alarm.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alarm.tetiklendi ? "secondary" : "default"}>
                        {alarm.tip}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatDate(alarm.alarmTarihi)}
                      </span>
                      {alarm.tetiklendi && (
                        <Badge variant="outline">Tetiklendi</Badge>
                      )}
                    </div>
                    {alarm.mesaj && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {alarm.mesaj}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <TakipFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialData={{
          id: takip.id,
          gsmId: takip.gsmId,
          baslamaTarihi: takip.baslamaTarihi,
          bitisTarihi: takip.bitisTarihi,
          durum: takip.durum as TakipDurum,
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Takibi Sil"
        description="Bu takibi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bağlı alarmlar da silinecektir."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteTakip.isPending}
      />
    </div>
  )
}
