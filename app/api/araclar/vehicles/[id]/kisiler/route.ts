import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { addKisiToAracSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logCreate, logList } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/araclar/vehicles/[id]/kisiler - List all kisiler for a vehicle
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const arac = await prisma.arac.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!arac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      )
    }

    const kisiler = await prisma.aracKisi.findMany({
      where: { aracId: id },
      include: {
        kisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            tip: true,
            tc: true,
          },
        },
      },
    })

    await logList("AracKisi", { aracId: id }, kisiler.length)

    return NextResponse.json(kisiler.map(ak => ({
      ...ak.kisi,
      aciklama: ak.aciklama,
    })))
  } catch (error) {
    console.error("Error fetching arac kisiler:", error)
    return NextResponse.json(
      { error: "Araç kişileri getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/araclar/vehicles/[id]/kisiler - Add a kisi to a vehicle
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const validatedData = addKisiToAracSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const arac = await prisma.arac.findUnique({
      where: { id },
      select: { id: true, plaka: true },
    })

    if (!arac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      )
    }

    const kisi = await prisma.kisi.findUnique({
      where: { id: validatedData.data.kisiId },
      select: { id: true, ad: true, soyad: true },
    })

    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    // Check if relationship already exists
    const existingRelation = await prisma.aracKisi.findUnique({
      where: {
        aracId_kisiId: {
          aracId: id,
          kisiId: validatedData.data.kisiId,
        },
      },
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: "Bu kişi zaten bu araca ekli" },
        { status: 409 }
      )
    }

    const aracKisi = await prisma.aracKisi.create({
      data: {
        aracId: id,
        kisiId: validatedData.data.kisiId,
        aciklama: validatedData.data.aciklama,
      },
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
    })

    await logCreate(
      "AracKisi",
      aracKisi.id,
      aracKisi as unknown as Record<string, unknown>,
      `${arac.plaka} - ${kisi.ad} ${kisi.soyad}`,
      session
    )

    return NextResponse.json(aracKisi, { status: 201 })
  } catch (error) {
    console.error("Error adding kisi to arac:", error)
    return NextResponse.json(
      { error: "Kişi araca eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
