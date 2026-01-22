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
      kisiId,
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

    if (kisiId) {
      where.gsm = { kisiId }
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

    // Search by GSM number or kisi name
    if (search) {
      where.OR = [
        { gsm: { numara: { contains: search, mode: "insensitive" } } },
        { gsm: { kisi: { ad: { contains: search, mode: "insensitive" } } } },
        { gsm: { kisi: { soyad: { contains: search, mode: "insensitive" } } } },
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
              kisi: {
                select: {
                  id: true,
                  ad: true,
                  soyad: true,
                  tip: true,
                  fotograf: true,
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

      // Find existing active takips for these GSMs and mark them as inactive
      await prisma.takip.updateMany({
        where: {
          gsmId: { in: gsmIds },
          isActive: true,
        },
        data: {
          isActive: false,
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
          isActive: true,
          createdUserId: validUserId,
          updatedUserId: validUserId,
        })),
      })

      // LEAD → MUSTERI: Takip eklenen kişilerin tipini güncelle
      const gsmlerWithKisi = await prisma.gsm.findMany({
        where: { id: { in: gsmIds } },
        select: { kisiId: true },
      })
      const kisiIds = [...new Set(gsmlerWithKisi.map(g => g.kisiId).filter(Boolean))] as string[]

      if (kisiIds.length > 0) {
        await prisma.kisi.updateMany({
          where: {
            id: { in: kisiIds },
            tip: "LEAD",
          },
          data: {
            tip: "MUSTERI",
            updatedUserId: validUserId,
          },
        })
      }

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

    // Find existing active takips for this GSM and mark them as inactive
    await prisma.takip.updateMany({
      where: {
        gsmId: validatedData.data.gsmId,
        isActive: true,
      },
      data: {
        isActive: false,
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
        isActive: true,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
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

    // LEAD → MUSTERI: Takip eklenen kişinin tipini güncelle
    if (gsm.kisiId) {
      await prisma.kisi.updateMany({
        where: {
          id: gsm.kisiId,
          tip: "LEAD",
        },
        data: {
          tip: "MUSTERI",
          updatedUserId: validUserId,
        },
      })
    }

    return NextResponse.json(takip, { status: 201 })
  } catch (error) {
    console.error("Error creating takip:", error)
    return NextResponse.json(
      { error: "Takip oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
