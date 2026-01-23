import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    // Paralel sorgular ile tüm istatistikleri al
    const [
      kisiStats,
      takipStats,
      tanitimStats,
      operasyonStats,
      alarmStats,
      gsmCount,
      adresCount,
      aracCount,
      recentActivity,
    ] = await Promise.all([
      // Kişi istatistikleri
      prisma.kisi.aggregate({
        _count: { id: true },
        where: { isArchived: false },
      }).then(async (total) => {
        const [musteri, lead] = await Promise.all([
          prisma.kisi.count({ where: { tip: "MUSTERI", isArchived: false } }),
          prisma.kisi.count({ where: { tip: "LEAD", isArchived: false } }),
        ])
        return { total: total._count.id, musteri, lead }
      }),

      // Takip istatistikleri
      prisma.takip.aggregate({
        _count: { id: true },
        where: { isActive: true },
      }).then(async (active) => {
        const [total, expiringSoonList] = await Promise.all([
          prisma.takip.count(),
          prisma.takip.findMany({
            where: {
              isActive: true,
              bitisTarihi: {
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                gte: new Date(),
              },
            },
            take: 5,
            orderBy: { bitisTarihi: "asc" },
            select: {
              id: true,
              bitisTarihi: true,
              gsm: {
                select: {
                  numara: true,
                  kisi: { select: { ad: true, soyad: true } },
                },
              },
            },
          }),
        ])
        return { total, active: active._count.id, expiringSoon: expiringSoonList.length, expiringSoonList }
      }),

      // Tanıtım istatistikleri (bu ay)
      prisma.tanitim.aggregate({
        _count: { id: true },
      }).then(async (total) => {
        const thisMonth = await prisma.tanitim.count({
          where: {
            tarih: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        })
        return { total: total._count.id, thisMonth }
      }),

      // Operasyon istatistikleri (bu ay)
      prisma.operasyon.aggregate({
        _count: { id: true },
      }).then(async (total) => {
        const thisMonth = await prisma.operasyon.count({
          where: {
            tarih: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        })
        return { total: total._count.id, thisMonth }
      }),

      // Alarm istatistikleri
      prisma.alarm.aggregate({
        _count: { id: true },
        where: { durum: "BEKLIYOR" },
      }).then(async (pending) => {
        const triggered = await prisma.alarm.count({
          where: { durum: "TETIKLENDI" },
        })
        return { pending: pending._count.id, triggered }
      }),

      // GSM sayısı
      prisma.gsm.count(),

      // Adres sayısı
      prisma.adres.count(),

      // Araç sayısı
      prisma.arac.count(),

      // Son aktiviteler (son eklenen kayıtlar)
      Promise.all([
        prisma.kisi.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            ad: true,
            soyad: true,
            tip: true,
            createdAt: true,
          },
        }),
        prisma.takip.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            gsm: {
              select: {
                numara: true,
                kisi: { select: { ad: true, soyad: true } },
              },
            },
          },
        }),
        prisma.tanitim.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            tarih: true,
            createdAt: true,
            _count: { select: { katilimcilar: true } },
          },
        }),
      ]),
    ])

    return NextResponse.json({
      kisi: kisiStats,
      takip: takipStats,
      tanitim: tanitimStats,
      operasyon: operasyonStats,
      alarm: alarmStats,
      gsm: gsmCount,
      adres: adresCount,
      arac: aracCount,
      recentActivity: {
        kisiler: recentActivity[0],
        takipler: recentActivity[1],
        tanitimlar: recentActivity[2],
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "İstatistikler alınamadı" },
      { status: 500 }
    )
  }
}
