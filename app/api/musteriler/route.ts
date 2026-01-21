import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createMusteriSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/musteriler - List all customers
export async function GET() {
  try {
    const musteriler = await prisma.musteri.findMany({
      orderBy: { createdAt: "desc" },
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
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    return NextResponse.json(musteriler)
  } catch (error) {
    console.error("Error fetching musteriler:", error)
    return NextResponse.json(
      { error: "Müşteriler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/musteriler - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const body = await request.json()

    const validatedData = createMusteriSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
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

    const musteri = await prisma.musteri.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        gsmler: true,
        adresler: true,
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    return NextResponse.json(musteri, { status: 201 })
  } catch (error) {
    console.error("Error creating musteri:", error)

    // Handle unique constraint violation for TC
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu TC Kimlik No ile kayıtlı bir müşteri zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Müşteri oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
