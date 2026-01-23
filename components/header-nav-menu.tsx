"use client"

import * as React from "react"
import {
  Home,
  Users,
  Phone,
  Car,
  CalendarClock,
  Megaphone,
  Workflow,
  Bell,
  ListTree,
  UserCog,
  Settings,
  Activity,
  Menu,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { TabLink } from "@/components/tabs/tab-link"
import { useUser } from "@/components/providers/auth-provider"
import { useBildirimler } from "@/hooks/use-alarmlar"
import type { PersonelRol } from "@prisma/client"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  roles?: PersonelRol[]
}

interface NavGroup {
  label: string
  items: NavItem[]
  roles?: PersonelRol[]
}

const navGroups: NavGroup[] = [
  {
    label: "Genel",
    items: [{ title: "Ana Sayfa", url: "/", icon: Home }],
  },
  {
    label: "Kayıtlar",
    items: [
      { title: "Kişiler", url: "/kisiler", icon: Users },
      { title: "Numaralar", url: "/numaralar", icon: Phone },
      { title: "Araçlar", url: "/araclar", icon: Car },
    ],
  },
  {
    label: "Faaliyetler",
    items: [
      { title: "Takipler", url: "/takipler", icon: CalendarClock },
      { title: "Tanıtımlar", url: "/tanitimlar", icon: Megaphone },
      { title: "Operasyonlar", url: "/operasyonlar", icon: Workflow },
      { title: "Alarmlar", url: "/alarmlar", icon: Bell },
    ],
  },
  {
    label: "Tanımlar",
    items: [{ title: "Tanımlamalar", url: "/tanimlamalar", icon: ListTree }],
  },
  {
    label: "Yönetim",
    roles: ["ADMIN", "YONETICI"],
    items: [
      { title: "Personel", url: "/personel", icon: UserCog },
      { title: "Ayarlar", url: "/ayarlar", icon: Settings },
    ],
  },
  {
    label: "Sistem",
    items: [{ title: "Loglar", url: "/loglar", icon: Activity }],
  },
]

export function HeaderNavMenu() {
  const { user } = useUser()
  const { data: bildirimler } = useBildirimler()

  const hasAccess = (roles?: PersonelRol[]) => {
    if (!roles || roles.length === 0) return true
    if (!user) return false
    return roles.includes(user.rol)
  }

  const visibleGroups = navGroups
    .filter((group) => hasAccess(group.roles))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAccess(item.roles)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline">Menü</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {visibleGroups.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.items.map((item) => (
              <DropdownMenuItem key={item.url} asChild>
                <TabLink href={item.url} className="flex items-center gap-2 w-full cursor-pointer">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.url === "/alarmlar" && bildirimler?.unreadCount ? (
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                      {bildirimler.unreadCount}
                    </Badge>
                  ) : null}
                </TabLink>
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Alternatif: Yatay menü bar (küçük ekranlar için dropdown'a düşer)
export function HeaderNavBar() {
  const { user } = useUser()
  const { data: bildirimler } = useBildirimler()

  const hasAccess = (roles?: PersonelRol[]) => {
    if (!roles || roles.length === 0) return true
    if (!user) return false
    return roles.includes(user.rol)
  }

  // Flat list of quick access items
  const quickItems: NavItem[] = [
    { title: "Ana Sayfa", url: "/", icon: Home },
    { title: "Kişiler", url: "/kisiler", icon: Users },
    { title: "Takipler", url: "/takipler", icon: CalendarClock },
    { title: "Tanıtımlar", url: "/tanitimlar", icon: Megaphone },
    { title: "Alarmlar", url: "/alarmlar", icon: Bell },
  ]

  return (
    <div className="hidden md:flex items-center gap-1">
      {quickItems.map((item) => (
        <TabLink
          key={item.url}
          href={item.url}
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
          {item.url === "/alarmlar" && bildirimler?.unreadCount ? (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {bildirimler.unreadCount > 9 ? "9+" : bildirimler.unreadCount}
            </Badge>
          ) : null}
        </TabLink>
      ))}

      {/* More dropdown for less used items */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <span>Diğer</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <TabLink href="/numaralar" className="flex items-center gap-2 w-full cursor-pointer">
              <Phone className="h-4 w-4" />
              <span>Numaralar</span>
            </TabLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TabLink href="/araclar" className="flex items-center gap-2 w-full cursor-pointer">
              <Car className="h-4 w-4" />
              <span>Araçlar</span>
            </TabLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TabLink href="/operasyonlar" className="flex items-center gap-2 w-full cursor-pointer">
              <Workflow className="h-4 w-4" />
              <span>Operasyonlar</span>
            </TabLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <TabLink href="/tanimlamalar" className="flex items-center gap-2 w-full cursor-pointer">
              <ListTree className="h-4 w-4" />
              <span>Tanımlamalar</span>
            </TabLink>
          </DropdownMenuItem>
          {hasAccess(["ADMIN", "YONETICI"]) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <TabLink href="/personel" className="flex items-center gap-2 w-full cursor-pointer">
                  <UserCog className="h-4 w-4" />
                  <span>Personel</span>
                </TabLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <TabLink href="/ayarlar" className="flex items-center gap-2 w-full cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Ayarlar</span>
                </TabLink>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <TabLink href="/loglar" className="flex items-center gap-2 w-full cursor-pointer">
              <Activity className="h-4 w-4" />
              <span>Loglar</span>
            </TabLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
