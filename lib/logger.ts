import prisma from "@/lib/prisma"
import { getSession, JWTPayload } from "@/lib/auth"
import { LogIslem } from "@prisma/client"
import { headers } from "next/headers"

interface LogOptions {
  islem: LogIslem
  aciklama?: string
  entityType?: string
  entityId?: string
  entityAd?: string
  oncekiVeri?: Record<string, unknown>
  yeniVeri?: Record<string, unknown>
  metadata?: Record<string, unknown>
  session?: JWTPayload | null
}

// İki obje arasındaki farkları bul
function getDifferences(
  onceki: Record<string, unknown> | undefined,
  yeni: Record<string, unknown> | undefined
): Record<string, { onceki: unknown; yeni: unknown }> | null {
  if (!onceki || !yeni) return null

  const differences: Record<string, { onceki: unknown; yeni: unknown }> = {}
  const allKeys = new Set([...Object.keys(onceki), ...Object.keys(yeni)])

  for (const key of allKeys) {
    // Loglama alanlarını atla
    if (["createdAt", "updatedAt", "createdUserId", "updatedUserId"].includes(key)) {
      continue
    }

    const oncekiValue = onceki[key]
    const yeniValue = yeni[key]

    // JSON.stringify ile karşılaştır (Date ve nested object için)
    if (JSON.stringify(oncekiValue) !== JSON.stringify(yeniValue)) {
      differences[key] = { onceki: oncekiValue, yeni: yeniValue }
    }
  }

  return Object.keys(differences).length > 0 ? differences : null
}

// Hassas alanları temizle
function sanitizeData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return undefined

  const sensitiveFields = ["parola", "password", "token", "secret"]
  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[GİZLİ]"
    }
  }

  return sanitized
}

// IP ve User Agent bilgilerini al
async function getRequestInfo(): Promise<{ ipAdresi?: string; userAgent?: string }> {
  try {
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const userAgent = headersList.get("user-agent")

    return {
      ipAdresi: forwardedFor?.split(",")[0] || realIp || undefined,
      userAgent: userAgent || undefined,
    }
  } catch {
    return {}
  }
}

export async function createLog(options: LogOptions): Promise<void> {
  try {
    const session = options.session ?? (await getSession())
    const requestInfo = await getRequestInfo()

    const oncekiVeri = sanitizeData(options.oncekiVeri)
    const yeniVeri = sanitizeData(options.yeniVeri)
    const degisiklikler = getDifferences(oncekiVeri, yeniVeri)

    await prisma.log.create({
      data: {
        userId: session?.id,
        userAd: session?.ad,
        userSoyad: session?.soyad,
        islem: options.islem,
        aciklama: options.aciklama,
        entityType: options.entityType,
        entityId: options.entityId,
        entityAd: options.entityAd,
        oncekiVeri: oncekiVeri ? JSON.parse(JSON.stringify(oncekiVeri)) : undefined,
        yeniVeri: yeniVeri ? JSON.parse(JSON.stringify(yeniVeri)) : undefined,
        degisiklikler: degisiklikler ? JSON.parse(JSON.stringify(degisiklikler)) : undefined,
        ipAdresi: requestInfo.ipAdresi,
        userAgent: requestInfo.userAgent,
        metadata: options.metadata ? JSON.parse(JSON.stringify(options.metadata)) : undefined,
      },
    })
  } catch (error) {
    // Log hatası ana işlemi etkilememeli
    console.error("Log oluşturma hatası:", error)
  }
}

// Kısa yol fonksiyonları
export async function logCreate(
  entityType: string,
  entityId: string,
  yeniVeri: Record<string, unknown>,
  entityAd?: string,
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "CREATE",
    aciklama: `Yeni ${entityType} oluşturuldu`,
    entityType,
    entityId,
    entityAd,
    yeniVeri,
    session,
  })
}

export async function logUpdate(
  entityType: string,
  entityId: string,
  oncekiVeri: Record<string, unknown>,
  yeniVeri: Record<string, unknown>,
  entityAd?: string,
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "UPDATE",
    aciklama: `${entityType} güncellendi`,
    entityType,
    entityId,
    entityAd,
    oncekiVeri,
    yeniVeri,
    session,
  })
}

export async function logDelete(
  entityType: string,
  entityId: string,
  oncekiVeri: Record<string, unknown>,
  entityAd?: string,
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "DELETE",
    aciklama: `${entityType} silindi`,
    entityType,
    entityId,
    entityAd,
    oncekiVeri,
    session,
  })
}

export async function logLogin(
  userId: string,
  userAd: string,
  userSoyad: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  const requestInfo = await getRequestInfo()

  await prisma.log.create({
    data: {
      userId: success ? userId : undefined,
      userAd,
      userSoyad,
      islem: success ? "LOGIN" : "LOGIN_FAIL",
      aciklama: success ? "Giriş yapıldı" : "Başarısız giriş denemesi",
      entityType: "Personel",
      entityId: userId,
      ipAdresi: requestInfo.ipAdresi,
      userAgent: requestInfo.userAgent,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  })
}

export async function logLogout(session: JWTPayload): Promise<void> {
  const requestInfo = await getRequestInfo()

  await prisma.log.create({
    data: {
      userId: session.id,
      userAd: session.ad,
      userSoyad: session.soyad,
      islem: "LOGOUT",
      aciklama: "Çıkış yapıldı",
      entityType: "Personel",
      entityId: session.id,
      ipAdresi: requestInfo.ipAdresi,
      userAgent: requestInfo.userAgent,
    },
  })
}

export async function logBulkCreate(
  entityType: string,
  count: number,
  entityIds: string[],
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "BULK_CREATE",
    aciklama: `${count} adet ${entityType} toplu oluşturuldu`,
    entityType,
    metadata: { count, entityIds },
    session,
  })
}

export async function logStatusChange(
  entityType: string,
  entityId: string,
  oncekiDurum: string,
  yeniDurum: string,
  entityAd?: string,
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "STATUS_CHANGE",
    aciklama: `${entityType} durumu değiştirildi: ${oncekiDurum} -> ${yeniDurum}`,
    entityType,
    entityId,
    entityAd,
    metadata: { durum: { onceki: oncekiDurum, yeni: yeniDurum } },
    session,
  })
}

export async function logView(
  entityType: string,
  entityId: string,
  entityAd?: string,
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "VIEW",
    aciklama: `${entityType} görüntülendi`,
    entityType,
    entityId,
    entityAd,
    session,
  })
}

export async function logList(
  entityType: string,
  filters?: Record<string, unknown>,
  resultCount?: number,
  session?: JWTPayload | null
): Promise<void> {
  await createLog({
    islem: "VIEW",
    aciklama: `${entityType} listesi görüntülendi`,
    entityType,
    metadata: { filters, resultCount },
    session,
  })
}
