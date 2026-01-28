/**
 * Prisma Filter Mapper
 * Converts QueryOutput to Prisma where clause
 * Supports nested filter groups (DevExpress-style)
 */

import type { QueryOutput, Filter, FilterValue, FilterGroup, FilterRule } from "./types"

/**
 * Special field mappings for related tables
 * Maps virtual field names to Prisma relation queries
 */
const RELATED_FIELD_MAPPINGS: Record<string, (operator: string, value: any) => Record<string, any>> = {
  // GSM numarası arama (gsmler ilişkisi)
  "gsm.numara": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "numara")
    return {
      gsmler: {
        some: condition
      }
    }
  },

  // Araç plakası arama (araclar ilişkisi üzerinden)
  "arac.plaka": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "plaka")
    return {
      araclar: {
        some: {
          arac: condition
        }
      }
    }
  },

  // Adres - İl
  "adres.il": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "ad")
    return {
      adresler: {
        some: {
          mahalle: {
            ilce: {
              il: condition
            }
          }
        }
      }
    }
  },

  // Adres - İlçe
  "adres.ilce": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "ad")
    return {
      adresler: {
        some: {
          mahalle: {
            ilce: condition
          }
        }
      }
    }
  },

  // Adres - Mahalle
  "adres.mahalle": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "ad")
    return {
      adresler: {
        some: {
          mahalle: condition
        }
      }
    }
  },

  // Adres - Detay
  "adres.detay": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "detay")
    return {
      adresler: {
        some: condition
      }
    }
  },

  // Not - İçerik
  "not.icerik": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "icerik")
    return {
      notlar: {
        some: condition
      }
    }
  },

  // Faaliyet Alanı
  "faaliyet_alani.ad": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "ad")
    return {
      faaliyetAlanlari: {
        some: {
          faaliyetAlani: condition
        }
      }
    }
  },

  // Takip - Durum
  "takip.durum": (operator, value) => {
    return {
      gsmler: {
        some: {
          takipler: {
            some: {
              durum: { equals: value }
            }
          }
        }
      }
    }
  },

  // Takip - Başlama Tarihi
  "takip.baslama_tarihi": (operator, value) => {
    const condition = operator === "before" ? { lt: new Date(value) } :
                      operator === "after" ? { gt: new Date(value) } :
                      operator === "equals" ? { equals: new Date(value) } :
                      { equals: new Date(value) }
    return {
      gsmler: {
        some: {
          takipler: {
            some: {
              baslamaTarihi: condition
            }
          }
        }
      }
    }
  },

  // Takip - Bitiş Tarihi
  "takip.bitis_tarihi": (operator, value) => {
    const condition = operator === "before" ? { lt: new Date(value) } :
                      operator === "after" ? { gt: new Date(value) } :
                      operator === "equals" ? { equals: new Date(value) } :
                      { equals: new Date(value) }
    return {
      gsmler: {
        some: {
          takipler: {
            some: {
              bitisTarihi: condition
            }
          }
        }
      }
    }
  },

  // Tanıtım - Notlar
  "tanitim.notlar": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "notlar")
    return {
      tanitimlar: {
        some: {
          tanitim: condition
        }
      }
    }
  },

  // Tanıtım - Mahalle
  "tanitim.mahalle": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "ad")
    return {
      tanitimlar: {
        some: {
          tanitim: {
            mahalle: condition
          }
        }
      }
    }
  },

  // Operasyon - Notlar
  "operasyon.notlar": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "notlar")
    return {
      operasyonlar: {
        some: {
          operasyon: condition
        }
      }
    }
  },

  // Operasyon - Mahalle
  "operasyon.mahalle": (operator, value) => {
    const condition = mapOperatorToCondition(operator, value, "ad")
    return {
      operasyonlar: {
        some: {
          operasyon: {
            mahalle: condition
          }
        }
      }
    }
  },
}

/**
 * Helper function to map operator to Prisma condition
 */
