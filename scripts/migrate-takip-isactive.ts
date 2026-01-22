import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Migration script to set isActive field for existing takip records
 * Logic: For each GSM, only the most recent takip (by createdAt DESC) should be isActive=true
 */
async function main() {
  console.log("Takip isActive migration başlıyor...")

  // First, set all takips to isActive=false
  const resetResult = await prisma.takip.updateMany({
    data: { isActive: false },
  })
  console.log(`${resetResult.count} takip kaydı isActive=false olarak güncellendi`)

  // Get all unique GSM IDs that have takips
  const gsmIds = await prisma.takip.findMany({
    select: { gsmId: true },
    distinct: ["gsmId"],
  })
  console.log(`${gsmIds.length} GSM için takip kaydı bulundu`)

  let updatedCount = 0

  // For each GSM, find the most recent takip and set it to active
  for (const { gsmId } of gsmIds) {
    const latestTakip = await prisma.takip.findFirst({
      where: { gsmId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })

    if (latestTakip) {
      await prisma.takip.update({
        where: { id: latestTakip.id },
        data: { isActive: true },
      })
      updatedCount++
    }
  }

  console.log(`${updatedCount} takip kaydı isActive=true olarak güncellendi`)
  console.log("Migration tamamlandı!")
}

main()
  .catch((e) => {
    console.error("Hata:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
