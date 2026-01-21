import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

interface MahalleData {
  ad: string
}

interface IlceData {
  ad: string
  mahalleler: MahalleData[]
}

interface IlData {
  ad: string
  plaka: number
  ilceler: IlceData[]
}

interface LokasyonData {
  iller: IlData[]
}

async function main() {
  console.log("Lokasyon verileri import ediliyor...")

  // Read JSON file
  const filePath = path.join(process.cwd(), "hazirveri", "lokasyonlar.json")
  const fileContent = fs.readFileSync(filePath, "utf-8")
  const data: LokasyonData = JSON.parse(fileContent)

  console.log(`${data.iller.length} il bulundu.`)

  let totalIlceler = 0
  let totalMahalleler = 0

  // Process each il
  for (const ilData of data.iller) {
    console.log(`İl: ${ilData.ad} (${ilData.plaka}) işleniyor...`)

    // Create or update il
    const il = await prisma.il.upsert({
      where: { plaka: ilData.plaka },
      update: {
        ad: ilData.ad,
      },
      create: {
        ad: ilData.ad,
        plaka: ilData.plaka,
        isActive: true,
      },
    })

    // Process ilceler
    for (const ilceData of ilData.ilceler) {
      // Check if ilce exists
      const existingIlce = await prisma.ilce.findFirst({
        where: {
          ad: ilceData.ad,
          ilId: il.id,
        },
      })

      let ilce
      if (existingIlce) {
        ilce = existingIlce
      } else {
        ilce = await prisma.ilce.create({
          data: {
            ad: ilceData.ad,
            ilId: il.id,
            isActive: true,
          },
        })
        totalIlceler++
      }

      // Process mahalleler in batches
      const mahallelerToCreate = []
      for (const mahalleData of ilceData.mahalleler) {
        // Check if mahalle exists
        const existingMahalle = await prisma.mahalle.findFirst({
          where: {
            ad: mahalleData.ad,
            ilceId: ilce.id,
          },
        })

        if (!existingMahalle) {
          mahallelerToCreate.push({
            ad: mahalleData.ad,
            ilceId: ilce.id,
            isActive: true,
          })
        }
      }

      // Batch create mahalleler
      if (mahallelerToCreate.length > 0) {
        await prisma.mahalle.createMany({
          data: mahallelerToCreate,
        })
        totalMahalleler += mahallelerToCreate.length
      }
    }
  }

  console.log("\n=== Import Tamamlandı ===")
  console.log(`Toplam: ${data.iller.length} il`)
  console.log(`Yeni eklenen ilçe: ${totalIlceler}`)
  console.log(`Yeni eklenen mahalle: ${totalMahalleler}`)
}

main()
  .catch((e) => {
    console.error("Hata:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
