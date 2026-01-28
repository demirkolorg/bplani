"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Search, Trash2 } from "lucide-react"
import { FilterRow } from "./filter-row"
import { FilterGroup } from "./filter-group"
import { mapFilterGroupToPrisma } from "@/lib/query-builder/prisma-mapper"
import { useLocale } from "@/components/providers/locale-provider"
import type { ColumnConfig, Filter, QueryOutput, FilterGroup as FilterGroupType, FilterRule } from "@/lib/query-builder/types"
import { nanoid } from "nanoid"

interface QueryBuilderProps {
  columns: ColumnConfig[]
  onSubmit: (query: QueryOutput) => void
  onSubmitGroup?: (where: Record<string, any>) => void // New: direct Prisma where clause
  initialFilters?: Filter[]
  initialLogic?: "AND" | "OR"
  initialGroup?: FilterGroupType // New: for nested groups
  title?: string
  description?: string
  submitLabel?: string
  useNestedGroups?: boolean // New: enable nested group UI
}

export function QueryBuilder({
  columns,
  onSubmit,
  onSubmitGroup,
  initialFilters = [],
  initialLogic = "AND",
  initialGroup,
  title = "Gelişmiş Filtreleme",
  description = "Arama kriterlerinizi belirleyin",
  submitLabel = "Sonuçları Göster",
  useNestedGroups = false,
}: QueryBuilderProps) {
  const { t } = useLocale()

  // State for nested groups
  const [rootGroup, setRootGroup] = React.useState<FilterGroupType>(() => {
    if (initialGroup) {
      return initialGroup
    }

    // Convert initial flat filters to group structure if using nested groups
    if (useNestedGroups) {
      const rules: FilterRule[] = initialFilters.map(filter => ({
        ...filter,
        id: "id" in filter ? filter.id : nanoid(),
      }))

      return {
        id: nanoid(),
        combinator: initialLogic,
        rules,
        groups: [],
      }
    }

    // Default empty group
    return {
      id: nanoid(),
      combinator: initialLogic,
      rules: [],
      groups: [],
    }
  })

  // Legacy state for flat filters (backwards compatibility)
  const [logic, setLogic] = React.useState<"AND" | "OR">(initialLogic)
  const [filters, setFilters] = React.useState<Filter[]>(() => {
    // Initialize with one empty filter if no initial filters
    if (initialFilters.length === 0 && columns.length > 0) {
      return [
        {
          id: nanoid(),
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
      id: nanoid(),
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

  // Validate rule (check if it has valid value)
  const isRuleValid = (rule: FilterRule): boolean => {
    const needsValue = !["isEmpty", "isNotEmpty"].includes(rule.operator)
    if (!needsValue) return true

    if (rule.value === null || rule.value === undefined || rule.value === "") {
      return false
    }

    if (Array.isArray(rule.value) && rule.value.length === 0) {
      return false
    }

    if (
      typeof rule.value === "object" &&
      "min" in rule.value &&
      "max" in rule.value
    ) {
      return rule.value.min !== "" && rule.value.max !== ""
    }

    return true
  }

  // Count valid rules recursively
  const countValidRules = (group: FilterGroupType): number => {
    const validRulesCount = group.rules.filter(isRuleValid).length
    const nestedCount = group.groups.reduce((acc, g) => acc + countValidRules(g), 0)
    return validRulesCount + nestedCount
  }

  // Handle submit for nested groups
  const handleSubmitNested = () => {
    const whereClause = mapFilterGroupToPrisma(rootGroup)

    // Call the new callback if provided
    if (onSubmitGroup) {
      onSubmitGroup(whereClause)
    }

    // For backwards compatibility, also convert to flat structure if old callback exists
    if (onSubmit) {
      const flatFilters = flattenGroupToFilters(rootGroup)
      const output: QueryOutput = {
        logic: rootGroup.combinator,
        filters: flatFilters,
      }
      onSubmit(output)
    }
  }

  // Flatten group to legacy Filter[] format (for backwards compatibility)
  const flattenGroupToFilters = (group: FilterGroupType): Filter[] => {
    const filters: Filter[] = group.rules.filter(isRuleValid).map(rule => ({
      id: rule.id,
      field: rule.field,
      operator: rule.operator,
      value: rule.value,
    }))

    // Add nested groups (simplified - loses nested structure)
    group.groups.forEach(subGroup => {
      filters.push(...flattenGroupToFilters(subGroup))
    })

    return filters
  }

  // Handle submit for flat filters (legacy)
  const handleSubmitFlat = () => {
    // Filter out empty/invalid filters
    const validFilters = filters.filter((filter) => {
      // Check if operator needs value
      const needsValue = !["isEmpty", "isNotEmpty"].includes(filter.operator)
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

  // Clear all filters
  const handleClearAll = () => {
    if (useNestedGroups) {
      setRootGroup({
        id: nanoid(),
        combinator: "AND",
        rules: [],
        groups: [],
      })
    } else {
      setFilters([])
    }
  }

  // Count valid filters
  const validFilterCount = useNestedGroups
    ? countValidRules(rootGroup)
    : filters.filter((filter) => {
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

  // Determine which submit handler to use
  const handleSubmit = useNestedGroups ? handleSubmitNested : handleSubmitFlat

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {(validFilterCount > 0 || (useNestedGroups && rootGroup.groups.length > 0)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t.queryBuilder.clearAll}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {useNestedGroups ? (
          /* Nested Group UI */
          <FilterGroup
            group={rootGroup}
            columns={columns}
            level={0}
            onUpdate={setRootGroup}
          />
        ) : (
          /* Legacy Flat UI */
          <>
            {/* Logic Selector */}
            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
              <Label className="text-sm font-medium">{t.queryBuilder.logic}</Label>
              <RadioGroup
                value={logic}
                onValueChange={(value) => setLogic(value as "AND" | "OR")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AND" id="and" />
                  <Label htmlFor="and" className="font-normal cursor-pointer">
                    {t.queryBuilder.logicAnd}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OR" id="or" />
                  <Label htmlFor="or" className="font-normal cursor-pointer">
                    {t.queryBuilder.logicOr}
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
              {t.queryBuilder.addFilter}
            </Button>
          </>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {validFilterCount > 0 ? (
              <span>
                {t.queryBuilder.activeFilters.replace("{count}", validFilterCount.toString())}
              </span>
            ) : (
              <span>{t.queryBuilder.noFilters}</span>
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
