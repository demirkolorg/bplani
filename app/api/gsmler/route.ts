import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createGsmSchema, updateGsmSchema, bulkCreateGsmSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/gsmler - List GSMs for a musteri, lead, or all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const musteriId = searchParams.get("musteriId")
    const leadId = searchParams.get("leadId")
    const all = searchParams.get("all")
    const search = searchParams.get("search")

    // If all=true, return all GSMs with musteri info
    if (all === "true") {
      const where: Record<string, unknown> = {}

      // Filter to only müşteri GSMs (not leads)
      where.musteriId = { not: null }

      // Search by numara or musteri name
      if (search) {
        where.OR = [
          { numara: { contains: search, mode: "insensitive" } },
          { musteri: { ad: { contains: search, mode: "insensitive" } } },
          { musteri: { soyad: { contains: search, mode: "insensitive" } } },
        ]
      }

      const gsmler = await prisma.gsm.findMany({
        where,
        orderBy: [{ musteri: { ad: "asc" } }, { numara: "asc" }],
        include: {
          musteri: {
            select: {
              id: true,
              ad: true,
              soyad: true,
            },
          },
        },
        take: 100, // Limit for performance
      })

      return NextResponse.json(gsmler)
    }

    if (!musteriId && !leadId) {
      return NextResponse.json(
        { error: "musteriId veya leadId parametresi gerekli" },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {}
    if (musteriId) where.musteriId = musteriId
    if (leadId) where.leadId = leadId

    const gsmler = await prisma.gsm.findMany({
      where,
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      include: {
        takipler: {
          orderBy: { createdAt: "desc" },
          include: {
            createdUser: {
              select: {
                id: true,
                ad: true,
                soyad: true,
              },
            },
            updatedUser: {
              select: {
                id: true,
                ad: true,
                soyad: true,
              },
            },
          },
        },
        createdUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    return NextResponse.json(gsmler)
  } catch (error) {
    console.error("Error fetching gsmler:", error)
    return NextResponse.json(
      { error: "GSM'ler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/gsmler - Create a single GSM or bulk create
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
    if (body.gsmler && Array.isArray(body.gsmler)) {
      const validatedData = bulkCreateGsmSchema.safeParse(body)
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Geçersiz veri", details: validatedData.error.flatten() },
          { status: 400 }
        )
      }

      const { musteriId, leadId, gsmler } = validatedData.data

      // If any GSM is marked as primary, unset existing primaries first
      const hasPrimary = gsmler.some((g) => g.isPrimary)
      if (hasPrimary) {
        await prisma.gsm.updateMany({
          where: musteriId ? { musteriId } : { leadId: leadId! },
          data: { isPrimary: false },
        })
      }

      const createdGsmler = await prisma.gsm.createMany({
        data: gsmler.map((gsm) => ({
          ...gsm,
          musteriId: musteriId ?? null,
          leadId: leadId ?? null,
          createdUserId: validUserId,
          updatedUserId: validUserId,
        })),
      })

      return NextResponse.json(createdGsmler, { status: 201 })
    }

    // Single GSM create
    const validatedData = createGsmSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // If this GSM is primary, unset existing primaries
    if (validatedData.data.isPrimary) {
      const { musteriId, leadId } = validatedData.data
      await prisma.gsm.updateMany({
        where: musteriId ? { musteriId } : { leadId: leadId! },
        data: { isPrimary: false },
      })
    }

    const gsm = await prisma.gsm.create({
      data: {
        ...validatedData.data,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
    })

    return NextResponse.json(gsm, { status: 201 })
  } catch (error) {
    console.error("Error creating gsm:", error)
    return NextResponse.json(
      { error: "GSM oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/gsmler?id=xxx - Update a GSM
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
    const validatedData = updateGsmSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.gsm.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "GSM bulunamadı" },
        { status: 404 }
      )
    }

    // If setting as primary, unset existing primaries
    if (validatedData.data.isPrimary) {
      await prisma.gsm.updateMany({
        where: existing.musteriId
          ? { musteriId: existing.musteriId, id: { not: id } }
          : { leadId: existing.leadId!, id: { not: id } },
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

    const gsm = await prisma.gsm.update({
      where: { id },
      data: {
        ...validatedData.data,
        updatedUserId: validUserId,
      },
    })

    return NextResponse.json(gsm)
  } catch (error) {
    console.error("Error updating gsm:", error)
    return NextResponse.json(
      { error: "GSM güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/gsmler?id=xxx - Delete a GSM
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

    const existing = await prisma.gsm.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "GSM bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.gsm.delete({ where: { id } })

    return NextResponse.json({ message: "GSM başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting gsm:", error)
    return NextResponse.json(
      { error: "GSM silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
