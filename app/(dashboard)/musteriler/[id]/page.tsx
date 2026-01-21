"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, User, Phone, MapPin, FileText } from "lucide-react"

import { useMusteri } from "@/hooks/use-musteriler"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { MusteriFormModal } from "@/components/musteriler/musteri-form-modal"
import { MusteriGsmList } from "@/components/musteriler/musteri-gsm-list"
import { MusteriAdresList } from "@/components/musteriler/musteri-adres-list"
import { MusteriNotList } from "@/components/musteriler/musteri-not-list"

export default function MusteriDetayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [showEditModal, setShowEditModal] = React.useState(false)

  const { data: musteri, isLoading, error } = useMusteri(id)

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

  if (error || !musteri) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Müşteri bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/musteriler">Müşterilere Dön</Link>
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

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/musteriler">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
            {musteri.fotograf ? (
              <img
                src={musteri.fotograf}
                alt={`${musteri.ad} ${musteri.soyad}`}
                className="h-16 w-16 object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {musteri.ad} {musteri.soyad}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {musteri.tc && (
                <span className="text-sm text-muted-foreground">
                  TC: {musteri.tc}
                </span>
              )}
              {musteri.isArchived && (
                <Badge variant="destructive">Arşivlenmiş</Badge>
              )}
              {musteri.pio && <Badge variant="secondary">PIO</Badge>}
              {musteri.asli && <Badge variant="secondary">Asli</Badge>}
            </div>
          </div>
        </div>

        <Button onClick={() => setShowEditModal(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Düzenle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">GSM</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {musteri.gsmler?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Adres</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {musteri.adresler?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Not</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {musteri.notlar?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Kayıt Tarihi</div>
            <p className="text-lg font-medium mt-1">
              {new Date(musteri.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="genel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="genel">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="gsm">
            GSM'ler ({musteri.gsmler?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="adresler">
            Adresler ({musteri.adresler?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notlar">
            Notlar ({musteri.notlar?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Genel Bilgiler */}
        <TabsContent value="genel">
          <Card>
            <CardHeader>
              <CardTitle>Genel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ad Soyad
                  </p>
                  <p className="mt-1">
                    {musteri.ad} {musteri.soyad}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    TC Kimlik No
                  </p>
                  <p className="mt-1 font-mono">{musteri.tc || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    PIO (Potansiyel İş Ortağı)
                  </p>
                  <p className="mt-1">{musteri.pio ? "Evet" : "Hayır"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Asli Müşteri
                  </p>
                  <p className="mt-1">{musteri.asli ? "Evet" : "Hayır"}</p>
                </div>
                {musteri.isArchived && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Durum
                    </p>
                    <p className="mt-1">
                      <Badge variant="destructive">Arşivlenmiş</Badge>
                    </p>
                  </div>
                )}
              </div>

              {musteri.faaliyet && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Faaliyet
                    </p>
                    <div
                      className="mt-2 prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: musteri.faaliyet }}
                    />
                  </div>
                </>
              )}

              <Separator />

              {/* Log Bilgileri */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Oluşturulma
                  </p>
                  <p className="mt-1">{formatDate(musteri.createdAt)}</p>
                  {musteri.createdUser && (
                    <p className="text-sm text-muted-foreground">
                      {musteri.createdUser.ad} {musteri.createdUser.soyad}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </p>
                  <p className="mt-1">{formatDate(musteri.updatedAt)}</p>
                  {musteri.updatedUser && (
                    <p className="text-sm text-muted-foreground">
                      {musteri.updatedUser.ad} {musteri.updatedUser.soyad}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GSM'ler */}
        <TabsContent value="gsm">
          <MusteriGsmList musteriId={id} />
        </TabsContent>

        {/* Adresler */}
        <TabsContent value="adresler">
          <MusteriAdresList musteriId={id} />
        </TabsContent>

        {/* Notlar */}
        <TabsContent value="notlar">
          <MusteriNotList musteriId={id} />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <MusteriFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialData={{
          id: musteri.id,
          tc: musteri.tc,
          ad: musteri.ad,
          soyad: musteri.soyad,
          faaliyet: musteri.faaliyet,
          pio: musteri.pio,
          asli: musteri.asli,
          fotograf: musteri.fotograf,
        }}
      />
    </div>
  )
}
