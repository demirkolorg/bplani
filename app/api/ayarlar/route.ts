import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateAyarlarSchema, DEFAULT_AYARLAR, type AyarKey } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logList, logUpdate } from "@/lib/logger"

// GET /api/ayarlar - Tüm ayarları getir
export async function GET() {
  try {
    // Veritabanındaki ayarları al
    const dbAyarlar = await prisma.alarmAyar.findMany()

    // Varsayılan değerlerle birleştir
    const ayarlar: Record<string, { value: string; aciklama: string }> = {}

    // Önce varsayılanları ekle
    for (const [key, defaultVal] of Object.entries(DEFAULT_AYARLAR)) {
      ayarlar[key] = { ...defaultVal }
    }

    // DB'deki değerlerle üzerine yaz
    for (const ayar of dbAyarlar) {
      if (ayar.key in ayarlar) {
        ayarlar[ayar.key] = {
          value: ayar.value,
          aciklama: ayar.aciklama || DEFAULT_AYARLAR[ayar.key as AyarKey]?.aciklama || "",
        }
      }
    }

    await logList("Ayar", {}, Object.keys(ayarlar).length)

    return NextResponse.json(ayarlar)
  } catch (error) {
    console.error("Error fetching ayarlar:", error)
    return NextResponse.json(
      { error: "Ayarlar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/ayarlar - Ayarları güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    const body = await request.json()
    const validatedData = updateAyarlarSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const { ayarlar } = validatedData.data

    // Önceki değerleri al
    const oncekiAyarlar = await prisma.alarmAyar.findMany()
    const oncekiMap: Record<string, string> = {}
    for (const ayar of oncekiAyarlar) {
      oncekiMap[ayar.key] = ayar.value
    }

    // Her ayarı upsert et
    for (const ayar of ayarlar) {
      await prisma.alarmAyar.upsert({
        where: { key: ayar.key },
        update: {
          value: ayar.value,
          aciklama: ayar.aciklama,
        },
        create: {
          key: ayar.key,
          value: ayar.value,
          aciklama: ayar.aciklama || DEFAULT_AYARLAR[ayar.key as AyarKey]?.aciklama,
        },
      })
    }

    // Güncel ayarları döndür
    const updatedAyarlar = await prisma.alarmAyar.findMany()
    const result: Record<string, { value: string; aciklama: string }> = {}

    for (const [key, defaultVal] of Object.entries(DEFAULT_AYARLAR)) {
      result[key] = { ...defaultVal }
    }

    for (const ayar of updatedAyarlar) {
      if (ayar.key in result) {
        result[ayar.key] = {
          value: ayar.value,
          aciklama: ayar.aciklama || DEFAULT_AYARLAR[ayar.key as AyarKey]?.aciklama || "",
        }
      }
    }

    // Yeni değerleri map'e al
    const yeniMap: Record<string, string> = {}
    for (const ayar of updatedAyarlar) {
      yeniMap[ayar.key] = ayar.value
    }

    await logUpdate("Ayar", "sistem-ayarlari", oncekiMap as unknown as Record<string, unknown>, yeniMap as unknown as Record<string, unknown>, "Sistem Ayarları", session)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating ayarlar:", error)
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
