"use client"

import * as React from "react"
import Link from "next/link"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import {
  Pencil,
  User,
  Phone,
  MapPin,
  FileText,
  Info,
  Megaphone,
  Car,
  Workflow,
  LayoutGrid,
  List,
  Minimize2,
  PanelTop
} from "lucide-react"

import { useKisi } from "@/hooks/use-kisiler"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { KisiFormModal } from "@/components/kisiler/musteri-form-modal"
import { KisiGsmList } from "@/components/kisiler/musteri-gsm-list"
import { KisiAdresList } from "@/components/kisiler/musteri-adres-list"
import { KisiNotList } from "@/components/kisiler/musteri-not-list"
import { KisiTanitimList } from "@/components/kisiler/kisi-tanitim-list"
import { KisiOperasyonList } from "@/components/kisiler/kisi-operasyon-list"
import { KisiAracList } from "@/components/kisiler/kisi-arac-list"
import { useTanitimlarByKisi } from "@/hooks/use-tanitimlar"
import { useOperasyonlarByKisi } from "@/hooks/use-operasyonlar"
import { useAraclarByKisi } from "@/hooks/use-araclar-vehicles"

type ViewMode = "kart" | "liste" | "compact" | "tab"

export default function KisiDetayPage() {
  const params = useTabParams<{ id: string }>()
  const id = params.id

  const [showEditModal, setShowEditModal] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>("kart")

  const { data: kisi, isLoading, error } = useKisi(id)

  // Tab title'ı dinamik güncelle
  useTabTitle(kisi ? `${kisi.ad} ${kisi.soyad}` : undefined)
  const { data: tanitimlar } = useTanitimlarByKisi(id)
  const { data: operasyonlar } = useOperasyonlarByKisi(id)
  const { data: araclarData } = useAraclarByKisi(id)

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
              <Link href="/kisiler">Kişilere Dön</Link>
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

  // Kart Görünümü - Mevcut 3 sütunlu layout
  const KartView = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6">
        <KisiGsmList kisiId={id} />
        <KisiAdresList kisiId={id} />
        <KisiAracList kisiId={id} />
      </div>
      <div className="space-y-6">
        <KisiTanitimList kisiId={id} />
        <KisiOperasyonList kisiId={id} />
      </div>
      <div className="space-y-6">
        <KisiNotList kisiId={id} />
      </div>
    </div>
  )

  // Liste Görünümü - Tek sütun, tüm bileşenler alt alta
  const ListeView = () => (
    <div className="space-y-6 max-w-4xl">
      <KisiGsmList kisiId={id} />
      <KisiAdresList kisiId={id} />
      <KisiAracList kisiId={id} />
      <KisiTanitimList kisiId={id} />
      <KisiOperasyonList kisiId={id} />
      <KisiNotList kisiId={id} />
    </div>
  )

  // Compact Görünümü - 2 sütun, daha sıkışık
  const CompactView = () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <KisiGsmList kisiId={id} />
        <KisiAdresList kisiId={id} />
        <KisiAracList kisiId={id} />
      </div>
      <div className="space-y-4">
        <KisiTanitimList kisiId={id} />
        <KisiOperasyonList kisiId={id} />
        <KisiNotList kisiId={id} />
      </div>
    </div>
  )

  // Tab Görünümü - Dikey tablar solda, içerik sağda
  const TabView = () => (
    <Tabs defaultValue="gsm" className="w-full gap-6" orientation="vertical">
      {/* Sol taraf - Dikey Tab Listesi */}
      <TabsList className="flex flex-col h-fit w-[160px] shrink-0 bg-muted/50 p-2 rounded-lg">
        <TabsTrigger value="gsm" className="w-full justify-start gap-2 px-3 py-2.5">
          <Phone className="h-4 w-4" />
          <span>GSM</span>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5">{kisi.gsmler?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="adres" className="w-full justify-start gap-2 px-3 py-2.5">
          <MapPin className="h-4 w-4" />
          <span>Adres</span>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5">{kisi.adresler?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="arac" className="w-full justify-start gap-2 px-3 py-2.5">
          <Car className="h-4 w-4" />
          <span>Araç</span>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5">{araclarData?.data?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="tanitim" className="w-full justify-start gap-2 px-3 py-2.5">
          <Megaphone className="h-4 w-4" />
          <span>Tanıtım</span>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5">{tanitimlar?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="operasyon" className="w-full justify-start gap-2 px-3 py-2.5">
          <Workflow className="h-4 w-4" />
          <span>Operasyon</span>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5">{operasyonlar?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="not" className="w-full justify-start gap-2 px-3 py-2.5">
          <FileText className="h-4 w-4" />
          <span>Not</span>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5">{kisi.notlar?.length || 0}</Badge>
        </TabsTrigger>
      </TabsList>

      {/* Sağ taraf - İçerik (tam genişlik) */}
      <TabsContent value="gsm" className="mt-0 flex-1 [&>div]:w-full">
        <KisiGsmList kisiId={id} />
      </TabsContent>
      <TabsContent value="adres" className="mt-0 flex-1 [&>div]:w-full">
        <KisiAdresList kisiId={id} />
      </TabsContent>
      <TabsContent value="arac" className="mt-0 flex-1 [&>div]:w-full">
        <KisiAracList kisiId={id} />
      </TabsContent>
      <TabsContent value="tanitim" className="mt-0 flex-1 [&>div]:w-full">
        <KisiTanitimList kisiId={id} />
      </TabsContent>
      <TabsContent value="operasyon" className="mt-0 flex-1 [&>div]:w-full">
        <KisiOperasyonList kisiId={id} />
      </TabsContent>
      <TabsContent value="not" className="mt-0 flex-1 [&>div]:w-full">
        <KisiNotList kisiId={id} />
      </TabsContent>
    </Tabs>
  )

  return (
    <div className="container mx-auto py-6">
      {/* Clean Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
              {kisi.faaliyetAlanlari && kisi.faaliyetAlanlari.length > 0 && (
                kisi.faaliyetAlanlari.map((f) => (
                  <Badge
                    key={f.id}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700"
                  >
                    {f.faaliyetAlani.ad}
                  </Badge>
                ))
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
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 p-4 bg-muted/50 rounded-lg">
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

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

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
        {/* Tanıtım */}
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-muted-foreground">Tanıtım:</span>
          <span className="font-semibold">{tanitimlar?.length || 0}</span>
        </div>
        {/* Operasyon */}
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-violet-600" />
          <span className="text-sm text-muted-foreground">Operasyon:</span>
          <span className="font-semibold">{operasyonlar?.length || 0}</span>
        </div>
        {/* Araç */}
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-indigo-600" />
          <span className="text-sm text-muted-foreground">Araç:</span>
          <span className="font-semibold">{araclarData?.data?.length || 0}</span>
        </div>
        {/* Not */}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-muted-foreground">Not:</span>
          <span className="font-semibold">{kisi.notlar?.length || 0}</span>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground">Görünüm:</span>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
          className="bg-muted p-1 rounded-lg"
        >
          <ToggleGroupItem value="kart" aria-label="Kart görünümü" className="data-[state=on]:bg-background">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kart
          </ToggleGroupItem>
          <ToggleGroupItem value="liste" aria-label="Liste görünümü" className="data-[state=on]:bg-background">
            <List className="h-4 w-4 mr-2" />
            Liste
          </ToggleGroupItem>
          <ToggleGroupItem value="compact" aria-label="Compact görünümü" className="data-[state=on]:bg-background">
            <Minimize2 className="h-4 w-4 mr-2" />
            Compact
          </ToggleGroupItem>
          <ToggleGroupItem value="tab" aria-label="Tab görünümü" className="data-[state=on]:bg-background">
            <PanelTop className="h-4 w-4 mr-2" />
            Tab
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Main Content - View Based */}
      {viewMode === "kart" && <KartView />}
      {viewMode === "liste" && <ListeView />}
      {viewMode === "compact" && <CompactView />}
      {viewMode === "tab" && <TabView />}

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
