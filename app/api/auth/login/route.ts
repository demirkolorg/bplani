import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'
import { logLogin } from '@/lib/logger'
import { successResponse, validationErrorResponse, handleApiError } from "@/lib/api-response"
import { AuthenticationError } from "@/types/errors"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visibleId, parola } = body

    if (!visibleId || !parola) {
      return handleApiError(
        new AuthenticationError('Kullanıcı ID ve parola gereklidir'),
        "LOGIN"
      )
    }

    const personel = await prisma.personel.findUnique({
      where: { visibleId },
    })

    if (!personel) {
      await logLogin("", visibleId, "", false, { reason: "Kullanıcı bulunamadı", visibleId })
      return handleApiError(
        new AuthenticationError('Kullanıcı bulunamadı'),
        "LOGIN"
      )
    }

    if (!personel.isActive) {
      await logLogin(personel.id, personel.ad, personel.soyad, false, { reason: "Hesap devre dışı" })
      return handleApiError(
        new AuthenticationError('Hesabınız devre dışı bırakılmış'),
        "LOGIN"
      )
    }

    const isValidPassword = await bcrypt.compare(parola, personel.parola)

    if (!isValidPassword) {
      await logLogin(personel.id, personel.ad, personel.soyad, false, { reason: "Geçersiz parola" })
      return handleApiError(
        new AuthenticationError('Geçersiz parola'),
        "LOGIN"
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

    // Log başarılı giriş
    await logLogin(personel.id, personel.ad, personel.soyad, true)

    // Create response
    const response = NextResponse.json({
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

    // Set cookie on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    return handleApiError(error, "LOGIN")
  }
}
