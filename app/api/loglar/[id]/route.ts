import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/loglar/[id] - Get a single log entry
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { id } = await params

    const log = await prisma.log.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            visibleId: true,
            ad: true,
            soyad: true,
            rol: true,
            fotograf: true,
          },
        },
      },
    })

    if (!log) {
      return NextResponse.json({ error: "Log bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error fetching log:", error)
    return NextResponse.json(
      { error: "Log getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
