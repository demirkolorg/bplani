import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
  queryToPrismaWhere,
  executeQueryWithPagination,
  type QueryOutput,
} from "@/lib/query-builder"
import { heavyApiRateLimit, getClientIdentifier } from "@/lib/rate-limit"
import { errorResponse } from "@/lib/api-response"

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
    // Rate limiting for heavy search operations
    const clientId = getClientIdentifier(request)
    const { success, limit, remaining, reset } = await heavyApiRateLimit.limit(clientId)

    if (!success) {
      return errorResponse(
        "Arama rate limit'i aşıldı. Lütfen bekleyin.",
        429,
        "RATE_LIMIT_EXCEEDED",
        {
          resetAt: new Date(reset).toISOString(),
          limit,
          remaining,
        }
      )
    }

    // Parse request body
    const query = (await request.json()) as QueryOutput

    // Get pagination params from query string
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    // Search in Kisi table with all related data
    const result = await executeQueryWithPagination(
      prisma.kisi,
      query,
      {
        page,
        pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          gsmler: {
            select: {
              numara: true,
              isPrimary: true,
              takipler: {
                where: { isActive: true },
                select: {
                  durum: true,
                  baslamaTarihi: true,
                  bitisTarihi: true,
                },
              },
            },
          },
          adresler: {
            select: {
              ad: true,
              detay: true,
              isPrimary: true,
              mahalle: {
                select: {
                  ad: true,
                  ilce: {
                    select: {
                      ad: true,
                      il: {
                        select: { ad: true },
                      },
                    },
                  },
                },
              },
            },
          },
          araclar: {
            include: {
              arac: {
                select: { plaka: true },
              },
            },
          },
          notlar: {
            select: {
              icerik: true,
              createdAt: true,
            },
            take: 3,
            orderBy: { createdAt: "desc" },
          },
          faaliyetAlanlari: {
            select: {
              faaliyetAlani: {
                select: { ad: true },
              },
            },
          },
          tanitimlar: {
            select: {
              tanitim: {
                select: {
                  tarih: true,
                  notlar: true,
                  mahalle: {
                    select: { ad: true },
                  },
                },
              },
            },
            take: 3,
          },
          operasyonlar: {
            select: {
              operasyon: {
                select: {
                  tarih: true,
                  notlar: true,
                  mahalle: {
                    select: { ad: true },
                  },
                },
              },
            },
            take: 3,
          },
        },
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
