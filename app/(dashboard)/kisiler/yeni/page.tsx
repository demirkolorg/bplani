"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { KisiForm } from "@/components/kisiler/musteri-form"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"

export default function YeniKisiPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/kisiler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t.kisiler.newKisiPageTitle}</h1>
          <p className="text-muted-foreground">
            {t.kisiler.newKisiPageDescription}
          </p>
        </div>
      </div>
      <KisiForm />
    </div>
  )
}
