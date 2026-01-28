import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { createPersonelSchema, listPersonelQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logCreate } from "@/lib/logger"
import { validationErrorResponse, handleApiError, errorResponse } from "@/lib/api-response"
import { ConflictError, AuthenticationError } from "@/types/errors"

// Yetki kontrolü - sadece ADMIN ve YONETICI erişebilir
async function checkPermission() {
  const session = await getSession()
  if (!session) {
    throw new AuthenticationError("Oturum bulunamadı")
  }
  if (session.rol !== "ADMIN" && session.rol !== "YONETICI") {
    throw new AuthenticationError("Bu işlem için yetkiniz yok")
  }
  return { session }
}

// GET /api/personel - List all personel with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { session } = await checkPermission()

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listPersonelQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return validationErrorResponse(validatedQuery.error)
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

    // Get all results (pagination handled client-side)

    
    const personeller = await prisma.personel.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
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

    await logList("Personel", { page, limit, search, rol, isActive, sortBy, sortOrder }, personeller.length, session)

    return NextResponse.json({
      data: personeller,
      pagination: {
        page: 1,
        limit: personeller.length,
        total: personeller.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    return handleApiError(error, "PERSONEL_LIST")
  }
}

// POST /api/personel - Create a new personel
export async function POST(request: NextRequest) {
  try {
    const { session } = await checkPermission()

    // Sadece ADMIN yeni kullanıcı oluşturabilir
    if (session.rol !== "ADMIN") {
      return handleApiError(
        new AuthenticationError("Yeni kullanıcı oluşturmak için Admin yetkisi gereklidir"),
        "PERSONEL_CREATE"
      )
    }

    const body = await request.json()

    const validatedData = createPersonelSchema.safeParse(body)
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    // Check if visibleId already exists
    const existing = await prisma.personel.findUnique({
      where: { visibleId: validatedData.data.visibleId },
    })
    if (existing) {
      return handleApiError(
        new ConflictError("Bu kullanıcı ID zaten kullanılıyor"),
        "PERSONEL_CREATE"
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

    await logCreate("Personel", personel.id, personel as unknown as Record<string, unknown>, `${personel.ad} ${personel.soyad}`, session)

    return NextResponse.json(personel, { status: 201 })
  } catch (error) {
    return handleApiError(error, "PERSONEL_CREATE")
  }
}
