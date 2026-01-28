import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createGsmSchema, updateGsmSchema, bulkCreateGsmSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate, logUpdate, logDelete, logBulkCreate } from "@/lib/logger"
import { validationErrorResponse, handleApiError, errorResponse } from "@/lib/api-response"
import { ConflictError, NotFoundError } from "@/types/errors"

// Normalize GSM number (add leading 0 if missing, remove spaces)
function normalizeGsmNumber(numara: string): string {
  const cleaned = numara.replace(/\s/g, "")
  return cleaned.startsWith("0") ? cleaned : `0${cleaned}`
}

// GET /api/gsmler - List GSMs for a kisi or all (for takip creation)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kisiId = searchParams.get("kisiId")
    const all = searchParams.get("all")
    const search = searchParams.get("search")

    // If all=true, return all GSMs with kisi info (for takip creation)
    if (all === "true") {
      const where: Record<string, unknown> = {}

      // Filter to only MÜŞTERİ kişi GSMs (leads can't have takip)
      where.kisi = { tt: true }

      // Search by numara or kisi name
      if (search) {
        where.OR = [
          { numara: { contains: search, mode: "insensitive" } },
          { kisi: { ad: { contains: search, mode: "insensitive" } } },
          { kisi: { soyad: { contains: search, mode: "insensitive" } } },
        ]
      }

      const gsmler = await prisma.gsm.findMany({
        where,
        orderBy: [{ kisi: { ad: "asc" } }, { numara: "asc" }],
        include: {
          kisi: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              tt: true,
            },
          },
        },
        take: 100, // Limit for performance
      })

      await logList("Gsm", { all: true, search }, gsmler.length)
      return NextResponse.json(gsmler)
    }

    if (!kisiId) {
      return errorResponse("kisiId parametresi gerekli", 400)
    }

    const gsmler = await prisma.gsm.findMany({
      where: { kisiId },
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

    await logList("Gsm", { kisiId }, gsmler.length)
    return NextResponse.json(gsmler)
  } catch (error) {
    return handleApiError(error, "GSM_LIST")
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
        return validationErrorResponse(validatedData.error)
      }

      const { kisiId, gsmler } = validatedData.data

      // Check for duplicate GSMs (normalized numbers are already in validatedData)
      const numaralar = gsmler.map(g => g.numara)
      const existingGsms = await prisma.gsm.findMany({
        where: {
          numara: { in: numaralar }
        },
        select: {
          numara: true,
        }
      })

      if (existingGsms.length > 0) {
        const duplicates = existingGsms.map(g => g.numara).join(", ")
        return handleApiError(
          new ConflictError(`Bu GSM numaraları sistemde zaten kayıtlı: ${duplicates}`),
          "GSM_BULK_CREATE"
        )
      }

      // If any GSM is marked as primary, unset existing primaries first
      const hasPrimary = gsmler.some((g) => g.isPrimary)
      if (hasPrimary) {
        await prisma.gsm.updateMany({
          where: { kisiId },
          data: { isPrimary: false },
        })
      }

      const createdGsmler = await prisma.gsm.createMany({
        data: gsmler.map((gsm) => ({
          ...gsm,
          kisiId,
          createdUserId: validUserId,
          updatedUserId: validUserId,
        })),
      })

      await logBulkCreate("Gsm", createdGsmler.count, [], session)
      return NextResponse.json(createdGsmler, { status: 201 })
    }

    // Single GSM create
    const validatedData = createGsmSchema.safeParse(body)
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    // Normalize the number for duplicate check (validation already normalizes it)
    const normalizedNumara = validatedData.data.numara

    // Check if GSM already exists (check normalized version)
    const existingGsm = await prisma.gsm.findFirst({
      where: { numara: normalizedNumara },
      include: {
        kisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    if (existingGsm) {
      return NextResponse.json(
        {
          error: "Bu GSM numarası sistemde zaten kayıtlı",
          existingKisi: {
            id: existingGsm.kisi.id,
            ad: existingGsm.kisi.ad,
            soyad: existingGsm.kisi.soyad,
          },
        },
        { status: 409 }
      )
    }

    // If this GSM is primary, unset existing primaries
    if (validatedData.data.isPrimary) {
      await prisma.gsm.updateMany({
        where: { kisiId: validatedData.data.kisiId },
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

    await logCreate("Gsm", gsm.id, gsm as unknown as Record<string, unknown>, gsm.numara, session)
    return NextResponse.json(gsm, { status: 201 })
  } catch (error) {
    return handleApiError(error, "GSM_CREATE")
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
      return errorResponse("id parametresi gerekli", 400)
    }

    const body = await request.json()
    const validatedData = updateGsmSchema.safeParse(body)
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const existing = await prisma.gsm.findUnique({ where: { id } })
    if (!existing) {
      return handleApiError(
        new NotFoundError("GSM bulunamadı"),
        "GSM_UPDATE"
      )
    }

    // If setting as primary, unset existing primaries
    if (validatedData.data.isPrimary) {
      await prisma.gsm.updateMany({
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

    const gsm = await prisma.gsm.update({
      where: { id },
      data: {
        ...validatedData.data,
        updatedUserId: validUserId,
      },
    })

    await logUpdate("Gsm", gsm.id, existing as unknown as Record<string, unknown>, gsm as unknown as Record<string, unknown>, gsm.numara, session)
    return NextResponse.json(gsm)
  } catch (error) {
    return handleApiError(error, "GSM_UPDATE")
  }
}

// DELETE /api/gsmler?id=xxx - Delete a GSM
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return errorResponse("id parametresi gerekli", 400)
    }

    const existing = await prisma.gsm.findUnique({ where: { id } })
    if (!existing) {
      return handleApiError(
        new NotFoundError("GSM bulunamadı"),
        "GSM_DELETE"
      )
    }

    await prisma.gsm.delete({ where: { id } })

    await logDelete("Gsm", id, existing as unknown as Record<string, unknown>, existing.numara, session)
    return NextResponse.json({ message: "GSM başarıyla silindi" })
  } catch (error) {
    return handleApiError(error, "GSM_DELETE")
  }
}
