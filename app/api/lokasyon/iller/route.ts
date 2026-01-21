import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createIlSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/lokasyon/iller - List all provinces
export async function GET() {
  try {
    const iller = await prisma.il.findMany({
      orderBy: { plaka: "asc" },
      include: {
        _count: { select: { ilceler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    return NextResponse.json(iller)
  } catch (error) {
    console.error("Error fetching iller:", error)
    return NextResponse.json(
      { error: "İller getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/lokasyon/iller - Create a new province
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = createIlSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const il = await prisma.il.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        _count: { select: { ilceler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    return NextResponse.json(il, { status: 201 })
  } catch (error) {
    console.error("Error creating il:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde veya plaka kodunda bir il zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "İl oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
