import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createTakipSchema, bulkCreateTakipSchema, listTakipQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { getAyarlar } from "@/lib/ayarlar"
import { logList, logCreate, logBulkCreate } from "@/lib/logger"

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

    await logList("Takip", { page, limit, search, gsmId, kisiId, durum, bitisTarihiBaslangic, bitisTarihiBitis, sortBy, sortOrder }, takipler.length)

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

    // Sistem ayarlarını al
    const ayarlar = await getAyarlar()
    const takipVarsayilanSure = ayarlar.takip_varsayilan_sure
    const alarmGunOnce1 = ayarlar.alarm_gun_once_1
    const alarmGunOnce2 = ayarlar.alarm_gun_once_2

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

      // Set default dates (ayarlardan takip varsayılan süresini kullan)
      const baslamaTarihi = inputBaslama || new Date()
      const bitisTarihi = inputBitis || new Date(baslamaTarihi.getTime() + takipVarsayilanSure * 24 * 60 * 60 * 1000)

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

      // Yeni oluşturulan takipler için otomatik alarm oluştur (bitiş tarihinden 20 gün önce)
      const newTakipler = await prisma.takip.findMany({
        where: {
          gsmId: { in: gsmIds },
          isActive: true,
          baslamaTarihi,
          bitisTarihi,
        },
        select: { id: true, bitisTarihi: true },
      })

      if (newTakipler.length > 0) {
        // Her takip için ayarlardaki gün sayılarına göre alarm oluştur
        const alarmlar = newTakipler.flatMap((takip) => {
          const tetikTarihi1 = new Date(takip.bitisTarihi)
          tetikTarihi1.setDate(tetikTarihi1.getDate() - alarmGunOnce1)

          const tetikTarihi2 = new Date(takip.bitisTarihi)
          tetikTarihi2.setDate(tetikTarihi2.getDate() - alarmGunOnce2)

          return [
            {
              takipId: takip.id,
              tip: "TAKIP_BITIS" as const,
              baslik: `Takip Bitiş Hatırlatması (${alarmGunOnce1} gün)`,
              mesaj: `Takip süresi ${alarmGunOnce1} gün içinde sona erecek`,
              tetikTarihi: tetikTarihi1,
              gunOnce: alarmGunOnce1,
              durum: "BEKLIYOR" as const,
              createdUserId: validUserId,
            },
            {
              takipId: takip.id,
              tip: "TAKIP_BITIS" as const,
              baslik: `Takip Bitiş Hatırlatması (${alarmGunOnce2} gün)`,
              mesaj: `Takip süresi ${alarmGunOnce2} gün içinde sona erecek`,
              tetikTarihi: tetikTarihi2,
              gunOnce: alarmGunOnce2,
              durum: "BEKLIYOR" as const,
              createdUserId: validUserId,
            },
          ]
        })

        await prisma.alarm.createMany({
          data: alarmlar,
        })
      }

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

      // Log toplu oluşturma
      const takipIds = newTakipler.map(t => t.id)
      await logBulkCreate("Takip", createdTakipler.count, takipIds, session)

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

    // Set default dates if not provided (ayarlardan takip varsayılan süresini kullan)
    const baslamaTarihi = validatedData.data.baslamaTarihi || new Date()
    const bitisTarihi = validatedData.data.bitisTarihi || new Date(baslamaTarihi.getTime() + takipVarsayilanSure * 24 * 60 * 60 * 1000)

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

    // Otomatik alarm oluştur (ayarlardaki gün sayılarına göre)
    const tetikTarihi1 = new Date(bitisTarihi)
    tetikTarihi1.setDate(tetikTarihi1.getDate() - alarmGunOnce1)

    const tetikTarihi2 = new Date(bitisTarihi)
    tetikTarihi2.setDate(tetikTarihi2.getDate() - alarmGunOnce2)

    await prisma.alarm.createMany({
      data: [
        {
          takipId: takip.id,
          tip: "TAKIP_BITIS",
          baslik: `Takip Bitiş Hatırlatması (${alarmGunOnce1} gün)`,
          mesaj: `Takip süresi ${alarmGunOnce1} gün içinde sona erecek`,
          tetikTarihi: tetikTarihi1,
          gunOnce: alarmGunOnce1,
          durum: "BEKLIYOR",
          createdUserId: validUserId,
        },
        {
          takipId: takip.id,
          tip: "TAKIP_BITIS",
          baslik: `Takip Bitiş Hatırlatması (${alarmGunOnce2} gün)`,
          mesaj: `Takip süresi ${alarmGunOnce2} gün içinde sona erecek`,
          tetikTarihi: tetikTarihi2,
          gunOnce: alarmGunOnce2,
          durum: "BEKLIYOR",
          createdUserId: validUserId,
        },
      ],
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

    // Log oluşturma
    await logCreate(
      "Takip",
      takip.id,
      takip as unknown as Record<string, unknown>,
      `${takip.gsm.kisi?.ad} ${takip.gsm.kisi?.soyad} - ${takip.gsm.numara}`,
      session
    )

    return NextResponse.json(takip, { status: 201 })
  } catch (error) {
    console.error("Error creating takip:", error)
    return NextResponse.json(
      { error: "Takip oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
