import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { upsertTercihSchema, batchUpsertTercihSchema, listTercihQuerySchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"

// GET /api/tercihler - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = listTercihQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { kategori } = validatedQuery.data

    // Build where clause
    const where: Record<string, unknown> = {
      personelId: session.id,
    }

    if (kategori) {
      where.kategori = kategori
    }

    const tercihler = await prisma.kullaniciTercihi.findMany({
      where,
      orderBy: [{ kategori: "asc" }, { anahtar: "asc" }],
    })

    // Transform to a more usable format
    const formatted = tercihler.reduce((acc, tercih) => {
      if (!acc[tercih.kategori]) {
        acc[tercih.kategori] = {}
      }
      acc[tercih.kategori][tercih.anahtar] = tercih.deger
      return acc
    }, {} as Record<string, Record<string, unknown>>)

    return NextResponse.json({
      data: formatted,
      raw: tercihler,
    })
  } catch (error) {
    console.error("Error fetching tercihler:", error)
    return NextResponse.json(
      { error: "Tercihler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/tercihler - Create or update a preference
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const validatedData = upsertTercihSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const { kategori, anahtar, deger } = validatedData.data

    const tercih = await prisma.kullaniciTercihi.upsert({
      where: {
        personelId_kategori_anahtar: {
          personelId: session.id,
          kategori,
          anahtar,
        },
      },
      update: {
        deger: deger as Prisma.InputJsonValue,
      },
      create: {
        personelId: session.id,
        kategori,
        anahtar,
        deger: deger as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json(tercih)
  } catch (error) {
    console.error("Error upserting tercih:", error)
    return NextResponse.json(
      { error: "Tercih kaydedilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/tercihler - Batch update preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const validatedData = batchUpsertTercihSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const { tercihler } = validatedData.data

    // Use transaction for batch operations
    const results = await prisma.$transaction(
      tercihler.map((tercih) =>
        prisma.kullaniciTercihi.upsert({
          where: {
            personelId_kategori_anahtar: {
              personelId: session.id,
              kategori: tercih.kategori,
              anahtar: tercih.anahtar,
            },
          },
          update: {
            deger: tercih.deger as Prisma.InputJsonValue,
          },
          create: {
            personelId: session.id,
            kategori: tercih.kategori,
            anahtar: tercih.anahtar,
            deger: tercih.deger as Prisma.InputJsonValue,
          },
        })
      )
    )

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("Error batch upserting tercihler:", error)
    return NextResponse.json(
      { error: "Tercihler kaydedilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/tercihler - Delete a preference
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get("kategori")
    const anahtar = searchParams.get("anahtar")

    if (!kategori || !anahtar) {
      return NextResponse.json(
        { error: "Kategori ve anahtar zorunludur" },
        { status: 400 }
      )
    }

    await prisma.kullaniciTercihi.delete({
      where: {
        personelId_kategori_anahtar: {
          personelId: session.id,
          kategori,
          anahtar,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tercih:", error)
    return NextResponse.json(
      { error: "Tercih silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
