import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateAracSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/araclar/vehicles/[id] - Get a single vehicle
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const arac = await prisma.arac.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            marka: { select: { id: true, ad: true } },
          },
        },
        kisiler: {
          include: {
            kisi: { select: { id: true, ad: true, soyad: true, tt: true } },
          },
        },
        tanitimlar: {
          include: {
            tanitim: {
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
                        tc: true,
                        tt: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            tanitim: {
              tarih: "desc",
            },
          },
        },
        operasyonlar: {
          include: {
            operasyon: {
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
                        tc: true,
                        tt: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            operasyon: {
              tarih: "desc",
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    if (!arac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Arac", arac.id, arac.plaka)

    return NextResponse.json(arac)
  } catch (error) {
    console.error("Error fetching arac:", error)
    return NextResponse.json(
      { error: "Araç getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/araclar/vehicles/[id] - Update a vehicle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = session?.id || null
    const body = await request.json()

    const validatedData = updateAracSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existingArac = await prisma.arac.findUnique({
      where: { id },
      include: {
        kisiler: { select: { kisiId: true } },
      },
    })

    if (!existingArac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
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

    const { kisiIds, ...aracData } = validatedData.data

    // If kisiIds is provided, update the relationships
    const kisiOperations = kisiIds !== undefined ? {
      kisiler: {
        deleteMany: {},
        create: kisiIds.map(kisiId => ({ kisiId })),
      },
    } : {}

    const arac = await prisma.arac.update({
      where: { id },
      data: {
        ...aracData,
        updatedUserId: validUserId,
        ...kisiOperations,
      },
      include: {
        model: {
          include: {
            marka: { select: { id: true, ad: true } },
          },
        },
        kisiler: {
          include: {
            kisi: { select: { id: true, ad: true, soyad: true, tt: true } },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    await logUpdate(
      "Arac",
      arac.id,
      existingArac as unknown as Record<string, unknown>,
      arac as unknown as Record<string, unknown>,
      arac.plaka,
      session
    )

    return NextResponse.json(arac)
  } catch (error) {
    console.error("Error updating arac:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu plaka ile bir araç zaten kayıtlı" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Araç güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/araclar/vehicles/[id] - Delete a vehicle
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const { id } = await params

    const existingArac = await prisma.arac.findUnique({
      where: { id },
    })

    if (!existingArac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.arac.delete({
      where: { id },
    })

    await logDelete("Arac", id, existingArac as unknown as Record<string, unknown>, existingArac.plaka, session)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting arac:", error)
    return NextResponse.json(
      { error: "Araç silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
