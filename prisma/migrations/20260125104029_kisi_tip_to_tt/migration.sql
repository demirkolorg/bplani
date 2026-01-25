-- CreateEnum
CREATE TYPE "PersonelRol" AS ENUM ('ADMIN', 'YONETICI', 'PERSONEL');

-- CreateEnum
CREATE TYPE "TakipDurum" AS ENUM ('UZATILACAK', 'DEVAM_EDECEK', 'SONLANDIRILACAK', 'UZATILDI');

-- CreateEnum
CREATE TYPE "AlarmTip" AS ENUM ('TAKIP_BITIS', 'ODEME_HATIRLATMA', 'OZEL');

-- CreateEnum
CREATE TYPE "AlarmDurum" AS ENUM ('BEKLIYOR', 'TETIKLENDI', 'GORULDU', 'IPTAL');

-- CreateEnum
CREATE TYPE "AracRenk" AS ENUM ('BEYAZ', 'SIYAH', 'GRI', 'GUMUS', 'KIRMIZI', 'MAVI', 'LACIVERT', 'YESIL', 'SARI', 'TURUNCU', 'KAHVERENGI', 'BEJ', 'BORDO', 'MOR', 'PEMBE', 'ALTIN', 'BRONZ', 'DIGER');

-- CreateEnum
CREATE TYPE "LogIslem" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'LOGIN_FAIL', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE', 'STATUS_CHANGE', 'EXPORT');

-- CreateTable
CREATE TABLE "personeller" (
    "id" TEXT NOT NULL,
    "visibleId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "parola" TEXT NOT NULL,
    "rol" "PersonelRol" NOT NULL DEFAULT 'PERSONEL',
    "fotograf" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kisiler" (
    "id" TEXT NOT NULL,
    "tt" BOOLEAN NOT NULL DEFAULT false,
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
);

