"use client"

import { usePathname } from "next/navigation"
import {
  Home,
  Settings,
  Users,
  CalendarClock,
  Megaphone,
  Bell,
  MapPin,
  UserCog,
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
  SidebarRail,
} from "@/components/ui/sidebar"

const mainNavItems = [
  {
    title: "Ana Sayfa",
    url: "/",
    icon: Home,
  },
  {
    title: "Kişiler",
    url: "/musteriler",
    icon: Users,
  },
  {
    title: "Takipler",
    url: "/takipler",
    icon: CalendarClock,
  },
  {
    title: "Tanıtımlar",
    url: "/tanitimlar",
    icon: Megaphone,
  },
  {
    title: "Alarmlar",
    url: "/alarmlar",
    icon: Bell,
  },
  {
    title: "Lokasyonlar",
    url: "/lokasyonlar",
    icon: MapPin,
  },
  {
    title: "Personel",
    url: "/personel",
    icon: UserCog,
  },
  {
    title: "Ayarlar",
    url: "/ayarlar",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BPlanı</span>
                  <span className="truncate text-xs">Kişi Takip</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
