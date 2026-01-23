import prisma from "@/lib/prisma"
import { DEFAULT_AYARLAR, type AyarKey } from "@/lib/validations"

// Sistem ayarlarını veritabanından çeker
export async function getAyarlar(): Promise<Record<AyarKey, number>> {
  try {
    const dbAyarlar = await prisma.alarmAyar.findMany()

    const result: Record<string, number> = {}

    // Önce varsayılan değerleri ekle
    for (const [key, defaultVal] of Object.entries(DEFAULT_AYARLAR)) {
      result[key] = parseInt(defaultVal.value, 10)
    }

    // DB'deki değerlerle üzerine yaz
    for (const ayar of dbAyarlar) {
      if (ayar.key in result) {
        const parsed = parseInt(ayar.value, 10)
        if (!isNaN(parsed)) {
          result[ayar.key] = parsed
        }
      }
    }

    return result as Record<AyarKey, number>
  } catch (error) {
    console.error("Error fetching ayarlar:", error)
    // Hata durumunda varsayılan değerleri döndür
    return {
      alarm_gun_once_1: 20,
      alarm_gun_once_2: 15,
      takip_varsayilan_sure: 90,
    }
  }
}
