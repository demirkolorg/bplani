import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createAlarmSchema, listAlarmQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// GET /api/alarmlar - List all alarms with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listAlarmQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, search, tip, durum, takipId, aktifOnly, sortBy, sortOrder } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    if (tip) {
      where.tip = tip
    }

    if (durum) {
      where.durum = durum
    }

    if (takipId) {
      where.takipId = takipId
    }

    // Sadece aktif alarmlar (bekleyen veya tetiklenen)
    if (aktifOnly) {
      where.durum = { in: ["BEKLIYOR", "TETIKLENDI"] }
      where.isPaused = false
    }

    // Search in baslik, mesaj
    if (search) {
      where.OR = [
        { baslik: { contains: search, mode: "insensitive" } },
        { mesaj: { contains: search, mode: "insensitive" } },
        {
          takip: {
            gsm: {
              OR: [
                { numara: { contains: search, mode: "insensitive" } },
                { kisi: { ad: { contains: search, mode: "insensitive" } } },
                { kisi: { soyad: { contains: search, mode: "insensitive" } } },
              ],
            },
          },
        },
      ]
    }

    // Get total count
    const total = await prisma.alarm.count({ where })

    // Get paginated results
    const alarmlar = await prisma.alarm.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        takip: {
          include: {
            gsm: {
              include: {
                kisi: {
                  select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    tip: true,
                  },
                },
              },
            },
          },
        },
        createdUser: {
          select: { ad: true, soyad: true },
        },
      },
    })

    await logList("Alarm", { page, limit, search, tip, durum, takipId, aktifOnly, sortBy, sortOrder }, alarmlar.length)

    return NextResponse.json({
      data: alarmlar,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching alarmlar:", error)
    return NextResponse.json(
      { error: "Alarmlar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/alarmlar - Create a new alarm
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = createAlarmSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const data = validatedData.data

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const alarm = await prisma.alarm.create({
      data: {
        ...data,
        createdUserId: validUserId,
      },
      include: {
        takip: {
          include: {
            gsm: {
              include: {
                kisi: {
                  select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    tip: true,
                  },
                },
              },
            },
          },
        },
        createdUser: {
          select: { ad: true, soyad: true },
        },
      },
    })

    await logCreate("Alarm", alarm.id, alarm as unknown as Record<string, unknown>, alarm.baslik || undefined, session)

    return NextResponse.json(alarm, { status: 201 })
  } catch (error) {
    console.error("Error creating alarm:", error)
    return NextResponse.json(
      { error: "Alarm oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
