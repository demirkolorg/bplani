import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createKisiSchema, listKisiQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// GET /api/kisiler - List all kisiler with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listKisiQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, search, tt, isArchived, pio, asli, sortBy, sortOrder } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    if (typeof tt === "boolean") {
      where.tt = tt
    }

    if (typeof isArchived === "boolean") {
      where.isArchived = isArchived
    }

    if (typeof pio === "boolean") {
      where.pio = pio
    }

    if (typeof asli === "boolean") {
      where.asli = asli
    }

    if (search) {
      where.OR = [
        { ad: { contains: search, mode: "insensitive" } },
        { soyad: { contains: search, mode: "insensitive" } },
        { tc: { contains: search } },
      ]
    }

    // Get total count
    const total = await prisma.kisi.count({ where })

    // Get paginated results
    const kisiler = await prisma.kisi.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        gsmler: {
          orderBy: { isPrimary: "desc" },
        },
        adresler: {
          orderBy: { isPrimary: "desc" },
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
        faaliyetAlanlari: {
          include: {
            faaliyetAlani: true,
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
        _count: {
          select: {
            gsmler: true,
            adresler: true,
            notlar: true,
            tanitimlar: true,
            operasyonlar: true,
            araclar: true,
          },
        },
      },
    })

    await logList("Kişi", { page, limit, search, tt, isArchived, pio, asli, sortBy, sortOrder }, kisiler.length)

    return NextResponse.json({
      data: kisiler,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching kisiler:", error)
    return NextResponse.json(
      { error: "Kişiler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/kisiler - Create a new kisi
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = createKisiSchema.safeParse(body)
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

    const kisi = await prisma.kisi.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        gsmler: true,
        adresler: true,
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    // Log oluştur
    await logCreate(
      "Kisi",
      kisi.id,
      kisi as unknown as Record<string, unknown>,
      `${kisi.ad} ${kisi.soyad}`,
      session
    )

    return NextResponse.json(kisi, { status: 201 })
  } catch (error) {
    console.error("Error creating kisi:", error)

    // Handle unique constraint violation for TC
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu TC Kimlik No ile kayıtlı bir kişi zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Kişi oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
