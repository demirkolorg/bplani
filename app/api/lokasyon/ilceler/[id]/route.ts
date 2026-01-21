import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateIlceSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/lokasyon/ilceler/[id] - Get a single district
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const ilce = await prisma.ilce.findUnique({
      where: { id },
      include: {
        il: { select: { id: true, ad: true, plaka: true } },
        _count: { select: { mahalleler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!ilce) {
      return NextResponse.json(
        { error: "İlçe bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(ilce)
  } catch (error) {
    console.error("Error fetching ilce:", error)
    return NextResponse.json(
      { error: "İlçe getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/lokasyon/ilceler/[id] - Update a district
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = updateIlceSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.ilce.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "İlçe bulunamadı" },
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

    const ilce = await prisma.ilce.update({
      where: { id },
      data: updateData,
      include: {
        il: { select: { id: true, ad: true, plaka: true } },
        _count: { select: { mahalleler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    return NextResponse.json(ilce)
  } catch (error) {
    console.error("Error updating ilce:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir ilçe bu ilde zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "İlçe güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/lokasyon/ilceler/[id] - Delete a district
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.ilce.findUnique({
      where: { id },
      include: { _count: { select: { mahalleler: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "İlçe bulunamadı" },
        { status: 404 }
      )
    }

    if (existing._count.mahalleler > 0) {
      return NextResponse.json(
        { error: "Bu ilçeye bağlı mahalleler var. Önce mahalleleri silin veya taşıyın." },
        { status: 400 }
      )
    }

    await prisma.ilce.delete({
      where: { id },
    })

    return NextResponse.json({ message: "İlçe başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting ilce:", error)
    return NextResponse.json(
      { error: "İlçe silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
