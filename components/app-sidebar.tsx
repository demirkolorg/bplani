"use client"

import { usePathname } from "next/navigation"
import {
  Home,
  Settings,
  Users,
  CalendarClock,
  Megaphone,
  Workflow,
  Bell,
  UserCog,
  Phone,
  Activity,
  ListTree,
  Car,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/components/providers/auth-provider"
import { useBildirimler } from "@/hooks/use-alarmlar"
import type { PersonelRol } from "@prisma/client"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  roles?: PersonelRol[] // Belirtilmezse herkes görür
}

interface NavGroup {
  label: string
  items: NavItem[]
  roles?: PersonelRol[] // Belirtilmezse herkes görür
}

const navGroups: NavGroup[] = [
  {
    label: "Genel",
    items: [
      { title: "Ana Sayfa", url: "/", icon: Home },
    ],
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
    items: [
      { title: "Tanımlamalar", url: "/tanimlamalar", icon: ListTree },
    ],
  },
  {
    label: "Yönetim",
    roles: ["ADMIN", "YONETICI"], // Sadece Admin ve Yönetici görebilir
    items: [
      { title: "Personel", url: "/personel", icon: UserCog },
      { title: "Ayarlar", url: "/ayarlar", icon: Settings },
    ],
  },
  {
    label: "Sistem",
    items: [
      { title: "Loglar", url: "/loglar", icon: Activity },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()
  const { data: bildirimler } = useBildirimler()

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

  // Rol kontrolü
  const hasAccess = (roles?: PersonelRol[]) => {
    if (!roles || roles.length === 0) return true // Rol belirtilmemişse herkes erişebilir
    if (!user) return false // Kullanıcı yoksa erişim yok
    return roles.includes(user.rol)
  }

  // Görünür grupları filtrele
  const visibleGroups = navGroups
    .filter((group) => hasAccess(group.roles))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAccess(item.roles)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-lg font-bold">A</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ALTAY</span>
                  <span className="truncate text-xs">Analiz Takip Yönetimi</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.url === "/alarmlar" && bildirimler?.unreadCount ? (
                      <SidebarMenuBadge className="bg-destructive text-white">
                        {bildirimler.unreadCount}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
