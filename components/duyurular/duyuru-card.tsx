"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/components/providers/locale-provider"
import type { Duyuru } from "@/hooks/use-duyurular"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"
import { AlertCircle, Info, AlertTriangle } from "lucide-react"

interface DuyuruCardProps {
  duyuru: Duyuru
}

export function DuyuruCard({ duyuru }: DuyuruCardProps) {
  const { t, locale } = useLocale()
  const dateLocale = locale === "tr" ? tr : enUS

  // Priority colors and icons
  const priorityConfig = {
    KRITIK: {
      color: "border-red-500",
      badgeColor: "bg-red-500 text-white hover:bg-red-600",
      borderColor: "border-l-4 border-l-red-500",
      icon: AlertCircle,
    },
    ONEMLI: {
      color: "border-orange-500",
      badgeColor: "bg-orange-500 text-white hover:bg-orange-600",
      borderColor: "border-l-4 border-l-orange-500",
      icon: AlertTriangle,
    },
    NORMAL: {
      color: "border-blue-500",
      badgeColor: "bg-blue-500 text-white hover:bg-blue-600",
      borderColor: "border-l-4 border-l-blue-500",
      icon: Info,
    },
  }

  const config = priorityConfig[duyuru.oncelik]
  const Icon = config.icon

  const isExpired = duyuru.expiresAt && new Date(duyuru.expiresAt) < new Date()

  return (
    <Card className={`${config.borderColor} ${config.color} transition-all hover:shadow-md group`}>
      <CardHeader className="pb-1.5 pt-2 px-3">
        <div className="flex items-start gap-2">
          <div className="flex items-center flex-shrink-0">
            <div className={`p-1 rounded-md group-hover:scale-110 transition-transform`}>
              <Icon className={`h-3.5 w-3.5 ${
                duyuru.oncelik === 'KRITIK' ? 'text-red-500' :
                duyuru.oncelik === 'ONEMLI' ? 'text-orange-500' :
                'text-blue-500'
              }`} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge className={`${config.badgeColor} text-[10px] px-1.5 py-0`}>
                {t.duyurular[`priority${duyuru.oncelik.charAt(0) + duyuru.oncelik.slice(1).toLowerCase()}` as keyof typeof t.duyurular]}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {t.duyurular.expired}
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm font-bold leading-tight mb-0.5">{duyuru.baslik}</CardTitle>
            <CardDescription className="line-clamp-2 text-xs leading-snug">
              {duyuru.icerik}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground border-t pt-1.5 mt-1.5">
          <span className="font-medium">{format(new Date(duyuru.publishedAt), "d MMM yyyy", { locale: dateLocale })}</span>

          {duyuru.createdUser && (
            <>
              <span>•</span>
              <span>{duyuru.createdUser.ad} {duyuru.createdUser.soyad}</span>
            </>
          )}

          {duyuru.expiresAt && (
            <>
              <span>•</span>
              <span className={isExpired ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                {isExpired ? t.duyurular.expired : format(new Date(duyuru.expiresAt), "d MMM yyyy", { locale: dateLocale })}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
