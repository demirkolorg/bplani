import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createAdresSchema, updateAdresSchema, bulkCreateAdresSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/adresler - List addresses for a kisi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kisiId = searchParams.get("kisiId")

    if (!kisiId) {
      return NextResponse.json(
        { error: "kisiId parametresi gerekli" },
        { status: 400 }
      )
    }

    const adresler = await prisma.adres.findMany({
      where: { kisiId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
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
    })

    return NextResponse.json(adresler)
  } catch (error) {
    console.error("Error fetching adresler:", error)
    return NextResponse.json(
      { error: "Adresler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/adresler - Create a single address or bulk create
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const body = await request.json()

    // Check if it's a bulk create request
    if (body.adresler && Array.isArray(body.adresler)) {
      const validatedData = bulkCreateAdresSchema.safeParse(body)
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Geçersiz veri", details: validatedData.error.flatten() },
          { status: 400 }
        )
      }

      const { kisiId, adresler } = validatedData.data

      // If any address is marked as primary, unset existing primaries first
      const hasPrimary = adresler.some((a) => a.isPrimary)
      if (hasPrimary) {
        await prisma.adres.updateMany({
          where: { kisiId },
          data: { isPrimary: false },
        })
      }

      const createdAdresler = await prisma.adres.createMany({
        data: adresler.map((adres) => ({
          ...adres,
          kisiId,
          createdUserId: validUserId,
          updatedUserId: validUserId,
        })),
      })

      return NextResponse.json(createdAdresler, { status: 201 })
    }

    // Single address create
    const validatedData = createAdresSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // If this address is primary, unset existing primaries
    if (validatedData.data.isPrimary) {
      await prisma.adres.updateMany({
        where: { kisiId: validatedData.data.kisiId },
        data: { isPrimary: false },
      })
    }

    const adres = await prisma.adres.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
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
      },
    })

    return NextResponse.json(adres, { status: 201 })
  } catch (error) {
    console.error("Error creating adres:", error)
    return NextResponse.json(
      { error: "Adres oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/adresler?id=xxx - Update an address
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id parametresi gerekli" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateAdresSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.adres.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Adres bulunamadı" },
        { status: 404 }
      )
    }

    // If setting as primary, unset existing primaries
    if (validatedData.data.isPrimary) {
      await prisma.adres.updateMany({
        where: { kisiId: existing.kisiId, id: { not: id } },
        data: { isPrimary: false },
      })
    }

    // Validate user exists before assigning
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({ where: { id: userId }, select: { id: true } })
      if (userExists) {
        validUserId = userId
      }
    }

    const adres = await prisma.adres.update({
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
      },
    })

    return NextResponse.json(adres)
  } catch (error) {
    console.error("Error updating adres:", error)
    return NextResponse.json(
      { error: "Adres güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/adresler?id=xxx - Delete an address
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

    const existing = await prisma.adres.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Adres bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.adres.delete({ where: { id } })

    return NextResponse.json({ message: "Adres başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting adres:", error)
    return NextResponse.json(
      { error: "Adres silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
