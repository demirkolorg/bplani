import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateMusteriSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/musteriler/[id] - Get a single customer with all relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const musteri = await prisma.musteri.findUnique({
      where: { id },
      include: {
        gsmler: {
          orderBy: { isPrimary: "desc" },
        },
        adresler: {
          orderBy: { isPrimary: "desc" },
          include: {
            mahalle: {
              include: {
                ilce: {
                  include: {
                    il: true,
                  },
                },
              },
            },
          },
        },
        notlar: {
          orderBy: { createdAt: "desc" },
          include: {
            createdUser: {
              select: { ad: true, soyad: true },
            },
          },
        },
        createdUser: {
          select: { ad: true, soyad: true },
        },
        updatedUser: {
          select: { ad: true, soyad: true },
        },
      },
    })

    if (!musteri) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(musteri)
  } catch (error) {
    console.error("Error fetching musteri:", error)
    return NextResponse.json(
      { error: "Müşteri getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/musteriler/[id] - Update a customer
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const { id } = await params
    const body = await request.json()

    const validatedData = updateMusteriSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if musteri exists
    const existing = await prisma.musteri.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
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

    const musteri = await prisma.musteri.update({
      where: { id },
      data: {
        ...validatedData.data,
        updatedUserId: validUserId,
      },
      include: {
        gsmler: true,
        adresler: {
          include: {
            mahalle: {
              include: {
                ilce: {
                  include: {
                    il: true,
                  },
                },
              },
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    return NextResponse.json(musteri)
  } catch (error) {
    console.error("Error updating musteri:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu TC Kimlik No ile kayıtlı bir müşteri zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Müşteri güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/musteriler/[id] - Delete a customer
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.musteri.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.musteri.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Müşteri başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting musteri:", error)
    return NextResponse.json(
      { error: "Müşteri silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
