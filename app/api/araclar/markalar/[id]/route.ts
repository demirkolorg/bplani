import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateMarkaSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/araclar/markalar/[id] - Get a single brand
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const marka = await prisma.marka.findUnique({
      where: { id },
      include: {
        _count: { select: { modeller: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!marka) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Marka", id, marka.ad)

    return NextResponse.json(marka)
  } catch (error) {
    console.error("Error fetching marka:", error)
    return NextResponse.json(
      { error: "Marka getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/araclar/markalar/[id] - Update a brand
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

    const validatedData = updateMarkaSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.marka.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
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

    const marka = await prisma.marka.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { modeller: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate("Marka", id, existing as unknown as Record<string, unknown>, marka as unknown as Record<string, unknown>, marka.ad, session)

    return NextResponse.json(marka)
  } catch (error) {
    console.error("Error updating marka:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir marka zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Marka güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/araclar/markalar/[id] - Delete a brand
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

    const existing = await prisma.marka.findUnique({
      where: { id },
      include: { _count: { select: { modeller: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      )
    }

    if (existing._count.modeller > 0) {
      return NextResponse.json(
        { error: "Bu markaya bağlı modeller var. Önce modelleri silin veya taşıyın." },
        { status: 400 }
      )
    }

    await prisma.marka.delete({
      where: { id },
    })

    await logDelete("Marka", id, existing as unknown as Record<string, unknown>, existing.ad, session)

    return NextResponse.json({ message: "Marka başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting marka:", error)
    return NextResponse.json(
      { error: "Marka silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
