import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Migration script to merge musteriler and leadler tables into kisiler
 *
 * Steps:
 * 1. Create kisiler table if not exists
 * 2. Migrate musteriler data (tip=MUSTERI)
 * 3. Migrate leadler data (tip=LEAD)
 * 4. Update GSM, Adres, Not, TanitimKatilimci foreign keys
 * 5. Drop old columns and tables
 */
async function main() {
  console.log("Müşteri/Lead → Kişi migrasyon başlıyor...")
  console.log("=" .repeat(50))

  // Check if old tables exist
  const checkTables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('musteriler', 'leadler', 'kisiler')
  `

  const existingTables = checkTables.map(t => t.table_name)
  console.log("Mevcut tablolar:", existingTables.join(", ") || "yok")

  const hasMusteriler = existingTables.includes("musteriler")
  const hasLeadler = existingTables.includes("leadler")
  const hasKisiler = existingTables.includes("kisiler")

  if (!hasMusteriler && !hasLeadler) {
    console.log("⚠️  musteriler ve leadler tabloları bulunamadı.")
    console.log("   Muhtemelen migrasyon zaten tamamlanmış veya henüz veri yok.")
    return
  }

  // Step 1: Create kisiler table if not exists
  if (!hasKisiler) {
    console.log("\n1. kisiler tablosu oluşturuluyor...")
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "kisiler" (
        "id" TEXT NOT NULL,
        "tip" TEXT NOT NULL DEFAULT 'LEAD',
        "tc" TEXT,
        "ad" TEXT NOT NULL,
        "soyad" TEXT NOT NULL,
        "faaliyet" TEXT,
        "pio" BOOLEAN NOT NULL DEFAULT false,
        "asli" BOOLEAN NOT NULL DEFAULT false,
        "fotograf" TEXT,
        "isArchived" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "createdUserId" TEXT,
        "updatedUserId" TEXT,
        CONSTRAINT "kisiler_pkey" PRIMARY KEY ("id")
      )
    `
    console.log("   ✓ kisiler tablosu oluşturuldu")

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "kisiler_ad_soyad_idx" ON "kisiler"("ad", "soyad")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "kisiler_tc_idx" ON "kisiler"("tc")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "kisiler_tip_idx" ON "kisiler"("tip")`
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "kisiler_tc_key" ON "kisiler"("tc")`
    console.log("   ✓ indexler oluşturuldu")
  } else {
    console.log("\n1. kisiler tablosu zaten mevcut")
  }

  // Step 2: Migrate musteriler data
  if (hasMusteriler) {
    console.log("\n2. musteriler verisi taşınıyor...")
    const musteriCount = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "musteriler"
    `
    const count = Number(musteriCount[0]?.count || 0)
    console.log(`   ${count} müşteri kaydı bulundu`)

    if (count > 0) {
      await prisma.$executeRaw`
        INSERT INTO "kisiler" ("id", "tip", "tc", "ad", "soyad", "faaliyet", "pio", "asli", "fotograf", "isArchived", "createdAt", "updatedAt", "createdUserId", "updatedUserId")
        SELECT
          "id",
          'MUSTERI' as "tip",
          "tc",
          "ad",
          "soyad",
          "faaliyet",
          "pio",
          "asli",
          "fotograf",
          "isArchived",
          "createdAt",
          "updatedAt",
          "createdUserId",
          "updatedUserId"
        FROM "musteriler"
        ON CONFLICT ("id") DO NOTHING
      `
      console.log(`   ✓ ${count} müşteri kaydı taşındı (tip=MUSTERI)`)
    }
  } else {
    console.log("\n2. musteriler tablosu bulunamadı, atlanıyor...")
  }

  // Step 3: Migrate leadler data
  if (hasLeadler) {
    console.log("\n3. leadler verisi taşınıyor...")
    const leadCount = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "leadler"
    `
    const count = Number(leadCount[0]?.count || 0)
    console.log(`   ${count} lead kaydı bulundu`)

    if (count > 0) {
      await prisma.$executeRaw`
        INSERT INTO "kisiler" ("id", "tip", "tc", "ad", "soyad", "faaliyet", "pio", "asli", "fotograf", "isArchived", "createdAt", "updatedAt", "createdUserId", "updatedUserId")
        SELECT
          "id",
          'LEAD' as "tip",
          "tc",
          "ad",
          "soyad",
          "faaliyet",
          COALESCE("pio", false) as "pio",
          COALESCE("asli", false) as "asli",
          "fotograf",
          COALESCE("isArchived", false) as "isArchived",
          "createdAt",
          "updatedAt",
          "createdUserId",
          "updatedUserId"
        FROM "leadler"
        ON CONFLICT ("id") DO NOTHING
      `
      console.log(`   ✓ ${count} lead kaydı taşındı (tip=LEAD)`)
    }
  } else {
    console.log("\n3. leadler tablosu bulunamadı, atlanıyor...")
  }

  // Step 4: Update GSM foreign keys
  console.log("\n4. GSM tablosu güncelleniyor...")

  // Check if gsmler has kisiId column
  const gsmColumns = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'gsmler'
    AND column_name IN ('musteriId', 'leadId', 'kisiId')
  `
  const gsmColNames = gsmColumns.map(c => c.column_name)
  console.log("   GSM kolonları:", gsmColNames.join(", "))

  if (!gsmColNames.includes("kisiId")) {
    // Add kisiId column
    await prisma.$executeRaw`ALTER TABLE "gsmler" ADD COLUMN IF NOT EXISTS "kisiId" TEXT`
    console.log("   ✓ kisiId kolonu eklendi")
  }

  // Update kisiId from musteriId
  if (gsmColNames.includes("musteriId")) {
    const result = await prisma.$executeRaw`
      UPDATE "gsmler" SET "kisiId" = "musteriId" WHERE "musteriId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} GSM kaydı musteriId'den güncellendi`)
  }

  // Update kisiId from leadId
  if (gsmColNames.includes("leadId")) {
    const result = await prisma.$executeRaw`
      UPDATE "gsmler" SET "kisiId" = "leadId" WHERE "leadId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} GSM kaydı leadId'den güncellendi`)
  }

  // Step 5: Update Adres foreign keys
  console.log("\n5. Adres tablosu güncelleniyor...")

  const adresColumns = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'adresler'
    AND column_name IN ('musteriId', 'leadId', 'kisiId')
  `
  const adresColNames = adresColumns.map(c => c.column_name)
  console.log("   Adres kolonları:", adresColNames.join(", "))

  if (!adresColNames.includes("kisiId")) {
    await prisma.$executeRaw`ALTER TABLE "adresler" ADD COLUMN IF NOT EXISTS "kisiId" TEXT`
    console.log("   ✓ kisiId kolonu eklendi")
  }

  if (adresColNames.includes("musteriId")) {
    const result = await prisma.$executeRaw`
      UPDATE "adresler" SET "kisiId" = "musteriId" WHERE "musteriId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} Adres kaydı musteriId'den güncellendi`)
  }

  if (adresColNames.includes("leadId")) {
    const result = await prisma.$executeRaw`
      UPDATE "adresler" SET "kisiId" = "leadId" WHERE "leadId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} Adres kaydı leadId'den güncellendi`)
  }

  // Step 6: Update Not foreign keys
  console.log("\n6. Not tablosu güncelleniyor...")

  const notColumns = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'notlar'
    AND column_name IN ('musteriId', 'leadId', 'kisiId')
  `
  const notColNames = notColumns.map(c => c.column_name)
  console.log("   Not kolonları:", notColNames.join(", "))

  if (!notColNames.includes("kisiId")) {
    await prisma.$executeRaw`ALTER TABLE "notlar" ADD COLUMN IF NOT EXISTS "kisiId" TEXT`
    console.log("   ✓ kisiId kolonu eklendi")
  }

  if (notColNames.includes("musteriId")) {
    const result = await prisma.$executeRaw`
      UPDATE "notlar" SET "kisiId" = "musteriId" WHERE "musteriId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} Not kaydı musteriId'den güncellendi`)
  }

  if (notColNames.includes("leadId")) {
    const result = await prisma.$executeRaw`
      UPDATE "notlar" SET "kisiId" = "leadId" WHERE "leadId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} Not kaydı leadId'den güncellendi`)
  }

  // Step 7: Update TanitimKatilimci foreign keys
  console.log("\n7. TanitimKatilimci tablosu güncelleniyor...")

  const tkColumns = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'tanitim_katilimcilari'
    AND column_name IN ('musteriId', 'leadId', 'kisiId')
  `
  const tkColNames = tkColumns.map(c => c.column_name)
  console.log("   TanitimKatilimci kolonları:", tkColNames.join(", "))

  if (!tkColNames.includes("kisiId")) {
    await prisma.$executeRaw`ALTER TABLE "tanitim_katilimcilari" ADD COLUMN IF NOT EXISTS "kisiId" TEXT`
    console.log("   ✓ kisiId kolonu eklendi")
  }

  if (tkColNames.includes("musteriId")) {
    const result = await prisma.$executeRaw`
      UPDATE "tanitim_katilimcilari" SET "kisiId" = "musteriId" WHERE "musteriId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} TanitimKatilimci kaydı musteriId'den güncellendi`)
  }

  if (tkColNames.includes("leadId")) {
    const result = await prisma.$executeRaw`
      UPDATE "tanitim_katilimcilari" SET "kisiId" = "leadId" WHERE "leadId" IS NOT NULL AND "kisiId" IS NULL
    `
    console.log(`   ✓ ${result} TanitimKatilimci kaydı leadId'den güncellendi`)
  }

  // Summary
  console.log("\n" + "=" .repeat(50))
  console.log("Veri migrasyon tamamlandı!")
  console.log("")
  console.log("Sonraki adımlar:")
  console.log("1. Verilerin doğru taşındığını kontrol edin")
  console.log("2. npx prisma db push komutunu çalıştırın")
  console.log("   (Bu, eski kolonları kaldırıp yeni FK'ları ekleyecek)")
  console.log("")
  console.log("⚠️  prisma db push çalıştırıldığında:")
  console.log("   - musteriler tablosu silinecek")
  console.log("   - leadler tablosu silinecek")
  console.log("   - GSM, Adres, Not tablolarındaki musteriId/leadId kolonları kaldırılacak")
}

main()
  .catch((e) => {
    console.error("Hata:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
