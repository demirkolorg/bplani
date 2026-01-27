"use client"

import * as React from "react"
import { useState } from "react"
import {
  Search,
  Users,
  Phone,
  CalendarClock,
  Megaphone,
  Workflow,
  Bell,
  Car,
  UserPlus,
  AlertTriangle,
  Zap,
} from "lucide-react"

import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useUser } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GlobalSearch } from "@/components/search/global-search"
import { TabLink } from "@/components/tabs/tab-link"
import { DuyuruList } from "@/components/duyurular/duyuru-list"
import { cn } from "@/lib/utils"

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  href,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  bgColor: string
  textColor: string
  href: string
}) {
  return (
    <TabLink href={href} className="flex-1 min-w-[140px]">
      <div className={cn("relative overflow-hidden rounded-2xl p-4 h-full cursor-pointer hover:opacity-90 transition-opacity", bgColor)}>
        {/* Background Icon */}
        <Icon className={cn("absolute -right-2 -top-2 h-20 w-20 opacity-20", textColor)} />

        {/* Content */}
        <div className="relative z-10">
          <p className={cn("text-3xl font-bold mb-1", textColor)}>
            {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
          </p>
          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>
      </div>
    </TabLink>
  )
}


export default function DashboardPage() {
  const { user } = useUser()
  const { t } = useLocale()
  const { data: stats, isLoading } = useDashboardStats()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="min-h-full bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="ALTAY"
              className="h-16 md:h-20 w-auto"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {interpolate(t.dashboard.welcomeMessage, { name: user?.ad || t.auth.user })}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-4 px-6 py-5 bg-background border-2 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all"
            >
              <Search className="h-6 w-6 text-muted-foreground" />
              <span className="flex-1 text-lg text-muted-foreground">
                {t.dashboard.searchPlaceholder}
              </span>
              <kbd className="hidden sm:flex h-7 select-none items-center gap-1 rounded-lg border bg-muted px-2.5 font-mono text-sm font-medium text-muted-foreground">
                Ctrl K
              </kbd>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
                {t.dashboard.searchTagTc}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
                {t.dashboard.searchTagPhone}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
                {t.dashboard.searchTagName}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
                {t.dashboard.searchTagAddress}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 pb-8">
        {/* All Stats in One Row */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 min-w-[140px]">
                <div className="rounded-2xl p-4 bg-muted/50">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                title={t.dashboard.kisiler}
                value={stats?.kisi.total || 0}
                icon={Users}
                bgColor="bg-blue-50/80 dark:bg-blue-950/20"
                textColor="text-blue-500 dark:text-blue-400"
                href="/kisiler"
              />
              <StatCard
                title={t.dashboard.gsm}
                value={stats?.gsm || 0}
                icon={Phone}
                bgColor="bg-green-50/80 dark:bg-green-950/20"
                textColor="text-green-500 dark:text-green-400"
                href="/numaralar"
              />
              <StatCard
                title={t.dashboard.takipler}
                value={stats?.takip.active || 0}
                icon={CalendarClock}
                bgColor="bg-purple-50/80 dark:bg-purple-950/20"
                textColor="text-purple-500 dark:text-purple-400"
                href="/takipler"
              />
              <StatCard
                title={t.dashboard.tanitimlar}
                value={stats?.tanitim.total || 0}
                icon={Megaphone}
                bgColor="bg-orange-50/80 dark:bg-orange-950/20"
                textColor="text-orange-500 dark:text-orange-400"
                href="/tanitimlar"
              />
              <StatCard
                title={t.dashboard.operasyonlar}
                value={stats?.operasyon.total || 0}
                icon={Workflow}
                bgColor="bg-indigo-50/80 dark:bg-indigo-950/20"
                textColor="text-indigo-500 dark:text-indigo-400"
                href="/operasyonlar"
              />
              <StatCard
                title={t.dashboard.araclar}
                value={stats?.arac || 0}
                icon={Car}
                bgColor="bg-cyan-50/80 dark:bg-cyan-950/20"
                textColor="text-cyan-500 dark:text-cyan-400"
                href="/araclar"
              />
              <StatCard
                title={t.dashboard.alarmlar}
                value={stats?.alarm.pending || 0}
                icon={Bell}
                bgColor="bg-amber-50/80 dark:bg-amber-950/20"
                textColor="text-amber-500 dark:text-amber-400"
                href="/alarmlar"
              />
            </>
          )}
        </div>

        {/* Duyurular & Actions Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-2">
          {/* Duyurular Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <DuyuruList />
          </div>

          {/* Quick Actions & Alerts Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t.dashboard.quickActions}</h3>
                  <p className="text-xs text-muted-foreground">{t.common.quickActionsDescription}</p>
                </div>
              </div>
              <div className="space-y-1">
                <TabLink href="/kisiler/yeni">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t.dashboard.newKisi}</span>
                  </div>
                </TabLink>
                <TabLink href="/takipler/yeni">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t.dashboard.newTakip}</span>
                  </div>
                </TabLink>
                <TabLink href="/tanitimlar/yeni">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t.dashboard.newTanitim}</span>
                  </div>
                </TabLink>
                <TabLink href="/operasyonlar/yeni">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t.dashboard.newOperasyon}</span>
                  </div>
                </TabLink>
              </div>
            </div>

            {/* Expiring Takips */}
            {stats?.takip.expiringSoonList && stats.takip.expiringSoonList.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {t.dashboard.expiringSoon}
                </h3>
                <div className="space-y-1">
                  {stats.takip.expiringSoonList.map((takip) => (
                    <TabLink key={takip.id} href={`/takipler/${takip.id}`}>
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="text-sm">
                          {takip.gsm.kisi ? `${takip.gsm.kisi.ad} ${takip.gsm.kisi.soyad}` : takip.gsm.numara}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(takip.bitisTarihi).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </TabLink>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Alarms */}
            {stats?.alarm.pending && (
              <div>
                <TabLink href="/alarmlar">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-red-600 dark:text-red-400">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">{interpolate(t.dashboard.pendingAlarms, { count: stats.alarm.pending })}</span>
                  </div>
                </TabLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
