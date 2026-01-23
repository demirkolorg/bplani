import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession, canManageLokasyon } from "@/lib/auth"
import { logDelete } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string; kisiId: string }>
}

// DELETE /api/araclar/vehicles/[id]/kisiler/[kisiId] - Remove a kisi from a vehicle
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

    const { id, kisiId } = await params

    const arac = await prisma.arac.findUnique({
      where: { id },
      select: { id: true, plaka: true },
    })

    if (!arac) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      )
    }

    const kisi = await prisma.kisi.findUnique({
      where: { id: kisiId },
      select: { id: true, ad: true, soyad: true },
    })

    if (!kisi) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    const aracKisi = await prisma.aracKisi.findUnique({
      where: {
        aracId_kisiId: {
          aracId: id,
          kisiId,
        },
      },
    })

    if (!aracKisi) {
      return NextResponse.json(
        { error: "Bu kişi bu araca ekli değil" },
        { status: 404 }
      )
    }

    await prisma.aracKisi.delete({
      where: {
        aracId_kisiId: {
          aracId: id,
          kisiId,
        },
      },
    })

    await logDelete(
      "AracKisi",
      aracKisi.id,
      aracKisi as unknown as Record<string, unknown>,
      `${arac.plaka} - ${kisi.ad} ${kisi.soyad}`,
      session
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing kisi from arac:", error)
    return NextResponse.json(
      { error: "Kişi araçtan çıkarılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
