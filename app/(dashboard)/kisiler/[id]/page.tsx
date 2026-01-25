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
  Megaphone,
  Car,
  Workflow,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowLeft,
  Clock,
  ArrowUpRight,
} from "lucide-react"

import { useKisi } from "@/hooks/use-kisiler"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { KisiDetayEditModal } from "@/components/kisiler/kisi-detay-edit-modal"
import { KisiFaaliyetEditModal } from "@/components/kisiler/kisi-faaliyet-edit-modal"
import { KisiFotografEditModal } from "@/components/kisiler/kisi-fotograf-edit-modal"
import { KisiGsmList } from "@/components/kisiler/musteri-gsm-list"
import { KisiAdresList } from "@/components/kisiler/musteri-adres-list"
import { KisiNotList } from "@/components/kisiler/musteri-not-list"
import { KisiTanitimList } from "@/components/kisiler/kisi-tanitim-list"
import { KisiOperasyonList } from "@/components/kisiler/kisi-operasyon-list"
import { KisiAracList } from "@/components/kisiler/kisi-arac-list"
import { useTanitimlarByKisi } from "@/hooks/use-tanitimlar"
import { useOperasyonlarByKisi } from "@/hooks/use-operasyonlar"
import { useAraclarByKisi } from "@/hooks/use-araclar-vehicles"

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  onEdit?: () => void
  onAdd?: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  onEdit,
  onAdd,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        {icon}
        <span className="font-medium text-sm">{title}</span>
        {onEdit && (
          <Pencil
            className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer hover:text-primary"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          />
        )}
        {onAdd && (
          <Plus
            className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto cursor-pointer hover:text-primary"
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
          />
        )}
      </button>
      {isOpen && <div className="mt-3 pl-6">{children}</div>}
    </div>
  )
}

// Detail Row Component
interface DetailRowProps {
  label: string
  value: React.ReactNode
  isLink?: boolean
}

function DetailRow({ label, value, isLink }: DetailRowProps) {
  return (
    <div className="flex items-start py-1.5">
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("text-sm", isLink && "text-blue-600 hover:underline cursor-pointer")}>
        {value || "-"}
      </span>
    </div>
  )
}

