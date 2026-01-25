"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { TakipTable } from "@/components/takipler/takip-table"

export default function TakiplerPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.takipler.pageTitle}</h1>
          <p className="text-muted-foreground">
            {t.takipler.pageDescription}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/takipler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              {t.takipler.newTakipButton}
            </Link>
          </Button>
        </div>
      </div>

      <TakipTable />
    </div>
  )
}
