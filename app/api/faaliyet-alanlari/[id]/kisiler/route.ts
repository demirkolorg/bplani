import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/faaliyet-alanlari/[id]/kisiler - Get all kisiler for a faaliyet area
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // First check if faaliyet alani exists
    const faaliyetAlani = await prisma.faaliyetAlani.findUnique({
      where: { id },
      select: { id: true, ad: true },
    })

    if (!faaliyetAlani) {
      return NextResponse.json(
        { error: "Faaliyet alanı bulunamadı" },
        { status: 404 }
      )
    }

    // Get all kisiler with this faaliyet alani
    const kisiler = await prisma.kisi.findMany({
      where: {
        isArchived: false,
        faaliyetAlanlari: {
          some: {
            faaliyetAlaniId: id,
          },
        },
      },
      include: {
        gsmler: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            takipler: {
              where: {
                durum: {
                  in: ["UZATILACAK", "DEVAM_EDECEK"],
                },
              },
              take: 1,
              orderBy: { baslamaTarihi: "desc" },
            },
          },
        },
        adresler: {
          orderBy: { createdAt: "desc" },
          take: 1,
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
        araclar: {
          orderBy: { createdAt: "desc" },
          take: 3,
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
        faaliyetAlanlari: {
          include: {
            faaliyetAlani: true,
          },
        },
        notlar: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        tanitimlar: {
          take: 3,
          include: {
            tanitim: {
              select: {
                id: true,
                baslik: true,
                tarih: true,
              },
            },
          },
          orderBy: {
            tanitim: {
              tarih: "desc",
            },
          },
        },
        operasyonlar: {
          take: 3,
          include: {
            operasyon: {
              select: {
                id: true,
                baslik: true,
                tarih: true,
              },
            },
          },
          orderBy: {
            operasyon: {
              tarih: "desc",
            },
          },
        },
      },
      orderBy: [
        { tt: "desc" }, // Müşteriler önce
        { ad: "asc" },
        { soyad: "asc" },
      ],
    })

    return NextResponse.json({
      faaliyetAlani,
      kisiler,
      total: kisiler.length,
    })
  } catch (error) {
    console.error("Error fetching kisiler for faaliyet alani:", error)
    return NextResponse.json(
      { error: "Kişiler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
