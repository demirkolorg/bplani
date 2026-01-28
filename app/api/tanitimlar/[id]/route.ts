import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateTanitimSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/tanitimlar/[id] - Get a single tanitim with all relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const tanitim = await prisma.tanitim.findUnique({
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
                tc: true,
                tt: true,
                gsmler: {
                  orderBy: { isPrimary: "desc" },
                },
              },
            },
          },
        },
        araclar: {
          include: {
            arac: {
              include: {
                model: {
                  include: {
                    marka: true,
                  },
                },
                kisiler: {
                  include: {
                    kisi: {
                      select: {
                        id: true,
                        ad: true,
                        soyad: true,
                      },
                    },
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

    if (!tanitim) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Tanıtım", id, tanitim.adresDetay || undefined)

    return NextResponse.json(tanitim)
  } catch (error) {
    console.error("Error fetching tanitim:", error)
    return NextResponse.json(
      { error: "Tanıtım getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/tanitimlar/[id] - Update a tanitim
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const { id } = await params
    const body = await request.json()

    const validatedData = updateTanitimSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if tanitim exists
    const existing = await prisma.tanitim.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
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

    const tanitim = await prisma.tanitim.update({
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
                tc: true,
                tt: true,
              },
            },
          },
        },
        araclar: {
          include: {
            arac: {
              include: {
                model: {
                  include: {
                    marka: true,
                  },
                },
                kisiler: {
                  include: {
                    kisi: {
                      select: {
                        id: true,
                        ad: true,
                        soyad: true,
                      },
                    },
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

    await logUpdate("Tanıtım", id, existing as unknown as Record<string, unknown>, tanitim as unknown as Record<string, unknown>, tanitim.adresDetay || undefined, session)

    return NextResponse.json(tanitim)
  } catch (error) {
    console.error("Error updating tanitim:", error)
    return NextResponse.json(
      { error: "Tanıtım güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/tanitimlar/[id] - Delete a tanitim
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    const existing = await prisma.tanitim.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.tanitim.delete({
      where: { id },
    })

    await logDelete("Tanıtım", id, existing as unknown as Record<string, unknown>, existing.adresDetay || undefined, session)

    return NextResponse.json({ message: "Tanıtım başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting tanitim:", error)
    return NextResponse.json(
      { error: "Tanıtım silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
