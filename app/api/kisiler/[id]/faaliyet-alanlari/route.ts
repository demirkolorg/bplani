import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logUpdate } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

const updateFaaliyetAlanlariSchema = z.object({
  faaliyetAlaniIds: z.array(z.string().cuid()),
})

// GET /api/kisiler/[id]/faaliyet-alanlari - Get faaliyet alanlari for a kisi
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const kisi = await prisma.kisi.findUnique({
      where: { id },
      include: {
        faaliyetAlanlari: {
          include: {
            faaliyetAlani: {
              select: {
                id: true,
                ad: true,
                parentId: true,
                parent: { select: { ad: true } },
              },
            },
          },
        },
      },
    })

    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(kisi.faaliyetAlanlari)
  } catch (error) {
    console.error("Error fetching kisi faaliyet alanlari:", error)
    return NextResponse.json(
      { error: "Faaliyet alanları getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/kisiler/[id]/faaliyet-alanlari - Update faaliyet alanlari for a kisi
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params
    const body = await request.json()

    const validatedData = updateFaaliyetAlanlariSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if kisi exists and get previous faaliyet alanlari
    const kisi = await prisma.kisi.findUnique({
      where: { id },
      include: {
        faaliyetAlanlari: {
          include: {
            faaliyetAlani: {
              select: { id: true, ad: true },
            },
          },
        },
      },
    })
    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    // Store previous state for logging
    const oncekiFaaliyetAlanlari = kisi.faaliyetAlanlari.map((f) => ({
      id: f.faaliyetAlani.id,
      ad: f.faaliyetAlani.ad,
    }))

    const { faaliyetAlaniIds } = validatedData.data

    // Validate all faaliyet alani IDs exist
    if (faaliyetAlaniIds.length > 0) {
      const existingCount = await prisma.faaliyetAlani.count({
        where: { id: { in: faaliyetAlaniIds } },
      })
      if (existingCount !== faaliyetAlaniIds.length) {
        return NextResponse.json(
          { error: "Bazı faaliyet alanları bulunamadı" },
          { status: 400 }
        )
      }
    }

    // Delete existing relations and create new ones in a transaction
    await prisma.$transaction([
      prisma.kisiFaaliyetAlani.deleteMany({
        where: { kisiId: id },
      }),
      ...(faaliyetAlaniIds.length > 0
        ? [
            prisma.kisiFaaliyetAlani.createMany({
              data: faaliyetAlaniIds.map((faaliyetAlaniId) => ({
                kisiId: id,
                faaliyetAlaniId,
              })),
            }),
          ]
        : []),
    ])

    // Fetch updated relations
    const updatedFaaliyetAlanlari = await prisma.kisiFaaliyetAlani.findMany({
      where: { kisiId: id },
      include: {
        faaliyetAlani: {
          select: {
            id: true,
            ad: true,
            parentId: true,
            parent: { select: { ad: true } },
          },
        },
      },
    })

    // Log the update
    const yeniFaaliyetAlanlari = updatedFaaliyetAlanlari.map((f) => ({
      id: f.faaliyetAlani.id,
      ad: f.faaliyetAlani.ad,
    }))

    await logUpdate(
      "Kişi Faaliyet Alanları",
      id,
      { faaliyetAlanlari: oncekiFaaliyetAlanlari },
      { faaliyetAlanlari: yeniFaaliyetAlanlari },
      `${kisi.ad} ${kisi.soyad}`,
      session
    )

    return NextResponse.json(updatedFaaliyetAlanlari)
  } catch (error) {
    console.error("Error updating kisi faaliyet alanlari:", error)
    return NextResponse.json(
      { error: "Faaliyet alanları güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
