import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateKisiSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/kisiler/[id] - Get a single kisi with all relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const kisi = await prisma.kisi.findUnique({
      where: { id },
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
        notlar: {
          orderBy: { createdAt: "desc" },
          include: {
            createdUser: {
              select: { ad: true, soyad: true },
            },
          },
        },
        faaliyetAlanlari: {
          include: {
            faaliyetAlani: {
              select: {
                id: true,
                ad: true,
                parent: { select: { ad: true } },
              },
            },
          },
        },
        createdUser: {
          select: { ad: true, soyad: true },
        },
        updatedUser: {
          select: { ad: true, soyad: true },
        },
      },
    })

    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Kişi", id, `${kisi.ad} ${kisi.soyad}`)

    return NextResponse.json(kisi)
  } catch (error) {
    console.error("Error fetching kisi:", error)
    return NextResponse.json(
      { error: "Kişi getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/kisiler/[id] - Update a kisi
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const userId = session?.id || null

    const { id } = await params
    const body = await request.json()

    const validatedData = updateKisiSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if kisi exists
    const existing = await prisma.kisi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
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

    // Extract faaliyetAlaniIds from validated data
    const { faaliyetAlaniIds, ...kisiData } = validatedData.data

    const kisi = await prisma.kisi.update({
      where: { id },
      data: {
        ...kisiData,
        updatedUserId: validUserId,
      },
      include: {
        gsmler: true,
        adresler: {
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
        faaliyetAlanlari: {
          include: {
            faaliyetAlani: {
              select: { id: true, ad: true },
            },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })

    // Update faaliyet alanlari if provided
    if (faaliyetAlaniIds !== undefined) {
      // Delete existing relations
      await prisma.kisiFaaliyetAlani.deleteMany({
        where: { kisiId: id },
      })

      // Create new relations
      if (faaliyetAlaniIds.length > 0) {
        await prisma.kisiFaaliyetAlani.createMany({
          data: faaliyetAlaniIds.map((faaliyetAlaniId) => ({
            kisiId: id,
            faaliyetAlaniId,
          })),
        })
      }

      // Re-fetch to get updated faaliyet alanlari
      const updatedKisi = await prisma.kisi.findUnique({
        where: { id },
        include: {
          gsmler: true,
          adresler: {
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
          faaliyetAlanlari: {
            include: {
              faaliyetAlani: {
                select: { id: true, ad: true },
              },
            },
          },
          createdUser: { select: { ad: true, soyad: true } },
          updatedUser: { select: { ad: true, soyad: true } },
        },
      })

      // Log güncelleme
      await logUpdate(
        "Kisi",
        kisi.id,
        existing as unknown as Record<string, unknown>,
        updatedKisi as unknown as Record<string, unknown>,
        `${kisi.ad} ${kisi.soyad}`,
        session
      )

      return NextResponse.json(updatedKisi)
    }

    // Log güncelleme
    await logUpdate(
      "Kisi",
      kisi.id,
      existing as unknown as Record<string, unknown>,
      kisi as unknown as Record<string, unknown>,
      `${kisi.ad} ${kisi.soyad}`,
      session
    )

    return NextResponse.json(kisi)
  } catch (error) {
    console.error("Error updating kisi:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu TC Kimlik No ile kayıtlı bir kişi zaten var" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Kişi güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/kisiler/[id] - Delete a kisi
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    const existing = await prisma.kisi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.kisi.delete({
      where: { id },
    })

    // Log silme
    await logDelete(
      "Kisi",
      id,
      existing as unknown as Record<string, unknown>,
      `${existing.ad} ${existing.soyad}`,
      session
    )

    return NextResponse.json({ message: "Kişi başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting kisi:", error)
    return NextResponse.json(
      { error: "Kişi silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
