import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { createPersonelSchema, listPersonelQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"

// Yetki kontrolü - sadece ADMIN ve YONETICI erişebilir
async function checkPermission() {
  const session = await getSession()
  if (!session) {
    return { error: "Oturum bulunamadı", status: 401 }
  }
  if (session.rol !== "ADMIN" && session.rol !== "YONETICI") {
    return { error: "Bu işlem için yetkiniz yok", status: 403 }
  }
  return { session }
}

// GET /api/personel - List all personel with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const permCheck = await checkPermission()
    if ("error" in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listPersonelQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, search, rol, isActive, sortBy, sortOrder } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    if (rol) {
      where.rol = rol
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive
    }

    if (search) {
      where.OR = [
        { ad: { contains: search, mode: "insensitive" } },
        { soyad: { contains: search, mode: "insensitive" } },
        { visibleId: { contains: search } },
      ]
    }

    // Get total count
    const total = await prisma.personel.count({ where })

    // Get paginated results
    const personeller = await prisma.personel.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        visibleId: true,
        ad: true,
        soyad: true,
        rol: true,
        fotograf: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdKisiler: true,
            createdTakipler: true,
            createdNotlar: true,
            createdTanitimlar: true,
          },
        },
      },
    })

    await logList("Personel", { page, limit, search, rol, isActive, sortBy, sortOrder }, personeller.length, permCheck.session)

    return NextResponse.json({
      data: personeller,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching personeller:", error)
    return NextResponse.json(
      { error: "Personeller getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/personel - Create a new personel
export async function POST(request: NextRequest) {
  try {
    const permCheck = await checkPermission()
    if ("error" in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status })
    }

    // Sadece ADMIN yeni kullanıcı oluşturabilir
    if (permCheck.session.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "Yeni kullanıcı oluşturmak için Admin yetkisi gereklidir" },
        { status: 403 }
      )
    }

    const body = await request.json()

    const validatedData = createPersonelSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if visibleId already exists
    const existing = await prisma.personel.findUnique({
      where: { visibleId: validatedData.data.visibleId },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Bu kullanıcı ID zaten kullanılıyor" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.data.parola, 10)

    const personel = await prisma.personel.create({
      data: {
        ...validatedData.data,
        parola: hashedPassword,
      },
      select: {
        id: true,
        visibleId: true,
        ad: true,
        soyad: true,
        rol: true,
        fotograf: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await logCreate("Personel", personel.id, personel as unknown as Record<string, unknown>, `${personel.ad} ${personel.soyad}`, permCheck.session)

    return NextResponse.json(personel, { status: 201 })
  } catch (error) {
    console.error("Error creating personel:", error)
    return NextResponse.json(
      { error: "Personel oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
