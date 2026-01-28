import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// GET /api/loglar - List logs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const userId = searchParams.get("userId")
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const islem = searchParams.get("islem")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (islem) where.islem = islem

    // Tarih filtresi
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        ;(where.createdAt as Record<string, unknown>).lte = end
      }
    }

    // Arama
    if (search) {
      where.OR = [
        { aciklama: { contains: search, mode: "insensitive" } },
        { entityAd: { contains: search, mode: "insensitive" } },
        { userAd: { contains: search, mode: "insensitive" } },
        { userSoyad: { contains: search, mode: "insensitive" } },
      ]
    }

    const [loglar, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              fotograf: true,
            },
          },
        },
      }),
      prisma.log.count({ where }),
    ])

    return NextResponse.json({
      data: loglar,
      pagination: {
        page: 1,
        limit: loglar.length,
        total: loglar.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json(
      { error: "Loglar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
