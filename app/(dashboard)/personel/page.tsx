"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useEffect } from "react"

import { useUser } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { PersonelTable } from "@/components/personel/personel-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function PersonelPage() {
  const { user, isLoading } = useUser()
  const { t } = useLocale()
  const router = useRouter()

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

  const isAdmin = user.rol === "ADMIN"

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.personel.pageTitle}</h1>
          <p className="text-muted-foreground">{t.personel.pageDescription}</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/personel/yeni">
              <Plus className="mr-2 h-4 w-4" />
              {t.personel.newPersonelButton}
            </Link>
          </Button>
        )}
      </div>

      <PersonelTable currentUserRol={user.rol} currentUserId={user.id} />
    </div>
  )
}
