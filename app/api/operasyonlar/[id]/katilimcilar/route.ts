import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { addOperasyonKatilimciSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/operasyonlar/[id]/katilimcilar - Get all participants of a operasyon
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

    const katilimcilar = await prisma.operasyonKatilimci.findMany({
      where: { operasyonId: id },
      include: {
        kisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            tt: true,
            gsmler: {
              orderBy: { isPrimary: "desc" },
            },
          },
        },
      },
    })

    await logList("OperasyonKatılımcı", { operasyonId: id }, katilimcilar.length)

    return NextResponse.json(katilimcilar)
  } catch (error) {
    console.error("Error fetching katilimcilar:", error)
    return NextResponse.json(
      { error: "Katılımcılar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/operasyonlar/[id]/katilimcilar - Add a participant to operasyon
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params
    const body = await request.json()

    const validatedData = addOperasyonKatilimciSchema.safeParse(body)
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

    // Check if kisi exists
    const kisi = await prisma.kisi.findUnique({ where: { id: validatedData.data.kisiId } })
    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    // Check if already a participant
    const existingKatilimci = await prisma.operasyonKatilimci.findUnique({
      where: {
        operasyonId_kisiId: {
          operasyonId: id,
          kisiId: validatedData.data.kisiId,
        },
      },
    })

    if (existingKatilimci) {
      return NextResponse.json(
        { error: "Bu kişi zaten katılımcı olarak eklenmiş" },
        { status: 409 }
      )
    }

    const katilimci = await prisma.operasyonKatilimci.create({
      data: {
        operasyonId: id,
        kisiId: validatedData.data.kisiId,
        gsmId: validatedData.data.gsmId,
      },
      include: {
        kisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            tt: true,
            gsmler: {
              orderBy: { isPrimary: "desc" },
            },
          },
        },
      },
    })

    await logCreate("OperasyonKatılımcı", katilimci.id, katilimci as unknown as Record<string, unknown>, `${kisi.ad} ${kisi.soyad}`, session)

    return NextResponse.json(katilimci, { status: 201 })
  } catch (error) {
    console.error("Error adding katilimci:", error)
    return NextResponse.json(
      { error: "Katılımcı eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
