"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { TabProvider } from "@/components/providers/tab-provider"
import { TabBar, TabContentRenderer } from "@/components/tabs"
import { HeaderNavMenu, HeaderNavBar } from "@/components/header-nav-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleToggle } from "@/components/locale-toggle"
import { NavUser } from "@/components/nav-user"
import { AlarmBell } from "@/components/alarm-bell"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/search/global-search"
import { useLocale } from "@/components/providers/locale-provider"

export function HeaderLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { t } = useLocale()

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <TabProvider>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4">
            <img
              src="/logo.png"
              alt="ALTAY"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold hidden sm:inline">ALTAY</span>
          </div>

          {/* Navigation Menu (Dropdown for mobile) */}
          <div className="md:hidden">
            <HeaderNavMenu />
          </div>

          {/* Navigation Bar (visible on desktop) */}
          <HeaderNavBar />

          {/* Spacer - Left */}
          <div className="flex-1" />

          {/* Centered Search Button */}
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 text-muted-foreground h-9 w-64 lg:w-80 justify-start px-3"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{t.table.searchPlaceholder}</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              Ctrl K
            </kbd>
          </Button>
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Spacer - Right */}
          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <AlarmBell />
            <LocaleToggle />
            <ThemeToggle />
            <NavUser />
          </div>
        </header>

        {/* Tab Bar */}
        <TabBar />

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <TabContentRenderer />
        </main>

        {/* Global Search Dialog */}
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </TabProvider>
  )
}
