import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createAracSchema, listAracQuerySchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// GET /api/araclar/vehicles - List all vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      kisiId: searchParams.get("kisiId") || undefined,
      modelId: searchParams.get("modelId") || undefined,
      markaId: searchParams.get("markaId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    }

    const validatedQuery = listAracQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, kisiId, modelId, markaId, search, sortBy, sortOrder } = validatedQuery.data
    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      kisiler?: { some: { kisiId: string } }
      modelId?: string
      model?: { markaId: string }
      OR?: Array<{ plaka: { contains: string; mode: "insensitive" } }>
    } = {}

    if (kisiId) {
      where.kisiler = { some: { kisiId } }
    }

    if (modelId) {
      where.modelId = modelId
    }

    if (markaId) {
      where.model = { markaId }
    }

    if (search) {
      where.OR = [
        { plaka: { contains: search, mode: "insensitive" } },
      ]
    }

    const [araclar, total] = await Promise.all([
      prisma.arac.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy === "plaka" ? { plaka: sortOrder }
          : sortBy === "renk" ? { renk: sortOrder }
          : sortBy === "createdAt" ? { createdAt: sortOrder }
          : { updatedAt: sortOrder },
        include: {
          model: {
            include: {
              marka: { select: { id: true, ad: true } },
            },
          },
          kisiler: {
            include: {
              kisi: { select: { id: true, ad: true, soyad: true, tt: true } },
            },
          },
          createdUser: { select: { ad: true, soyad: true } },
          updatedUser: { select: { ad: true, soyad: true } },
        },
      }),
      prisma.arac.count({ where }),
    ])

    await logList("Arac", validatedQuery.data, total)

    return NextResponse.json({
      data: araclar,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching araclar:", error)
    return NextResponse.json(
      { error: "Araçlar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/araclar/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const userId = session?.id || null
    const body = await request.json()

    const validatedData = createAracSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const { kisiIds, ...aracData } = validatedData.data

    const arac = await prisma.arac.create({
      data: {
        ...aracData,
        createdUserId: validUserId,
        updatedUserId: validUserId,
        ...(kisiIds && kisiIds.length > 0 && {
          kisiler: {
            create: kisiIds.map(kisiId => ({ kisiId })),
          },
        }),
      },
      include: {
        model: {
          include: {
            marka: { select: { id: true, ad: true } },
          },
        },
        kisiler: {
          include: {
            kisi: { select: { id: true, ad: true, soyad: true, tt: true } },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logCreate("Arac", arac.id, arac as unknown as Record<string, unknown>, arac.plaka, session)

    return NextResponse.json(arac, { status: 201 })
  } catch (error) {
    console.error("Error creating arac:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu plaka ile bir araç zaten kayıtlı" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Araç oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
