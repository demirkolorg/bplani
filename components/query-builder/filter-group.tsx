"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Layers, X } from "lucide-react"
import { FilterRow } from "./filter-row"
import { CombinatorToggle } from "./combinator-toggle"
import { useLocale } from "@/components/providers/locale-provider"
import type { FilterGroup as FilterGroupType, FilterRule, ColumnConfig } from "@/lib/query-builder/types"
import { nanoid } from "nanoid"

interface FilterGroupProps {
  group: FilterGroupType
  columns: ColumnConfig[]
  level: number
  onUpdate: (group: FilterGroupType) => void
  onDelete?: () => void
}

export function FilterGroup({
  group,
  columns,
  level,
  onUpdate,
  onDelete,
}: FilterGroupProps) {
  const { t } = useLocale()

  // Add new rule
  const handleAddRule = () => {
    if (columns.length === 0) return

    const newRule: FilterRule = {
      id: nanoid(),
      field: columns[0].field,
      operator: columns[0].operators[0],
      value: null,
    }

    onUpdate({
      ...group,
      rules: [...group.rules, newRule],
    })
  }

  // Add new group
  const handleAddGroup = () => {
    const newGroup: FilterGroupType = {
      id: nanoid(),
      combinator: "AND",
      rules: [],
      groups: [],
    }

    onUpdate({
      ...group,
      groups: [...group.groups, newGroup],
    })
  }

  // Update rule
  const handleUpdateRule = (index: number, rule: FilterRule) => {
    const newRules = [...group.rules]
    newRules[index] = rule
    onUpdate({
      ...group,
      rules: newRules,
    })
  }

  // Delete rule
  const handleDeleteRule = (index: number) => {
    onUpdate({
      ...group,
      rules: group.rules.filter((_, i) => i !== index),
    })
  }

  // Update nested group
  const handleUpdateGroup = (index: number, updatedGroup: FilterGroupType) => {
    const newGroups = [...group.groups]
    newGroups[index] = updatedGroup
    onUpdate({
      ...group,
      groups: newGroups,
    })
  }

  // Delete nested group
  const handleDeleteGroup = (index: number) => {
    onUpdate({
      ...group,
      groups: group.groups.filter((_, i) => i !== index),
    })
  }

  // Update combinator
  const handleCombinatorChange = (combinator: "AND" | "OR") => {
    onUpdate({
      ...group,
      combinator,
    })
  }

  // Calculate background color based on level
  const bgColor = level % 2 === 0 ? "bg-muted/20" : "bg-background"
  const borderColor = level % 2 === 0 ? "border-muted" : "border-border"

  // Check if group has any content
  const hasContent = group.rules.length > 0 || group.groups.length > 0

  return (
    <Card
      className={`relative ${bgColor} ${borderColor}`}
      style={{
        paddingLeft: `${level * 16}px`,
        borderLeftWidth: level > 0 ? '3px' : '1px'
      }}
    >
      <div className="p-4 space-y-3">
        {/* Header: Combinator + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CombinatorToggle
              value={group.combinator}
              onChange={handleCombinatorChange}
            />

            {level > 0 && (
              <span className="text-xs text-muted-foreground">
                (Grup {level})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRule}
              disabled={columns.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.queryBuilder.addFilter}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddGroup}
            >
              <Layers className="h-4 w-4 mr-1" />
              {t.queryBuilder.addGroup}
            </Button>

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                {t.queryBuilder.removeGroup}
              </Button>
            )}
          </div>
        </div>

        {/* Rules */}
        {group.rules.map((rule, index) => (
          <FilterRow
            key={rule.id}
            filter={rule}
            columns={columns}
            onChange={(newRule) => handleUpdateRule(index, newRule as FilterRule)}
            onRemove={() => handleDeleteRule(index)}
            canRemove={hasContent && (group.rules.length > 1 || group.groups.length > 0)}
          />
        ))}

        {/* Nested Groups - RECURSIVE */}
        {group.groups.map((subGroup, index) => (
          <FilterGroup
            key={subGroup.id}
            group={subGroup}
            columns={columns}
            level={level + 1}
            onUpdate={(updatedGroup) => handleUpdateGroup(index, updatedGroup)}
            onDelete={() => handleDeleteGroup(index)}
          />
        ))}

        {/* Empty state */}
        {!hasContent && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Bu grupta henüz filtre yok. Yukarıdaki butonları kullanarak filtre veya grup ekleyin.
          </div>
        )}
      </div>
    </Card>
  )
}
