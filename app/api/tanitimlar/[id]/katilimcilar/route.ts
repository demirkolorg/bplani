import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { addKatilimciSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/tanitimlar/[id]/katilimcilar - Get all participants of a tanitim
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if tanitim exists
    const tanitim = await prisma.tanitim.findUnique({ where: { id } })
    if (!tanitim) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
        { status: 404 }
      )
    }

    const katilimcilar = await prisma.tanitimKatilimci.findMany({
      where: { tanitimId: id },
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

    await logList("TanıtımKatılımcı", { tanitimId: id }, katilimcilar.length)

    return NextResponse.json(katilimcilar)
  } catch (error) {
    console.error("Error fetching katilimcilar:", error)
    return NextResponse.json(
      { error: "Katılımcılar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/tanitimlar/[id]/katilimcilar - Add a participant to tanitim
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params
    const body = await request.json()

    const validatedData = addKatilimciSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if tanitim exists
    const tanitim = await prisma.tanitim.findUnique({ where: { id } })
    if (!tanitim) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
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
    const existingKatilimci = await prisma.tanitimKatilimci.findUnique({
      where: {
        tanitimId_kisiId: {
          tanitimId: id,
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

    const katilimci = await prisma.tanitimKatilimci.create({
      data: {
        tanitimId: id,
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

    await logCreate("TanıtımKatılımcı", katilimci.id, katilimci as unknown as Record<string, unknown>, `${kisi.ad} ${kisi.soyad}`, session)

    return NextResponse.json(katilimci, { status: 201 })
  } catch (error) {
    console.error("Error adding katilimci:", error)
    return NextResponse.json(
      { error: "Katılımcı eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
