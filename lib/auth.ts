import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { PersonelRol } from '@prisma/client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const TOKEN_NAME = 'auth-token'
const TOKEN_MAX_AGE = 60 * 60 * 24 // 1 gün

export interface JWTPayload {
  id: string
  visibleId: string
  ad: string
  soyad: string
  rol: PersonelRol
  fotograf: string | null
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value

  if (!token) return null

  return verifyToken(token)
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

// Yetki kontrol fonksiyonları
export function isAdmin(session: JWTPayload | null): boolean {
  return session?.rol === 'ADMIN'
}

export function isYonetici(session: JWTPayload | null): boolean {
  return session?.rol === 'YONETICI'
}

export function isAdminOrYonetici(session: JWTPayload | null): boolean {
  return session?.rol === 'ADMIN' || session?.rol === 'YONETICI'
}

export function canManageLokasyon(session: JWTPayload | null): boolean {
  // Lokasyon yönetimi sadece ADMIN ve YONETICI yapabilir
  return isAdminOrYonetici(session)
}
