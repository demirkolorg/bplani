import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createMahalleSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/lokasyon/mahalleler - List neighborhoods (optionally filtered by ilce or il)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ilceId = searchParams.get("ilceId")
    const ilId = searchParams.get("ilId")

    const where: Record<string, unknown> = {}
    if (ilceId) {
      where.ilceId = ilceId
    }
    if (ilId) {
      where.ilce = { ilId }
    }

    const mahalleler = await prisma.mahalle.findMany({
      where,
      orderBy: { ad: "asc" },
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

    return NextResponse.json(mahalleler)
  } catch (error) {
    console.error("Error fetching mahalleler:", error)
    return NextResponse.json(
      { error: "Mahalleler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/lokasyon/mahalleler - Create a new neighborhood
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = createMahalleSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if ilce exists
    const ilce = await prisma.ilce.findUnique({
      where: { id: validatedData.data.ilceId },
    })
    if (!ilce) {
      return NextResponse.json(
        { error: "Belirtilen ilçe bulunamadı" },
        { status: 404 }
      )
    }

    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const mahalle = await prisma.mahalle.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
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

    return NextResponse.json(mahalle, { status: 201 })
  } catch (error) {
    console.error("Error creating mahalle:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir mahalle bu ilçede zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Mahalle oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
