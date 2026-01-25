import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateAlarmSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logView, logUpdate, logDelete } from "@/lib/logger"

// GET /api/alarmlar/[id] - Get single alarm
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const alarm = await prisma.alarm.findUnique({
      where: { id },
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
                    tt: true,
                    tc: true,
                  },
                },
              },
            },
          },
        },
        createdUser: {
          select: { ad: true, soyad: true },
        },
      },
    })

    if (!alarm) {
      return NextResponse.json(
        { error: "Alarm bulunamadı" },
        { status: 404 }
      )
    }

    await logView("Alarm", id, alarm.baslik || undefined)

    return NextResponse.json(alarm)
  } catch (error) {
    console.error("Error fetching alarm:", error)
    return NextResponse.json(
      { error: "Alarm getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/alarmlar/[id] - Update alarm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params
    const body = await request.json()

    const validatedData = updateAlarmSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // Check if alarm exists
    const existingAlarm = await prisma.alarm.findUnique({
      where: { id },
    })

    if (!existingAlarm) {
      return NextResponse.json(
        { error: "Alarm bulunamadı" },
        { status: 404 }
      )
    }

    const alarm = await prisma.alarm.update({
      where: { id },
      data: validatedData.data,
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
                    tt: true,
                  },
                },
              },
            },
          },
        },
        createdUser: {
          select: { ad: true, soyad: true },
        },
      },
    })

    await logUpdate("Alarm", id, existingAlarm as unknown as Record<string, unknown>, alarm as unknown as Record<string, unknown>, alarm.baslik || undefined, session)

    return NextResponse.json(alarm)
  } catch (error) {
    console.error("Error updating alarm:", error)
    return NextResponse.json(
      { error: "Alarm güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/alarmlar/[id] - Delete alarm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    // Check if alarm exists
    const existingAlarm = await prisma.alarm.findUnique({
      where: { id },
    })

    if (!existingAlarm) {
      return NextResponse.json(
        { error: "Alarm bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.alarm.delete({
      where: { id },
    })

    await logDelete("Alarm", id, existingAlarm as unknown as Record<string, unknown>, existingAlarm.baslik || undefined, session)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alarm:", error)
    return NextResponse.json(
      { error: "Alarm silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
