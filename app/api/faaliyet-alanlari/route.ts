import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createFaaliyetAlaniSchema, listFaaliyetAlaniQuerySchema } from "@/lib/validations"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// Helper function to build tree structure
interface FaaliyetAlaniWithChildren {
  id: string
  ad: string
  parentId: string | null
  sira: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: { ad: string; soyad: string } | null
  updatedUser: { ad: string; soyad: string } | null
  _count: { kisiler: number; children: number }
  children?: FaaliyetAlaniWithChildren[]
}

function buildTree(
  items: FaaliyetAlaniWithChildren[],
  parentId: string | null = null
): FaaliyetAlaniWithChildren[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sira - b.sira || a.ad.localeCompare(b.ad, "tr"))
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }))
}

// GET /api/faaliyet-alanlari - List all faaliyet areas (tree or flat)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = listFaaliyetAlaniQuerySchema.parse({
      parentId: searchParams.get("parentId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      flat: searchParams.get("flat") ?? undefined,
    })

    const where: Record<string, unknown> = {}

    if (query.isActive !== undefined) {
      where.isActive = query.isActive
    }

    if (query.search) {
      where.ad = { contains: query.search, mode: "insensitive" }
    }

    if (query.flat && query.parentId !== undefined) {
      where.parentId = query.parentId
    }

    const faaliyetAlanlari = await prisma.faaliyetAlani.findMany({
      where,
      orderBy: [{ sira: "asc" }, { ad: "asc" }],
      include: {
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
        _count: { select: { kisiler: true, children: true } },
      },
    })

    await logList("FaaliyetAlani", query, faaliyetAlanlari.length)

    // Return tree structure by default, flat list if requested
    if (query.flat) {
      return NextResponse.json(faaliyetAlanlari)
    }

    const tree = buildTree(faaliyetAlanlari as FaaliyetAlaniWithChildren[])
    return NextResponse.json(tree)
  } catch (error) {
    console.error("Error fetching faaliyet alanlari:", error)
    return NextResponse.json(
      { error: "Faaliyet alanları getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/faaliyet-alanlari - Create a new faaliyet area
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Yetki kontrolü: Sadece ADMIN ve YONETICI
    if (!canManageLokasyon(session)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const userId = session?.id || null
    const body = await request.json()

    const validatedData = createFaaliyetAlaniSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Validate parent exists if parentId provided
    if (validatedData.data.parentId) {
      const parent = await prisma.faaliyetAlani.findUnique({
        where: { id: validatedData.data.parentId },
      })
      if (!parent) {
        return NextResponse.json(
          { error: "Üst kategori bulunamadı" },
          { status: 404 }
        )
      }
    }

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

    const faaliyetAlani = await prisma.faaliyetAlani.create({
      data: {
        ad: validatedData.data.ad,
        parentId: validatedData.data.parentId ?? null,
        sira: validatedData.data.sira,
        isActive: validatedData.data.isActive,
        createdUserId: validUserId,
        updatedUserId: validUserId,
      },
      include: {
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
        parent: { select: { id: true, ad: true } },
        _count: { select: { kisiler: true, children: true } },
      },
    })

    await logCreate(
      "FaaliyetAlani",
      faaliyetAlani.id,
      faaliyetAlani as unknown as Record<string, unknown>,
      faaliyetAlani.ad,
      session
    )

    return NextResponse.json(faaliyetAlani, { status: 201 })
  } catch (error) {
    console.error("Error creating faaliyet alani:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu isimde bir faaliyet alanı zaten var (aynı üst kategoride)" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Faaliyet alanı oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
