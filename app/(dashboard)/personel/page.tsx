import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { PersonelTable } from "@/components/personel/personel-table"

export default async function PersonelPage() {
  const session = await getSession()

  // Yetki kontrolü - sadece ADMIN ve YONETICI erişebilir
  if (!session || (session.rol !== "ADMIN" && session.rol !== "YONETICI")) {
    redirect("/")
  }

  const isAdmin = session.rol === "ADMIN"

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Personel</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/personel/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Personel
            </Link>
          </Button>
        )}
      </div>

      <PersonelTable currentUserRol={session.rol} currentUserId={session.id} />
    </div>
  )
}
