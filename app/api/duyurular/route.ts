import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createDuyuruSchema, listDuyuruQuerySchema } from "@/lib/validations"
import { getSession, isAdminOrYonetici } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// Priority sorting helper
const priorityOrder = { KRITIK: 1, ONEMLI: 2, NORMAL: 3 }

// GET /api/duyurular - List all duyurular with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listDuyuruQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, onlyActive, sortBy, sortOrder } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    if (onlyActive) {
      where.isActive = true
      // Filter out expired announcements
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ]
    }

    // Get total count
    const total = await prisma.duyuru.count({ where })

    // Get all matching results (we'll sort and paginate in JS for priority sorting)
    const allDuyurular = await prisma.duyuru.findMany({
      where,
      include: {
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    // Sort by priority first, then by the requested field
    let sortedDuyurular = [...allDuyurular]

    if (sortBy === "oncelik") {
      // Priority-based sorting
      sortedDuyurular.sort((a, b) => {
        const priorityDiff = priorityOrder[a.oncelik] - priorityOrder[b.oncelik]
        if (priorityDiff !== 0) {
          return sortOrder === "desc" ? -priorityDiff : priorityDiff
        }
        // Secondary sort by publishedAt
        return sortOrder === "desc"
          ? b.publishedAt.getTime() - a.publishedAt.getTime()
          : a.publishedAt.getTime() - b.publishedAt.getTime()
      })
    } else {
      // Sort by requested field
      sortedDuyurular.sort((a, b) => {
        const aVal = a[sortBy as keyof typeof a]
        const bVal = b[sortBy as keyof typeof b]

        if (aVal instanceof Date && bVal instanceof Date) {
          return sortOrder === "desc"
            ? bVal.getTime() - aVal.getTime()
            : aVal.getTime() - bVal.getTime()
        }

        return 0
      })
    }

    // Apply pagination
    const paginatedDuyurular = sortedDuyurular.slice((page - 1) * limit, page * limit)

    await logList("Duyuru", { page, limit, onlyActive, sortBy, sortOrder }, paginatedDuyurular.length)

    return NextResponse.json({
      data: paginatedDuyurular,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching duyurular:", error)
    return NextResponse.json(
      { error: "Duyurular getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/duyurular - Create a new duyuru (ADMIN and YONETICI only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Check authorization
    if (!isAdminOrYonetici(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok. Sadece ADMIN ve YONETICI duyuru oluşturabilir." },
        { status: 403 }
      )
    }

    const userId = session?.id || null
    const body = await request.json()

    const validatedData = createDuyuruSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const duyuru = await prisma.duyuru.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logCreate("Duyuru", duyuru.id, duyuru as unknown as Record<string, unknown>, duyuru.baslik, session)

    return NextResponse.json(duyuru, { status: 201 })
  } catch (error) {
    console.error("Error creating duyuru:", error)
    return NextResponse.json(
      { error: "Duyuru oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
