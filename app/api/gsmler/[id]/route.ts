import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/gsmler/[id] - Get GSM details with full relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const gsm = await prisma.gsm.findUnique({
      where: { id },
      include: {
        kisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            tc: true,
            tt: true,
            pio: true,
            asli: true,
            faaliyetAlanlari: {
              include: {
                faaliyetAlani: {
                  select: {
                    id: true,
                    ad: true,
                  },
                },
              },
            },
            adresler: {
              take: 1,
              orderBy: { createdAt: "desc" },
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
          },
        },
        takipler: {
          orderBy: { baslamaTarihi: "desc" },
          include: {
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

    if (!gsm) {
      return NextResponse.json(
        { error: "GSM bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(gsm)
  } catch (error) {
    console.error("Error fetching gsm details:", error)
    return NextResponse.json(
      { error: "GSM detayları getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