function mapOperatorToCondition(operator: string, value: any, field: string): Record<string, any> {
  switch (operator) {
    case "contains":
      return { [field]: { contains: value as string, mode: "insensitive" } }

    case "doesNotContain":
      return { [field]: { not: { contains: value as string, mode: "insensitive" } } }

    case "equals":
      return { [field]: { equals: value } }

    case "notEquals":
      return { [field]: { not: value } }

    case "startsWith":
      return { [field]: { startsWith: value as string, mode: "insensitive" } }

    case "endsWith":
      return { [field]: { endsWith: value as string, mode: "insensitive" } }

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

    case "greaterThan":
      return { [field]: { gt: value } }

    case "lessThan":
      return { [field]: { lt: value } }

    case "before":
      return { [field]: { lt: new Date(value as string) } }

    case "after":
      return { [field]: { gt: new Date(value as string) } }

    case "between":
      const betweenValue = value as { min: number | string; max: number | string }
      return {
        AND: [
          { [field]: { gte: betweenValue.min } },
          { [field]: { lte: betweenValue.max } },
        ],
      }

    default:
      return { [field]: value }
  }
}

/**
 * Maps a single filter rule to Prisma where condition
 */
function mapFilterRuleToPrisma(filter: FilterRule): Record<string, any> {
  const { field, operator, value } = filter

  // Check if this is a related field
  if (RELATED_FIELD_MAPPINGS[field]) {
    return RELATED_FIELD_MAPPINGS[field](operator, value)
  }

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
 * Maps a single filter to Prisma where condition (backwards compatibility wrapper)
 */
function mapFilterToPrisma(filter: Filter): Record<string, any> {
  return mapFilterRuleToPrisma(filter)
}

/**
 * Recursively maps a FilterGroup to Prisma where clause
 * Supports nested AND/OR groups (DevExpress-style)
 *
 * @example
 * const group = {
 *   id: "1",
 *   combinator: "AND",
 *   rules: [
 *     { id: "r1", field: "name", operator: "contains", value: "John" }
 *   ],
 *   groups: [
 *     {
 *       id: "g1",
 *       combinator: "OR",
 *       rules: [
 *         { id: "r2", field: "age", operator: "greaterThan", value: 18 },
 *         { id: "r3", field: "city", operator: "equals", value: "Istanbul" }
 *       ],
 *       groups: []
 *     }
 *   ]
 * }
 *
 * const where = mapFilterGroupToPrisma(group)
 * // {
 * //   AND: [
 * //     { name: { contains: "John", mode: "insensitive" } },
 * //     { OR: [
 * //       { age: { gt: 18 } },
 * //       { city: { equals: "Istanbul" } }
 * //     ]}
 * //   ]
 * // }
 */
export function mapFilterGroupToPrisma(group: FilterGroup): Record<string, any> {
  // Map all rules in this group
  const ruleConditions = group.rules.map((rule) => mapFilterRuleToPrisma(rule))

  // Recursively map all nested groups
  const groupConditions = group.groups.map((subGroup) =>
    mapFilterGroupToPrisma(subGroup)
  )

  // Combine rules and nested groups
  const allConditions = [...ruleConditions, ...groupConditions]

  // If no conditions, return empty object
  if (allConditions.length === 0) {
    return {}
  }

  // If only one condition, return it directly
  if (allConditions.length === 1) {
    return allConditions[0]
  }

  // Multiple conditions: combine with AND or OR
  return {
    [group.combinator]: allConditions,
  }
}

/**
 * Converts QueryOutput to Prisma where clause
 * (Backwards compatibility with flat filter structure)
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
  options: { page?: number; pageSize?: number; orderBy?: any; include?: any } = {}
): Promise<{
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}> {
  const { page = 1, pageSize = 20, orderBy, include } = options

  const where = queryToPrismaWhere(query)
  const pagination = getPaginationParams(page, pageSize)

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: orderBy || { createdAt: "desc" },
      ...(include && { include }),
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
