import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateMahalleSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/lokasyon/mahalleler/[id] - Get a single neighborhood
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const mahalle = await prisma.mahalle.findUnique({
      where: { id },
      include: {
        ilce: {
          select: {
            id: true,
            ad: true,
            il: { select: { id: true, ad: true, plaka: true } },
          },
        },
        _count: { select: { adresler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!mahalle) {
      return NextResponse.json(
        { error: "Mahalle bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Mahalle", id, mahalle.ad)

    return NextResponse.json(mahalle)
  } catch (error) {
    console.error("Error fetching mahalle:", error)
    return NextResponse.json(
      { error: "Mahalle getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/lokasyon/mahalleler/[id] - Update a neighborhood
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

    const validatedData = updateMahalleSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.mahalle.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Mahalle bulunamadı" },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (validatedData.data.ad !== undefined) updateData.ad = validatedData.data.ad
    if (validatedData.data.isActive !== undefined) updateData.isActive = validatedData.data.isActive

    // Verify user exists before setting updatedUserId
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        updateData.updatedUserId = userId
      }
    }

    const mahalle = await prisma.mahalle.update({
      where: { id },
      data: updateData,
      include: {
        ilce: {
          select: {
            id: true,
            ad: true,
            il: { select: { id: true, ad: true, plaka: true } },
          },
        },
        _count: { select: { adresler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate("Mahalle", id, existing as unknown as Record<string, unknown>, mahalle as unknown as Record<string, unknown>, mahalle.ad, session)

    return NextResponse.json(mahalle)
  } catch (error) {
    console.error("Error updating mahalle:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir mahalle bu ilçede zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Mahalle güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/lokasyon/mahalleler/[id] - Delete a neighborhood
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

    const existing = await prisma.mahalle.findUnique({
      where: { id },
      include: { _count: { select: { adresler: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Mahalle bulunamadı" },
        { status: 404 }
      )
    }

    if (existing._count.adresler > 0) {
      return NextResponse.json(
        { error: "Bu mahalleye bağlı adresler var. Önce adresleri silin veya taşıyın." },
        { status: 400 }
      )
    }

    await prisma.mahalle.delete({
      where: { id },
    })

    await logDelete("Mahalle", id, existing as unknown as Record<string, unknown>, existing.ad, session)

    return NextResponse.json({ message: "Mahalle başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting mahalle:", error)
    return NextResponse.json(
      { error: "Mahalle silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
