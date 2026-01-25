"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  ColumnType,
  FilterOperator,
  FilterValue,
  SelectOption,
} from "@/lib/query-builder/types"
import {
  operatorNeedsValue,
  operatorNeedsBulkInput,
  operatorNeedsBetweenInput,
  operatorNeedsMultiSelect,
  parseBulkInput,
} from "@/lib/query-builder/types"

interface FilterValueInputProps {
  columnType: ColumnType
  operator: FilterOperator
  value: FilterValue
  onChange: (value: FilterValue) => void
  options?: SelectOption[]
  placeholder?: string
}

export function FilterValueInput({
  columnType,
  operator,
  value,
  onChange,
  options = [],
  placeholder = "Değer girin...",
}: FilterValueInputProps) {
  const [bulkText, setBulkText] = React.useState("")
  const [bulkOpen, setBulkOpen] = React.useState(false)

  // No input needed for isEmpty/isNotEmpty
  if (!operatorNeedsValue(operator)) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        Değer gerekmiyor
      </div>
    )
  }

  // Bulk input (textarea for inList/notInList)
  if (operatorNeedsBulkInput(operator)) {
    const currentList = Array.isArray(value) ? value : []

    return (
      <div className="flex-1">
        <Popover open={bulkOpen} onOpenChange={setBulkOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {currentList.length > 0 ? (
                <Badge variant="secondary">
                  {currentList.length} değer seçildi
                </Badge>
              ) : (
                <span className="text-muted-foreground">
                  Toplu değer yapıştır...
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <div className="p-4 space-y-4">
              <div>
                <Label>Toplu Değer Girişi</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Her satıra bir değer yazın veya Excel'den kopyalayıp yapıştırın
                </p>
              </div>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Değer1&#10;Değer2&#10;Değer3..."
                rows={10}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {parseBulkInput(bulkText).length} benzersiz değer
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBulkText("")
                      onChange([])
                      setBulkOpen(false)
                    }}
                  >
                    Temizle
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const parsed = parseBulkInput(bulkText)
                      onChange(parsed)
                      setBulkOpen(false)
                    }}
                  >
                    Uygula
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {currentList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {currentList.slice(0, 5).map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
            {currentList.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{currentList.length - 5} daha
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  // Between input (min/max)
  if (operatorNeedsBetweenInput(operator)) {
    const betweenValue =
      value && typeof value === "object" && "min" in value
        ? value
        : { min: "", max: "" }

    return (
      <div className="flex-1 flex gap-2">
        <Input
          type={columnType === "number" ? "number" : columnType === "date" ? "date" : "text"}
          placeholder="Min"
          value={betweenValue.min}
          onChange={(e) =>
            onChange({
              min: e.target.value,
              max: betweenValue.max,
            })
          }
        />
        <span className="text-muted-foreground self-center">-</span>
        <Input
          type={columnType === "number" ? "number" : columnType === "date" ? "date" : "text"}
          placeholder="Max"
          value={betweenValue.max}
          onChange={(e) =>
            onChange({
              min: betweenValue.min,
              max: e.target.value,
            })
          }
        />
      </div>
    )
  }

  // Multi-select (for select type with in/notIn operators)
  if (operatorNeedsMultiSelect(operator) && columnType === "select") {
    const selectedValues = Array.isArray(value) ? value : []
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {selectedValues.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedValues.slice(0, 2).map((val) => {
                    const option = options.find((o) => o.value === val)
                    return (
                      <Badge key={val} variant="secondary" className="text-xs">
                        {option?.label || val}
                      </Badge>
                    )
                  })}
                  {selectedValues.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedValues.length - 2}
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">Seçim yapın...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Ara..." />
              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        const newValues = isSelected
                          ? selectedValues.filter((v) => v !== option.value)
                          : [...selectedValues, option.value]
                        onChange(newValues)
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Single select (for select type with equals/notEquals)
  if (columnType === "select" && ["equals", "notEquals"].includes(operator)) {
    const selectedValue = typeof value === "string" ? value : ""
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {selectedValue ? (
                <span>
                  {options.find((o) => o.value === selectedValue)?.label || selectedValue}
                </span>
              ) : (
                <span className="text-muted-foreground">Seçim yapın...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Ara..." />
              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Standard input (text, number, date)
  return (
    <Input
      type={columnType === "number" ? "number" : columnType === "date" ? "date" : "text"}
      placeholder={placeholder}
      value={typeof value === "string" || typeof value === "number" ? value : ""}
      onChange={(e) => {
        const newValue =
          columnType === "number" && e.target.value
            ? Number(e.target.value)
            : e.target.value
        onChange(newValue)
      }}
      className="flex-1"
    />
  )
}
