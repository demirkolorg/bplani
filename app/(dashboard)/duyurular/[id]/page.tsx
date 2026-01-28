"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useLocale } from "@/components/providers/locale-provider"
import { useUser } from "@/components/providers/auth-provider"
import { useTabs } from "@/components/providers/tab-provider"
import { useCurrentTabId } from "@/components/tabs/tab-panel"
import { Pencil, Megaphone, Calendar, Info, Trash2, User, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"

import { useDuyuru, useDeleteDuyuru } from "@/hooks/use-duyurular"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { DuyuruFormModal } from "@/components/duyurular/duyuru-form-modal"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

export default function DuyuruDetayPage() {
  const { t, locale } = useLocale()
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const { updateTabTitle } = useTabs()
  const currentTabId = useCurrentTabId()
  const id = params.id as string
  const dateLocale = locale === "tr" ? tr : enUS

  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const { data: duyuru, isLoading, error } = useDuyuru(id)
  const deleteDuyuru = useDeleteDuyuru()

  // Check if user can edit/delete (ADMIN or YONETICI)
  const canEdit = user?.rol === "ADMIN" || user?.rol === "YONETICI"

  // Update tab title when duyuru loads
  React.useEffect(() => {
    if (duyuru && currentTabId) {
      updateTabTitle(currentTabId, duyuru.baslik, true)
    }
  }, [duyuru, currentTabId, updateTabTitle])

  const handleDelete = async () => {
    await deleteDuyuru.mutateAsync(id)
    router.push("/duyurular")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
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

  if (error || !duyuru) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Duyuru bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/duyurular">Duyurulara Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Priority colors and icons
  const priorityConfig = {
    KRITIK: {
      color: "bg-red-500 text-white",
      bgColor: "bg-red-100 dark:bg-red-950",
      borderColor: "border-red-500",
    },
    ONEMLI: {
      color: "bg-orange-500 text-white",
      bgColor: "bg-orange-100 dark:bg-orange-950",
      borderColor: "border-orange-500",
    },
    NORMAL: {
      color: "bg-blue-500 text-white",
      bgColor: "bg-blue-100 dark:bg-blue-950",
      borderColor: "border-blue-500",
    },
  }

  const config = priorityConfig[duyuru.oncelik]
  const isExpired = duyuru.expiresAt && new Date(duyuru.expiresAt) < new Date()

  return (
    <div className="container mx-auto py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.common.back}
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${config.bgColor}`}>
            <Megaphone className={`h-7 w-7 text-${config.borderColor.replace("border-", "")}-600`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{duyuru.baslik}</h1>
              <Badge className={config.color}>
                {t.duyurular[`priority${duyuru.oncelik.charAt(0) + duyuru.oncelik.slice(1).toLowerCase()}` as keyof typeof t.duyurular]}
              </Badge>
              {!duyuru.isActive && (
                <Badge variant="secondary">{t.duyurular.inactive}</Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">{t.duyurular.expired}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">
                {format(new Date(duyuru.publishedAt), "d MMMM yyyy, HH:mm", { locale: dateLocale })}
              </span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t.duyurular.edit}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t.duyurular.delete}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`border-l-4 ${config.borderColor}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t.duyurular.content}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{duyuru.icerik}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.duyurular.duyuruDetails}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{t.duyurular.publishDate}</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(duyuru.publishedAt), "d MMMM yyyy, HH:mm", { locale: dateLocale })}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{t.duyurular.expiryDate}</span>
                </div>
                {duyuru.expiresAt ? (
                  <p className={`text-sm font-medium ${isExpired ? "text-red-600 dark:text-red-400" : ""}`}>
                    {format(new Date(duyuru.expiresAt), "d MMMM yyyy, HH:mm", { locale: dateLocale })}
                    {isExpired && ` (${t.duyurular.expired})`}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.duyurular.noExpiry}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{t.duyurular.createdBy}</span>
                </div>
                {duyuru.createdUser ? (
                  <p className="text-sm font-medium">
                    {duyuru.createdUser.ad} {duyuru.createdUser.soyad}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.duyurular.unknownUser}</p>
                )}
              </div>

              {duyuru.updatedUser && duyuru.updatedAt && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{t.duyurular.updatedBy}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {duyuru.updatedUser.ad} {duyuru.updatedUser.soyad}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(duyuru.updatedAt), "d MMMM yyyy, HH:mm", { locale: dateLocale })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {canEdit && (
        <>
          <DuyuruFormModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            initialData={duyuru}
          />

          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title={t.duyurular.deleteDuyuru}
            description={t.duyurular.deleteDuyuruConfirm}
            confirmText={t.common.delete}
            onConfirm={handleDelete}
            isLoading={deleteDuyuru.isPending}
          />
        </>
      )}
    </div>
  )
}
