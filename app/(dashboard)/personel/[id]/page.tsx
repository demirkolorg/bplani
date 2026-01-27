"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTabParams } from "@/components/providers/params-provider"
import { useTabTitle } from "@/hooks/use-tab-title"
import Link from "next/link"
import {
  Pencil,
  User,
  Key,
  Shield,
  Power,
  Trash2,
  Info,
  CalendarClock,
  FileText,
  Users,
  Megaphone,
} from "lucide-react"

import { usePersonel, useDeletePersonel, useToggleActive } from "@/hooks/use-personel"
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PersonelFormModal } from "@/components/personel/personel-form-modal"
import { PersonelPasswordModal } from "@/components/personel/personel-password-modal"
import { PersonelRolModal } from "@/components/personel/personel-rol-modal"
import { personelRolLabels, personelRolColors } from "@/lib/validations"
import { useLocale } from "@/components/providers/locale-provider"

export default function PersonelDetayPage() {
  const params = useTabParams<{ id: string }>()
  const router = useRouter()
  const { t } = useLocale()
  const id = params.id

  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showPasswordModal, setShowPasswordModal] = React.useState(false)
  const [showRolModal, setShowRolModal] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { data: personel, isLoading, error: fetchError } = usePersonel(id)

  // Tab title'ı dinamik güncelle
  useTabTitle(personel ? `${personel.ad} ${personel.soyad}` : undefined)
  const deletePersonel = useDeletePersonel()
  const toggleActive = useToggleActive()

  const handleDelete = async () => {
    setError(null)
    try {
      await deletePersonel.mutateAsync(id)
      router.push("/personel")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Personel silinemedi")
    }
    setShowDeleteConfirm(false)
  }

  const handleToggleActive = async () => {
    if (!personel) return
    setError(null)
    try {
      await toggleActive.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum değiştirilemedi")
    }
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

  if (fetchError || !personel) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {fetchError instanceof Error ? fetchError.message : "Personel bulunamadı"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/personel">Personele Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (date: string | null) => {
    if (!date) return "—"
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
            {personel.fotograf ? (
              <img
                src={personel.fotograf}
                alt={`${personel.ad} ${personel.soyad}`}
                className="h-16 w-16 object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {personel.ad} {personel.soyad}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground font-mono">
                ID: {personel.visibleId}
              </span>
              <Badge variant="outline" className={personelRolColors[personel.rol]}>
                {personelRolLabels[personel.rol]}
              </Badge>
              {!personel.isActive && (
                <Badge variant="destructive">Pasif</Badge>
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
                  Personel kaydı hakkında teknik bilgiler
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Oluşturulma
                  </p>
                  <p className="mt-1">{formatDate(personel.createdAt)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </p>
                  <p className="mt-1">{formatDate(personel.updatedAt)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Son Giriş
                  </p>
                  <p className="mt-1">
                    {personel.lastLoginAt
                      ? formatDate(personel.lastLoginAt)
                      : "Hiç giriş yapmadı"}
                  </p>
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

      {/* Error display */}
      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Durum:</span>
          {personel.isActive ? (
            <Badge variant="default" className="bg-green-600">Aktif</Badge>
          ) : (
            <Badge variant="secondary">Pasif</Badge>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Son Giriş:</span>
          <span className="font-medium">
            {personel.lastLoginAt ? formatDate(personel.lastLoginAt) : "—"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aktivite İstatistikleri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktivite İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{personel._count?.createdKisiler || 0}</p>
                  <p className="text-sm text-muted-foreground">Oluşturulan Kişi</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CalendarClock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{personel._count?.createdTakipler || 0}</p>
                  <p className="text-sm text-muted-foreground">Oluşturulan Takip</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{personel._count?.createdNotlar || 0}</p>
                  <p className="text-sm text-muted-foreground">Oluşturulan Not</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Megaphone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{personel._count?.createdTanitimlar || 0}</p>
                  <p className="text-sm text-muted-foreground">Oluşturulan Tanıtım</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hızlı İşlemler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.common.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowPasswordModal(true)}
            >
              <Key className="mr-2 h-4 w-4" />
              Şifre Değiştir
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowRolModal(true)}
            >
              <Shield className="mr-2 h-4 w-4" />
              Rol Değiştir
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleToggleActive}
              disabled={toggleActive.isPending}
            >
              <Power className="mr-2 h-4 w-4" />
              {personel.isActive ? "Deaktive Et" : "Aktive Et"}
            </Button>
            <Separator />
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Personeli Sil
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PersonelFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialData={personel}
      />

      {personel && (
        <>
          <PersonelPasswordModal
            open={showPasswordModal}
            onOpenChange={setShowPasswordModal}
            personel={personel}
          />
          <PersonelRolModal
            open={showRolModal}
            onOpenChange={setShowRolModal}
            personel={personel}
          />
        </>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Personeli Sil"
        description="Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deletePersonel.isPending}
      />
    </div>
  )
}
