"use client"

import * as React from "react"
import { Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FaaliyetAlaniItem {
  id: string
  faaliyetAlani: {
    id: string
    ad: string
    parent?: {
      ad: string
    } | null
  }
}

interface FaaliyetDisplayProps {
  faaliyetAlanlari: FaaliyetAlaniItem[]
  maxDisplay?: number
  size?: "sm" | "default"
  className?: string
}

export function FaaliyetDisplay({
  faaliyetAlanlari,
  maxDisplay = 3,
  size = "default",
  className,
}: FaaliyetDisplayProps) {
  if (!faaliyetAlanlari || faaliyetAlanlari.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">-</span>
    )
  }

  const displayItems = faaliyetAlanlari.slice(0, maxDisplay)
  const remainingItems = faaliyetAlanlari.slice(maxDisplay)
  const hasMore = remainingItems.length > 0

  const badgeSize = size === "sm" ? "text-[10px] px-1.5 py-0" : ""

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayItems.map((item) => (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn("gap-1 cursor-default", badgeSize)}
              >
                <Briefcase className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
                {item.faaliyetAlani.ad}
              </Badge>
            </TooltipTrigger>
            {item.faaliyetAlani.parent && (
              <TooltipContent>
                <p className="text-xs">
                  <span className="text-muted-foreground">Üst: </span>
                  {item.faaliyetAlani.parent.ad}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ))}

      {hasMore && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn("cursor-default", badgeSize)}>
                +{remainingItems.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {remainingItems.map((item) => (
                  <p key={item.id} className="text-xs">
                    {item.faaliyetAlani.ad}
                    {item.faaliyetAlani.parent && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({item.faaliyetAlani.parent.ad})
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// Simple variant for table cells
interface FaaliyetBadgesProps {
  items: Array<{ id: string; ad: string }>
  maxDisplay?: number
}

export function FaaliyetBadges({ items, maxDisplay = 2 }: FaaliyetBadgesProps) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground">-</span>
  }

  const displayItems = items.slice(0, maxDisplay)
  const remaining = items.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-1">
      {displayItems.map((item) => (
        <Badge key={item.id} variant="secondary" className="text-xs">
          {item.ad}
        </Badge>
      ))}
      {remaining > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-default">
                +{remaining}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {items.slice(maxDisplay).map((item) => (
                  <p key={item.id} className="text-xs">{item.ad}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
