"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import { useLocale } from "@/components/providers/locale-provider"
import Link from "next/link"
import {
  Pencil,
  Phone,
  User,
  Calendar,
  Bell,
  Clock,
  Plus,
  UserCog,
} from "lucide-react"

import { useTakiplerByGsm } from "@/hooks/use-takip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TakipFormModal } from "@/components/takipler/takip-form-modal"
import { takipDurumLabels, type TakipDurum } from "@/lib/validations"
import { interpolate } from "@/locales"

// Durum badge variant mapping
const durumVariants: Record<TakipDurum, "default" | "secondary" | "destructive" | "outline"> = {
  UZATILACAK: "default",
  DEVAM_EDECEK: "secondary",
  SONLANDIRILACAK: "destructive",
  UZATILDI: "outline",
}

export default function TakipDetayPage() {
  const params = useTabParams<{ id: string }>()
  const router = useRouter()
  const { t } = useLocale()
  const gsmId = params.id

  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showAddModal, setShowAddModal] = React.useState(false)

  const { data: response, isLoading, error } = useTakiplerByGsm(gsmId)

  // Aktif ve geçmiş takipleri ayır
  const takipler = response?.data || []
  const activeTakip = takipler.find((t) => t.isActive)
  const pastTakipler = takipler
    .filter((t) => !t.isActive)
    .sort((a, b) => new Date(b.baslamaTarihi).getTime() - new Date(a.baslamaTarihi).getTime())

  // GSM ve kişi bilgilerini al (ilk takipten)
  const gsm = takipler[0]?.gsm
  const kisi = gsm?.kisi

  // Tab title'ı dinamik güncelle
  const tabTitle = gsm
    ? `Takip - ${kisi ? `${kisi.ad} ${kisi.soyad}` : gsm.numara}`
    : undefined
  useTabTitle(tabTitle)

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

  if (error || !gsm) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : t.takipler.gsmNotFound || "GSM bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/takipler">{t.takipler.backToTakipler || "Takiplere Dön"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Aktif takip için kalan gün hesapla
  let kalanGun: number | null = null
  let isExpired = false
  let isExpiringSoon = false
  if (activeTakip) {
    const bitisTarihi = new Date(activeTakip.bitisTarihi)
    const now = new Date()
    kalanGun = Math.ceil((bitisTarihi.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    isExpired = kalanGun <= 0
    isExpiringSoon = kalanGun <= 7 && kalanGun > 0
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header: GSM ve Kişi Bilgileri */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {kisi && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
              {kisi.fotograf ? (
                <img
                  src={kisi.fotograf}
                  alt={`${kisi.ad} ${kisi.soyad}`}
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {kisi ? `${kisi.ad} ${kisi.soyad}` : gsm.numara}
              </h1>
              {activeTakip && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {t.takipler.activeTakip || "Aktif"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-mono">{gsm.numara}</span>
            </div>
            {kisi && (
              <Button asChild variant="link" className="p-0 h-auto mt-1">
                <Link href={`/kisiler/${kisi.id}`}>
                  {t.takipler.goToPersonDetail || "Kişi Detayına Git"} →
                </Link>
              </Button>
            )}
          </div>
        </div>

        {!activeTakip && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.takipler.addNewTakip || "Yeni Takip Ekle"}
          </Button>
        )}
      </div>

      {/* Aktif Takip Kartı */}
      {activeTakip ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.takipler.activeTakip || "Aktif Takip"}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t.common.edit}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {/* Kalan Gün - Belirgin Gösterim */}
              <div className="col-span-full md:col-span-1">
                <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 h-full"
                  style={{
                    borderColor: isExpired ? "rgb(239, 68, 68)" : isExpiringSoon ? "rgb(249, 115, 22)" : "rgb(34, 197, 94)",
                    backgroundColor: isExpired ? "rgb(254, 242, 242)" : isExpiringSoon ? "rgb(255, 247, 237)" : "rgb(240, 253, 244)"
                  }}
                >
                  <Clock className={`h-8 w-8 mb-2 ${isExpired ? "text-red-500" : isExpiringSoon ? "text-orange-500" : "text-green-600"}`} />
                  <span className="text-sm font-medium text-muted-foreground mb-1">
                    {t.takipler.remainingDays}
                  </span>
                  <p className={`text-4xl font-bold ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-green-700"}`}>
                    {isExpired ? Math.abs(kalanGun || 0) : kalanGun}
                  </p>
                  <span className={`text-xs font-medium mt-1 ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-green-700"}`}>
                    {isExpired ? t.takipler.expired : t.common.day}
                  </span>
                </div>
              </div>

              {/* Diğer Bilgiler */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.takipler.startDate}
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {formatDate(activeTakip.baslamaTarihi)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.takipler.endDate}
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isExpired ? "text-destructive" : isExpiringSoon ? "text-orange-500" : ""}`}>
                  {formatDate(activeTakip.bitisTarihi)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.takipler.durum}
                  </span>
                </div>
                <Badge variant={durumVariants[activeTakip.durum as TakipDurum]}>
                  {takipDurumLabels[activeTakip.durum as TakipDurum]}
                </Badge>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.takipler.alarm}
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {activeTakip._count?.alarmlar || 0}
                </p>
              </div>
            </div>

            {/* Sistem Bilgileri */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-3">Sistem Bilgileri</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Oluşturulma Tarihi</p>
                  <p className="font-medium">{formatDateTime(activeTakip.createdAt)}</p>
                </div>
                {activeTakip.createdUser && (
                  <div>
                    <p className="text-muted-foreground mb-1">Oluşturan</p>
                    <div className="flex items-center gap-1">
                      <UserCog className="h-3 w-3 text-muted-foreground" />
                      <p className="font-medium">{activeTakip.createdUser.ad} {activeTakip.createdUser.soyad}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground mb-1">Son Güncelleme</p>
                  <p className="font-medium">{formatDateTime(activeTakip.updatedAt)}</p>
                </div>
                {activeTakip.updatedUser && (
                  <div>
                    <p className="text-muted-foreground mb-1">Son Güncelleyen</p>
                    <div className="flex items-center gap-1">
                      <UserCog className="h-3 w-3 text-muted-foreground" />
                      <p className="font-medium">{activeTakip.updatedUser.ad} {activeTakip.updatedUser.soyad}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alarmlar */}
            {activeTakip.alarmlar && activeTakip.alarmlar.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3">{t.takipler.alarmList || "Alarmlar"}</h3>
                <ul className="space-y-2">
                  {activeTakip.alarmlar.map((alarm) => (
                    <li
                      key={alarm.id}
                      className="flex items-start justify-between rounded-md border p-3 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alarm.durum === "TETIKLENDI" ? "secondary" : "default"} className="text-xs">
                            {alarm.tip}
                          </Badge>
                          <span className="text-sm">
                            {formatDate(alarm.tetikTarihi)}
                          </span>
                          {alarm.durum === "TETIKLENDI" && (
                            <Badge variant="outline" className="text-xs">
                              {t.takipler.triggered || "Tetiklendi"}
                            </Badge>
                          )}
                        </div>
                        {alarm.mesaj && (
                          <p className="mt-1 text-muted-foreground">
                            {alarm.mesaj}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t.takipler.noActiveTakip || "Aktif takip bulunmuyor"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t.takipler.noActiveTakipDescription || "Bu GSM için aktif bir takip kaydı bulunmamaktadır."}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t.takipler.addNewTakip || "Yeni Takip Ekle"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Geçmiş Takipler */}
      {pastTakipler.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t.takipler.takipHistory || "Takip Geçmişi"} ({pastTakipler.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      {t.takipler.startDate}
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      {t.takipler.endDate}
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      {t.takipler.duration || "Süre"}
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      {t.takipler.durum}
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Oluşturulma
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Oluşturan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pastTakipler.map((takip) => {
                    const start = new Date(takip.baslamaTarihi)
                    const end = new Date(takip.bitisTarihi)
                    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <tr key={takip.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm">{formatDate(takip.baslamaTarihi)}</td>
                        <td className="p-3 text-sm">{formatDate(takip.bitisTarihi)}</td>
                        <td className="p-3 text-sm">
                          {interpolate(t.takipler.daysCount || "{days} gün", { days: durationDays })}
                        </td>
                        <td className="p-3 text-sm">
                          <Badge variant={durumVariants[takip.durum as TakipDurum]}>
                            {takipDurumLabels[takip.durum as TakipDurum]}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDateTime(takip.createdAt)}
                        </td>
                        <td className="p-3 text-sm">
                          {takip.createdUser ? (
                            <div className="flex items-center gap-1">
                              <UserCog className="h-3 w-3 text-muted-foreground" />
                              <span>{takip.createdUser.ad} {takip.createdUser.soyad}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {activeTakip && (
        <TakipFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          initialData={{
            id: activeTakip.id,
            gsmId: activeTakip.gsmId,
            baslamaTarihi: activeTakip.baslamaTarihi,
            bitisTarihi: activeTakip.bitisTarihi,
            durum: activeTakip.durum as TakipDurum,
          }}
        />
      )}

      {/* Add Modal */}
      <TakipFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        initialData={{
          gsmId: gsmId,
        }}
      />
    </div>
  )
}
