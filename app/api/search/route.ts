import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { globalSearchQuerySchema, type SearchResultItem, type GlobalSearchResponse } from "@/lib/validations"

// GET /api/search - Global search across all tables
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedQuery = globalSearchQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Geçersiz sorgu parametreleri", details: validatedQuery.error.flatten() },
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
      markalar,
      modeller,
      iller,
      ilceler,
      mahalleler,
      notlar,
      loglar,
    ] = await Promise.all([
      // Kişiler
      prisma.kisi.findMany({
        where: {
          OR: [
            { ad: { contains: query, mode: "insensitive" } },
            { soyad: { contains: query, mode: "insensitive" } },
            { tc: { contains: query, mode: "insensitive" } },
            { faaliyet: { contains: query, mode: "insensitive" } },
          ],
          isArchived: false,
        },
        take: limit,
        select: { id: true, ad: true, soyad: true, tc: true, tip: true },
      }),

      // GSM (with kisi info)
      prisma.gsm.findMany({
        where: {
          OR: [
            { numara: { contains: query, mode: "insensitive" } },
            { kisi: { ad: { contains: query, mode: "insensitive" } } },
            { kisi: { soyad: { contains: query, mode: "insensitive" } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          numara: true,
          kisiId: true,
          kisi: { select: { ad: true, soyad: true } },
        },
      }),

      // Adresler (with mahalle chain)
      prisma.adres.findMany({
        where: {
          OR: [
            { ad: { contains: query, mode: "insensitive" } },
            { detay: { contains: query, mode: "insensitive" } },
            { mahalle: { ad: { contains: query, mode: "insensitive" } } },
            { mahalle: { ilce: { ad: { contains: query, mode: "insensitive" } } } },
            { mahalle: { ilce: { il: { ad: { contains: query, mode: "insensitive" } } } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          ad: true,
          detay: true,
          kisiId: true,
          mahalle: {
            select: {
              ad: true,
              ilce: {
                select: {
                  ad: true,
                  il: { select: { ad: true } },
                },
              },
            },
          },
          kisi: { select: { ad: true, soyad: true } },
        },
      }),

      // Personel
      prisma.personel.findMany({
        where: {
          OR: [
            { ad: { contains: query, mode: "insensitive" } },
            { soyad: { contains: query, mode: "insensitive" } },
            { visibleId: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        take: limit,
        select: { id: true, ad: true, soyad: true, visibleId: true, rol: true },
      }),

      // Tanıtımlar (with mahalle)
      prisma.tanitim.findMany({
        where: {
          OR: [
            { notlar: { contains: query, mode: "insensitive" } },
            { adresDetay: { contains: query, mode: "insensitive" } },
            { mahalle: { ad: { contains: query, mode: "insensitive" } } },
            { mahalle: { ilce: { ad: { contains: query, mode: "insensitive" } } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          tarih: true,
          notlar: true,
          adresDetay: true,
          mahalle: {
            select: {
              ad: true,
              ilce: { select: { ad: true } },
            },
          },
        },
      }),

      // Operasyonlar (with mahalle)
      prisma.operasyon.findMany({
        where: {
          OR: [
            { notlar: { contains: query, mode: "insensitive" } },
            { adresDetay: { contains: query, mode: "insensitive" } },
            { mahalle: { ad: { contains: query, mode: "insensitive" } } },
            { mahalle: { ilce: { ad: { contains: query, mode: "insensitive" } } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          tarih: true,
          notlar: true,
          adresDetay: true,
          mahalle: {
            select: {
              ad: true,
              ilce: { select: { ad: true } },
            },
          },
        },
      }),

      // Alarmlar
      prisma.alarm.findMany({
        where: {
          OR: [
            { baslik: { contains: query, mode: "insensitive" } },
            { mesaj: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: { id: true, baslik: true, mesaj: true, tip: true, durum: true },
      }),

      // Takipler (with gsm and kisi)
      prisma.takip.findMany({
        where: {
          OR: [
            { gsm: { numara: { contains: query, mode: "insensitive" } } },
            { gsm: { kisi: { ad: { contains: query, mode: "insensitive" } } } },
            { gsm: { kisi: { soyad: { contains: query, mode: "insensitive" } } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          durum: true,
          gsm: {
            select: {
              numara: true,
              kisi: { select: { ad: true, soyad: true } },
            },
          },
        },
      }),

      // Araçlar (with model and marka)
      prisma.arac.findMany({
        where: {
          OR: [
            { plaka: { contains: query, mode: "insensitive" } },
            { model: { ad: { contains: query, mode: "insensitive" } } },
            { model: { marka: { ad: { contains: query, mode: "insensitive" } } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          plaka: true,
          renk: true,
          model: {
            select: {
              ad: true,
              marka: { select: { ad: true } },
            },
          },
        },
      }),

      // Markalar
      prisma.marka.findMany({
        where: {
          ad: { contains: query, mode: "insensitive" },
        },
        take: limit,
        select: { id: true, ad: true },
      }),

      // Modeller
      prisma.model.findMany({
        where: {
          OR: [
            { ad: { contains: query, mode: "insensitive" } },
            { marka: { ad: { contains: query, mode: "insensitive" } } },
          ],
        },
        take: limit,
        select: {
          id: true,
          ad: true,
          marka: { select: { ad: true } },
        },
      }),

      // İller
      prisma.il.findMany({
        where: {
          ad: { contains: query, mode: "insensitive" },
          isActive: true,
        },
        take: limit,
        select: { id: true, ad: true, plaka: true },
      }),

      // İlçeler
      prisma.ilce.findMany({
        where: {
          OR: [
            { ad: { contains: query, mode: "insensitive" } },
            { il: { ad: { contains: query, mode: "insensitive" } } },
          ],
          isActive: true,
        },
        take: limit,
        select: {
          id: true,
          ad: true,
          il: { select: { ad: true } },
        },
      }),

      // Mahalleler
      prisma.mahalle.findMany({
        where: {
          OR: [
            { ad: { contains: query, mode: "insensitive" } },
            { ilce: { ad: { contains: query, mode: "insensitive" } } },
          ],
          isActive: true,
        },
        take: limit,
        select: {
          id: true,
          ad: true,
          ilce: {
            select: {
              ad: true,
              il: { select: { ad: true } },
            },
          },
        },
      }),

      // Notlar
      prisma.not.findMany({
        where: {
          icerik: { contains: query, mode: "insensitive" },
        },
        take: limit,
        select: {
          id: true,
          icerik: true,
          kisiId: true,
          kisi: { select: { ad: true, soyad: true } },
        },
      }),

      // Loglar
      prisma.log.findMany({
        where: {
          OR: [
            { aciklama: { contains: query, mode: "insensitive" } },
            { entityAd: { contains: query, mode: "insensitive" } },
            { userAd: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, aciklama: true, entityAd: true, entityType: true, islem: true, userAd: true, userSoyad: true },
      }),
    ])

    // Transform results into SearchResultItem format
    const results: GlobalSearchResponse["results"] = {
      kisiler: kisiler.map((k) => ({
        id: k.id,
        title: `${k.ad} ${k.soyad}`,
        subtitle: k.tc ? `TC: ${k.tc}` : k.tip,
        url: `/kisiler/${k.id}`,
        category: "Kişiler",
      })),

      gsmler: gsmler.map((g) => ({
        id: g.id,
        title: g.numara,
        subtitle: `${g.kisi.ad} ${g.kisi.soyad}`,
        url: `/kisiler/${g.kisiId}`,
        category: "GSM",
      })),

      adresler: adresler.map((a) => ({
        id: a.id,
        title: a.ad || `${a.mahalle.ilce.il.ad}, ${a.mahalle.ilce.ad}, ${a.mahalle.ad}`,
        subtitle: `${a.kisi.ad} ${a.kisi.soyad}${a.detay ? ` - ${a.detay}` : ""}`,
        url: `/kisiler/${a.kisiId}`,
        category: "Adresler",
      })),

      personel: personelList.map((p) => ({
        id: p.id,
        title: `${p.ad} ${p.soyad}`,
        subtitle: `${p.visibleId} - ${p.rol}`,
        url: `/personel/${p.id}`,
        category: "Personel",
      })),

      tanitimlar: tanitimlar.map((t) => ({
        id: t.id,
        title: t.mahalle ? `${t.mahalle.ilce.ad}, ${t.mahalle.ad}` : "Tanıtım",
        subtitle: t.notlar?.slice(0, 50) || new Date(t.tarih).toLocaleDateString("tr-TR"),
        url: `/tanitimlar/${t.id}`,
        category: "Tanıtımlar",
      })),

      operasyonlar: operasyonlar.map((o) => ({
        id: o.id,
        title: o.mahalle ? `${o.mahalle.ilce.ad}, ${o.mahalle.ad}` : "Operasyon",
        subtitle: o.notlar?.slice(0, 50) || new Date(o.tarih).toLocaleDateString("tr-TR"),
        url: `/operasyonlar/${o.id}`,
        category: "Operasyonlar",
      })),

      alarmlar: alarmlar.map((a) => ({
        id: a.id,
        title: a.baslik || a.tip,
        subtitle: a.mesaj?.slice(0, 50) || a.durum,
        url: `/alarmlar`,
        category: "Alarmlar",
      })),

      takipler: takipler.map((t) => ({
        id: t.id,
        title: t.gsm.numara,
        subtitle: `${t.gsm.kisi.ad} ${t.gsm.kisi.soyad} - ${t.durum}`,
        url: `/takipler/${t.id}`,
        category: "Takipler",
      })),

      araclar: araclar.map((a) => ({
        id: a.id,
        title: a.plaka,
        subtitle: `${a.model.marka.ad} ${a.model.ad}${a.renk ? ` - ${a.renk}` : ""}`,
        url: `/araclar`,
        category: "Araçlar",
      })),

      markalar: markalar.map((m) => ({
        id: m.id,
        title: m.ad,
        subtitle: "Marka",
        url: `/tanimlamalar`,
        category: "Markalar",
      })),

      modeller: modeller.map((m) => ({
        id: m.id,
        title: m.ad,
        subtitle: m.marka.ad,
        url: `/tanimlamalar`,
        category: "Modeller",
      })),

      lokasyonlar: [
        ...iller.map((i) => ({
          id: i.id,
          title: i.ad,
          subtitle: i.plaka ? `İl - Plaka: ${i.plaka}` : "İl",
          url: `/tanimlamalar`,
          category: "Lokasyonlar",
        })),
        ...ilceler.map((i) => ({
          id: i.id,
          title: i.ad,
          subtitle: `İlçe - ${i.il.ad}`,
          url: `/tanimlamalar`,
          category: "Lokasyonlar",
        })),
        ...mahalleler.map((m) => ({
          id: m.id,
          title: m.ad,
          subtitle: `Mahalle - ${m.ilce.il.ad}, ${m.ilce.ad}`,
          url: `/tanimlamalar`,
          category: "Lokasyonlar",
        })),
      ].slice(0, limit),

      notlar: notlar.map((n) => ({
        id: n.id,
        title: n.icerik.slice(0, 50) + (n.icerik.length > 50 ? "..." : ""),
        subtitle: `${n.kisi.ad} ${n.kisi.soyad}`,
        url: `/kisiler/${n.kisiId}`,
        category: "Notlar",
      })),

      loglar: loglar.map((l) => ({
        id: l.id,
        title: l.entityAd || l.aciklama || l.islem,
        subtitle: `${l.userAd || ""} ${l.userSoyad || ""} - ${l.entityType || ""}`.trim(),
        url: `/loglar`,
        category: "Loglar",
      })),
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
    return NextResponse.json(
      { error: "Arama yapılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
