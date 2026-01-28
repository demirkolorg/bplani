import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createTanitimSchema, listTanitimQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"
import { validationErrorResponse, handleApiError } from "@/lib/api-response"

// GET /api/tanitimlar - List all tanitimlar with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listTanitimQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return validationErrorResponse(validatedQuery.error)
    }

    const { page, limit, search, tarihBaslangic, tarihBitis, kisiId, mahalleId, sortBy, sortOrder } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    // Date range filter
    if (tarihBaslangic || tarihBitis) {
      where.tarih = {}
      if (tarihBaslangic) {
        (where.tarih as Record<string, unknown>).gte = tarihBaslangic
      }
      if (tarihBitis) {
        (where.tarih as Record<string, unknown>).lte = tarihBitis
      }
    }

    // Filter by participant kisiId
    if (kisiId) {
      where.katilimcilar = {
        some: { kisiId },
      }
    }

    // Filter by mahalleId
    if (mahalleId) {
      where.mahalleId = mahalleId
    }

    // Search in address details, notes, and participant names
    if (search) {
      where.OR = [
        { adresDetay: { contains: search, mode: "insensitive" } },
        { notlar: { contains: search, mode: "insensitive" } },
        {
          mahalle: {
            OR: [
              { ad: { contains: search, mode: "insensitive" } },
              { ilce: { ad: { contains: search, mode: "insensitive" } } },
              { ilce: { il: { ad: { contains: search, mode: "insensitive" } } } },
            ],
          },
        },
        {
          katilimcilar: {
            some: {
              kisi: {
                OR: [
                  { ad: { contains: search, mode: "insensitive" } },
                  { soyad: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ]
    }

    // Get all results (pagination handled client-side)
    const tanitimlar = await prisma.tanitim.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
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
        katilimcilar: {
          include: {
            kisi: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                tc: true,
                tt: true,
              },
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logList("Tanıtım", { page, limit, search, tarihBaslangic, tarihBitis, kisiId, mahalleId, sortBy, sortOrder }, tanitimlar.length)

    return NextResponse.json({
      data: tanitimlar,
      pagination: {
        page: 1,
        limit: tanitimlar.length,
        total: tanitimlar.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    return handleApiError(error, "TANITIM_LIST")
  }
}

// POST /api/tanitimlar - Create a new tanitim
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = createTanitimSchema.safeParse(body)
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const { katilimcilar, araclar, ...tanitimData } = validatedData.data

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const tanitim = await prisma.tanitim.create({
      data: {
        ...tanitimData,
        createdUserId: validUserId,
        updatedUserId: validUserId,
        katilimcilar: katilimcilar && katilimcilar.length > 0
          ? {
              create: katilimcilar.map((k) => ({
                kisiId: k.kisiId,
                gsmId: k.gsmId,
              })),
            }
          : undefined,
        araclar: araclar && araclar.length > 0
          ? {
              create: araclar.map((a) => ({
                aracId: a.aracId,
                aciklama: a.aciklama,
              })),
            }
          : undefined,
      },
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
        katilimcilar: {
          include: {
            kisi: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                tc: true,
                tt: true,
              },
            },
          },
        },
        araclar: {
          include: {
            arac: {
              include: {
                model: {
                  include: {
                    marka: true,
                  },
                },
              },
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logCreate("Tanıtım", tanitim.id, tanitim as unknown as Record<string, unknown>, tanitim.adresDetay || undefined, session)

    return NextResponse.json(tanitim, { status: 201 })
  } catch (error) {
    return handleApiError(error, "TANITIM_CREATE")
  }
}
