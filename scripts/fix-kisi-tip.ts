import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Kişi tipini aktif takip durumuna göre düzelt:
 * - Aktif takibi olan = MUSTERI
 * - Aktif takibi olmayan = LEAD
 */
async function main() {
  console.log("Kişi tip düzeltmesi başlıyor...")
  console.log("Kural: Aktif takibi olan = MUSTERI, olmayan = LEAD\n")

  // Tüm kişileri aktif takip sayılarıyla getir
  const kisiler = await prisma.kisi.findMany({
    select: {
      id: true,
      ad: true,
      soyad: true,
      tip: true,
      gsmler: {
        select: {
          takipler: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
  })

  const leadYapilacaklar: string[] = []
  const musteriYapilacaklar: string[] = []

  kisiler.forEach((kisi) => {
    const aktiveTakipSayisi = kisi.gsmler.reduce(
      (acc, gsm) => acc + gsm.takipler.length,
      0
    )
    const olmaliTip = aktiveTakipSayisi > 0 ? "MUSTERI" : "LEAD"

    if (kisi.tip !== olmaliTip) {
      console.log(
        `  ${kisi.ad} ${kisi.soyad}: ${kisi.tip} → ${olmaliTip} (${aktiveTakipSayisi} aktif takip)`
      )
      if (olmaliTip === "LEAD") {
        leadYapilacaklar.push(kisi.id)
      } else {
        musteriYapilacaklar.push(kisi.id)
      }
    }
  })

  // LEAD'e çevrilecekleri güncelle
  if (leadYapilacaklar.length > 0) {
    await prisma.kisi.updateMany({
      where: { id: { in: leadYapilacaklar } },
      data: { tip: "LEAD" },
    })
    console.log(`\n✓ ${leadYapilacaklar.length} kişi LEAD olarak güncellendi`)
  }

  // MUSTERI'ye çevrilecekleri güncelle
  if (musteriYapilacaklar.length > 0) {
    await prisma.kisi.updateMany({
      where: { id: { in: musteriYapilacaklar } },
      data: { tip: "MUSTERI" },
    })
    console.log(`✓ ${musteriYapilacaklar.length} kişi MUSTERI olarak güncellendi`)
  }

  if (leadYapilacaklar.length === 0 && musteriYapilacaklar.length === 0) {
    console.log("Tüm kişilerin tipi zaten doğru.")
  }

  // Son durum
  console.log("\n--- Son Durum ---")
  const sonDurum = await prisma.kisi.groupBy({
    by: ["tip"],
    _count: true,
  })
  sonDurum.forEach((d) => console.log(`  ${d.tip}: ${d._count} kişi`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
