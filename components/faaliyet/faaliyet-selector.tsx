"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Briefcase, Folder, X, Search } from "lucide-react"
import { useFaaliyetAlaniTree, type FaaliyetAlani } from "@/hooks/use-faaliyet-alani"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FaaliyetSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
  maxDisplay?: number
}

// Flatten tree with hierarchy info for display
interface FlatItem {
  id: string
  ad: string
  level: number
  hasChildren: boolean
  parentPath: string[] // Parent names for search
  fullPath: string // Full path string for display
}

function flattenTreeWithPath(
  items: FaaliyetAlani[],
  level = 0,
  parentPath: string[] = []
): FlatItem[] {
  const result: FlatItem[] = []
  for (const item of items) {
    const currentPath = [...parentPath, item.ad]
    result.push({
      id: item.id,
      ad: item.ad,
      level,
      hasChildren: !!(item.children && item.children.length > 0),
      parentPath,
      fullPath: currentPath.join(" > "),
    })
    if (item.children?.length) {
      result.push(...flattenTreeWithPath(item.children, level + 1, currentPath))
    }
  }
  return result
}

export function FaaliyetSelector({
  value,
  onChange,
  disabled,
  placeholder,
  maxDisplay = 3,
}: FaaliyetSelectorProps) {
  const { t } = useLocale()
  const defaultPlaceholder = placeholder || t.faaliyet.selectFaaliyetAlani
  const { data: tree = [], isLoading } = useFaaliyetAlaniTree()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Flatten tree for combobox display
  const flatItems = React.useMemo(() => flattenTreeWithPath(tree), [tree])

  // Build map for quick lookups
  const itemMap = React.useMemo(() => {
    const map = new Map<string, FlatItem>()
    for (const item of flatItems) {
      map.set(item.id, item)
    }
    return map
  }, [flatItems])

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return flatItems
    const searchLower = search.toLowerCase()
    return flatItems.filter(
      (item) =>
        item.ad.toLowerCase().includes(searchLower) ||
        item.fullPath.toLowerCase().includes(searchLower)
    )
  }, [flatItems, search])

  const selectedIds = React.useMemo(() => new Set(value), [value])

  const handleToggleSelect = (id: string) => {
    const newValue = selectedIds.has(id)
      ? value.filter((v) => v !== id)
      : [...value, id]
    onChange(newValue)
  }

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== id))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  // Get selected items for display
  const selectedItems = value
    .map((id) => itemMap.get(id))
    .filter((item): item is FlatItem => !!item)

  const displayItems = selectedItems.slice(0, maxDisplay)
  const remainingCount = selectedItems.length - maxDisplay

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[2.5rem] h-auto font-normal",
            !value.length && "text-muted-foreground"
          )}
          disabled={disabled || isLoading}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedItems.length > 0 ? (
              <>
                {displayItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="font-normal gap-1"
                  >
                    {item.level > 0 && (
                      <span className="text-muted-foreground text-[10px]">
                        {item.parentPath[item.parentPath.length - 1]} /
                      </span>
                    )}
                    {item.ad}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                      onClick={(e) => handleRemove(item.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleRemove(item.id, e as unknown as React.MouseEvent)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline" className="font-normal">
                    +{remainingCount}
                  </Badge>
                )}
              </>
            ) : (
              <span>{isLoading ? t.common.loading : defaultPlaceholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as unknown as React.MouseEvent)
                  }
                }}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t.faaliyet.searchFaaliyetAlani}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center py-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">{t.common.noResultsFound}</p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id)
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleToggleSelect(item.id)}
                    className="cursor-pointer"
                  >
                    <div
                      className="flex items-center gap-2 flex-1"
                      style={{ paddingLeft: `${item.level * 16}px` }}
                    >
                      {/* Icon */}
                      {item.hasChildren ? (
                        <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-blue-500 shrink-0" />
                      )}

                      {/* Name with hierarchy indicator */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{item.ad}</span>
                        {item.level > 0 && search && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {item.parentPath.join(" > ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Check indicator */}
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>

          {/* Footer with selection count */}
          {value.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>{value.length} alan seçildi</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive hover:text-destructive"
                onClick={() => onChange([])}
              >
                Tümünü Kaldır
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
