import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createIlceSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// GET /api/lokasyon/ilceler - List districts (optionally filtered by il)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ilId = searchParams.get("ilId")

    const where: Record<string, unknown> = {}
    if (ilId) {
      where.ilId = ilId
    }

    const ilceler = await prisma.ilce.findMany({
      where,
      orderBy: { ad: "asc" },
      include: {
        il: { select: { id: true, ad: true, plaka: true } },
        _count: { select: { mahalleler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logList("İlçe", { ilId }, ilceler.length)

    return NextResponse.json(ilceler)
  } catch (error) {
    console.error("Error fetching ilceler:", error)
    return NextResponse.json(
      { error: "İlçeler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/lokasyon/ilceler - Create a new district
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

    const validatedData = createIlceSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if il exists
    const il = await prisma.il.findUnique({
      where: { id: validatedData.data.ilId },
    })
    if (!il) {
      return NextResponse.json(
        { error: "Belirtilen il bulunamadı" },
        { status: 404 }
      )
    }

    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const ilce = await prisma.ilce.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        il: { select: { id: true, ad: true, plaka: true } },
        _count: { select: { mahalleler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logCreate("İlçe", ilce.id, ilce as unknown as Record<string, unknown>, ilce.ad, session)

    return NextResponse.json(ilce, { status: 201 })
  } catch (error) {
    console.error("Error creating ilce:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir ilçe bu ilde zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "İlçe oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
