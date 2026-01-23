"use client"

import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  User,
  Calendar,
  Monitor,
  Globe,
  FileJson,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  useLog,
  islemLabels,
  entityTypeLabels,
  getIslemColor,
} from "@/hooks/use-loglar"
import { useTabParams } from "@/components/providers/params-provider"

function JsonViewer({ data, title }: { data: unknown; title: string }) {
  if (!data) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[400px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}

function DegisiklikCard({ degisiklikler }: { degisiklikler: Record<string, { onceki: unknown; yeni: unknown }> }) {
  if (!degisiklikler || Object.keys(degisiklikler).length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Değişiklikler</CardTitle>
        <CardDescription>Güncellenen alanlar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(degisiklikler).map(([field, values]) => (
            <div key={field} className="rounded-lg border p-3">
              <div className="text-sm font-medium mb-2">{field}</div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 bg-red-50 dark:bg-red-950 p-2 rounded">
                  <span className="text-red-600 dark:text-red-400 text-xs font-medium">Önceki:</span>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {typeof values.onceki === "object"
                      ? JSON.stringify(values.onceki, null, 2)
                      : String(values.onceki ?? "-")}
                  </pre>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 bg-green-50 dark:bg-green-950 p-2 rounded">
                  <span className="text-green-600 dark:text-green-400 text-xs font-medium">Yeni:</span>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {typeof values.yeni === "object"
                      ? JSON.stringify(values.yeni, null, 2)
                      : String(values.yeni ?? "-")}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LogDetailPage() {
  const params = useTabParams<{ id: string }>()
  const id = params.id
  const { data: log, isLoading } = useLog(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Log bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Log Detayı</h1>
            <Badge className={getIslemColor(log.islem)} variant="outline">
              {islemLabels[log.islem]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {format(new Date(log.createdAt), "dd MMMM yyyy HH:mm:ss", { locale: tr })}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Kullanıcı Bilgisi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Kullanıcı Bilgisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {log.user ? (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={log.user.fotograf || undefined} />
                    <AvatarFallback>
                      {log.userAd?.[0]}{log.userSoyad?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{log.userAd} {log.userSoyad}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.user.visibleId} - {log.user.rol}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-8 w-8" />
                  <span>{log.userAd || "Sistem"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* İşlem Bilgisi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              İşlem Bilgisi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">İşlem:</span>
              <span>{islemLabels[log.islem]}</span>

              <span className="text-muted-foreground">Veri Türü:</span>
              <span>{log.entityType ? entityTypeLabels[log.entityType] || log.entityType : "-"}</span>

              <span className="text-muted-foreground">Kayıt ID:</span>
              <span className="font-mono text-xs">{log.entityId || "-"}</span>

              {log.entityAd && (
                <>
                  <span className="text-muted-foreground">Kayıt Adı:</span>
                  <span>{log.entityAd}</span>
                </>
              )}
            </div>

            {log.aciklama && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Açıklama:</span>
                  <p className="text-sm mt-1">{log.aciklama}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* İstek Bilgileri */}
      {(log.ipAdresi || log.userAgent) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              İstek Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {log.ipAdresi && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">IP:</span>
                <span className="font-mono">{log.ipAdresi}</span>
              </div>
            )}
            {log.userAgent && (
              <div className="flex items-start gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Tarayıcı:</span>
                <span className="text-xs break-all">{log.userAgent}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Değişiklikler */}
      {log.degisiklikler && (
        <DegisiklikCard
          degisiklikler={log.degisiklikler as Record<string, { onceki: unknown; yeni: unknown }>}
        />
      )}

      {/* Veri Detayları */}
      <div className="grid gap-6 md:grid-cols-2">
        <JsonViewer data={log.oncekiVeri} title="Önceki Veri" />
        <JsonViewer data={log.yeniVeri} title="Yeni Veri" />
      </div>

      {/* Metadata */}
      <JsonViewer data={log.metadata} title="Ek Bilgiler (Metadata)" />
    </div>
  )
}
