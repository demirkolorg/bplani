"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, User, Phone, MapPin, FileText, Info } from "lucide-react"

import { useMusteri } from "@/hooks/use-musteriler"
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
                <span className="text-sm text-muted-foreground font-mono">
                  TC: {musteri.tc}
                </span>
              )}
              {musteri.isArchived && (
                <Badge variant="destructive">Arşivlenmiş</Badge>
              )}
              {musteri.pio && <Badge variant="secondary">PIO</Badge>}
              {musteri.asli && <Badge variant="secondary">Asli</Badge>}
              {musteri.faaliyet && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-300 max-w-xs truncate"
                  title={musteri.faaliyet.replace(/<[^>]*>/g, '')}
                >
                  {musteri.faaliyet.replace(/<[^>]*>/g, '').substring(0, 30)}{musteri.faaliyet.replace(/<[^>]*>/g, '').length > 30 ? '...' : ''}
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
                  Müşteri kaydı ve güncellemeler hakkında teknik bilgiler
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                <Separator />
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
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-muted-foreground">GSM:</span>
          <span className="font-semibold">{musteri.gsmler?.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">Adres:</span>
          <span className="font-semibold">{musteri.adresler?.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-muted-foreground">Not:</span>
          <span className="font-semibold">{musteri.notlar?.length || 0}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Üye:</span>
          <span>{new Date(musteri.createdAt).toLocaleDateString("tr-TR")}</span>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Sol Sütun - GSM ve Takipler */}
        <div className="space-y-6">
          <MusteriGsmList musteriId={id} />
        </div>

        {/* Orta Sütun - Adresler */}
        <div className="space-y-6">
          <MusteriAdresList musteriId={id} />
        </div>

        {/* Sağ Sütun - Notlar */}
        <div className="space-y-6">
          <MusteriNotList musteriId={id} />
        </div>
      </div>

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
