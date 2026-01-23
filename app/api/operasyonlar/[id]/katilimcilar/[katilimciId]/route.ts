import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string; katilimciId: string }> }

// DELETE /api/operasyonlar/[id]/katilimcilar/[katilimciId] - Remove a participant from operasyon
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id, katilimciId } = await params

    // Check if operasyon exists
    const operasyon = await prisma.operasyon.findUnique({ where: { id } })
    if (!operasyon) {
      return NextResponse.json(
        { error: "Operasyon bulunamadı" },
        { status: 404 }
      )
    }

    // Check if katilimci exists and belongs to this operasyon
    const katilimci = await prisma.operasyonKatilimci.findFirst({
      where: {
        id: katilimciId,
        operasyonId: id,
      },
    })

    if (!katilimci) {
      return NextResponse.json(
        { error: "Katılımcı bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.operasyonKatilimci.delete({
      where: { id: katilimciId },
    })

    await logDelete("OperasyonKatılımcı", katilimciId, katilimci as unknown as Record<string, unknown>, undefined, session)

    return NextResponse.json({ message: "Katılımcı başarıyla silindi" })
  } catch (error) {
    console.error("Error removing katilimci:", error)
    return NextResponse.json(
      { error: "Katılımcı silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
