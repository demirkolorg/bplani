"use client"

import * as React from "react"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import { useLocale } from "@/components/providers/locale-provider"
import { useTabs } from "@/components/providers/tab-provider"
import {
  Phone,
  User,
  MapPin,
  Briefcase,
  ArrowLeft,
  Calendar,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  History,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { format, differenceInDays } from "date-fns"
import { tr } from "date-fns/locale"

interface Gsm {
  id: string
  numara: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
  kisi: {
    id: string
    ad: string
    soyad: string
    tc: string | null
    tt: boolean
    pio: boolean
    asli: boolean
    faaliyetAlanlari: Array<{
      faaliyetAlani: {
        id: string
        ad: string
      }
    }>
    adresler: Array<{
      id: string
      mahalle: {
        ad: string
        ilce: {
          ad: string
          il: {
            ad: string
          }
        }
      }
    }>
  }
  takipler: Array<{
    id: string
    durum: string
    baslamaTarihi: Date
    bitisTarihi: Date | null
    aciklama: string | null
    createdAt: Date
    createdUser: {
      id: string
      ad: string
      soyad: string
    } | null
    updatedUser: {
      id: string
      ad: string
      soyad: string
    } | null
  }>
  createdUser: {
    id: string
    ad: string
    soyad: string
  } | null
  updatedUser: {
    id: string
    ad: string
    soyad: string
  } | null
}

export default function GsmDetayPage() {
  const params = useTabParams()
  const { t } = useLocale()
  const { openTab } = useTabs()
  const gsmId = params?.id as string

  const [gsm, setGsm] = React.useState<Gsm | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  useTabTitle(gsm?.numara || "GSM Detayı")

  React.useEffect(() => {
    if (!gsmId) {
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/gsmler/${gsmId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Veriler getirilemedi")
        }

        const data = await response.json()
        setGsm(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gsmId])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !gsm) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive font-medium">
              {error || "GSM bulunamadı"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => openTab("/numaralar")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.common.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Statistics
  const activeTakip = gsm.takipler.find((t) =>
    t.durum === "UZATILACAK" || t.durum === "DEVAM_EDECEK"
  )
  const pastTakipler = gsm.takipler.filter((t) =>
    t.durum !== "UZATILACAK" && t.durum !== "DEVAM_EDECEK"
  )
  const completedTakipler = gsm.takipler.filter((t) => t.durum === "TAMAMLANDI").length
  const cancelledTakipler = gsm.takipler.filter((t) => t.durum === "IPTAL").length

  // Kalan gün hesaplama
  const kalanGun = activeTakip && activeTakip.bitisTarihi
    ? differenceInDays(new Date(activeTakip.bitisTarihi), new Date())
    : 0
  const isExpiringSoon = kalanGun > 0 && kalanGun <= 7
  const isExpired = kalanGun < 0

  const adres = gsm.kisi.adresler[0]
  const fullAddress = adres
    ? `${adres.mahalle.ad}, ${adres.mahalle.ilce.ad}, ${adres.mahalle.ilce.il.ad}`
    : null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openTab("/numaralar")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-3xl font-bold">{gsm.numara}</h1>
                {gsm.isPrimary && (
                  <Badge variant="default">{t.common.primary}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kişi Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.kisiler.personalInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ad Soyad</p>
              <Button
                variant="link"
                className="h-auto p-0 text-lg font-semibold"
                onClick={() => openTab(`/kisiler/${gsm.kisi.id}`)}
              >
                {gsm.kisi.ad} {gsm.kisi.soyad}
              </Button>
            </div>
            <div className="flex gap-2">
              {gsm.kisi.tt && (
                <Badge variant="default">{t.kisiler.tipMusteri}</Badge>
              )}
              {!gsm.kisi.tt && (
                <Badge variant="secondary">{t.kisiler.tipAday}</Badge>
              )}
              {gsm.kisi.pio && (
                <Badge variant="outline">PIO</Badge>
              )}
              {gsm.kisi.asli && (
                <Badge variant="outline">Asli</Badge>
              )}
            </div>
          </div>

          {gsm.kisi.tc && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">TC Kimlik No</p>
              <p className="font-mono">{gsm.kisi.tc}</p>
            </div>
          )}

          {fullAddress && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Adres
              </p>
              <p className="text-sm">{fullAddress}</p>
            </div>
          )}

          {gsm.kisi.faaliyetAlanlari.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                Faaliyet Alanları
              </p>
              <div className="flex flex-wrap gap-2">
                {gsm.kisi.faaliyetAlanlari.map((fa) => (
                  <Badge
                    key={fa.faaliyetAlani.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => openTab(`/tanimlamalar/faaliyet-alanlari/${fa.faaliyetAlani.id}`)}
                  >
                    {fa.faaliyetAlani.ad}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Karar İstatistikleri */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Toplam */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-blue-50/80 dark:bg-blue-950/20">
          <Calendar className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-blue-500 dark:text-blue-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-blue-500 dark:text-blue-400">
              {gsm.takipler.length.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">{t.common.total}</p>
          </div>
        </div>

        {/* Aktif */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-purple-50/80 dark:bg-purple-950/20">
          <Clock className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-purple-500 dark:text-purple-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-purple-500 dark:text-purple-400">
              {(activeTakip ? 1 : 0).toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">Aktif</p>
          </div>
        </div>

        {/* Tamamlanan */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-green-50/80 dark:bg-green-950/20">
          <CheckCircle2 className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-green-500 dark:text-green-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-green-500 dark:text-green-400">
              {completedTakipler.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">Tamamlanan</p>
          </div>
        </div>

        {/* İptal */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-red-50/80 dark:bg-red-950/20">
          <XCircle className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-red-500 dark:text-red-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-red-500 dark:text-red-400">
              {cancelledTakipler.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">İptal</p>
          </div>
        </div>
      </div>

      {/* Aktif Karar Kaydı */}
      {activeTakip && (
        <Card className={`border-2 ${
          isExpired ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
          isExpiringSoon ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
          'border-green-500 bg-green-50 dark:bg-green-950/20'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${
                  isExpired ? 'text-red-600' :
                  isExpiringSoon ? 'text-amber-600' :
                  'text-green-600'
                }`} />
                {t.takipler.activeTakip}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    isExpired ? 'text-red-600' :
                    isExpiringSoon ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {Math.abs(kalanGun)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isExpired ? t.takipler.daysPassed.replace('{days}', '') : t.takipler.daysLeft.replace('{days}', '')}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={
                  activeTakip.durum === "UZATILACAK" ? "default" : "secondary"
                }>
                  {t.enums.takipDurumu[activeTakip.durum as keyof typeof t.enums.takipDurumu] || activeTakip.durum}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t.takipler.expired}
                  </Badge>
                )}
                {isExpiringSoon && (
                  <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400">
                    <Clock className="h-3 w-3" />
                    {t.takipler.daysLeft.replace('{days}', String(kalanGun))}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{t.takipler.startDate}</span>
                  </div>
                  <div className="font-semibold">
                    {format(new Date(activeTakip.baslamaTarihi), "d MMMM yyyy", { locale: tr })}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{t.takipler.endDate}</span>
                  </div>
                  <div className="font-semibold">
                    {activeTakip.bitisTarihi ? format(new Date(activeTakip.bitisTarihi), "d MMMM yyyy", { locale: tr }) : "-"}
                  </div>
                </div>
              </div>

              {activeTakip.aciklama && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t.common.description}</p>
                  <p className="text-sm">{activeTakip.aciklama}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => openTab(`/takipler/${gsmId}`)}
              >
                {t.takipler.takipDetails}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geçmiş Karar Kayıtları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Geçmiş Kayıtlar
          </CardTitle>
          <CardDescription>
            Bu GSM için geçmişte oluşturulmuş karar kayıtları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastTakipler.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geçmiş karar kaydı bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastTakipler.map((takip) => (
                <Card key={takip.id} className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openTab(`/takipler/${gsmId}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              takip.durum === "TAMAMLANDI"
                                ? "default"
                                : takip.durum === "IPTAL"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {t.enums.takipDurumu[takip.durum as keyof typeof t.enums.takipDurumu] || takip.durum}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(takip.baslamaTarihi), "d MMM yyyy", { locale: tr })} - {takip.bitisTarihi ? format(new Date(takip.bitisTarihi), "d MMM yyyy", { locale: tr }) : "Devam ediyor"}
                          </span>
                        </div>
                        {takip.aciklama && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{takip.aciklama}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {takip.createdUser && (
                            <span className="flex items-center gap-1">
                              <UserCog className="h-3 w-3" />
                              {takip.createdUser.ad} {takip.createdUser.soyad}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sistem Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
              <p className="text-sm font-mono">{format(new Date(gsm.createdAt), "d MMM yyyy HH:mm", { locale: tr })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Son Güncelleme</p>
              <p className="text-sm font-mono">{format(new Date(gsm.updatedAt), "d MMM yyyy HH:mm", { locale: tr })}</p>
            </div>
            {gsm.createdUser && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Oluşturan</p>
                <p className="text-sm">{gsm.createdUser.ad} {gsm.createdUser.soyad}</p>
              </div>
            )}
            {gsm.updatedUser && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Son Güncelleyen</p>
                <p className="text-sm">{gsm.updatedUser.ad} {gsm.updatedUser.soyad}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
