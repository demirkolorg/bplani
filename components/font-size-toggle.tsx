"use client"

import * as React from "react"
import { Minus, Plus, RotateCcw, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFontSize } from "@/components/providers/font-size-provider"

export function FontSizeToggle() {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Yazı boyutu">
          <Type className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Yazı boyutu ayarla</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Yazı Boyutu</p>
            <p className="text-xs text-muted-foreground">{fontSize}px</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={decreaseFontSize}
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
        >
          <Minus className="mr-2 h-4 w-4" />
          Küçült
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={increaseFontSize}
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Büyüt
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={resetFontSize}
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Varsayılan (16px)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
