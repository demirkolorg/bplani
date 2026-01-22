import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const kisiler = await prisma.kisi.findMany({
    select: {
      id: true,
      tip: true,
      ad: true,
      soyad: true,
    }
  })

  console.log("Kisiler:")
  kisiler.forEach(k => {
    console.log(`  [${k.tip}] ${k.ad} ${k.soyad} (${k.id})`)
  })

  const gsmler = await prisma.gsm.findMany({
    select: {
      id: true,
      numara: true,
      kisiId: true,
      kisi: {
        select: { ad: true, soyad: true, tip: true }
      }
    }
  })

  console.log("\nGSM'ler:")
  gsmler.forEach(g => {
    console.log(`  ${g.numara} → ${g.kisi?.ad} ${g.kisi?.soyad} [${g.kisi?.tip}]`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
