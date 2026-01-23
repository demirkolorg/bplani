import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateModelSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/araclar/modeller/[id] - Get a single model
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        marka: { select: { id: true, ad: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!model) {
      return NextResponse.json(
        { error: "Model bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Model", id, model.ad)

    return NextResponse.json(model)
  } catch (error) {
    console.error("Error fetching model:", error)
    return NextResponse.json(
      { error: "Model getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/araclar/modeller/[id] - Update a model
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const userId = session?.id || null
    const body = await request.json()

    const validatedData = updateModelSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.model.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Model bulunamadı" },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { ...validatedData.data }
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        updateData.updatedUserId = userId
      }
    }

    const model = await prisma.model.update({
      where: { id },
      data: updateData,
      include: {
        marka: { select: { id: true, ad: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate("Model", id, existing as unknown as Record<string, unknown>, model as unknown as Record<string, unknown>, model.ad, session)

    return NextResponse.json(model)
  } catch (error) {
    console.error("Error updating model:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu marka için aynı isimde bir model zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Model güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/araclar/modeller/[id] - Delete a model
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const existing = await prisma.model.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Model bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.model.delete({
      where: { id },
    })

    await logDelete("Model", id, existing as unknown as Record<string, unknown>, existing.ad, session)

    return NextResponse.json({ message: "Model başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting model:", error)
    return NextResponse.json(
      { error: "Model silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
