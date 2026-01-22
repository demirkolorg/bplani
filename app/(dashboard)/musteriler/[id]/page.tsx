"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, User, Phone, MapPin, FileText, Info } from "lucide-react"

import { useKisi } from "@/hooks/use-kisiler"
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
import { KisiFormModal } from "@/components/musteriler/musteri-form-modal"
import { KisiGsmList } from "@/components/musteriler/musteri-gsm-list"
import { KisiAdresList } from "@/components/musteriler/musteri-adres-list"
import { KisiNotList } from "@/components/musteriler/musteri-not-list"

export default function KisiDetayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [showEditModal, setShowEditModal] = React.useState(false)

  const { data: kisi, isLoading, error } = useKisi(id)

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

  if (error || !kisi) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Kişi bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/musteriler">Kişilere Dön</Link>
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
      {/* Clean Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/musteriler">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {/* Avatar */}
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

          <div>
            <h1 className="text-2xl font-bold">
              {kisi.ad} {kisi.soyad}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {kisi.tc && (
                <span className="text-sm text-muted-foreground font-mono">
                  TC: {kisi.tc}
                </span>
              )}
              {kisi.isArchived && (
                <Badge variant="destructive">Arşivlenmiş</Badge>
              )}
              {kisi.faaliyet && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700 max-w-xs truncate"
                  title={kisi.faaliyet.replace(/<[^>]*>/g, '')}
                >
                  {kisi.faaliyet.replace(/<[^>]*>/g, '').substring(0, 30)}{kisi.faaliyet.replace(/<[^>]*>/g, '').length > 30 ? '...' : ''}
                </Badge>
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
                  Kişi kaydı ve güncellemeler hakkında teknik bilgiler
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Oluşturulma
                  </p>
                  <p className="mt-1">{formatDate(kisi.createdAt)}</p>
                  {kisi.createdUser && (
                    <p className="text-sm text-muted-foreground">
                      {kisi.createdUser.ad} {kisi.createdUser.soyad}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </p>
                  <p className="mt-1">{formatDate(kisi.updatedAt)}</p>
                  {kisi.updatedUser && (
                    <p className="text-sm text-muted-foreground">
                      {kisi.updatedUser.ad} {kisi.updatedUser.soyad}
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

      {/* Compact Stats */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-muted/50 rounded-lg">
        {/* Tip */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-muted-foreground">Tip:</span>
          <Badge
            variant="outline"
            className={
              kisi.tip === "MUSTERI"
                ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
            }
          >
            {kisi.tip === "MUSTERI" ? "Müşteri" : "Aday"}
          </Badge>
        </div>
        {/* PIO */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">PIO:</span>
          <Badge variant={kisi.pio ? "default" : "secondary"}>
            {kisi.pio ? "Evet" : "Hayır"}
          </Badge>
        </div>
        {/* Asli */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Asli:</span>
          <Badge variant={kisi.asli ? "default" : "secondary"}>
            {kisi.asli ? "Evet" : "Hayır"}
          </Badge>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* GSM */}
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-muted-foreground">GSM:</span>
          <span className="font-semibold">{kisi.gsmler?.length || 0}</span>
        </div>
        {/* Adres */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">Adres:</span>
          <span className="font-semibold">{kisi.adresler?.length || 0}</span>
        </div>
        {/* Not */}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-muted-foreground">Not:</span>
          <span className="font-semibold">{kisi.notlar?.length || 0}</span>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Sol Sütun - GSM ve Takipler */}
        <div className="space-y-6">
          <KisiGsmList kisiId={id} />
        </div>

        {/* Orta Sütun - Adresler */}
        <div className="space-y-6">
          <KisiAdresList kisiId={id} />
        </div>

        {/* Sağ Sütun - Notlar */}
        <div className="space-y-6">
          <KisiNotList kisiId={id} />
        </div>
      </div>

      {/* Edit Modal */}
      <KisiFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialData={{
          id: kisi.id,
          tc: kisi.tc,
          ad: kisi.ad,
          soyad: kisi.soyad,
          faaliyet: kisi.faaliyet,
          pio: kisi.pio,
          asli: kisi.asli,
          fotograf: kisi.fotograf,
        }}
      />
    </div>
  )
}
