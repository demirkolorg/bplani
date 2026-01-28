"use client"

import * as React from "react"
import { Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface HeaderFilterValue {
  value: any
  label: string
  count?: number
}

interface HeaderFilterPopupProps {
  /** Trigger button */
  trigger: React.ReactNode
  /** Available filter values */
  values: HeaderFilterValue[]
  /** Currently selected values */
  selectedValues: any[]
  /** Callback when Apply is clicked */
  onApply: (selectedValues: any[]) => void
  /** Callback when Cancel is clicked */
  onCancel?: () => void
  /** Filter popup title */
  title?: string
  /** Search placeholder */
  searchPlaceholder?: string
  /** Show "(Blanks)" option */
  showBlanks?: boolean
  /** Labels */
  labels?: {
    selectAll: string
    blanks: string
    apply: string
    cancel: string
    noResults: string
  }
}

export function HeaderFilterPopup({
  trigger,
  values,
  selectedValues: initialSelectedValues,
  onApply,
  onCancel,
  title = "Filter Values",
  searchPlaceholder = "Enter text to search...",
  showBlanks = true,
  labels = {
    selectAll: "Select All",
    blanks: "(Blanks)",
    apply: "Apply",
    cancel: "Cancel",
    noResults: "No results",
  },
}: HeaderFilterPopupProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedValues, setSelectedValues] = React.useState<any[]>(initialSelectedValues)

  // Reset selection when popup opens
  React.useEffect(() => {
    if (open) {
      setSelectedValues(initialSelectedValues)
      setSearchTerm("")
    }
  }, [open, initialSelectedValues])

  // Filter values based on search
  const filteredValues = React.useMemo(() => {
    if (!searchTerm) return values

    const term = searchTerm.toLowerCase()
    return values.filter(v =>
      v.label.toLowerCase().includes(term)
    )
  }, [values, searchTerm])

  // Check if all filtered values are selected
  const allSelected = React.useMemo(() => {
    if (filteredValues.length === 0) return false
    return filteredValues.every(v => selectedValues.includes(v.value))
  }, [filteredValues, selectedValues])

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered values
      setSelectedValues(prev =>
        prev.filter(v => !filteredValues.some(fv => fv.value === v))
      )
    } else {
      // Select all filtered values
      const newValues = [...selectedValues]
      filteredValues.forEach(v => {
        if (!newValues.includes(v.value)) {
          newValues.push(v.value)
        }
      })
      setSelectedValues(newValues)
    }
  }

  const handleToggleValue = (value: any) => {
    setSelectedValues(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const handleApply = () => {
    onApply(selectedValues)
    setOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b px-4 py-3">
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Values list */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {/* Select All */}
              <div className="flex items-center space-x-2 px-2 py-2 hover:bg-accent rounded-sm cursor-pointer select-none">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium" onClick={handleSelectAll}>{labels.selectAll}</span>
              </div>

              {/* Blanks option */}
              {showBlanks && (
                <div className="flex items-center space-x-2 px-2 py-2 hover:bg-accent rounded-sm cursor-pointer select-none">
                  <Checkbox
                    checked={selectedValues.includes(null)}
                    onCheckedChange={() => handleToggleValue(null)}
                  />
                  <span className="text-sm text-muted-foreground italic" onClick={() => handleToggleValue(null)}>{labels.blanks}</span>
                </div>
              )}

              {/* Value items */}
              {filteredValues.length > 0 ? (
                filteredValues.map((item, idx) => {
                  const isChecked = selectedValues.includes(item.value)
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-sm cursor-pointer select-none"
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleValue(item.value)
                      }}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleValue(item.value)}
                        />
                        <span className="text-sm truncate">{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">({item.count})</span>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {labels.noResults}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              {labels.cancel}
            </Button>
            <Button size="sm" onClick={handleApply}>
              {labels.apply}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
