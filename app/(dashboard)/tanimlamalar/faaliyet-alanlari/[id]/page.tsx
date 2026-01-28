"use client"

import * as React from "react"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import { useLocale } from "@/components/providers/locale-provider"
import { useTabs } from "@/components/providers/tab-provider"
import {
  Briefcase,
  Users,
  Phone,
  MapPin,
  Car,
  Megaphone,
  Workflow,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/shared/data-table"
import { getKisiColumns } from "@/components/kisiler/musteri-columns"

interface FaaliyetAlani {
  id: string
  ad: string
  parent?: {
    id: string
    ad: string
  } | null
}

interface Kisi {
  id: string
  ad: string
  soyad: string
  tc: string | null
  tt: boolean
  pio: boolean
  asli: boolean
  faaliyet: string | null
  gsmler: Array<{
    id: string
    numara: string
    takipler: Array<{
      id: string
      durum: string
    }>
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
  araclar: Array<{
    arac: {
      id: string
      plaka: string
      model: {
        ad: string
        marka: {
          ad: string
        }
      }
    }
  }>
  faaliyetAlanlari: Array<{
    faaliyetAlani: {
      id: string
      ad: string
    }
  }>
  notlar: Array<{
    id: string
    icerik: string
  }>
  tanitimlar: Array<{
    tanitim: {
      id: string
      baslik: string | null
      tarih: Date
    }
  }>
  operasyonlar: Array<{
    operasyon: {
      id: string
      baslik: string | null
      tarih: Date
    }
  }>
}

export default function FaaliyetAlaniDetayPage() {
  const params = useTabParams()
  const { t } = useLocale()
  const { openTab } = useTabs()
  const faaliyetAlaniId = params?.id as string

  const [faaliyetAlani, setFaaliyetAlani] = React.useState<FaaliyetAlani | null>(null)
  const [kisiler, setKisiler] = React.useState<Kisi[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  useTabTitle(faaliyetAlani?.ad || "Faaliyet Alanı Detayı")

  React.useEffect(() => {
    if (!faaliyetAlaniId) {
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/faaliyet-alanlari/${faaliyetAlaniId}/kisiler`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Veriler getirilemedi")
        }

        const data = await response.json()
        setFaaliyetAlani(data.faaliyetAlani)
        setKisiler(data.kisiler)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [faaliyetAlaniId])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !faaliyetAlani) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive font-medium">
              {error || "Faaliyet alanı bulunamadı"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => openTab("/tanimlamalar")}
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
  const musteriCount = kisiler.filter((k) => k.tt).length
  const adayCount = kisiler.filter((k) => !k.tt).length
  const pioCount = kisiler.filter((k) => k.pio).length
  const asliCount = kisiler.filter((k) => k.asli).length
  const takipliCount = kisiler.filter((k) =>
    k.gsmler.some((g) => g.takipler.length > 0)
  ).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openTab("/tanimlamalar")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-3xl font-bold">{faaliyetAlani.ad}</h1>
              </div>
              {faaliyetAlani.parent && (
                <p className="text-sm text-muted-foreground mt-1">
                  Üst Kategori:
                  <Button
                    variant="link"
                    className="h-auto p-0 ml-1"
                    onClick={() => openTab(`/tanimlamalar/faaliyet-alanlari/${faaliyetAlani.parent!.id}`)}
                  >
                    {faaliyetAlani.parent.ad}
                  </Button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {/* Toplam */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-blue-50/80 dark:bg-blue-950/20">
          <Users className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-blue-500 dark:text-blue-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-blue-500 dark:text-blue-400">
              {kisiler.length.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">{t.common.total}</p>
          </div>
        </div>

        {/* Müşteri */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-green-50/80 dark:bg-green-950/20">
          <Users className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-green-500 dark:text-green-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-green-500 dark:text-green-400">
              {musteriCount.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">{t.kisiler.tipMusteri}</p>
          </div>
        </div>

        {/* Aday */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-amber-50/80 dark:bg-amber-950/20">
          <Users className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-amber-500 dark:text-amber-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-amber-500 dark:text-amber-400">
              {adayCount.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">{t.kisiler.tipAday}</p>
          </div>
        </div>

        {/* PIO */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-purple-50/80 dark:bg-purple-950/20">
          <Briefcase className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-purple-500 dark:text-purple-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-purple-500 dark:text-purple-400">
              {pioCount.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">PIO</p>
          </div>
        </div>

        {/* Takipli */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-red-50/80 dark:bg-red-950/20">
          <Phone className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-red-500 dark:text-red-400" />
          <div className="relative z-10">
            <p className="text-3xl font-bold mb-1 text-red-500 dark:text-red-400">
              {takipliCount.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm font-medium text-foreground">Takipli</p>
          </div>
        </div>
      </div>

      {/* Kisiler Table */}
      <Card>
        <CardHeader>
          <CardTitle>İlişkili Kişiler</CardTitle>
          <CardDescription>
            Bu faaliyet alanı ile ilişkili kişiler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kisiler.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.common.noData}</p>
            </div>
          ) : (
            <DataTable
              columns={getKisiColumns(t)}
              data={kisiler as any}
              searchPlaceholder={t.kisiler.searchPlaceholder}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
