import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
  queryToPrismaWhere,
  executeQueryWithPagination,
  type QueryOutput,
} from "@/lib/query-builder"

/**
 * POST /api/advanced-search
 * Advanced search endpoint using Query Builder output
 *
 * Request Body: QueryOutput
 * {
 *   logic: "AND" | "OR",
 *   filters: [
 *     { field: "ad", operator: "contains", value: "Ahmet" },
 *     { field: "tc", operator: "inList", value: ["11122233344", "55566677788"] }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const query = (await request.json()) as QueryOutput

    // Get pagination params from query string
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    // Example: Search in Kisi table
    const result = await executeQueryWithPagination(
      prisma.kisi,
      query,
      {
        page,
        pageSize,
        orderBy: { createdAt: "desc" },
      }
    )

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      query, // Echo back the query for debugging
    })
  } catch (error) {
    console.error("Advanced search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Arama sırasında bir hata oluştu",
      },
      { status: 500 }
    )
  }
}

/**
 * Example alternative: Direct where clause conversion
 */
export async function postAlternative(request: NextRequest) {
  try {
    const query = (await request.json()) as QueryOutput

    // Convert to Prisma where clause
    const where = queryToPrismaWhere(query)

    // Execute query
    const results = await prisma.kisi.findMany({
      where,
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        gsmler: true,
        adresler: {
          include: {
            mahalle: {
              include: {
                ilce: {
                  include: {
                    il: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    )
  }
}
