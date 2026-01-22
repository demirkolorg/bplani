import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateKisiSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/kisiler/[id] - Get a single kisi with all relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const kisi = await prisma.kisi.findUnique({
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

    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(kisi)
  } catch (error) {
    console.error("Error fetching kisi:", error)
    return NextResponse.json(
      { error: "Kişi getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/kisiler/[id] - Update a kisi
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const { id } = await params
    const body = await request.json()

    const validatedData = updateKisiSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if kisi exists
    const existing = await prisma.kisi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
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

    const kisi = await prisma.kisi.update({
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

    return NextResponse.json(kisi)
  } catch (error) {
    console.error("Error updating kisi:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu TC Kimlik No ile kayıtlı bir kişi zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Kişi güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/kisiler/[id] - Delete a kisi
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.kisi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.kisi.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Kişi başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting kisi:", error)
    return NextResponse.json(
      { error: "Kişi silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
