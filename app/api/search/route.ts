import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { globalSearchQuerySchema, type SearchResultItem, type GlobalSearchResponse } from "@/lib/validations"
import { getTranslations, type Locale } from "@/locales"

// Get locale from request headers (default: "tr")
function getLocaleFromRequest(request: NextRequest): Locale {
  const locale = request.headers.get("x-locale") || "tr"
  return locale === "en" ? "en" : "tr"
}

// Normalize Turkish characters for search
function normalizeTurkish(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
}

// GET /api/search - Global search across all tables
export async function GET(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request)
    const t = getTranslations(locale)

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = globalSearchQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: t.api.invalidQueryParams, details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    const { q: query, limit } = validatedQuery.data

    // Execute all searches in parallel
    const [
      kisiler,
      gsmler,
      adresler,
      personelList,
      tanitimlar,
      operasyonlar,
      alarmlar,
      takipler,
      araclar,
      notlar,
      faaliyetAlanlari,
      loglar,
    ] = await Promise.all([
      // Kişiler - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          ad: string
          soyad: string
          tc: string | null
          tt: boolean
        }>>`
          SELECT id, ad, soyad, tc, tt
          FROM kisiler
          WHERE "isArchived" = false
            AND (
              LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                LIKE ${searchPattern}
              OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                LIKE ${searchPattern}
              OR LOWER(COALESCE(tc, '')) LIKE ${searchPattern}
            )
          LIMIT ${limit}
        `

        return results
      })(),

      // GSM (with kisi info) - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          numara: string
          kisiId: string
          kisi: string
        }>>`
          SELECT
            g.id,
            g.numara,
            g."kisiId",
            jsonb_build_object('ad', k.ad, 'soyad', k.soyad, 'tc', k.tc)::text as kisi
          FROM gsmler g
          JOIN kisiler k ON g."kisiId" = k.id
          WHERE
            LOWER(g.numara) LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          kisi: JSON.parse(r.kisi),
        }))
      })(),

      // Adresler (with mahalle chain) - Using raw SQL for Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          ad: string | null
          detay: string | null
          kisiId: string
          mahalle: string
          kisi: string
        }>>`
          SELECT
            a.id,
            a.ad,
            a.detay,
            a."kisiId",
            jsonb_build_object(
              'ad', m.ad,
              'ilce', jsonb_build_object(
                'ad', ilce.ad,
                'il', jsonb_build_object('ad', il.ad)
              )
            )::text as mahalle,
            jsonb_build_object('ad', k.ad, 'soyad', k.soyad, 'tc', k.tc)::text as kisi
          FROM adresler a
          JOIN mahalleler m ON a."mahalleId" = m.id
          JOIN ilceler ilce ON m."ilceId" = ilce.id
          JOIN iller il ON ilce."ilId" = il.id
          JOIN kisiler k ON a."kisiId" = k.id
          WHERE
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(a.ad, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(a.detay, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(m.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ilce.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(il.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(COALESCE(k.tc, '')) LIKE ${searchPattern}
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          mahalle: JSON.parse(r.mahalle),
          kisi: JSON.parse(r.kisi),
        }))
      })(),

      // Personel - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          ad: string
          soyad: string
          visibleId: string
          rol: string
        }>>`
          SELECT id, ad, soyad, "visibleId", rol
          FROM personeller
          WHERE "isActive" = true
            AND (
              LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                LIKE ${searchPattern}
              OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                LIKE ${searchPattern}
              OR LOWER("visibleId") LIKE ${searchPattern}
            )
          LIMIT ${limit}
        `

        return results
      })(),

      // Tanıtımlar (with mahalle and katilimcilar) - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          baslik: string | null
          tarih: Date
          notlar: string | null
          adresDetay: string | null
          mahalle: string | null
          katilimcilar: string
          relatedAraclar: string
        }>>`
          SELECT
            t.id,
            t.baslik,
            t.tarih,
            t.notlar,
            t."adresDetay",
            CASE
              WHEN t."mahalleId" IS NOT NULL THEN
                jsonb_build_object(
                  'ad', m.ad,
                  'ilce', jsonb_build_object('ad', ilce.ad)
                )::text
              ELSE NULL
            END as mahalle,
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', tk."kisiId",
                    'ad', k.ad,
                    'soyad', k.soyad,
                    'tt', k.tt,
                    'tc', k.tc
                  )
                )
                FROM tanitim_katilimcilari tk
                JOIN kisiler k ON tk."kisiId" = k.id
                WHERE tk."tanitimId" = t.id
              ),
              '[]'::jsonb
            )::text as katilimcilar,
            COALESCE(
              (SELECT jsonb_agg(subq.data)
               FROM (
                 SELECT DISTINCT ON (a.id) jsonb_build_object(
                   'id', a.id,
                   'plaka', a.plaka,
                   'renk', a.renk,
                   'model', jsonb_build_object(
                     'ad', mo.ad,
                     'marka', jsonb_build_object('ad', ma.ad)
                   ),
                   'sahipler', COALESCE(
                     (SELECT jsonb_agg(jsonb_build_object(
                       'id', k.id, 'ad', k.ad, 'soyad', k.soyad, 'tt', k.tt, 'tc', k.tc
                     ))
                     FROM arac_kisileri ak
                     JOIN kisiler k ON ak."kisiId" = k.id
                     WHERE ak."aracId" = a.id
                     LIMIT 3),
                     '[]'::jsonb
                   )
                 ) as data
                 FROM tanitim_araclari ta
                 JOIN araclar a ON ta."aracId" = a.id
                 JOIN modeller mo ON a."modelId" = mo.id
                 JOIN markalar ma ON mo."markaId" = ma.id
                 WHERE ta."tanitimId" = t.id
                 ORDER BY a.id
                 LIMIT 5
               ) subq),
              '[]'::jsonb
            )::text as "relatedAraclar"
          FROM tanitimlar t
          LEFT JOIN mahalleler m ON t."mahalleId" = m.id
          LEFT JOIN ilceler ilce ON m."ilceId" = ilce.id
          WHERE
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(t.baslik, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(t.notlar, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(t."adresDetay", ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(m.ad, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(ilce.ad, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR EXISTS (
              SELECT 1 FROM tanitim_katilimcilari tk
              JOIN kisiler k ON tk."kisiId" = k.id
              WHERE tk."tanitimId" = t.id
                AND (
                  LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                    LIKE ${searchPattern}
                  OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                    LIKE ${searchPattern}
                  OR LOWER(COALESCE(k.tc, '')) LIKE ${searchPattern}
                )
            )
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          mahalle: r.mahalle ? JSON.parse(r.mahalle) : null,
          katilimcilar: JSON.parse(r.katilimcilar),
          relatedAraclar: JSON.parse(r.relatedAraclar),
        }))
      })(),

      // Operasyonlar (with mahalle and katilimcilar) - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          baslik: string | null
          tarih: Date
          notlar: string | null
          adresDetay: string | null
          mahalle: string | null
          katilimcilar: string
          relatedAraclar: string
        }>>`
          SELECT
            o.id,
            o.baslik,
            o.tarih,
            o.notlar,
            o."adresDetay",
            CASE
              WHEN o."mahalleId" IS NOT NULL THEN
                jsonb_build_object(
                  'ad', m.ad,
                  'ilce', jsonb_build_object('ad', ilce.ad)
                )::text
              ELSE NULL
            END as mahalle,
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', ok."kisiId",
                    'ad', k.ad,
                    'soyad', k.soyad,
                    'tt', k.tt,
                    'tc', k.tc
                  )
                )
                FROM operasyon_katilimcilari ok
                JOIN kisiler k ON ok."kisiId" = k.id
                WHERE ok."operasyonId" = o.id
              ),
              '[]'::jsonb
            )::text as katilimcilar,
            COALESCE(
              (SELECT jsonb_agg(subq.data)
               FROM (
                 SELECT DISTINCT ON (a.id) jsonb_build_object(
                   'id', a.id,
                   'plaka', a.plaka,
                   'renk', a.renk,
                   'model', jsonb_build_object(
                     'ad', mo.ad,
                     'marka', jsonb_build_object('ad', ma.ad)
                   ),
                   'sahipler', COALESCE(
                     (SELECT jsonb_agg(jsonb_build_object(
                       'id', k.id, 'ad', k.ad, 'soyad', k.soyad, 'tt', k.tt, 'tc', k.tc
                     ))
                     FROM arac_kisileri ak
                     JOIN kisiler k ON ak."kisiId" = k.id
                     WHERE ak."aracId" = a.id
                     LIMIT 3),
                     '[]'::jsonb
                   )
                 ) as data
                 FROM operasyon_araclari oa
                 JOIN araclar a ON oa."aracId" = a.id
                 JOIN modeller mo ON a."modelId" = mo.id
                 JOIN markalar ma ON mo."markaId" = ma.id
                 WHERE oa."operasyonId" = o.id
                 ORDER BY a.id
                 LIMIT 5
               ) subq),
              '[]'::jsonb
            )::text as "relatedAraclar"
          FROM operasyonlar o
          LEFT JOIN mahalleler m ON o."mahalleId" = m.id
          LEFT JOIN ilceler ilce ON m."ilceId" = ilce.id
          WHERE
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(o.baslik, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(o.notlar, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(o."adresDetay", ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(m.ad, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(ilce.ad, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR EXISTS (
              SELECT 1 FROM operasyon_katilimcilari ok
              JOIN kisiler k ON ok."kisiId" = k.id
              WHERE ok."operasyonId" = o.id
                AND (
                  LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                    LIKE ${searchPattern}
                  OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                    LIKE ${searchPattern}
                  OR LOWER(COALESCE(k.tc, '')) LIKE ${searchPattern}
                )
            )
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          mahalle: r.mahalle ? JSON.parse(r.mahalle) : null,
          katilimcilar: JSON.parse(r.katilimcilar),
          relatedAraclar: JSON.parse(r.relatedAraclar),
        }))
      })(),

      // Alarmlar - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          baslik: string | null
          mesaj: string | null
          tip: string
          durum: string
        }>>`
          SELECT id, baslik, mesaj, tip, durum
          FROM alarmlar
          WHERE
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(baslik, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(mesaj, ''), 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
          LIMIT ${limit}
        `

        return results
      })(),

      // Takipler (with gsm and kisi) - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          gsmId: string
          durum: string
          gsm: string
        }>>`
          SELECT
            t.id,
            t."gsmId",
            t.durum,
            jsonb_build_object(
              'numara', g.numara,
              'kisi', jsonb_build_object('id', k.id, 'ad', k.ad, 'soyad', k.soyad, 'tc', k.tc)
            )::text as gsm
          FROM takipler t
          JOIN gsmler g ON t."gsmId" = g.id
          JOIN kisiler k ON g."kisiId" = k.id
          WHERE
            LOWER(g.numara) LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          gsm: JSON.parse(r.gsm),
        }))
      })(),

      // Araçlar (with model, marka, and kisiler) - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          plaka: string
          renk: string | null
          model: string
          kisiler: string
          relatedTanitimlar: string
          relatedOperasyonlar: string
        }>>`
          SELECT
            a.id,
            a.plaka,
            a.renk,
            jsonb_build_object(
              'ad', mo.ad,
              'marka', jsonb_build_object('ad', ma.ad)
            )::text as model,
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', ak."kisiId",
                    'ad', k.ad,
                    'soyad', k.soyad,
                    'tt', k.tt,
                    'tc', k.tc
                  )
                )
                FROM arac_kisileri ak
                JOIN kisiler k ON ak."kisiId" = k.id
                WHERE ak."aracId" = a.id
              ),
              '[]'::jsonb
            )::text as kisiler,
            COALESCE(
              (SELECT jsonb_agg(subq.data)
               FROM (
                 SELECT DISTINCT ON (t.id) jsonb_build_object(
                   'id', t.id,
                   'baslik', t.baslik,
                   'tarih', t.tarih,
                   'katilimcilar', COALESCE(
                     (SELECT jsonb_agg(jsonb_build_object(
                       'id', k.id, 'ad', k.ad, 'soyad', k.soyad, 'tt', k.tt, 'tc', k.tc
                     ))
                     FROM tanitim_katilimcilari tk
                     JOIN kisiler k ON tk."kisiId" = k.id
                     WHERE tk."tanitimId" = t.id
                     LIMIT 3),
                     '[]'::jsonb
                   )
                 ) as data
                 FROM tanitim_araclari ta
                 JOIN tanitimlar t ON ta."tanitimId" = t.id
                 WHERE ta."aracId" = a.id
                 ORDER BY t.id, t.tarih DESC
                 LIMIT 5
               ) subq),
              '[]'::jsonb
            )::text as "relatedTanitimlar",
            COALESCE(
              (SELECT jsonb_agg(subq.data)
               FROM (
                 SELECT DISTINCT ON (o.id) jsonb_build_object(
                   'id', o.id,
                   'baslik', o.baslik,
                   'tarih', o.tarih,
                   'katilimcilar', COALESCE(
                     (SELECT jsonb_agg(jsonb_build_object(
                       'id', k.id, 'ad', k.ad, 'soyad', k.soyad, 'tt', k.tt, 'tc', k.tc
                     ))
                     FROM operasyon_katilimcilari ok
                     JOIN kisiler k ON ok."kisiId" = k.id
                     WHERE ok."operasyonId" = o.id
                     LIMIT 3),
                     '[]'::jsonb
                   )
                 ) as data
                 FROM operasyon_araclari oa
                 JOIN operasyonlar o ON oa."operasyonId" = o.id
                 WHERE oa."aracId" = a.id
                 ORDER BY o.id, o.tarih DESC
                 LIMIT 5
               ) subq),
              '[]'::jsonb
            )::text as "relatedOperasyonlar"
          FROM araclar a
          JOIN modeller mo ON a."modelId" = mo.id
          JOIN markalar ma ON mo."markaId" = ma.id
          WHERE
            LOWER(a.plaka) LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mo.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ma.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR EXISTS (
              SELECT 1 FROM arac_kisileri ak
              JOIN kisiler k ON ak."kisiId" = k.id
              WHERE ak."aracId" = a.id
                AND (
                  LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                    LIKE ${searchPattern}
                  OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
                    LIKE ${searchPattern}
                  OR LOWER(COALESCE(k.tc, '')) LIKE ${searchPattern}
                )
            )
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          model: JSON.parse(r.model),
          kisiler: JSON.parse(r.kisiler),
          relatedTanitimlar: JSON.parse(r.relatedTanitimlar),
          relatedOperasyonlar: JSON.parse(r.relatedOperasyonlar),
        }))
      })(),

      // Notlar - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          icerik: string
          kisiId: string
          kisi: string
        }>>`
          SELECT
            n.id,
            n.icerik,
            n."kisiId",
            jsonb_build_object('ad', k.ad, 'soyad', k.soyad, 'tc', k.tc)::text as kisi
          FROM notlar n
          JOIN kisiler k ON n."kisiId" = k.id
          WHERE
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(n.icerik, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(k.soyad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
            OR LOWER(COALESCE(k.tc, '')) LIKE ${searchPattern}
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          kisi: JSON.parse(r.kisi),
        }))
      })(),

      // Faaliyet Alanlari - Turkish-aware search
      (async () => {
        const normalizedQuery = normalizeTurkish(query)
        const searchPattern = `%${normalizedQuery}%`

        const results = await prisma.$queryRaw<Array<{
          id: string
          ad: string
          parentId: string | null
          parent: string | null
          kisiCount: number
        }>>`
          SELECT
            fa.id,
            fa.ad,
            fa."parentId",
            CASE
              WHEN fa."parentId" IS NOT NULL THEN
                jsonb_build_object('id', p.id, 'ad', p.ad)::text
              ELSE NULL
            END as parent,
            (
              SELECT COUNT(*)::int
              FROM kisi_faaliyet_alanlari kfa
              JOIN kisiler k ON kfa."kisiId" = k.id
              WHERE kfa."faaliyetAlaniId" = fa.id
                AND k."isArchived" = false
            ) as "kisiCount"
          FROM faaliyet_alanlari fa
          LEFT JOIN faaliyet_alanlari p ON fa."parentId" = p.id
          WHERE
            fa."isActive" = true
            AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(fa.ad, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'))
              LIKE ${searchPattern}
          LIMIT ${limit}
        `

        return results.map(r => ({
          ...r,
          parent: r.parent ? JSON.parse(r.parent) : null,
        }))
      })(),

      // Loglar - Disabled for global search
      (async () => {
        return []
      })(),
    ])

    // Transform results into SearchResultItem format
    const results: GlobalSearchResponse["results"] = {
      kisiler: kisiler.map((k) => ({
        id: k.id,
        title: `${k.ad} ${k.soyad}`,
        subtitle: k.tc || undefined,
        url: `/kisiler/${k.id}`,
        category: "kisiler",
        metadata: {
          tt: k.tt,
          tc: k.tc || undefined,
        },
      })),

      gsmler: gsmler.map((g) => ({
        id: g.id,
        title: g.numara,
        subtitle: `${g.kisi.ad} ${g.kisi.soyad}`,
        url: `/numaralar/${g.id}`,
        category: "gsmler",
        metadata: {
          relatedKisiler: [{
            id: g.kisiId,
            ad: g.kisi.ad,
            soyad: g.kisi.soyad,
            tc: g.kisi.tc,
          }],
        },
      })),

      adresler: adresler.map((a) => {
        // Build full address with "Mahallesi" suffix
        const fullAddress = [
          `${a.mahalle.ad} Mahallesi`,
          a.detay,
          a.mahalle.ilce.ad,
          a.mahalle.ilce.il.ad
        ].filter(Boolean).join(", ")

        return {
          id: a.id,
          title: a.ad || fullAddress,
          subtitle: fullAddress,
          url: `/kisiler/${a.kisiId}#adres`,
          category: "adresler",
          metadata: {
            fullAddress,
            hasDetail: !!a.detay,
            relatedKisiler: [{
              id: a.kisiId,
              ad: a.kisi.ad,
              soyad: a.kisi.soyad,
              tc: a.kisi.tc,
            }],
          },
        }
      }),

      personel: personelList.map((p) => ({
        id: p.id,
        title: `${p.ad} ${p.soyad}`,
        subtitle: `${p.visibleId} - ${p.rol}`,
        url: `/personel/${p.id}`,
        category: "personel",
      })),

      tanitimlar: tanitimlar.map((t) => {
        // Build full address for tanitim
        const address = t.mahalle
          ? [
              `${t.mahalle.ad} Mahallesi`,
              t.adresDetay,
              t.mahalle.ilce.ad
            ].filter(Boolean).join(", ")
          : null

        return {
          id: t.id,
          title: t.baslik || address || "Tanıtım",
          subtitle: t.notlar?.slice(0, 60) || address || new Date(t.tarih).toLocaleDateString("tr-TR"),
          url: `/tanitimlar/${t.id}`,
          category: "tanitimlar",
          metadata: {
            hasAddress: !!address,
            relatedKisiler: (t.katilimcilar || []).map((k: any) => ({
              id: k.id,
              ad: k.ad,
              soyad: k.soyad,
              tt: k.tt,
              tc: k.tc,
            })),
            relatedAraclar: (t.relatedAraclar || []).map((a: any) => ({
              id: a.id,
              plaka: a.plaka,
              model: a.model,
              renk: a.renk,
              sahipler: a.sahipler,
            })),
          },
        }
      }),

      operasyonlar: operasyonlar.map((o) => {
        // Build full address for operasyon
        const address = o.mahalle
          ? [
              `${o.mahalle.ad} Mahallesi`,
              o.adresDetay,
              o.mahalle.ilce.ad
            ].filter(Boolean).join(", ")
          : null

        return {
          id: o.id,
          title: o.baslik || address || "Operasyon",
          subtitle: o.notlar?.slice(0, 60) || address || new Date(o.tarih).toLocaleDateString("tr-TR"),
          url: `/operasyonlar/${o.id}`,
          category: "operasyonlar",
          metadata: {
            hasAddress: !!address,
            relatedKisiler: (o.katilimcilar || []).map((k: any) => ({
              id: k.id,
              ad: k.ad,
              soyad: k.soyad,
              tt: k.tt,
              tc: k.tc,
            })),
            relatedAraclar: (o.relatedAraclar || []).map((a: any) => ({
              id: a.id,
              plaka: a.plaka,
              model: a.model,
              renk: a.renk,
              sahipler: a.sahipler,
            })),
          },
        }
      }),

      alarmlar: alarmlar.map((a) => ({
        id: a.id,
        title: a.baslik || a.tip,
        subtitle: a.mesaj?.slice(0, 50) || a.durum,
        url: `/alarmlar`,
        category: "alarmlar",
      })),

      takipler: takipler.map((t) => ({
        id: t.id,
        title: t.gsm.numara,
        subtitle: `${t.durum}`,
        url: `/takipler/${t.gsmId}`,
        category: "takipler",
        metadata: {
          relatedKisiler: [{
            id: t.gsm.kisi.id,
            ad: t.gsm.kisi.ad,
            soyad: t.gsm.kisi.soyad,
            tc: t.gsm.kisi.tc,
          }],
        },
      })),

      araclar: araclar.map((a) => ({
        id: a.id,
        title: a.plaka,
        subtitle: `${a.model.marka.ad} ${a.model.ad}${a.renk ? ` - ${a.renk}` : ""}`,
        url: `/araclar`,
        category: "araclar",
        metadata: {
          relatedKisiler: (a.kisiler || []).map((k: any) => ({
            id: k.id,
            ad: k.ad,
            soyad: k.soyad,
            tt: k.tt,
            tc: k.tc,
          })),
          relatedTanitimlar: (a.relatedTanitimlar || []).map((t: any) => ({
            id: t.id,
            baslik: t.baslik,
            tarih: t.tarih,
            katilimcilar: t.katilimcilar,
          })),
          relatedOperasyonlar: (a.relatedOperasyonlar || []).map((o: any) => ({
            id: o.id,
            baslik: o.baslik,
            tarih: o.tarih,
            katilimcilar: o.katilimcilar,
          })),
        },
      })),

      notlar: notlar.map((n) => ({
        id: n.id,
        title: n.icerik.slice(0, 50) + (n.icerik.length > 50 ? "..." : ""),
        subtitle: n.icerik.length > 50 ? n.icerik : undefined,
        url: `/kisiler/${n.kisiId}`,
        category: "notlar",
        metadata: {
          relatedKisiler: [{
            id: n.kisiId,
            ad: n.kisi.ad,
            soyad: n.kisi.soyad,
            tc: n.kisi.tc,
          }],
        },
      })),

      faaliyetAlanlari: faaliyetAlanlari.map((fa) => ({
        id: fa.id,
        title: fa.ad,
        subtitle: fa.parent
          ? `${fa.parent.ad} / ${fa.kisiCount} kişi`
          : `${fa.kisiCount} kişi`,
        url: `/tanimlamalar/faaliyet-alanlari/${fa.id}`,
        category: "faaliyetAlanlari",
        metadata: {
          kisiCount: fa.kisiCount,
          parent: fa.parent || undefined,
        },
      })),

      loglar: [], // Disabled for global search
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

    const response: GlobalSearchResponse = {
      query,
      totalResults,
      results,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in global search:", error)
    const locale = getLocaleFromRequest(request)
    const t = getTranslations(locale)
    return NextResponse.json(
      { error: t.api.searchError },
      { status: 500 }
    )
  }
}
