import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logList } from "@/lib/logger"

// GET /api/kisiler/[id]/tanitimlar - Kişinin katıldığı tanıtımları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Kişinin katıldığı tanıtımları getir
    const katilimlar = await prisma.tanitimKatilimci.findMany({
      where: {
        kisiId: id,
      },
      include: {
        tanitim: {
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
                    tip: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        tanitim: {
          tarih: "desc",
        },
      },
    })

    // Tanıtımları formatla
    const tanitimlar = katilimlar.map((k) => k.tanitim)

    await logList("KişiTanıtım", { kisiId: id }, tanitimlar.length)

    return NextResponse.json(tanitimlar)
  } catch (error) {
    console.error("Error fetching kişi tanıtımları:", error)
    return NextResponse.json(
      { error: "Tanıtımlar yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}
