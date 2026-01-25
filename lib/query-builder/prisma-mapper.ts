/**
 * Prisma Filter Mapper
 * Converts QueryOutput to Prisma where clause
 */

import type { QueryOutput, Filter, FilterValue } from "./types"

/**
 * Maps a single filter to Prisma where condition
 */
function mapFilterToPrisma(filter: Filter): Record<string, any> {
  const { field, operator, value } = filter

  switch (operator) {
    // Text operators
    case "contains":
      return { [field]: { contains: value as string, mode: "insensitive" } }

    case "doesNotContain":
      return { [field]: { not: { contains: value as string, mode: "insensitive" } } }

    case "startsWith":
      return { [field]: { startsWith: value as string, mode: "insensitive" } }

    case "endsWith":
      return { [field]: { endsWith: value as string, mode: "insensitive" } }

    case "equals":
      return { [field]: { equals: value } }

    case "notEquals":
      return { [field]: { not: value } }

    case "isEmpty":
      return {
        OR: [
          { [field]: { equals: null } },
          { [field]: { equals: "" } },
        ],
      }

    case "isNotEmpty":
      return {
        AND: [
          { [field]: { not: null } },
          { [field]: { not: "" } },
        ],
      }

    case "inList":
    case "in":
      return { [field]: { in: value as string[] } }

    case "notInList":
    case "notIn":
      return { [field]: { notIn: value as string[] } }

    // Number operators
    case "greaterThan":
      return { [field]: { gt: value as number } }

    case "lessThan":
      return { [field]: { lt: value as number } }

    case "between": {
      const betweenValue = value as { min: number | string; max: number | string }
      return {
        AND: [
          { [field]: { gte: betweenValue.min } },
          { [field]: { lte: betweenValue.max } },
        ],
      }
    }

    // Date operators
    case "before":
      return { [field]: { lt: new Date(value as string) } }

    case "after":
      return { [field]: { gt: new Date(value as string) } }

    default:
      console.warn(`Unknown operator: ${operator}`)
      return {}
  }
}

/**
 * Converts QueryOutput to Prisma where clause
 *
 * @example
 * const query = {
 *   logic: "AND",
 *   filters: [
 *     { field: "name", operator: "contains", value: "John" },
 *     { field: "age", operator: "greaterThan", value: 18 }
 *   ]
 * }
 *
 * const where = queryToPrismaWhere(query)
 * // { AND: [{ name: { contains: "John", mode: "insensitive" } }, { age: { gt: 18 } }] }
 *
 * await prisma.user.findMany({ where })
 */
export function queryToPrismaWhere(query: QueryOutput): Record<string, any> {
  if (!query.filters || query.filters.length === 0) {
    return {}
  }

  const conditions = query.filters.map((filter) => mapFilterToPrisma(filter))

  // If only one filter, return it directly
  if (conditions.length === 1) {
    return conditions[0]
  }

  // Multiple filters: combine with AND or OR
  return {
    [query.logic]: conditions,
  }
}

/**
 * Example usage in API route:
 *
 * ```typescript
 * // app/api/search/route.ts
 * import { queryToPrismaWhere } from "@/lib/query-builder/prisma-mapper"
 * import prisma from "@/lib/prisma"
 *
 * export async function POST(request: Request) {
 *   const query = await request.json() as QueryOutput
 *
 *   const where = queryToPrismaWhere(query)
 *
 *   const results = await prisma.kisi.findMany({
 *     where,
 *     take: 100,
 *     orderBy: { createdAt: "desc" }
 *   })
 *
 *   return Response.json(results)
 * }
 * ```
 */

/**
 * Type-safe wrapper for specific models
 *
 * @example
 * const where = queryToPrismaWhere<Prisma.KisiWhereInput>(query)
 * const results = await prisma.kisi.findMany({ where })
 */
export function queryToPrismaWhereTyped<T = Record<string, any>>(
  query: QueryOutput
): T {
  return queryToPrismaWhere(query) as T
}

/**
 * Utility: Get pagination params from query
 */
export interface PaginationParams {
  skip: number
  take: number
  page: number
  pageSize: number
}

export function getPaginationParams(
  page: number = 1,
  pageSize: number = 20
): PaginationParams {
  const skip = (page - 1) * pageSize
  return {
    skip,
    take: pageSize,
    page,
    pageSize,
  }
}

/**
 * Utility: Execute query with pagination
 *
 * @example
 * const { data, pagination } = await executeQuery(
 *   prisma.kisi,
 *   query,
 *   { page: 1, pageSize: 20 }
 * )
 */
export async function executeQueryWithPagination<T>(
  model: any,
  query: QueryOutput,
  options: { page?: number; pageSize?: number; orderBy?: any } = {}
): Promise<{
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}> {
  const { page = 1, pageSize = 20, orderBy } = options

  const where = queryToPrismaWhere(query)
  const pagination = getPaginationParams(page, pageSize)

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: orderBy || { createdAt: "desc" },
    }),
    model.count({ where }),
  ])

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}
