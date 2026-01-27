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
  Search,
  BellRing,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TabLink } from "@/components/tabs/tab-link"
import { useUser } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { useBildirimler } from "@/hooks/use-alarmlar"
import type { PersonelRol } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import type { NavigationTranslations, SidebarTranslations } from "@/types/locale"

interface NavItem {
  titleKey: keyof NavigationTranslations
  url: string
  icon: LucideIcon
  roles?: PersonelRol[]
}

interface NavGroup {
  labelKey: keyof SidebarTranslations
  items: NavItem[]
  roles?: PersonelRol[]
}

const navGroups: NavGroup[] = [
  {
    labelKey: "general",
    items: [{ titleKey: "home", url: "/", icon: Home }],
  },
  {
    labelKey: "records",
    items: [
      { titleKey: "kisiler", url: "/kisiler", icon: Users },
      { titleKey: "numaralar", url: "/numaralar", icon: Phone },
      { titleKey: "araclar", url: "/araclar", icon: Car },
      { titleKey: "advancedSearch", url: "/advanced-search", icon: Search },
    ],
  },
  {
    labelKey: "activities",
    items: [
      { titleKey: "takipler", url: "/takipler", icon: CalendarClock },
      { titleKey: "tanitimlar", url: "/tanitimlar", icon: Megaphone },
      { titleKey: "operasyonlar", url: "/operasyonlar", icon: Workflow },
      { titleKey: "alarmlar", url: "/alarmlar", icon: Bell },
    ],
  },
  {
    labelKey: "definitions",
    items: [{ titleKey: "tanimlamalar", url: "/tanimlamalar", icon: ListTree }],
  },
  {
    labelKey: "management",
    roles: ["ADMIN", "YONETICI"],
    items: [
      { titleKey: "personel", url: "/personel", icon: UserCog },
      { titleKey: "ayarlar", url: "/ayarlar", icon: Settings },
      { titleKey: "duyurular", url: "/duyurular", icon: BellRing },
    ],
  },
  {
    labelKey: "system",
    items: [{ titleKey: "loglar", url: "/loglar", icon: Activity }],
  },
]

export function HeaderNavMenu() {
  const { user } = useUser()
  const { t } = useLocale()
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
          <span className="hidden sm:inline">{t.sidebar.menu}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {visibleGroups.map((group, groupIndex) => (
          <React.Fragment key={group.labelKey}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.items.map((item) => (
              <DropdownMenuItem key={item.url} asChild>
                <TabLink href={item.url} className="flex items-center gap-2 w-full cursor-pointer">
                  <item.icon className="h-4 w-4" />
                  <span>{t.navigation[item.titleKey]}</span>
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
  const { t } = useLocale()
  const { data: bildirimler } = useBildirimler()

  const hasAccess = (roles?: PersonelRol[]) => {
    if (!roles || roles.length === 0) return true
    if (!user) return false
    return roles.includes(user.rol)
  }

  // Flat list of quick access items
  const quickItems: NavItem[] = [
    { titleKey: "kisiler", url: "/kisiler", icon: Users },
    { titleKey: "takipler", url: "/takipler", icon: CalendarClock },
    { titleKey: "tanitimlar", url: "/tanitimlar", icon: Megaphone },
    { titleKey: "operasyonlar", url: "/operasyonlar", icon: Workflow },
    { titleKey: "advancedSearch", url: "/advanced-search", icon: Search },
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
          <span>{t.navigation[item.titleKey]}</span>
        </TabLink>
      ))}

      {/* More dropdown for less used items */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <span>{t.sidebar.other}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <TabLink href="/numaralar" className="flex items-center gap-2 w-full cursor-pointer">
              <Phone className="h-4 w-4" />
              <span>{t.navigation.numaralar}</span>
            </TabLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TabLink href="/araclar" className="flex items-center gap-2 w-full cursor-pointer">
              <Car className="h-4 w-4" />
              <span>{t.navigation.araclar}</span>
            </TabLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <TabLink href="/alarmlar" className="flex items-center gap-2 w-full cursor-pointer">
              <Bell className="h-4 w-4" />
              <span>{t.navigation.alarmlar}</span>
              {bildirimler?.unreadCount ? (
                <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                  {bildirimler.unreadCount}
                </Badge>
              ) : null}
            </TabLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <TabLink href="/tanimlamalar" className="flex items-center gap-2 w-full cursor-pointer">
              <ListTree className="h-4 w-4" />
              <span>{t.navigation.tanimlamalar}</span>
            </TabLink>
          </DropdownMenuItem>
          {hasAccess(["ADMIN", "YONETICI"]) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <TabLink href="/personel" className="flex items-center gap-2 w-full cursor-pointer">
                  <UserCog className="h-4 w-4" />
                  <span>{t.navigation.personel}</span>
                </TabLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <TabLink href="/duyurular" className="flex items-center gap-2 w-full cursor-pointer">
                  <BellRing className="h-4 w-4" />
                  <span>{t.navigation.duyurular}</span>
                </TabLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <TabLink href="/ayarlar" className="flex items-center gap-2 w-full cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>{t.navigation.ayarlar}</span>
                </TabLink>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <TabLink href="/loglar" className="flex items-center gap-2 w-full cursor-pointer">
              <Activity className="h-4 w-4" />
              <span>{t.navigation.loglar}</span>
            </TabLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
