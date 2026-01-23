import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateOperasyonSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/operasyonlar/[id] - Get a single operasyon with all relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const operasyon = await prisma.operasyon.findUnique({
      where: { id },
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
        katilimcilar: {
          include: {
            kisi: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                tip: true,
                gsmler: {
                  orderBy: { isPrimary: "desc" },
                },
              },
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!operasyon) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Operasyon", id, operasyon.adresDetay || undefined)

    return NextResponse.json(operasyon)
  } catch (error) {
    console.error("Error fetching operasyon:", error)
    return NextResponse.json(
      { error: "Operasyon getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/operasyonlar/[id] - Update a operasyon
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const { id } = await params
    const body = await request.json()

    const validatedData = updateOperasyonSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if operasyon exists
    const existing = await prisma.operasyon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
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

    const operasyon = await prisma.operasyon.update({
      where: { id },
      data: {
        ...validatedData.data,
        updatedUserId: validUserId,
      },
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
        katilimcilar: {
          include: {
            kisi: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                tip: true,
              },
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate("Operasyon", id, existing as unknown as Record<string, unknown>, operasyon as unknown as Record<string, unknown>, operasyon.adresDetay || undefined, session)

    return NextResponse.json(operasyon)
  } catch (error) {
    console.error("Error updating operasyon:", error)
    return NextResponse.json(
      { error: "Operasyon güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/operasyonlar/[id] - Delete a operasyon
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    const existing = await prisma.operasyon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.operasyon.delete({
      where: { id },
    })

    await logDelete("Operasyon", id, existing as unknown as Record<string, unknown>, existing.adresDetay || undefined, session)

    return NextResponse.json({ message: "Operasyon başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting operasyon:", error)
    return NextResponse.json(
      { error: "Operasyon silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
