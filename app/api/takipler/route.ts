import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createTakipSchema, bulkCreateTakipSchema, listTakipQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/takipler - List takipler with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listTakipQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const {
      page,
      limit,
      search,
      gsmId,
      musteriId,
      durum,
      bitisTarihiBaslangic,
      bitisTarihiBitis,
      sortBy,
      sortOrder,
    } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    if (gsmId) {
      where.gsmId = gsmId
    }

    if (musteriId) {
      where.gsm = { musteriId }
    }

    if (durum) {
      where.durum = durum
    }

    // Date range filter for bitisTarihi
    if (bitisTarihiBaslangic || bitisTarihiBitis) {
      where.bitisTarihi = {}
      if (bitisTarihiBaslangic) {
        (where.bitisTarihi as Record<string, unknown>).gte = bitisTarihiBaslangic
      }
      if (bitisTarihiBitis) {
        (where.bitisTarihi as Record<string, unknown>).lte = bitisTarihiBitis
      }
    }

    // Search by GSM number or customer name
    if (search) {
      where.OR = [
        { gsm: { numara: { contains: search, mode: "insensitive" } } },
        { gsm: { musteri: { ad: { contains: search, mode: "insensitive" } } } },
        { gsm: { musteri: { soyad: { contains: search, mode: "insensitive" } } } },
      ]
    }

    const skip = (page - 1) * limit

    const [takipler, total] = await Promise.all([
      prisma.takip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          gsm: {
            include: {
              musteri: {
                select: {
                  id: true,
                  ad: true,
                  soyad: true,
                },
              },
            },
          },
          createdUser: {
            select: {
              id: true,
              ad: true,
              soyad: true,
            },
          },
          updatedUser: {
            select: {
              id: true,
              ad: true,
              soyad: true,
            },
          },
          _count: {
            select: {
              alarmlar: true,
            },
          },
        },
      }),
      prisma.takip.count({ where }),
    ])

    return NextResponse.json({
      data: takipler,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching takipler:", error)
    return NextResponse.json(
      { error: "Takipler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/takipler - Create a new takip or bulk create
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    // Validate user exists
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({
        where: { id: userId },
        select: { id: true },
      })
      if (userExists) {
        validUserId = userId
      }
    }

    const body = await request.json()

    // Check if it's a bulk create request
    if (body.gsmIds && Array.isArray(body.gsmIds)) {
      const validatedData = bulkCreateTakipSchema.safeParse(body)
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Geçersiz veri", details: validatedData.error.flatten() },
          { status: 400 }
        )
      }

      const { gsmIds, baslamaTarihi: inputBaslama, bitisTarihi: inputBitis } = validatedData.data

      // Verify all GSMs exist
      const existingGsms = await prisma.gsm.findMany({
        where: { id: { in: gsmIds } },
        select: { id: true },
      })

      if (existingGsms.length !== gsmIds.length) {
        return NextResponse.json(
          { error: "Bazı GSM'ler bulunamadı" },
          { status: 404 }
        )
      }

      // Set default dates
      const baslamaTarihi = inputBaslama || new Date()
      const bitisTarihi = inputBitis || new Date(baslamaTarihi.getTime() + 90 * 24 * 60 * 60 * 1000)

      // Find existing active takips for these GSMs and mark them as UZATILDI
      await prisma.takip.updateMany({
        where: {
          gsmId: { in: gsmIds },
          durum: { not: "UZATILDI" },
        },
        data: {
          durum: "UZATILDI",
          updatedUserId: validUserId,
        },
      })

      // Create all takips
      const createdTakipler = await prisma.takip.createMany({
        data: gsmIds.map((gsmId) => ({
          gsmId,
          baslamaTarihi,
          bitisTarihi,
          durum: "UZATILACAK",
          createdUserId: validUserId,
          updatedUserId: validUserId,
        })),
      })

      return NextResponse.json({ count: createdTakipler.count }, { status: 201 })
    }

    // Single takip create
    const validatedData = createTakipSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if GSM exists
    const gsm = await prisma.gsm.findUnique({
      where: { id: validatedData.data.gsmId },
    })

    if (!gsm) {
      return NextResponse.json(
        { error: "GSM bulunamadı" },
        { status: 404 }
      )
    }

    // Set default dates if not provided
    const baslamaTarihi = validatedData.data.baslamaTarihi || new Date()
    const bitisTarihi = validatedData.data.bitisTarihi || new Date(baslamaTarihi.getTime() + 90 * 24 * 60 * 60 * 1000) // +90 days

    // Find existing active takips for this GSM and mark them as UZATILDI
    await prisma.takip.updateMany({
      where: {
        gsmId: validatedData.data.gsmId,
        durum: { not: "UZATILDI" },
      },
      data: {
        durum: "UZATILDI",
        updatedUserId: validUserId,
      },
    })

    const takip = await prisma.takip.create({
      data: {
        gsmId: validatedData.data.gsmId,
        baslamaTarihi,
        bitisTarihi,
        durum: validatedData.data.durum,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        gsm: {
          include: {
            musteri: {
              select: {
                id: true,
                ad: true,
                soyad: true,
              },
            },
          },
        },
        createdUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
        updatedUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    return NextResponse.json(takip, { status: 201 })
  } catch (error) {
    console.error("Error creating takip:", error)
    return NextResponse.json(
      { error: "Takip oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
