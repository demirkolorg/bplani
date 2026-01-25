"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Search } from "lucide-react"
import { FilterRow } from "./filter-row"
import type { ColumnConfig, Filter, QueryOutput } from "@/lib/query-builder/types"

interface QueryBuilderProps {
  columns: ColumnConfig[]
  onSubmit: (query: QueryOutput) => void
  initialFilters?: Filter[]
  initialLogic?: "AND" | "OR"
  title?: string
  description?: string
  submitLabel?: string
}

export function QueryBuilder({
  columns,
  onSubmit,
  initialFilters = [],
  initialLogic = "AND",
  title = "Gelişmiş Filtreleme",
  description = "Arama kriterlerinizi belirleyin",
  submitLabel = "Sonuçları Göster",
}: QueryBuilderProps) {
  const [logic, setLogic] = React.useState<"AND" | "OR">(initialLogic)
  const [filters, setFilters] = React.useState<Filter[]>(() => {
    // Initialize with one empty filter if no initial filters
    if (initialFilters.length === 0 && columns.length > 0) {
      return [
        {
          field: columns[0].field,
          operator: columns[0].operators[0],
          value: null,
        },
      ]
    }
    return initialFilters
  })

  // Add new filter
  const handleAddFilter = () => {
    if (columns.length === 0) return

    const newFilter: Filter = {
      field: columns[0].field,
      operator: columns[0].operators[0],
      value: null,
    }
    setFilters([...filters, newFilter])
  }

  // Update filter
  const handleUpdateFilter = (index: number, filter: Filter) => {
    const newFilters = [...filters]
    newFilters[index] = filter
    setFilters(newFilters)
  }

  // Remove filter
  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  // Handle submit
  const handleSubmit = () => {
    // Filter out empty/invalid filters
    const validFilters = filters.filter((filter) => {
      // Check if operator needs value
      const needsValue = ![" isEmpty", "isNotEmpty"].includes(filter.operator)
      if (!needsValue) return true

      // Check if value is provided
      if (filter.value === null || filter.value === undefined || filter.value === "") {
        return false
      }

      // Check array values
      if (Array.isArray(filter.value) && filter.value.length === 0) {
        return false
      }

      // Check between values
      if (
        typeof filter.value === "object" &&
        "min" in filter.value &&
        "max" in filter.value
      ) {
        return filter.value.min !== "" && filter.value.max !== ""
      }

      return true
    })

    const output: QueryOutput = {
      logic,
      filters: validFilters,
    }

    onSubmit(output)
  }

  // Count valid filters
  const validFilterCount = filters.filter((filter) => {
    const needsValue = !["isEmpty", "isNotEmpty"].includes(filter.operator)
    if (!needsValue) return true
    if (filter.value === null || filter.value === undefined || filter.value === "") {
      return false
    }
    if (Array.isArray(filter.value) && filter.value.length === 0) {
      return false
    }
    return true
  }).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logic Selector */}
        <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
          <Label className="text-sm font-medium">Mantık:</Label>
          <RadioGroup
            value={logic}
            onValueChange={(value) => setLogic(value as "AND" | "OR")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="AND" id="and" />
              <Label htmlFor="and" className="font-normal cursor-pointer">
                VE (Tüm koşullar)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OR" id="or" />
              <Label htmlFor="or" className="font-normal cursor-pointer">
                VEYA (Herhangi biri)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <FilterRow
              key={index}
              filter={filter}
              columns={columns}
              onChange={(newFilter) => handleUpdateFilter(index, newFilter)}
              onRemove={() => handleRemoveFilter(index)}
              canRemove={filters.length > 1}
            />
          ))}
        </div>

        {/* Add Filter Button */}
        <Button
          variant="outline"
          onClick={handleAddFilter}
          className="w-full"
          disabled={columns.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Filtre Ekle
        </Button>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {validFilterCount > 0 ? (
              <span>
                {validFilterCount} aktif filtre
              </span>
            ) : (
              <span>En az bir filtre ekleyin</span>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={validFilterCount === 0}
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
