"use client"

import { useActiveDuyurular } from "@/hooks/use-duyurular"
import { DuyuruCard } from "./duyuru-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/components/providers/locale-provider"
import { Megaphone } from "lucide-react"

export function DuyuruList() {
  const { data, isLoading, error } = useActiveDuyurular()
  const { t } = useLocale()

  // Don't render if loading, error, or no data
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">{t.duyurular.pageTitle}</h2>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !data || data.data.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t.duyurular.pageTitle}</h2>
            <p className="text-xs text-muted-foreground">Son güncellemeler ve önemli duyurular</p>
          </div>
        </div>
        {data.data.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {data.data.length} duyuru
          </span>
        )}
      </div>

      <div className="space-y-2">
        {data.data.map((duyuru) => (
          <DuyuruCard key={duyuru.id} duyuru={duyuru} />
        ))}
      </div>
    </div>
  )
}
