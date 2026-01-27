import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string; aracId: string }> }

// DELETE /api/operasyonlar/[id]/araclar/[aracId] - Remove a vehicle from operasyon
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id, aracId } = await params

    // Check if operasyon exists
    const operasyon = await prisma.operasyon.findUnique({ where: { id } })
    if (!operasyon) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
        { status: 404 }
      )
    }

    // Check if arac relation exists and belongs to this operasyon
    const operasyonArac = await prisma.operasyonArac.findFirst({
      where: {
        id: aracId,
        operasyonId: id,
      },
    })

    if (!operasyonArac) {
      return NextResponse.json(
        { error: "Araç ilişkisi bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.operasyonArac.delete({
      where: { id: aracId },
    })

    await logDelete("OperasyonAraç", aracId, operasyonArac as unknown as Record<string, unknown>, undefined, session)

    return NextResponse.json({ message: "Araç başarıyla kaldırıldı" })
  } catch (error) {
    console.error("Error removing arac:", error)
    return NextResponse.json(
      { error: "Araç kaldırılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
