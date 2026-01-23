import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string; katilimciId: string }> }

// DELETE /api/tanitimlar/[id]/katilimcilar/[katilimciId] - Remove a participant from tanitim
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id, katilimciId } = await params

    // Check if tanitim exists
    const tanitim = await prisma.tanitim.findUnique({ where: { id } })
    if (!tanitim) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
        { status: 404 }
      )
    }

    // Check if katilimci exists and belongs to this tanitim
    const katilimci = await prisma.tanitimKatilimci.findFirst({
      where: {
        id: katilimciId,
        tanitimId: id,
      },
    })

    if (!katilimci) {
      return NextResponse.json(
        { error: "Katılımcı bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.tanitimKatilimci.delete({
      where: { id: katilimciId },
    })

    await logDelete("TanıtımKatılımcı", katilimciId, katilimci as unknown as Record<string, unknown>, undefined, session)

    return NextResponse.json({ message: "Katılımcı başarıyla silindi" })
  } catch (error) {
    console.error("Error removing katilimci:", error)
    return NextResponse.json(
      { error: "Katılımcı silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
