import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { updatePersonelSchema, changePasswordSchema, changeRolSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { logView, logUpdate, logDelete, logStatusChange } from "@/lib/logger"

// Yetki kontrolü
async function checkPermission() {
  const session = await getSession()
  if (!session) {
    return { error: "Oturum bulunamadı", status: 401 }
  }
  if (session.rol !== "ADMIN" && session.rol !== "YONETICI") {
    return { error: "Bu işlem için yetkiniz yok", status: 403 }
  }
  return { session }
}

// GET /api/personel/[id] - Get single personel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkPermission()
    if ("error" in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status })
    }

    const { id } = await params

    const personel = await prisma.personel.findUnique({
      where: { id },
      select: {
        id: true,
        visibleId: true,
        ad: true,
        soyad: true,
        rol: true,
        fotograf: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdKisiler: true,
            updatedKisiler: true,
            createdTakipler: true,
            updatedTakipler: true,
            createdNotlar: true,
            createdTanitimlar: true,
            updatedTanitimlar: true,
            createdAlarmlar: true,
          },
        },
      },
    })

    if (!personel) {
      return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 })
    }

    await logView("Personel", id, `${personel.ad} ${personel.soyad}`, permCheck.session)

    return NextResponse.json(personel)
  } catch (error) {
    console.error("Error fetching personel:", error)
    return NextResponse.json(
      { error: "Personel getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PUT /api/personel/[id] - Update personel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkPermission()
    if ("error" in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status })
    }

    const { id } = await params
    const body = await request.json()

    // Personel var mı kontrol et
    const existing = await prisma.personel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 })
    }

    // ADMIN olmayan biri ADMIN'i düzenleyemez
    if (existing.rol === "ADMIN" && permCheck.session.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin kullanıcıyı düzenleme yetkiniz yok" },
        { status: 403 }
      )
    }

    const validatedData = updatePersonelSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    // visibleId değiştiyse, başkası kullanıyor mu kontrol et
    if (validatedData.data.visibleId && validatedData.data.visibleId !== existing.visibleId) {
      const duplicate = await prisma.personel.findUnique({
        where: { visibleId: validatedData.data.visibleId },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: "Bu kullanıcı ID zaten kullanılıyor" },
          { status: 409 }
        )
      }
    }

    const personel = await prisma.personel.update({
      where: { id },
      data: validatedData.data,
      select: {
        id: true,
        visibleId: true,
        ad: true,
        soyad: true,
        rol: true,
        fotograf: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await logUpdate("Personel", id, existing as unknown as Record<string, unknown>, personel as unknown as Record<string, unknown>, `${personel.ad} ${personel.soyad}`, permCheck.session)

    return NextResponse.json(personel)
  } catch (error) {
    console.error("Error updating personel:", error)
    return NextResponse.json(
      { error: "Personel güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/personel/[id] - Delete personel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkPermission()
    if ("error" in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status })
    }

    // Sadece ADMIN silme yapabilir
    if (permCheck.session.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "Kullanıcı silmek için Admin yetkisi gereklidir" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Kendini silemez
    if (id === permCheck.session.id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      )
    }

    const existing = await prisma.personel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 })
    }

    await prisma.personel.delete({ where: { id } })

    await logDelete("Personel", id, existing as unknown as Record<string, unknown>, `${existing.ad} ${existing.soyad}`, permCheck.session)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting personel:", error)
    return NextResponse.json(
      { error: "Personel silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PATCH /api/personel/[id] - Special operations (password, role, toggle-active)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkPermission()
    if ("error" in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    const existing = await prisma.personel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 })
    }

    // ADMIN olmayan biri ADMIN üzerinde işlem yapamaz
    if (existing.rol === "ADMIN" && permCheck.session.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin kullanıcı üzerinde işlem yapma yetkiniz yok" },
        { status: 403 }
      )
    }

    switch (action) {
      case "change-password": {
        // Sadece ADMIN şifre değiştirebilir (kendi şifresi dahil)
        if (permCheck.session.rol !== "ADMIN") {
          return NextResponse.json(
            { error: "Şifre değiştirmek için Admin yetkisi gereklidir" },
            { status: 403 }
          )
        }

        const validated = changePasswordSchema.safeParse(body)
        if (!validated.success) {
          return NextResponse.json(
            { error: "Geçersiz veri", details: validated.error.flatten() },
            { status: 400 }
          )
        }

        const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10)
        await prisma.personel.update({
          where: { id },
          data: { parola: hashedPassword },
        })

        await logUpdate("Personel", id, { parola: "[GİZLİ]" }, { parola: "[GİZLİ - DEĞİŞTİRİLDİ]" }, `${existing.ad} ${existing.soyad} - Şifre değişikliği`, permCheck.session)

        return NextResponse.json({ success: true, message: "Şifre başarıyla güncellendi" })
      }

      case "change-role": {
        // Sadece ADMIN rol değiştirebilir
        if (permCheck.session.rol !== "ADMIN") {
          return NextResponse.json(
            { error: "Rol değiştirmek için Admin yetkisi gereklidir" },
            { status: 403 }
          )
        }

        // Kendinin rolünü değiştiremez (son admin kalmasın)
        if (id === permCheck.session.id) {
          return NextResponse.json(
            { error: "Kendi rolünüzü değiştiremezsiniz" },
            { status: 400 }
          )
        }

        const validated = changeRolSchema.safeParse(body)
        if (!validated.success) {
          return NextResponse.json(
            { error: "Geçersiz veri", details: validated.error.flatten() },
            { status: 400 }
          )
        }

        const personel = await prisma.personel.update({
          where: { id },
          data: { rol: validated.data.rol },
          select: {
            id: true,
            visibleId: true,
            ad: true,
            soyad: true,
            rol: true,
            fotograf: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        await logStatusChange("Personel", id, existing.rol, validated.data.rol, `${personel.ad} ${personel.soyad}`, permCheck.session)

        return NextResponse.json(personel)
      }

      case "toggle-active": {
        // Kendini deaktive edemez
        if (id === permCheck.session.id) {
          return NextResponse.json(
            { error: "Kendi hesabınızı deaktive edemezsiniz" },
            { status: 400 }
          )
        }

        const personel = await prisma.personel.update({
          where: { id },
          data: { isActive: !existing.isActive },
          select: {
            id: true,
            visibleId: true,
            ad: true,
            soyad: true,
            rol: true,
            fotograf: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        await logStatusChange("Personel", id, existing.isActive ? "Aktif" : "Pasif", personel.isActive ? "Aktif" : "Pasif", `${personel.ad} ${personel.soyad}`, permCheck.session)

        return NextResponse.json(personel)
      }

      default:
        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in personel PATCH:", error)
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
