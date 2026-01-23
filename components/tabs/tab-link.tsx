"use client"

import * as React from "react"
import { useTabs } from "@/components/providers/tab-provider"

interface TabLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function TabLink({ href, children, onClick, ...props }: TabLinkProps) {
  const { openTab } = useTabs()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Ctrl/Cmd + click = background'da aç
    const isCtrlClick = e.ctrlKey || e.metaKey

    e.preventDefault()
    openTab(href, { background: isCtrlClick })

    // Original onClick varsa çağır
    onClick?.(e)
  }

  const handleAuxClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Middle mouse button = background'da aç
    if (e.button === 1) {
      e.preventDefault()
      openTab(href, { background: true })
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      {...props}
    >
      {children}
    </a>
  )
}
