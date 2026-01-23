import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateIlSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/lokasyon/iller/[id] - Get a single province
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const il = await prisma.il.findUnique({
      where: { id },
      include: {
        _count: { select: { ilceler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!il) {
      return NextResponse.json(
        { error: "İl bulunamadı" },
        { status: 404 }
      )
    }

    await logView("İl", id, il.ad)

    return NextResponse.json(il)
  } catch (error) {
    console.error("Error fetching il:", error)
    return NextResponse.json(
      { error: "İl getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/lokasyon/iller/[id] - Update a province
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

    const validatedData = updateIlSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.il.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "İl bulunamadı" },
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

    const il = await prisma.il.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { ilceler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate("İl", id, existing as unknown as Record<string, unknown>, il as unknown as Record<string, unknown>, il.ad, session)

    return NextResponse.json(il)
  } catch (error) {
    console.error("Error updating il:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde veya plaka kodunda bir il zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "İl güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/lokasyon/iller/[id] - Delete a province
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

    const existing = await prisma.il.findUnique({
      where: { id },
      include: { _count: { select: { ilceler: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "İl bulunamadı" },
        { status: 404 }
      )
    }

    if (existing._count.ilceler > 0) {
      return NextResponse.json(
        { error: "Bu ile bağlı ilçeler var. Önce ilçeleri silin veya taşıyın." },
        { status: 400 }
      )
    }

    await prisma.il.delete({
      where: { id },
    })

    await logDelete("İl", id, existing as unknown as Record<string, unknown>, existing.ad, session)

    return NextResponse.json({ message: "İl başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting il:", error)
    return NextResponse.json(
      { error: "İl silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