export default function KisiDetayPage() {
  const params = useTabParams<{ id: string }>()
  const id = params.id

  const [showDetayModal, setShowDetayModal] = React.useState(false)
  const [showFaaliyetModal, setShowFaaliyetModal] = React.useState(false)
  const [showFotografModal, setShowFotografModal] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("genel")

  const { data: kisi, isLoading, error } = useKisi(id)

  // Tab title'ı dinamik güncelle
  useTabTitle(kisi ? `${kisi.ad} ${kisi.soyad}` : undefined)
  const { data: tanitimlar } = useTanitimlarByKisi(id)
  const { data: operasyonlar } = useOperasyonlarByKisi(id)
  const { data: araclarData } = useAraclarByKisi(id)

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-[360px] border-r p-6">
          <Skeleton className="h-8 w-24 mb-8" />
          <Skeleton className="h-24 w-24 rounded-2xl mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !kisi) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Kişi bulunamadı"}
            </p>
            <Button asChild>
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
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get primary GSM
  const primaryGsm = kisi.gsmler?.find((g) => g.isPrimary) || kisi.gsmler?.[0]

  // Get primary address
  const primaryAdres = kisi.adresler?.find((a) => a.isPrimary) || kisi.adresler?.[0]
  const adresText = primaryAdres
    ? `${primaryAdres.mahalle?.ad || ""}, ${primaryAdres.mahalle?.ilce?.ad || ""}, ${primaryAdres.mahalle?.ilce?.il?.ad || ""}`
    : null

  // Recent notes (last 2)
  const recentNotes = kisi.notlar?.slice(0, 2) || []

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <div className="w-[360px] border-r flex flex-col overflow-y-auto">
        <div className="p-6">
          {/* Back Button */}
          <Link
            href="/kisiler"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Kişiler
          </Link>

          {/* Profile Photo */}
          <div className="mb-4 group relative">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 overflow-hidden flex items-center justify-center">
              {kisi.fotograf ? (
                <img
                  src={kisi.fotograf}
                  alt={`${kisi.ad} ${kisi.soyad}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => setShowFotografModal(true)}
              className="absolute inset-0 h-24 w-24 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Pencil className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-semibold mb-1">
            {kisi.ad} {kisi.soyad}
          </h1>

          {/* Archived Badge */}
          {kisi.isArchived && (
            <Badge variant="destructive" className="mb-2">Arşivlenmiş</Badge>
          )}
        </div>

        {/* Sections */}
        <div className="px-6 divide-y">
          {/* Kişi Detayları */}
          <CollapsibleSection
            title="Kişi Detayları"
            onEdit={() => setShowDetayModal(true)}
          >
            <div className="space-y-0.5">
              {kisi.tc && <DetailRow label="TC" value={kisi.tc} />}
              {primaryGsm && (
                <DetailRow
                  label="Telefon"
                  value={primaryGsm.numara}
                  isLink
                />
              )}
              {adresText && (
                <DetailRow label="Adres" value={adresText} />
              )}
              <DetailRow
                label="TT"
                value={
                  <Badge
                    variant="outline"
                    className={
                      kisi.tt
                        ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300"
                        : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                    }
                  >
                    {kisi.tt ? "Müşteri" : "Aday"}
                  </Badge>
                }
              />
              <DetailRow
                label="PIO"
                value={kisi.pio ? "Evet" : "Hayır"}
              />
              <DetailRow
                label="Asli"
                value={kisi.asli ? "Evet" : "Hayır"}
              />
            </div>
          </CollapsibleSection>

          {/* Faaliyet Alanları (Tags) */}
          <CollapsibleSection
            title="Faaliyet Alanları"
            onEdit={() => setShowFaaliyetModal(true)}
          >
            <div className="flex flex-wrap gap-2">
              {kisi.faaliyetAlanlari && kisi.faaliyetAlanlari.length > 0 ? (
                kisi.faaliyetAlanlari.map((f) => (
                  <Badge
                    key={f.id}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                  >
                    {f.faaliyetAlani.ad}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Faaliyet alanı belirlenmemiş
                </span>
              )}
            </div>
          </CollapsibleSection>

          {/* Notlar */}
          <CollapsibleSection
            title="Notlar"
            onAdd={() => setActiveTab("notlar")}
          >
            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map((not) => (
                  <div
                    key={not.id}
                    className="p-3 bg-muted/50 rounded-lg text-sm"
                  >
                    <p className="line-clamp-3">{not.icerik}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {not.createdUser && (
                        <span className="text-blue-600">
                          {not.createdUser.ad} {not.createdUser.soyad}
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatDate(not.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {(kisi.notlar?.length || 0) > 2 && (
                  <button
                    onClick={() => setActiveTab("notlar")}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tümünü gör ({kisi.notlar?.length})
                  </button>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Henüz not eklenmemiş
              </span>
            )}
          </CollapsibleSection>
        </div>

        {/* System Info Footer */}
        <div className="mt-auto p-6 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3" />
            <span>Oluşturulma: {formatDateTime(kisi.createdAt)}</span>
          </div>
          {kisi.createdUser && (
            <span className="pl-5">
              {kisi.createdUser.ad} {kisi.createdUser.soyad}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6 pt-2">
            <TabsList variant="line">
              <TabsTrigger value="genel">
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="gsm">
                <Phone className="h-4 w-4" />
                GSM
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {kisi.gsmler?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="adres">
                <MapPin className="h-4 w-4" />
                Adresler
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {kisi.adresler?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="arac">
                <Car className="h-4 w-4" />
                Araçlar
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {araclarData?.data?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tanitim">
                <Megaphone className="h-4 w-4" />
                Tanıtımlar
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {tanitimlar?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="operasyon">
                <Workflow className="h-4 w-4" />
                Operasyonlar
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {operasyonlar?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notlar">
                <FileText className="h-4 w-4" />
                Notlar
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {kisi.notlar?.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Genel Bakış */}
            <TabsContent value="genel" className="mt-0 h-full">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Son Tanıtımlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Son Tanıtımlar</h3>
                    {(tanitimlar?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("tanitim")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Tümünü gör
                      </button>
                    )}
                  </div>
                  {tanitimlar && tanitimlar.length > 0 ? (
                    <div className="space-y-2">
                      {tanitimlar.slice(0, 3).map((tanitim) => (
                        <Link
                          key={tanitim.id}
                          href={`/tanitimlar/${tanitim.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <Megaphone className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {tanitim.mahalle?.ad}, {tanitim.mahalle?.ilce?.ad}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tanitim.saat}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(tanitim.tarih)}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz tanıtım kaydı yok</p>
                    </div>
                  )}
                </div>

                {/* Son Operasyonlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Son Operasyonlar</h3>
                    {(operasyonlar?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("operasyon")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Tümünü gör
                      </button>
                    )}
                  </div>
                  {operasyonlar && operasyonlar.length > 0 ? (
                    <div className="space-y-2">
                      {operasyonlar.slice(0, 3).map((op) => (
                        <Link
                          key={op.id}
                          href={`/operasyonlar/${op.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                              <Workflow className="h-4 w-4 text-violet-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {op.mahalle?.ad}, {op.mahalle?.ilce?.ad}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {op.saat}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(op.tarih)}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz operasyon kaydı yok</p>
                    </div>
                  )}
                </div>

                {/* Araçlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Araçlar</h3>
                    {(araclarData?.data?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("arac")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Tümünü gör
                      </button>
                    )}
                  </div>
                  {araclarData?.data && araclarData.data.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {araclarData.data.slice(0, 4).map((arac) => (
                        <div
                          key={arac.id}
                          className="p-3 rounded-lg border bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/50 dark:to-blue-950/50"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="h-4 w-4 text-indigo-600" />
                            <span className="font-mono font-medium text-sm">
                              {arac.plaka}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {arac.model?.marka?.ad} {arac.model?.ad}
                          </p>
                          {arac.renk && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {arac.renk}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz araç kaydı yok</p>
                    </div>
                  )}
                </div>

                {/* Son Aktivite */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold">Son Aktivite</h3>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {kisi.createdUser && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium text-blue-600">
                              {kisi.createdUser.ad} {kisi.createdUser.soyad}
                            </span>{" "}
                            kişi kaydını oluşturdu
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(kisi.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {kisi.updatedUser && kisi.updatedAt !== kisi.createdAt && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium text-blue-600">
                              {kisi.updatedUser.ad} {kisi.updatedUser.soyad}
                            </span>{" "}
                            kişi bilgilerini güncelledi
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(kisi.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* GSM */}
            <TabsContent value="gsm" className="mt-0">
              <KisiGsmList kisiId={id} />
            </TabsContent>

            {/* Adresler */}
            <TabsContent value="adres" className="mt-0">
              <KisiAdresList kisiId={id} />
            </TabsContent>

            {/* Araçlar */}
            <TabsContent value="arac" className="mt-0">
              <KisiAracList kisiId={id} />
            </TabsContent>

            {/* Tanıtımlar */}
            <TabsContent value="tanitim" className="mt-0">
              <KisiTanitimList kisiId={id} />
            </TabsContent>

            {/* Operasyonlar */}
            <TabsContent value="operasyon" className="mt-0">
              <KisiOperasyonList kisiId={id} />
            </TabsContent>

            {/* Notlar */}
            <TabsContent value="notlar" className="mt-0">
              <KisiNotList kisiId={id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Kişi Detayları Edit Modal */}
      <KisiDetayEditModal
        open={showDetayModal}
        onOpenChange={setShowDetayModal}
        kisi={{
          id: kisi.id,
          tc: kisi.tc,
          ad: kisi.ad,
          soyad: kisi.soyad,
          tt: kisi.tt,
          pio: kisi.pio,
          asli: kisi.asli,
        }}
      />

      {/* Faaliyet Alanları Edit Modal */}
      <KisiFaaliyetEditModal
        open={showFaaliyetModal}
        onOpenChange={setShowFaaliyetModal}
        kisiId={kisi.id}
        faaliyetAlanlari={kisi.faaliyetAlanlari || []}
      />

      {/* Fotoğraf Edit Modal */}
      <KisiFotografEditModal
        open={showFotografModal}
        onOpenChange={setShowFotografModal}
        kisiId={kisi.id}
        fotograf={kisi.fotograf}
        ad={kisi.ad}
        soyad={kisi.soyad}
      />
    </div>
  )
}
