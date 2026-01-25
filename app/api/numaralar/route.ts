import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { logList } from "@/lib/logger"

// Query params schema
const listNumaraQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["numara", "createdAt", "kisiAd"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// GET /api/numaralar - List all GSM numbers with kisi info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listNumaraQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, search, sortBy, sortOrder } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {}

    // Search in numara or kisi ad/soyad
    if (search) {
      where.OR = [
        { numara: { contains: search, mode: "insensitive" } },
        { kisi: { ad: { contains: search, mode: "insensitive" } } },
        { kisi: { soyad: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get total count
    const total = await prisma.gsm.count({ where })

    // Build orderBy
    let orderBy: Record<string, unknown> = {}
    if (sortBy === "kisiAd") {
      orderBy = { kisi: { ad: sortOrder } }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Get paginated results
    const numaralar = await prisma.gsm.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        kisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            tt: true,
            tc: true,
          },
        },
        takipler: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            baslamaTarihi: true,
            bitisTarihi: true,
            durum: true,
          },
          take: 1,
        },
      },
    })

    await logList("Numara", { page, limit, search, sortBy, sortOrder }, numaralar.length)

    return NextResponse.json({
      data: numaralar,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching numaralar:", error)
    return NextResponse.json(
      { error: "Numaralar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
