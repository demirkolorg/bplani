import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateFaaliyetAlaniSchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

// Helper to check for circular reference
async function wouldCreateCircle(id: string, newParentId: string): Promise<boolean> {
  if (id === newParentId) return true

  let currentId: string | null = newParentId
  while (currentId) {
    if (currentId === id) return true
    const parentRecord: { parentId: string | null } | null = await prisma.faaliyetAlani.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })
    currentId = parentRecord?.parentId || null
  }
  return false
}

// GET /api/faaliyet-alanlari/[id] - Get a single faaliyet area with children
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const faaliyetAlani = await prisma.faaliyetAlani.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, ad: true } },
        children: {
          orderBy: [{ sira: "asc" }, { ad: "asc" }],
          include: {
            _count: { select: { kisiler: true, children: true } },
          },
        },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
        _count: { select: { kisiler: true, children: true } },
      },
    })

    if (!faaliyetAlani) {
      return NextResponse.json(
        { error: "Faaliyet alanı bulunamadı" },
        { status: 404 }
      )
    }

    await logView("FaaliyetAlani", id, faaliyetAlani.ad)

    return NextResponse.json(faaliyetAlani)
  } catch (error) {
    console.error("Error fetching faaliyet alani:", error)
    return NextResponse.json(
      { error: "Faaliyet alanı getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/faaliyet-alanlari/[id] - Update a faaliyet area
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

    const validatedData = updateFaaliyetAlaniSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.faaliyetAlani.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Faaliyet alanı bulunamadı" },
        { status: 404 }
      )
    }

    // Check for circular reference if parentId is being updated
    if (validatedData.data.parentId !== undefined) {
      const newParentId = validatedData.data.parentId
      if (newParentId) {
        // Validate parent exists
        const parent = await prisma.faaliyetAlani.findUnique({
          where: { id: newParentId },
        })
        if (!parent) {
          return NextResponse.json(
            { error: "Üst kategori bulunamadı" },
            { status: 404 }
          )
        }

        // Check circular reference
        if (await wouldCreateCircle(id, newParentId)) {
          return NextResponse.json(
            { error: "Bu işlem döngüsel bir hiyerarşi oluşturur" },
            { status: 400 }
          )
        }
      }
    }

    const updateData: Record<string, unknown> = {}
    if (validatedData.data.ad !== undefined) {
      updateData.ad = validatedData.data.ad
    }
    if (validatedData.data.parentId !== undefined) {
      updateData.parentId = validatedData.data.parentId
    }
    if (validatedData.data.sira !== undefined) {
      updateData.sira = validatedData.data.sira
    }
    if (validatedData.data.isActive !== undefined) {
      updateData.isActive = validatedData.data.isActive
    }

    if (userId) {
      const userExists = await prisma.personel.findUnique({
        where: { id: userId },
        select: { id: true },
      })
      if (userExists) {
        updateData.updatedUserId = userId
      }
    }

    const faaliyetAlani = await prisma.faaliyetAlani.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, ad: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
        _count: { select: { kisiler: true, children: true } },
      },
    })

    await logUpdate(
      "FaaliyetAlani",
      id,
      existing as unknown as Record<string, unknown>,
      faaliyetAlani as unknown as Record<string, unknown>,
      faaliyetAlani.ad,
      session
    )

    return NextResponse.json(faaliyetAlani)
  } catch (error) {
    console.error("Error updating faaliyet alani:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir faaliyet alanı zaten var (aynı üst kategoride)" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Faaliyet alanı güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/faaliyet-alanlari/[id] - Delete a faaliyet area
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

    const existing = await prisma.faaliyetAlani.findUnique({
      where: { id },
      include: { _count: { select: { children: true, kisiler: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Faaliyet alanı bulunamadı" },
        { status: 404 }
      )
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: "Bu faaliyet alanına bağlı alt kategoriler var. Önce alt kategorileri silin." },
        { status: 400 }
      )
    }

    // Note: kisiler relations will be cascade deleted due to schema definition

    await prisma.faaliyetAlani.delete({
      where: { id },
    })

    await logDelete(
      "FaaliyetAlani",
      id,
      existing as unknown as Record<string, unknown>,
      existing.ad,
      session
    )

    return NextResponse.json({ message: "Faaliyet alanı başarıyla silindi" })
  } catch (error) {
    console.error("Error deleting faaliyet alani:", error)
    return NextResponse.json(
      { error: "Faaliyet alanı silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
