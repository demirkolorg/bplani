# Advanced Query Builder

Type-aware, bulk-paste supported query builder for Next.js with Prisma integration.

## Features

- ✅ **Type-Aware Filtering**: Different operators for Text, Number, Select, and Date columns
- ✅ **Bulk Paste Support**: Copy-paste 100+ values from Excel/Notepad
- ✅ **Dynamic UI**: Input changes based on selected operator
- ✅ **POST Body**: Avoid URL length limits by using JSON payload
- ✅ **Prisma Integration**: Direct conversion to Prisma where clause
- ✅ **TypeScript**: Fully type-safe
- ✅ **Shadcn/UI**: Beautiful, accessible components

## Installation

This package is already integrated into your project. All files are in:
- `lib/query-builder/` - Core logic and types
- `components/query-builder/` - React components

## Quick Start

### 1. Define Your Columns

```typescript
import { ColumnConfig } from "@/lib/query-builder"

const columns: ColumnConfig[] = [
  {
    field: "name",
    label: "Customer Name",
    type: "text",
    operators: ["contains", "startsWith", "equals", "inList"],
    placeholder: "Enter name...",
  },
  {
    field: "age",
    label: "Age",
    type: "number",
    operators: ["equals", "greaterThan", "lessThan", "between"],
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    operators: ["equals", "in"],
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    field: "createdAt",
    label: "Registration Date",
    type: "date",
    operators: ["before", "after", "between"],
  },
]
```

### 2. Use QueryBuilder Component

```typescript
"use client"

import { QueryBuilder, type QueryOutput } from "@/lib/query-builder"

export default function SearchPage() {
  const handleSearch = async (query: QueryOutput) => {
    const response = await fetch("/api/advanced-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })

    const results = await response.json()
    console.log(results)
  }

  return (
    <QueryBuilder
      columns={columns}
      onSubmit={handleSearch}
      title="Advanced Search"
      description="Define your search criteria"
    />
  )
}
```

### 3. Create API Endpoint

```typescript
// app/api/advanced-search/route.ts
import { NextRequest, NextResponse } from "next/server"
import { queryToPrismaWhere, type QueryOutput } from "@/lib/query-builder"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const query = await request.json() as QueryOutput

  // Convert to Prisma where clause
  const where = queryToPrismaWhere(query)

  // Execute query
  const results = await prisma.user.findMany({
    where,
    take: 100,
  })

  return NextResponse.json(results)
}
```

## Column Types & Operators

### Text
**Operators**: `contains`, `doesNotContain`, `startsWith`, `endsWith`, `equals`, `notEquals`, `isEmpty`, `isNotEmpty`, `inList`, `notInList`

**Special Feature**: `inList` and `notInList` show a bulk paste textarea where users can paste 100+ values from Excel.

### Number
**Operators**: `equals`, `notEquals`, `greaterThan`, `lessThan`, `between`, `inList`, `notInList`

**Special Feature**: `between` shows two inputs (Min and Max).

### Select
**Operators**: `equals`, `notEquals`, `in`, `notIn`

**Special Feature**: `in` and `notIn` show a multi-select dropdown with checkboxes.

### Date
**Operators**: `before`, `after`, `between`, `equals`

**Special Feature**: `between` shows two date pickers (Start and End).

## Bulk Paste Feature

When using `inList` or `notInList` operators:

1. A button appears: "Toplu değer yapıştır..."
2. Click it to open a textarea
3. Paste values from Excel (separated by newlines, commas, or semicolons)
4. Parser automatically splits and deduplicates
5. Shows badge: "25 değer seçildi"

**Example Input**:
```
11122233344
55566677788
99988877766
```

**Parsed Output**: `["11122233344", "55566677788", "99988877766"]`

## Query Output Format

```typescript
interface QueryOutput {
  logic: "AND" | "OR"
  filters: [
    {
      field: "name",
      operator: "contains",
      value: "John"
    },
    {
      field: "tc",
      operator: "inList",
      value: ["11122233344", "55566677788"] // Bulk input
    },
    {
      field: "age",
      operator: "between",
      value: { min: 18, max: 65 }
    },
    {
      field: "status",
      operator: "in",
      value: ["active", "pending"] // Multi-select
    }
  ]
}
```

## Prisma Mapping Examples

### Text Operators

```typescript
// contains
{ name: { contains: "John", mode: "insensitive" } }

// inList (Bulk)
{ tc: { in: ["11122233344", "55566677788", ...] } }

// isEmpty
{ OR: [{ email: { equals: null } }, { email: { equals: "" } }] }
```

### Number Operators

```typescript
// between
{ AND: [{ age: { gte: 18 } }, { age: { lte: 65 } }] }

// greaterThan
{ price: { gt: 100 } }
```

### Select Operators

```typescript
// in (Multi-select)
{ status: { in: ["active", "pending"] } }
```

### Date Operators

```typescript
// between
{ AND: [
  { createdAt: { gte: new Date("2024-01-01") } },
  { createdAt: { lte: new Date("2024-12-31") } }
] }
```

## Advanced Usage

### With Pagination

```typescript
import { executeQueryWithPagination } from "@/lib/query-builder"

const result = await executeQueryWithPagination(
  prisma.user,
  query,
  {
    page: 1,
    pageSize: 20,
    orderBy: { createdAt: "desc" }
  }
)

console.log(result.data) // Users
console.log(result.pagination) // { page, pageSize, total, totalPages }
```

### Type-Safe Prisma Where

```typescript
import { Prisma } from "@prisma/client"
import { queryToPrismaWhereTyped } from "@/lib/query-builder"

const where = queryToPrismaWhereTyped<Prisma.UserWhereInput>(query)
const users = await prisma.user.findMany({ where })
```

### Custom Operator Labels

Edit `lib/query-builder/types.ts`:

```typescript
export const operatorLabels: Record<FilterOperator, string> = {
  contains: "Contains (Custom Label)",
  // ... your labels
}
```

## Components API

### QueryBuilder

```typescript
interface QueryBuilderProps {
  columns: ColumnConfig[]
  onSubmit: (query: QueryOutput) => void
  initialFilters?: Filter[]
  initialLogic?: "AND" | "OR"
  title?: string
  description?: string
  submitLabel?: string
}
```

### FilterRow

```typescript
interface FilterRowProps {
  filter: Filter
  columns: ColumnConfig[]
  onChange: (filter: Filter) => void
  onRemove: () => void
  canRemove: boolean
}
```

### FilterValueInput

```typescript
interface FilterValueInputProps {
  columnType: ColumnType
  operator: FilterOperator
  value: FilterValue
  onChange: (value: FilterValue) => void
  options?: SelectOption[]
  placeholder?: string
}
```

## Troubleshooting

### URL Too Long Error

✅ This is why we use POST body! All query parameters are sent in the request body, not in the URL.

### Parser Not Working

Make sure your bulk input uses one of these delimiters:
- Newlines (`\n`)
- Commas (`,`)
- Semicolons (`;`)

The parser automatically handles all three.

### Prisma Type Error

Make sure your Prisma schema fields match the `field` names in your column configuration.

## Examples

See `app/(dashboard)/advanced-search/page.tsx` for a complete working example.

## License

MIT

## Support

For issues, please open a ticket in your project repository.
