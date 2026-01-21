import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const iller = await prisma.il.count()
  const ilceler = await prisma.ilce.count()
  const mahalleler = await prisma.mahalle.count()

  console.log("=== Veritabanı Kayıt Sayıları ===")
  console.log(`İl sayısı: ${iller}`)
  console.log(`İlçe sayısı: ${ilceler}`)
  console.log(`Mahalle sayısı: ${mahalleler}`)

  // Sample data
  const sampleIl = await prisma.il.findFirst({
    include: {
      _count: { select: { ilceler: true } }
    },
    orderBy: { plaka: "asc" }
  })

  if (sampleIl) {
    console.log(`\nÖrnek: ${sampleIl.plaka} - ${sampleIl.ad} (${sampleIl._count.ilceler} ilçe)`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
