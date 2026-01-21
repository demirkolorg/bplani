"use client"

import {
  BadgeCheck,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/providers/auth-provider"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

export function NavUser() {
  const { user, isLoading } = useUser()
  const { logout } = useAuth()

  const fullName = user ? `${user.ad} ${user.soyad}` : "Kullanıcı"
  const initials = user ? `${user.ad[0]}${user.soyad[0]}` : "?"
  const rolLabel = user?.rol === "ADMIN" ? "Yönetici" : user?.rol === "YONETICI" ? "Yönetici" : "Personel"

  if (isLoading) {
    return (
      <Button variant="ghost" className="gap-2" disabled>
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="hidden h-4 w-20 sm:block" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Avatar className="size-8">
            <AvatarImage src={user?.fotograf || undefined} alt={fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">{fullName}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8">
              <AvatarImage src={user?.fotograf || undefined} alt={fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{fullName}</span>
              <span className="truncate text-xs text-muted-foreground">{rolLabel}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck className="mr-2 size-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 size-4" />
            Hesap Ayarları
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 size-4" />
            Bildirimler
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
