import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'
import { logLogin } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visibleId, parola } = body

    if (!visibleId || !parola) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve parola gereklidir' },
        { status: 400 }
      )
    }

    const personel = await prisma.personel.findUnique({
      where: { visibleId },
    })

    if (!personel) {
      await logLogin("", visibleId, "", false, { reason: "Kullanıcı bulunamadı", visibleId })
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    if (!personel.isActive) {
      await logLogin(personel.id, personel.ad, personel.soyad, false, { reason: "Hesap devre dışı" })
      return NextResponse.json(
        { error: 'Hesabınız devre dışı bırakılmış' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(parola, personel.parola)

    if (!isValidPassword) {
      await logLogin(personel.id, personel.ad, personel.soyad, false, { reason: "Geçersiz parola" })
      return NextResponse.json(
        { error: 'Geçersiz parola' },
        { status: 401 }
      )
    }

    // Son giriş zamanını güncelle
    await prisma.personel.update({
      where: { id: personel.id },
      data: { lastLoginAt: new Date() },
    })

    const token = await createToken({
      id: personel.id,
      visibleId: personel.visibleId,
      ad: personel.ad,
      soyad: personel.soyad,
      rol: personel.rol,
      fotograf: personel.fotograf,
    })

    await setAuthCookie(token)

    // Log başarılı giriş
    await logLogin(personel.id, personel.ad, personel.soyad, true)

    return NextResponse.json({
      success: true,
      user: {
        id: personel.id,
        visibleId: personel.visibleId,
        ad: personel.ad,
        soyad: personel.soyad,
        rol: personel.rol,
        fotograf: personel.fotograf,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
