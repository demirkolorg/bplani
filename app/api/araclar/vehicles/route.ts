import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createAracSchema, listAracQuerySchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"
import { validationErrorResponse, handleApiError } from "@/lib/api-response"
import { ConflictError, AuthenticationError } from "@/types/errors"

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
      return validationErrorResponse(validatedQuery.error)
    }

    const { page, limit, kisiId, modelId, markaId, search, sortBy, sortOrder } = validatedQuery.data

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

    // Get all results (pagination handled client-side)
    const araclar = await prisma.arac.findMany({
      where,
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
      })

    await logList("Arac", validatedQuery.data, araclar.length)

    return NextResponse.json({
      data: araclar,
      pagination: {
        page: 1,
        limit: araclar.length,
        total: araclar.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    return handleApiError(error, "ARAC_LIST")
  }
}

// POST /api/araclar/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return handleApiError(
        new AuthenticationError("Bu işlem için yetkiniz yok"),
        "ARAC_CREATE"
      )
    }

    const userId = session?.id || null
    const body = await request.json()

    const validatedData = createAracSchema.safeParse(body)
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
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
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return handleApiError(
        new ConflictError("Bu plaka ile bir araç zaten kayıtlı"),
        "ARAC_CREATE"
      )
    }
    return handleApiError(error, "ARAC_CREATE")
  }
}