-- CreateTable
CREATE TABLE "gsmler" (
    "id" TEXT NOT NULL,
    "numara" TEXT NOT NULL,
    "kisiId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "gsmler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iller" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "plaka" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "iller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ilceler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "ilId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "ilceler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahalleler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "ilceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "mahalleler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adresler" (
    "id" TEXT NOT NULL,
    "ad" TEXT,
    "mahalleId" TEXT NOT NULL,
    "detay" TEXT,
    "kisiId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "adresler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "takipler" (
    "id" TEXT NOT NULL,
    "gsmId" TEXT NOT NULL,
    "baslamaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitisTarihi" TIMESTAMP(3) NOT NULL,
    "durum" "TakipDurum" NOT NULL DEFAULT 'UZATILACAK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "takipler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alarmlar" (
    "id" TEXT NOT NULL,
    "takipId" TEXT,
    "tip" "AlarmTip" NOT NULL,
    "baslik" TEXT,
    "mesaj" TEXT,
    "tetikTarihi" TIMESTAMP(3) NOT NULL,
    "gunOnce" INTEGER NOT NULL DEFAULT 20,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "durum" "AlarmDurum" NOT NULL DEFAULT 'BEKLIYOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,

    CONSTRAINT "alarmlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alarm_ayarlari" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alarm_ayarlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notlar" (
    "id" TEXT NOT NULL,
    "kisiId" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdUserId" TEXT,

    CONSTRAINT "notlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tanitimlar" (
    "id" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saat" TEXT,
    "mahalleId" TEXT,
    "adresDetay" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "tanitimlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tanitim_katilimcilari" (
    "id" TEXT NOT NULL,
    "tanitimId" TEXT NOT NULL,
    "kisiId" TEXT,
    "gsmId" TEXT,

    CONSTRAINT "tanitim_katilimcilari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operasyonlar" (
    "id" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saat" TEXT,
    "mahalleId" TEXT,
    "adresDetay" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "operasyonlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operasyon_katilimcilari" (
    "id" TEXT NOT NULL,
    "operasyonId" TEXT NOT NULL,
    "kisiId" TEXT,
    "gsmId" TEXT,

    CONSTRAINT "operasyon_katilimcilari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markalar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "markalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modeller" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "markaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "modeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "araclar" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "renk" "AracRenk",
    "plaka" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "araclar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arac_kisileri" (
    "id" TEXT NOT NULL,
    "aracId" TEXT NOT NULL,
    "kisiId" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arac_kisileri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loglar" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userAd" TEXT,
    "userSoyad" TEXT,
    "islem" "LogIslem" NOT NULL,
    "aciklama" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "entityAd" TEXT,
    "oncekiVeri" JSONB,
    "yeniVeri" JSONB,
    "degisiklikler" JSONB,
    "ipAdresi" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loglar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faaliyet_alanlari" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "parentId" TEXT,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "faaliyet_alanlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kisi_faaliyet_alanlari" (
    "id" TEXT NOT NULL,
    "kisiId" TEXT NOT NULL,
    "faaliyetAlaniId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kisi_faaliyet_alanlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kullanici_tercihleri" (
    "id" TEXT NOT NULL,
    "personelId" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "anahtar" TEXT NOT NULL,
    "deger" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kullanici_tercihleri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personeller_visibleId_key" ON "personeller"("visibleId");

-- CreateIndex
CREATE UNIQUE INDEX "kisiler_tc_key" ON "kisiler"("tc");

-- CreateIndex
CREATE INDEX "kisiler_ad_soyad_idx" ON "kisiler"("ad", "soyad");

-- CreateIndex
CREATE INDEX "kisiler_tc_idx" ON "kisiler"("tc");

-- CreateIndex
CREATE INDEX "kisiler_tt_idx" ON "kisiler"("tt");

-- CreateIndex
CREATE INDEX "gsmler_numara_idx" ON "gsmler"("numara");

-- CreateIndex
CREATE INDEX "gsmler_kisiId_idx" ON "gsmler"("kisiId");

-- CreateIndex
CREATE UNIQUE INDEX "iller_ad_key" ON "iller"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "iller_plaka_key" ON "iller"("plaka");

-- CreateIndex
CREATE UNIQUE INDEX "ilceler_ilId_ad_key" ON "ilceler"("ilId", "ad");

-- CreateIndex
CREATE UNIQUE INDEX "mahalleler_ilceId_ad_key" ON "mahalleler"("ilceId", "ad");

-- CreateIndex
CREATE INDEX "adresler_kisiId_idx" ON "adresler"("kisiId");

-- CreateIndex
CREATE INDEX "takipler_gsmId_idx" ON "takipler"("gsmId");

-- CreateIndex
CREATE INDEX "takipler_isActive_idx" ON "takipler"("isActive");

-- CreateIndex
CREATE INDEX "takipler_bitisTarihi_idx" ON "takipler"("bitisTarihi");

-- CreateIndex
CREATE INDEX "alarmlar_tetikTarihi_idx" ON "alarmlar"("tetikTarihi");

-- CreateIndex
CREATE INDEX "alarmlar_durum_idx" ON "alarmlar"("durum");

-- CreateIndex
CREATE INDEX "alarmlar_isPaused_idx" ON "alarmlar"("isPaused");

-- CreateIndex
CREATE UNIQUE INDEX "alarm_ayarlari_key_key" ON "alarm_ayarlari"("key");

-- CreateIndex
CREATE INDEX "notlar_kisiId_idx" ON "notlar"("kisiId");

-- CreateIndex
CREATE INDEX "tanitimlar_tarih_idx" ON "tanitimlar"("tarih");

-- CreateIndex
CREATE INDEX "tanitimlar_mahalleId_idx" ON "tanitimlar"("mahalleId");

-- CreateIndex
CREATE UNIQUE INDEX "tanitim_katilimcilari_tanitimId_kisiId_key" ON "tanitim_katilimcilari"("tanitimId", "kisiId");

-- CreateIndex
CREATE INDEX "operasyonlar_tarih_idx" ON "operasyonlar"("tarih");

-- CreateIndex
CREATE INDEX "operasyonlar_mahalleId_idx" ON "operasyonlar"("mahalleId");

-- CreateIndex
CREATE UNIQUE INDEX "operasyon_katilimcilari_operasyonId_kisiId_key" ON "operasyon_katilimcilari"("operasyonId", "kisiId");

-- CreateIndex
CREATE UNIQUE INDEX "markalar_ad_key" ON "markalar"("ad");

-- CreateIndex
CREATE INDEX "modeller_markaId_idx" ON "modeller"("markaId");

-- CreateIndex
CREATE UNIQUE INDEX "modeller_markaId_ad_key" ON "modeller"("markaId", "ad");

-- CreateIndex
CREATE UNIQUE INDEX "araclar_plaka_key" ON "araclar"("plaka");

-- CreateIndex
CREATE INDEX "araclar_modelId_idx" ON "araclar"("modelId");

-- CreateIndex
CREATE INDEX "araclar_plaka_idx" ON "araclar"("plaka");

-- CreateIndex
CREATE INDEX "arac_kisileri_aracId_idx" ON "arac_kisileri"("aracId");

-- CreateIndex
CREATE INDEX "arac_kisileri_kisiId_idx" ON "arac_kisileri"("kisiId");

-- CreateIndex
CREATE UNIQUE INDEX "arac_kisileri_aracId_kisiId_key" ON "arac_kisileri"("aracId", "kisiId");

-- CreateIndex
CREATE INDEX "loglar_userId_idx" ON "loglar"("userId");

-- CreateIndex
CREATE INDEX "loglar_entityType_idx" ON "loglar"("entityType");

-- CreateIndex
CREATE INDEX "loglar_entityId_idx" ON "loglar"("entityId");

-- CreateIndex
CREATE INDEX "loglar_islem_idx" ON "loglar"("islem");

-- CreateIndex
CREATE INDEX "loglar_createdAt_idx" ON "loglar"("createdAt");

-- CreateIndex
CREATE INDEX "faaliyet_alanlari_parentId_idx" ON "faaliyet_alanlari"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "faaliyet_alanlari_parentId_ad_key" ON "faaliyet_alanlari"("parentId", "ad");

-- CreateIndex
CREATE INDEX "kisi_faaliyet_alanlari_kisiId_idx" ON "kisi_faaliyet_alanlari"("kisiId");

-- CreateIndex
CREATE INDEX "kisi_faaliyet_alanlari_faaliyetAlaniId_idx" ON "kisi_faaliyet_alanlari"("faaliyetAlaniId");

-- CreateIndex
CREATE UNIQUE INDEX "kisi_faaliyet_alanlari_kisiId_faaliyetAlaniId_key" ON "kisi_faaliyet_alanlari"("kisiId", "faaliyetAlaniId");

-- CreateIndex
CREATE INDEX "kullanici_tercihleri_personelId_idx" ON "kullanici_tercihleri"("personelId");

-- CreateIndex
CREATE INDEX "kullanici_tercihleri_kategori_idx" ON "kullanici_tercihleri"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "kullanici_tercihleri_personelId_kategori_anahtar_key" ON "kullanici_tercihleri"("personelId", "kategori", "anahtar");

-- AddForeignKey
ALTER TABLE "kisiler" ADD CONSTRAINT "kisiler_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kisiler" ADD CONSTRAINT "kisiler_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gsmler" ADD CONSTRAINT "gsmler_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gsmler" ADD CONSTRAINT "gsmler_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gsmler" ADD CONSTRAINT "gsmler_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iller" ADD CONSTRAINT "iller_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iller" ADD CONSTRAINT "iller_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ilceler" ADD CONSTRAINT "ilceler_ilId_fkey" FOREIGN KEY ("ilId") REFERENCES "iller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ilceler" ADD CONSTRAINT "ilceler_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ilceler" ADD CONSTRAINT "ilceler_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahalleler" ADD CONSTRAINT "mahalleler_ilceId_fkey" FOREIGN KEY ("ilceId") REFERENCES "ilceler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahalleler" ADD CONSTRAINT "mahalleler_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahalleler" ADD CONSTRAINT "mahalleler_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresler" ADD CONSTRAINT "adresler_mahalleId_fkey" FOREIGN KEY ("mahalleId") REFERENCES "mahalleler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresler" ADD CONSTRAINT "adresler_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresler" ADD CONSTRAINT "adresler_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresler" ADD CONSTRAINT "adresler_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takipler" ADD CONSTRAINT "takipler_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "gsmler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takipler" ADD CONSTRAINT "takipler_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takipler" ADD CONSTRAINT "takipler_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarmlar" ADD CONSTRAINT "alarmlar_takipId_fkey" FOREIGN KEY ("takipId") REFERENCES "takipler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarmlar" ADD CONSTRAINT "alarmlar_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notlar" ADD CONSTRAINT "notlar_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notlar" ADD CONSTRAINT "notlar_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanitimlar" ADD CONSTRAINT "tanitimlar_mahalleId_fkey" FOREIGN KEY ("mahalleId") REFERENCES "mahalleler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanitimlar" ADD CONSTRAINT "tanitimlar_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanitimlar" ADD CONSTRAINT "tanitimlar_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanitim_katilimcilari" ADD CONSTRAINT "tanitim_katilimcilari_tanitimId_fkey" FOREIGN KEY ("tanitimId") REFERENCES "tanitimlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanitim_katilimcilari" ADD CONSTRAINT "tanitim_katilimcilari_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyonlar" ADD CONSTRAINT "operasyonlar_mahalleId_fkey" FOREIGN KEY ("mahalleId") REFERENCES "mahalleler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyonlar" ADD CONSTRAINT "operasyonlar_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyonlar" ADD CONSTRAINT "operasyonlar_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyon_katilimcilari" ADD CONSTRAINT "operasyon_katilimcilari_operasyonId_fkey" FOREIGN KEY ("operasyonId") REFERENCES "operasyonlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyon_katilimcilari" ADD CONSTRAINT "operasyon_katilimcilari_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markalar" ADD CONSTRAINT "markalar_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markalar" ADD CONSTRAINT "markalar_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modeller" ADD CONSTRAINT "modeller_markaId_fkey" FOREIGN KEY ("markaId") REFERENCES "markalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modeller" ADD CONSTRAINT "modeller_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modeller" ADD CONSTRAINT "modeller_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "araclar" ADD CONSTRAINT "araclar_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "modeller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "araclar" ADD CONSTRAINT "araclar_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "araclar" ADD CONSTRAINT "araclar_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arac_kisileri" ADD CONSTRAINT "arac_kisileri_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "araclar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arac_kisileri" ADD CONSTRAINT "arac_kisileri_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loglar" ADD CONSTRAINT "loglar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faaliyet_alanlari" ADD CONSTRAINT "faaliyet_alanlari_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "faaliyet_alanlari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faaliyet_alanlari" ADD CONSTRAINT "faaliyet_alanlari_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faaliyet_alanlari" ADD CONSTRAINT "faaliyet_alanlari_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kisi_faaliyet_alanlari" ADD CONSTRAINT "kisi_faaliyet_alanlari_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "kisiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kisi_faaliyet_alanlari" ADD CONSTRAINT "kisi_faaliyet_alanlari_faaliyetAlaniId_fkey" FOREIGN KEY ("faaliyetAlaniId") REFERENCES "faaliyet_alanlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kullanici_tercihleri" ADD CONSTRAINT "kullanici_tercihleri_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
