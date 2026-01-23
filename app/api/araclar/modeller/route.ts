import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createModelSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// GET /api/araclar/modeller - List all models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const markaId = searchParams.get("markaId")

    const modeller = await prisma.model.findMany({
      where: markaId ? { markaId } : undefined,
      orderBy: { ad: "asc" },
      include: {
        marka: { select: { id: true, ad: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logList("Model", { markaId }, modeller.length)

    return NextResponse.json(modeller)
  } catch (error) {
    console.error("Error fetching modeller:", error)
    return NextResponse.json(
      { error: "Modeller getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/araclar/modeller - Create a new model
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

    const validatedData = createModelSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Marka var mı kontrol et
    const markaExists = await prisma.marka.findUnique({
      where: { id: validatedData.data.markaId },
    })
    if (!markaExists) {
      return NextResponse.json(
        { error: "Belirtilen marka bulunamadı" },
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

    const model = await prisma.model.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        marka: { select: { id: true, ad: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logCreate("Model", model.id, model as unknown as Record<string, unknown>, model.ad, session)

    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    console.error("Error creating model:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu marka için aynı isimde bir model zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Model oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
