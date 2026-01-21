import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createNotSchema, updateNotSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/notlar - List notes for a musteri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const musteriId = searchParams.get("musteriId")

    if (!musteriId) {
      return NextResponse.json(
        { error: "musteriId parametresi gerekli" },
        { status: 400 }
      )
    }

    const notlar = await prisma.not.findMany({
      where: { musteriId },
      orderBy: { createdAt: "desc" },
      include: {
        createdUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    return NextResponse.json(notlar)
  } catch (error) {
    console.error("Error fetching notlar:", error)
    return NextResponse.json(
      { error: "Notlar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/notlar - Create a note
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({
        where: { id: userId },
        select: { id: true }
      })
      if (userExists) {
        validUserId = userId
      }
    }

    const body = await request.json()
    const validatedData = createNotSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const not = await prisma.not.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
      },
      include: {
        createdUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    return NextResponse.json(not, { status: 201 })
  } catch (error) {
    console.error("Error creating not:", error)
    return NextResponse.json(
      { error: "Not oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/notlar?id=xxx - Update a note
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id parametresi gerekli" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateNotSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.not.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Not bulunamadı" },
        { status: 404 }
      )
    }

    const not = await prisma.not.update({
      where: { id },
      data: validatedData.data,
      include: {
        createdUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    return NextResponse.json(not)
  } catch (error) {
    console.error("Error updating not:", error)
    return NextResponse.json(
      { error: "Not güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/notlar?id=xxx - Delete a note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id parametresi gerekli" },
        { status: 400 }
      )
    }

    const existing = await prisma.not.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Not bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.not.delete({ where: { id } })

    return NextResponse.json({ message: "Not başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting not:", error)
    return NextResponse.json(
      { error: "Not silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
