import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { addOperasyonAracSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/operasyonlar/[id]/araclar - Get all vehicles of an operasyon
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if operasyon exists
    const operasyon = await prisma.operasyon.findUnique({ where: { id } })
    if (!operasyon) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
        { status: 404 }
      )
    }

    const araclar = await prisma.operasyonArac.findMany({
      where: { operasyonId: id },
      include: {
        arac: {
          include: {
            model: {
              include: {
                marka: true,
              },
            },
            kisiler: {
              include: {
                kisi: {
                  select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    tt: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    await logList("OperasyonAraç", { operasyonId: id }, araclar.length)

    return NextResponse.json(araclar)
  } catch (error) {
    console.error("Error fetching araclar:", error)
    return NextResponse.json(
      { error: "Araçlar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/operasyonlar/[id]/araclar - Add a vehicle to operasyon
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params
    const body = await request.json()

    const validatedData = addOperasyonAracSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if operasyon exists
    const operasyon = await prisma.operasyon.findUnique({ where: { id } })
    if (!operasyon) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
        { status: 404 }
      )
    }

    // Check if arac exists
    const arac = await prisma.arac.findUnique({
      where: { id: validatedData.data.aracId },
      include: {
        model: {
          include: {
            marka: true,
          },
        },
      },
    })
    if (!arac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      )
    }

    // Check if already added
    const existingArac = await prisma.operasyonArac.findUnique({
      where: {
        operasyonId_aracId: {
          operasyonId: id,
          aracId: validatedData.data.aracId,
        },
      },
    })

    if (existingArac) {
      return NextResponse.json(
        { error: "Bu araç zaten eklenmiş" },
        { status: 409 }
      )
    }

    const operasyonArac = await prisma.operasyonArac.create({
      data: {
        operasyonId: id,
        aracId: validatedData.data.aracId,
        aciklama: validatedData.data.aciklama,
      },
      include: {
        arac: {
          include: {
            model: {
              include: {
                marka: true,
              },
            },
            kisiler: {
              include: {
                kisi: {
                  select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    tt: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    await logCreate(
      "OperasyonAraç",
      operasyonArac.id,
      operasyonArac as unknown as Record<string, unknown>,
      `${arac.model.marka.ad} ${arac.model.ad} - ${arac.plaka}`,
      session
    )

    return NextResponse.json(operasyonArac, { status: 201 })
  } catch (error) {
    console.error("Error adding arac:", error)
    return NextResponse.json(
      { error: "Araç eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
