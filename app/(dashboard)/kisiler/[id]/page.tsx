"use client"

import * as React from "react"
import Link from "next/link"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import { useLocale } from "@/components/providers/locale-provider"
import { useTabs } from "@/components/providers/tab-provider"
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
  Clock,
  ArrowUpRight,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Copy,
  Search,
} from "lucide-react"

import { useKisi } from "@/hooks/use-kisiler"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
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
  contextValue?: string // For copy/search functionality
}

function DetailRow({ label, value, isLink, contextValue }: DetailRowProps) {
  const { t } = useLocale()

  const handleCopy = async () => {
    if (contextValue) {
      try {
        await navigator.clipboard.writeText(contextValue)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  const handleSearch = () => {
    if (contextValue) {
      window.dispatchEvent(
        new CustomEvent("triggerGlobalSearch", {
          detail: { query: contextValue },
        })
      )
    }
  }

  const content = (
    <div className="flex items-start py-1.5">
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("text-sm", isLink && "text-blue-600 hover:underline cursor-pointer")}>
        {value || "-"}
      </span>
    </div>
  )

  if (!contextValue) {
    return content
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          {t.common.copy}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          {t.common.search}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default function KisiDetayPage() {
  const params = useTabParams<{ id: string }>()
  const id = params.id
  const { t } = useLocale()
  const { openTab } = useTabs()

  const [showDetayModal, setShowDetayModal] = React.useState(false)
  const [showFaaliyetModal, setShowFaaliyetModal] = React.useState(false)
  const [showFotografModal, setShowFotografModal] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("genel")

  const { data: kisi, isLoading, error } = useKisi(id)

  // Tab title'ı dinamik güncelle
  useTabTitle(kisi ? `${kisi.ad} ${kisi.soyad}` : undefined)

  // Handle URL fragment to open specific tab
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1) // Remove #
      if (hash && ["genel", "gsm", "adres", "arac", "tanitim", "operasyon", "notlar"].includes(hash)) {
        setActiveTab(hash)
      }
    }
  }, [])
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
              {error instanceof Error ? error.message : t.kisiler.personNotFound}
            </p>
            <Button asChild>
              <Link href="/kisiler">{t.kisiler.backToPersons}</Link>
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

  // Get primary address - full address with detail
  const primaryAdres = kisi.adresler?.find((a) => a.isPrimary) || kisi.adresler?.[0]
  const adresText = primaryAdres
    ? [
        primaryAdres.mahalle?.ad ? `${primaryAdres.mahalle.ad} Mahallesi` : null,
        primaryAdres.detay,
        primaryAdres.mahalle?.ilce?.ad,
        primaryAdres.mahalle?.ilce?.il?.ad
      ].filter(Boolean).join(", ")
    : null

  // Recent notes (last 2)
  // Recent notes (last 2)
  const recentNotes = kisi.notlar?.slice(0, 2) || []

  // Active takip count
  const activeTakipCount = kisi.gsmler?.reduce((count, gsm) => {
    return count + (gsm.takipler?.filter((t: any) => t.isActive).length || 0)
  }, 0) || 0

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <div className="w-[360px] border-r flex flex-col overflow-y-auto">
        <div className="p-6">
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
            <Badge variant="destructive" className="mb-2">{t.kisiler.archived}</Badge>
          )}
        </div>

        {/* Sections */}
        <div className="px-6 divide-y">
          {/* Kişi Detayları */}
          <CollapsibleSection
            title={t.kisiler.kisiDetails}
            onEdit={() => setShowDetayModal(true)}
          >
            <div className="space-y-0.5">
              <DetailRow
                label={t.kisiler.tip}
                value={
                  <Badge
                    variant="outline"
                    className={
                      kisi.tt
                        ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300"
                        : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                    }
                  >
                    {kisi.tt ? t.kisiler.tipMusteri : t.kisiler.tipAday}
                  </Badge>
                }
              />
              {kisi.tc && (
                <DetailRow
                  label={t.kisiler.tcLabel}
                  value={kisi.tc}
                  contextValue={kisi.tc}
                />
              )}
              {primaryGsm && (
                <DetailRow
                  label={t.kisiler.phone}
                  value={primaryGsm.numara}
                  isLink
                  contextValue={primaryGsm.numara}
                />
              )}
              {adresText && (
                <DetailRow
                  label={t.kisiler.address}
                  value={adresText}
                  contextValue={adresText}
                />
              )}
              <DetailRow
                label={t.kisiler.tt}
                value={
                  <Badge variant={kisi.tt ? "default" : "secondary"}>
                    {kisi.tt ? t.kisiler.yes : t.kisiler.no}
                  </Badge>
                }
              />
              <DetailRow
                label={t.kisiler.asli}
                value={kisi.asli ? t.kisiler.yes : t.kisiler.no}
              />
              <DetailRow
                label={t.kisiler.pio}
                value={kisi.pio ? t.kisiler.yes : t.kisiler.no}
              />
            </div>
          </CollapsibleSection>

          {/* Faaliyet Alanları (Tags) */}
          <CollapsibleSection
            title={t.kisiler.faaliyetAlanlari}
            onEdit={() => setShowFaaliyetModal(true)}
          >
            <div className="flex flex-wrap gap-2">
              {kisi.faaliyetAlanlari && kisi.faaliyetAlanlari.length > 0 ? (
                kisi.faaliyetAlanlari.map((f) => {
                  const faaliyetAd = f.faaliyetAlani.ad
                  const faaliyetId = f.faaliyetAlani.id

                  const handleCopy = async () => {
                    try {
                      await navigator.clipboard.writeText(faaliyetAd)
                    } catch (err) {
                      console.error("Failed to copy:", err)
                    }
                  }

                  const handleSearch = () => {
                    window.dispatchEvent(
                      new CustomEvent("triggerGlobalSearch", {
                        detail: { query: faaliyetAd },
                      })
                    )
                  }

                  const handleGoToDetail = () => {
                    openTab(`/tanimlamalar/faaliyet-alanlari/${faaliyetId}`)
                  }

                  return (
                    <ContextMenu key={f.id}>
                      <ContextMenuTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          onClick={handleGoToDetail}
                        >
                          {faaliyetAd}
                        </Badge>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={handleGoToDetail}>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          {t.common.detail}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleCopy}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t.common.copy}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleSearch}>
                          <Search className="h-4 w-4 mr-2" />
                          {t.common.search}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t.kisiler.noFaaliyetAlanlari}
                </span>
              )}
            </div>
          </CollapsibleSection>

          {/* Notlar */}
          <CollapsibleSection
            title={t.kisiler.notes}
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
                    {t.kisiler.viewAll} ({kisi.notlar?.length})
                  </button>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t.kisiler.noNotesYet}
              </span>
            )}
          </CollapsibleSection>
        </div>

        {/* System Info Footer */}
        <div className="mt-auto p-6 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3" />
            <span>{t.kisiler.createdAt} {formatDateTime(kisi.createdAt)}</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="sticky top-0 z-10 bg-background border-b px-6 pt-2">
            <TabsList variant="line">
              <TabsTrigger value="genel">
                {t.kisiler.overview}
              </TabsTrigger>
              <TabsTrigger value="gsm">
                <Phone className="h-4 w-4" />
                {t.kisiler.gsm}
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {kisi.gsmler?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="adres">
                <MapPin className="h-4 w-4" />
                {t.kisiler.addresses}
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {kisi.adresler?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="arac">
                <Car className="h-4 w-4" />
                {t.kisiler.vehicles}
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {araclarData?.data?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tanitim">
                <Megaphone className="h-4 w-4" />
                {t.kisiler.introductions}
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {tanitimlar?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="operasyon">
                <Workflow className="h-4 w-4" />
                {t.kisiler.operations}
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {operasyonlar?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notlar">
                <FileText className="h-4 w-4" />
                {t.kisiler.notes}
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {kisi.notlar?.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {/* Genel Bakış */}
            <TabsContent value="genel" className="mt-0">
              {/* Faaliyet Açıklaması */}
              {kisi.faaliyet && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t.kisiler.faaliyet}
                    </h3>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: kisi.faaliyet }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* İstatistikler */}
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-6 mb-6">
                {/* GSM Sayısı */}
                <div className="relative overflow-hidden rounded-2xl p-4 bg-green-50/80 dark:bg-green-950/20 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab("gsm")}>
                  <Phone className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-green-500 dark:text-green-400" />
                  <div className="relative z-10">
                    <p className="text-3xl font-bold mb-1 text-green-500 dark:text-green-400">
                      {(kisi.gsmler?.length || 0).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm font-medium text-foreground">{t.kisiler.gsm}</p>
                  </div>
                </div>

                {/* Adres Sayısı */}
                <div className="relative overflow-hidden rounded-2xl p-4 bg-blue-50/80 dark:bg-blue-950/20 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab("adres")}>
                  <MapPin className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-blue-500 dark:text-blue-400" />
                  <div className="relative z-10">
                    <p className="text-3xl font-bold mb-1 text-blue-500 dark:text-blue-400">
                      {(kisi.adresler?.length || 0).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm font-medium text-foreground">{t.kisiler.addresses}</p>
                  </div>
                </div>

                {/* Araç Sayısı */}
                <div className="relative overflow-hidden rounded-2xl p-4 bg-cyan-50/80 dark:bg-cyan-950/20 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab("arac")}>
                  <Car className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-cyan-500 dark:text-cyan-400" />
                  <div className="relative z-10">
                    <p className="text-3xl font-bold mb-1 text-cyan-500 dark:text-cyan-400">
                      {(araclarData?.data?.length || 0).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm font-medium text-foreground">{t.kisiler.vehicles}</p>
                  </div>
                </div>

                {/* Tanıtım Sayısı */}
                <div className="relative overflow-hidden rounded-2xl p-4 bg-orange-50/80 dark:bg-orange-950/20 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab("tanitim")}>
                  <Megaphone className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-orange-500 dark:text-orange-400" />
                  <div className="relative z-10">
                    <p className="text-3xl font-bold mb-1 text-orange-500 dark:text-orange-400">
                      {(tanitimlar?.length || 0).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm font-medium text-foreground">{t.kisiler.introductions}</p>
                  </div>
                </div>

                {/* Operasyon Sayısı */}
                <div className="relative overflow-hidden rounded-2xl p-4 bg-indigo-50/80 dark:bg-indigo-950/20 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab("operasyon")}>
                  <Workflow className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-indigo-500 dark:text-indigo-400" />
                  <div className="relative z-10">
                    <p className="text-3xl font-bold mb-1 text-indigo-500 dark:text-indigo-400">
                      {(operasyonlar?.length || 0).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm font-medium text-foreground">{t.kisiler.operations}</p>
                  </div>
                </div>

                {/* Not Sayısı */}
                <div className="relative overflow-hidden rounded-2xl p-4 bg-purple-50/80 dark:bg-purple-950/20 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab("notlar")}>
                  <FileText className="absolute -right-2 -top-2 h-20 w-20 opacity-20 text-purple-500 dark:text-purple-400" />
                  <div className="relative z-10">
                    <p className="text-3xl font-bold mb-1 text-purple-500 dark:text-purple-400">
                      {(kisi.notlar?.length || 0).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm font-medium text-foreground">{t.kisiler.notes}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Son Tanıtımlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{t.kisiler.recentIntroductions}</h3>
                    {(tanitimlar?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("tanitim")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t.kisiler.viewAll}
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
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                              <Megaphone className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {tanitim.baslik && (
                                <p className="text-sm font-semibold truncate">
                                  {tanitim.baslik}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground truncate">
                                {[
                                  tanitim.mahalle?.ad && `${tanitim.mahalle.ad} Mah.`,
                                  tanitim.adresDetay,
                                  tanitim.mahalle?.ilce?.ad,
                                  tanitim.mahalle?.ilce?.il?.ad
                                ].filter(Boolean).join(", ")}
                              </p>
                              {tanitim.saat && (
                                <p className="text-xs text-muted-foreground">
                                  {tanitim.saat}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0 ml-2">
                            {formatDate(tanitim.tarih)}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t.kisiler.noIntroductionsYet}</p>
                    </div>
                  )}
                </div>

                {/* Son Operasyonlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{t.kisiler.recentOperations}</h3>
                    {(operasyonlar?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("operasyon")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t.kisiler.viewAll}
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
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0">
                              <Workflow className="h-4 w-4 text-violet-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {op.baslik && (
                                <p className="text-sm font-semibold truncate">
                                  {op.baslik}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground truncate">
                                {[
                                  op.mahalle?.ad && `${op.mahalle.ad} Mah.`,
                                  op.adresDetay,
                                  op.mahalle?.ilce?.ad,
                                  op.mahalle?.ilce?.il?.ad
                                ].filter(Boolean).join(", ")}
                              </p>
                              {op.saat && (
                                <p className="text-xs text-muted-foreground">
                                  {op.saat}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0 ml-2">
                            {formatDate(op.tarih)}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t.kisiler.noOperationsYet}</p>
                    </div>
                  )}
                </div>

                {/* Araçlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{t.kisiler.vehicles}</h3>
                    {(araclarData?.data?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("arac")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t.kisiler.viewAll}
                      </button>
                    )}
                  </div>
                  {araclarData?.data && araclarData.data.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {araclarData.data.slice(0, 4).map((arac) => (
                        <div
                          key={arac.id}
                          className="p-3 rounded-lg border"
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
                      <p className="text-sm">{t.kisiler.noVehiclesYet}</p>
                    </div>
                  )}
                </div>

                {/* Takip Durumu */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold">{t.kisiler.trackingStatus}</h3>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {(() => {
                    const takipler = kisi.gsmler?.flatMap(gsm =>
                      (gsm.takipler || []).filter((t: any) => t.isActive)
                    ) || []

                    if (takipler.length > 0) {
                      return (
                        <div className="space-y-2">
                          {takipler.slice(0, 3).map((takip: any, index: number) => {
                            const gsm = kisi.gsmler?.find(g => g.takipler?.some((t: any) => t.id === takip.id))
                            const daysLeft = Math.ceil((new Date(takip.bitisTarihi).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
                            const isExpired = daysLeft < 0

                            return (
                              <div
                                key={takip.id || index}
                                className={cn(
                                  "p-3 rounded-lg border",
                                  isExpired ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" :
                                  isExpiringSoon ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800" :
                                  "border"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {isExpired ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                      ) : isExpiringSoon ? (
                                        <Clock className="h-4 w-4 text-amber-600" />
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      )}
                                      <span className="font-medium text-sm">
                                        {gsm?.numara || t.kisiler.unknown}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {t.kisiler.endsAt} {formatDate(takip.bitisTarihi)}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      takip.durum === 'UZATILACAK' ? 'destructive' :
                                      takip.durum === 'DEVAM_EDECEK' ? 'default' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {takip.durum}
                                  </Badge>
                                </div>
                                {(isExpiringSoon || isExpired) && (
                                  <p className="text-xs mt-2 font-medium text-amber-700 dark:text-amber-400">
                                    {isExpired
                                      ? t.kisiler.daysAgoExpired.replace('{days}', Math.abs(daysLeft).toString())
                                      : t.kisiler.daysLeft.replace('{days}', daysLeft.toString())
                                    }
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{t.kisiler.noActiveTracking}</p>
                        </div>
                      )
                    }
                  })()}
                </div>

                {/* Son Aktivite */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold">{t.kisiler.recentActivity}</h3>
                    <Activity className="h-4 w-4 text-muted-foreground" />
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
                            {t.kisiler.createdPersonRecord}
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
                            {t.kisiler.updatedPersonInfo}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(kisi.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Son Notlar */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t.kisiler.notes}
                    </h3>
                    {(kisi.notlar?.length || 0) > 0 && (
                      <button
                        onClick={() => setActiveTab("notlar")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t.kisiler.viewAll} ({kisi.notlar?.length})
                      </button>
                    )}
                  </div>
                  {kisi.notlar && kisi.notlar.length > 0 ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {kisi.notlar.slice(0, 4).map((not) => (
                        <Card key={not.id}>
                          <CardContent className="p-4">
                            <p className="text-sm line-clamp-3 mb-3">{not.icerik}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {not.createdUser && (
                                  <span className="text-blue-600 font-medium">
                                    {not.createdUser.ad} {not.createdUser.soyad}
                                  </span>
                                )}
                              </div>
                              <span>{formatDate(not.createdAt)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">{t.kisiler.noNotesYet}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setActiveTab("notlar")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t.kisiler.newNote}
                      </Button>
                    </div>
                  )}
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
