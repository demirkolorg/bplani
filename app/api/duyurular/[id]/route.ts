import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateDuyuruSchema } from "@/lib/validations"
import { getSession, isAdminOrYonetici } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/duyurular/[id] - Get a single duyuru
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const duyuru = await prisma.duyuru.findUnique({
      where: { id },
      include: {
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!duyuru) {
      return NextResponse.json(
        { error: "Duyuru bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Duyuru", id, duyuru.baslik)

    return NextResponse.json(duyuru)
  } catch (error) {
    console.error("Error fetching duyuru:", error)
    return NextResponse.json(
      { error: "Duyuru getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/duyurular/[id] - Update a duyuru (ADMIN and YONETICI only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    // Check authorization
    if (!isAdminOrYonetici(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok. Sadece ADMIN ve YONETICI duyuru güncelleyebilir." },
        { status: 403 }
      )
    }

    const userId = session?.id || null
    const { id } = await params
    const body = await request.json()

    const validatedData = updateDuyuruSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if duyuru exists
    const existing = await prisma.duyuru.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Duyuru bulunamadı" },
        { status: 404 }
      )
    }

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const duyuru = await prisma.duyuru.update({
      where: { id },
      data: {
        ...validatedData.data,
        updatedUserId: validUserId,
      },
      include: {
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate("Duyuru", id, existing as unknown as Record<string, unknown>, duyuru as unknown as Record<string, unknown>, duyuru.baslik, session)

    return NextResponse.json(duyuru)
  } catch (error) {
    console.error("Error updating duyuru:", error)
    return NextResponse.json(
      { error: "Duyuru güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/duyurular/[id] - Delete a duyuru (ADMIN and YONETICI only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    // Check authorization
    if (!isAdminOrYonetici(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok. Sadece ADMIN ve YONETICI duyuru silebilir." },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prisma.duyuru.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Duyuru bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.duyuru.delete({
      where: { id },
    })

    await logDelete("Duyuru", id, existing as unknown as Record<string, unknown>, existing.baslik, session)

    return NextResponse.json({ message: "Duyuru başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting duyuru:", error)
    return NextResponse.json(
      { error: "Duyuru silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
