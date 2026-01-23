import { NextResponse } from 'next/server'
import { removeAuthCookie, getSession } from '@/lib/auth'
import { logLogout } from '@/lib/logger'

export async function POST() {
  try {
    const session = await getSession()

    if (session) {
      await logLogout(session)
    }

    await removeAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Çıkış yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
