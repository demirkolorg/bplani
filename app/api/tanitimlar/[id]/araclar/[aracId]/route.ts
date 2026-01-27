import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logDelete } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string; aracId: string }> }

// DELETE /api/tanitimlar/[id]/araclar/[aracId] - Remove a vehicle from tanitim
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id, aracId } = await params

    // Check if tanitim exists
    const tanitim = await prisma.tanitim.findUnique({ where: { id } })
    if (!tanitim) {
      return NextResponse.json(
        { error: "Tanıtım bulunamadı" },
        { status: 404 }
      )
    }

    // Check if arac relation exists and belongs to this tanitim
    const tanitimArac = await prisma.tanitimArac.findFirst({
      where: {
        id: aracId,
        tanitimId: id,
      },
    })

    if (!tanitimArac) {
      return NextResponse.json(
        { error: "Araç ilişkisi bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.tanitimArac.delete({
      where: { id: aracId },
    })

    await logDelete("TanıtımAraç", aracId, tanitimArac as unknown as Record<string, unknown>, undefined, session)

    return NextResponse.json({ message: "Araç başarıyla kaldırıldı" })
  } catch (error) {
    console.error("Error removing arac:", error)
    return NextResponse.json(
      { error: "Araç kaldırılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
