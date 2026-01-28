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
      {/* Header: GSM Numarası Odaklı */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center">
            <Phone className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono">{gsm.numara}</h1>
              {activeTakip && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {t.takipler.activeTakip || "Aktif"}
                </Badge>
              )}
            </div>
            {kisi && (
              <div className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  İlişkili Kişi:
                </span>
                <Link
                  href={`/kisiler/${kisi.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {kisi.ad} {kisi.soyad}
                </Link>
              </div>
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
            {/* Stats Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-6">
              {/* Kalan Gün */}
              <div className={`relative overflow-hidden rounded-2xl p-4 ${
                isExpired
                  ? "bg-red-50/80 dark:bg-red-950/20"
                  : isExpiringSoon
                  ? "bg-orange-50/80 dark:bg-orange-950/20"
                  : "bg-green-50/80 dark:bg-green-950/20"
              }`}>
                <Clock className={`absolute -right-2 -top-2 h-20 w-20 opacity-20 ${
                  isExpired
                    ? "text-red-500 dark:text-red-400"
                    : isExpiringSoon
                    ? "text-orange-500 dark:text-orange-400"
                    : "text-green-500 dark:text-green-400"
                }`} />
                <div className="relative z-10">
                  <p className={`text-3xl font-bold mb-1 ${
                    isExpired
                      ? "text-red-500 dark:text-red-400"
                      : isExpiringSoon
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-green-500 dark:text-green-400"
                  }`}>
                    {isExpired ? Math.abs(kalanGun || 0) : kalanGun}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {t.takipler.remainingDays}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isExpired ? t.takipler.expired : t.common.day}
                  </p>
                </div>
              </div>

              {/* Başlangıç Tarihi */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-blue-50/80 dark:bg-blue-950/20">
                <Calendar className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-blue-500 dark:text-blue-400" />
                <div className="relative z-10">
                  <p className="text-xl font-bold mb-1 text-blue-500 dark:text-blue-400">
                    {new Date(activeTakip.baslamaTarihi).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                  </p>
                  <p className="text-sm font-medium text-foreground">{t.takipler.startDate}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activeTakip.baslamaTarihi).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Bitiş Tarihi */}
              <div className={`relative overflow-hidden rounded-2xl p-4 ${
                isExpired
                  ? "bg-red-50/80 dark:bg-red-950/20"
                  : isExpiringSoon
                  ? "bg-orange-50/80 dark:bg-orange-950/20"
                  : "bg-purple-50/80 dark:bg-purple-950/20"
              }`}>
                <Calendar className={`absolute -right-2 -top-2 h-20 w-20 opacity-20 ${
                  isExpired
                    ? "text-red-500 dark:text-red-400"
                    : isExpiringSoon
                    ? "text-orange-500 dark:text-orange-400"
                    : "text-purple-500 dark:text-purple-400"
                }`} />
                <div className="relative z-10">
                  <p className={`text-xl font-bold mb-1 ${
                    isExpired
                      ? "text-red-500 dark:text-red-400"
                      : isExpiringSoon
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-purple-500 dark:text-purple-400"
                  }`}>
                    {new Date(activeTakip.bitisTarihi).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                  </p>
                  <p className="text-sm font-medium text-foreground">{t.takipler.endDate}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activeTakip.bitisTarihi).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Durum */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-indigo-50/80 dark:bg-indigo-950/20">
                <div className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-6xl font-bold">
                  {activeTakip.durum === 'UZATILACAK' ? '⟳' : activeTakip.durum === 'DEVAM_EDECEK' ? '→' : activeTakip.durum === 'SONLANDIRILACAK' ? '×' : '✓'}
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-foreground mb-2">{t.takipler.durum}</p>
                  <Badge variant={durumVariants[activeTakip.durum as TakipDurum]} className="text-xs">
                    {takipDurumLabels[activeTakip.durum as TakipDurum]}
                  </Badge>
                </div>
              </div>

              {/* Alarmlar */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-amber-50/80 dark:bg-amber-950/20">
                <Bell className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-amber-500 dark:text-amber-400" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold mb-1 text-amber-500 dark:text-amber-400">
                    {(activeTakip._count?.alarmlar || 0).toLocaleString("tr-TR")}
                  </p>
                  <p className="text-sm font-medium text-foreground">{t.takipler.alarm}</p>
                </div>
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
