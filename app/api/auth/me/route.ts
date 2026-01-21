import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: session })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Oturum bilgisi alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
