import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { bildirimQuerySchema } from "@/lib/validations"

// GET /api/alarmlar/bildirimler - Get active notifications for header bell
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = bildirimQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri" },
        { status: 400 }
      )
    }

    const { limit } = validatedQuery.data

    // Get current date in UTC+3 (Turkey timezone)
    const now = new Date()

    // Get alarms that are:
    // 1. Not paused
    // 2. Status is BEKLIYOR or TETIKLENDI
    // 3. tetikTarihi is today or in the past
    const bildirimler = await prisma.alarm.findMany({
      where: {
        isPaused: false,
        durum: { in: ["BEKLIYOR", "TETIKLENDI"] },
        tetikTarihi: { lte: now },
      },
      orderBy: { tetikTarihi: "desc" },
      take: limit,
      include: {
        takip: {
          include: {
            gsm: {
              include: {
                kisi: {
                  select: {
                    id: true,
                    ad: true,
                    soyad: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Update status to TETIKLENDI for those that are BEKLIYOR
    const toUpdate = bildirimler
      .filter((b) => b.durum === "BEKLIYOR")
      .map((b) => b.id)

    if (toUpdate.length > 0) {
      await prisma.alarm.updateMany({
        where: { id: { in: toUpdate } },
        data: { durum: "TETIKLENDI" },
      })
    }

    // Count total unread (TETIKLENDI) notifications
    const unreadCount = await prisma.alarm.count({
      where: {
        isPaused: false,
        durum: "TETIKLENDI",
        tetikTarihi: { lte: now },
      },
    })

    return NextResponse.json({
      bildirimler,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching bildirimler:", error)
    return NextResponse.json(
      { error: "Bildirimler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST /api/alarmlar/bildirimler - Mark all as read
export async function POST() {
  try {
    const now = new Date()

    await prisma.alarm.updateMany({
      where: {
        durum: "TETIKLENDI",
        tetikTarihi: { lte: now },
      },
      data: { durum: "GORULDU" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking bildirimler as read:", error)
    return NextResponse.json(
      { error: "Bildirimler okundu olarak işaretlenirken hata oluştu" },
      { status: 500 }
    )
  }
}
