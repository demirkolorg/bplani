"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, EyeOff, X } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ColumnHeaderMenuProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  enableSorting?: boolean
  className?: string
  children?: React.ReactNode
}

export function ColumnHeaderMenu<TData, TValue>({
  column,
  title,
  enableSorting = false,
  className,
  children,
}: ColumnHeaderMenuProps<TData, TValue>) {
  const isSorted = column.getIsSorted()

  const handleClick = () => {
    if (enableSorting) {
      column.toggleSorting(isSorted === "asc")
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {enableSorting ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
          >
            {children && <span className="mr-2">{children}</span>}
            {title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2 py-2 cursor-context-menu select-none",
              className
            )}
          >
            {children}
            {title}
          </div>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[200px]">
        <ContextMenuItem
          onClick={() => column.toggleVisibility(false)}
          className="gap-2"
        >
          <EyeOff className="h-4 w-4" />
          Sütunu Gizle
        </ContextMenuItem>
        {enableSorting && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => column.toggleSorting(false)}
              disabled={isSorted === "asc"}
              className="gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Sırala (Artan)
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => column.toggleSorting(true)}
              disabled={isSorted === "desc"}
              className="gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Sırala (Azalan)
            </ContextMenuItem>
            {isSorted && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => column.clearSorting()}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <X className="h-4 w-4" />
                  Sıralamayı Temizle
                </ContextMenuItem>
              </>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
