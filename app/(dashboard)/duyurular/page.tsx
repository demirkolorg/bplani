"use client"

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

import { useUser } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { DuyuruTable } from "@/components/duyurular/duyuru-table"
import { DuyuruFormModal } from "@/components/duyurular/duyuru-form-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function DuyurularPage() {
  const { user, isLoading } = useUser()
  const { t } = useLocale()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Yetki kontrolü - sadece ADMIN ve YONETICI erişebilir
  useEffect(() => {
    if (!isLoading && (!user || (user.rol !== "ADMIN" && user.rol !== "YONETICI"))) {
      router.replace("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Yetkisiz erişim kontrolü
  if (!user || (user.rol !== "ADMIN" && user.rol !== "YONETICI")) {
    return null
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.duyurular.pageTitle}</h1>
          <p className="text-muted-foreground">{t.duyurular.pageDescription}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t.duyurular.newDuyuruButton}
        </Button>
      </div>

      <DuyuruTable />

      <DuyuruFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  )
}
