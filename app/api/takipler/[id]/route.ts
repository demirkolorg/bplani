import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateTakipSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/takipler/[id] - Get single takip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const takip = await prisma.takip.findUnique({
      where: { id },
      include: {
        gsm: {
          include: {
            kisi: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                tip: true,
                fotograf: true,
              },
            },
          },
        },
        alarmlar: {
          orderBy: { tetikTarihi: "asc" },
        },
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
    })

    if (!takip) {
      return NextResponse.json(
        { error: "Takip bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(takip)
  } catch (error) {
    console.error("Error fetching takip:", error)
    return NextResponse.json(
      { error: "Takip getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/takipler/[id] - Update takip
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getSession()
    const userId = session?.id || null

    // Check if takip exists with GSM info
    const existing = await prisma.takip.findUnique({
      where: { id },
      include: {
        gsm: {
          select: { kisiId: true },
        },
      },
    })
    if (!existing) {
      return NextResponse.json(
        { error: "Takip bulunamadı" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateTakipSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Validate user exists
    let validUserId: string | null = null
    if (userId) {
      const userExists = await prisma.personel.findUnique({
        where: { id: userId },
        select: { id: true },
      })
      if (userExists) {
        validUserId = userId
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      ...validatedData.data,
      updatedUserId: validUserId,
    }

    const takip = await prisma.takip.update({
      where: { id },
      data: updateData,
      include: {
        gsm: {
          include: {
            kisi: {
              select: {
                id: true,
                ad: true,
                soyad: true,
                tip: true,
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
        updatedUser: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
    })

    // MUSTERI → LEAD: Takip pasife alındıysa, aktif takip kalmadıysa kişiyi LEAD'e düşür
    const kisiId = existing.gsm.kisiId
    if (kisiId && validatedData.data.isActive === false && existing.isActive === true) {
      // Kişinin diğer aktif takiplerini kontrol et
      const remainingActiveTakipler = await prisma.takip.count({
        where: {
          gsm: { kisiId },
          isActive: true,
        },
      })

      if (remainingActiveTakipler === 0) {
        await prisma.kisi.updateMany({
          where: {
            id: kisiId,
            tip: "MUSTERI",
          },
          data: {
            tip: "LEAD",
            updatedUserId: validUserId,
          },
        })
      }
    }

    return NextResponse.json(takip)
  } catch (error) {
    console.error("Error updating takip:", error)
    return NextResponse.json(
      { error: "Takip güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/takipler/[id] - Delete takip
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getSession()
    const userId = session?.id || null

    const existing = await prisma.takip.findUnique({
      where: { id },
      include: {
        gsm: {
          select: { kisiId: true },
        },
        _count: {
          select: { alarmlar: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Takip bulunamadı" },
        { status: 404 }
      )
    }

    const kisiId = existing.gsm.kisiId

    // Delete takip (alarms will be cascade deleted)
    await prisma.takip.delete({ where: { id } })

    // MUSTERI → LEAD: Aktif takip kalmadıysa kişiyi LEAD'e düşür
    if (kisiId) {
      // Validate user exists for log
      let validUserId: string | null = null
      if (userId) {
        const userExists = await prisma.personel.findUnique({
          where: { id: userId },
          select: { id: true },
        })
        if (userExists) {
          validUserId = userId
        }
      }

      // Kişinin diğer aktif takiplerini kontrol et
      const remainingActiveTakipler = await prisma.takip.count({
        where: {
          gsm: { kisiId },
          isActive: true,
        },
      })

      if (remainingActiveTakipler === 0) {
        await prisma.kisi.updateMany({
          where: {
            id: kisiId,
            tip: "MUSTERI",
          },
          data: {
            tip: "LEAD",
            updatedUserId: validUserId,
          },
        })
      }
    }

    return NextResponse.json({ message: "Takip başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting takip:", error)
    return NextResponse.json(
      { error: "Takip silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
