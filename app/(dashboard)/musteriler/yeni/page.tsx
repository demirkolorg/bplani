import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { KisiForm } from "@/components/musteriler/musteri-form"
import { Button } from "@/components/ui/button"

export default function YeniKisiPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/musteriler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Kişi Ekle</h1>
          <p className="text-muted-foreground">
            Kişisel bilgiler, GSM numaraları ve adresleri ekleyin
          </p>
        </div>
      </div>
      <KisiForm />
    </div>
  )
}
