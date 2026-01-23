import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createMarkaSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// GET /api/araclar/markalar - List all brands
export async function GET() {
  try {
    const markalar = await prisma.marka.findMany({
      orderBy: { ad: "asc" },
      include: {
        _count: { select: { modeller: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logList("Marka", {}, markalar.length)

    return NextResponse.json(markalar)
  } catch (error) {
    console.error("Error fetching markalar:", error)
    return NextResponse.json(
      { error: "Markalar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/araclar/markalar - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const userId = session?.id || null
    const body = await request.json()

    const validatedData = createMarkaSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const marka = await prisma.marka.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        _count: { select: { modeller: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logCreate("Marka", marka.id, marka as unknown as Record<string, unknown>, marka.ad, session)

    return NextResponse.json(marka, { status: 201 })
  } catch (error) {
    console.error("Error creating marka:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir marka zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Marka oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
