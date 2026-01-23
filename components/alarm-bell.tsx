"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, Check, Clock, User, Phone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

import { useBildirimler, useMarkAllAsRead, type Alarm } from "@/hooks/use-alarmlar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

function BildirimItem({ alarm }: { alarm: Alarm }) {
  const kisi = alarm.takip?.gsm?.kisi
  const numara = alarm.takip?.gsm?.numara

  // Alarm tip label
  const tipLabel = {
    TAKIP_BITIS: "Takip Bitiş",
    ODEME_HATIRLATMA: "Ödeme Hatırlatma",
    OZEL: "Özel",
  }[alarm.tip]

  return (
    <Link href={kisi ? `/kisiler/${kisi.id}` : "/alarmlar"}>
      <div className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {alarm.baslik || tipLabel}
              </span>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {tipLabel}
              </Badge>
            </div>

            {kisi && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{kisi.ad} {kisi.soyad}</span>
              </div>
            )}

            {numara && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="font-mono">{numara}</span>
              </div>
            )}

            {alarm.mesaj && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {alarm.mesaj}
              </p>
            )}

            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(alarm.tetikTarihi), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function AlarmBell() {
  const { data, isLoading } = useBildirimler()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = data?.unreadCount || 0
  const bildirimler = data?.bildirimler || []

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Bildirimler</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <Check className="h-3 w-3 mr-1" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : bildirimler.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Bildirim yok</p>
            </div>
          ) : (
            <div className="p-1">
              {bildirimler.map((alarm, index) => (
                <React.Fragment key={alarm.id}>
                  <BildirimItem alarm={alarm} />
                  {index < bildirimler.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center" asChild>
            <Link href="/alarmlar">Tüm Alarmları Gör</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
