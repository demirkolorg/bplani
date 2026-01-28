import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createAlarmSchema, listAlarmQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"
import { validationErrorResponse, handleApiError } from "@/lib/api-response"

// GET /api/alarmlar - List all alarms with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listAlarmQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return validationErrorResponse(validatedQuery.error)
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

    // Get all results (pagination handled client-side)

    
    const alarmlar = await prisma.alarm.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
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
                    tt: true,
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
        page: 1,
        limit: alarmlar.length,
        total: alarmlar.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    return handleApiError(error, "ALARM_LIST")
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
      return validationErrorResponse(validatedData.error)
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
                    tt: true,
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
    return handleApiError(error, "ALARM_CREATE")
  }
}
