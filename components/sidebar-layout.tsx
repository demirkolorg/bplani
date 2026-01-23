"use client"

import * as React from "react"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavUser } from "@/components/nav-user"
import { AlarmBell } from "@/components/alarm-bell"

const SIDEBAR_STORAGE_KEY = "sidebar_open"

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored !== null) {
      setOpen(stored === "true")
    }
    setMounted(true)
  }, [])

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value))
  }

  if (!mounted) {
    return null
  }

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="font-medium">ALTAY</span>
          <div className="ml-auto flex items-center gap-2">
            <AlarmBell />
            <ThemeToggle />
            <NavUser />
          </div>
        </header>
        <main className="flex-1 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
