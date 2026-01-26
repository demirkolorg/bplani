import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logList } from "@/lib/logger"

// GET /api/kisiler/[id]/operasyonlar - Kişinin katıldığı operasyonları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Kişinin katıldığı operasyonları getir
    const katilimlar = await prisma.operasyonKatilimci.findMany({
      where: {
        kisiId: id,
      },
      include: {
        operasyon: {
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
          },
        },
      },
      orderBy: {
        operasyon: {
          tarih: "desc",
        },
      },
    })

    // Operasyonları formatla
    const operasyonlar = katilimlar.map((k) => k.operasyon)

    await logList("KişiOperasyon", { kisiId: id }, operasyonlar.length)

    return NextResponse.json(operasyonlar)
  } catch (error) {
    console.error("Error fetching kişi operasyonları:", error)
    return NextResponse.json(
      { error: "Operasyonlar yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}
