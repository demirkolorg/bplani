-- CreateTable
CREATE TABLE "tanitim_araclari" (
    "id" TEXT NOT NULL,
    "tanitimId" TEXT NOT NULL,
    "aracId" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tanitim_araclari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operasyon_araclari" (
    "id" TEXT NOT NULL,
    "operasyonId" TEXT NOT NULL,
    "aracId" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operasyon_araclari_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tanitim_araclari_tanitimId_idx" ON "tanitim_araclari"("tanitimId");

-- CreateIndex
CREATE INDEX "tanitim_araclari_aracId_idx" ON "tanitim_araclari"("aracId");

-- CreateIndex
CREATE UNIQUE INDEX "tanitim_araclari_tanitimId_aracId_key" ON "tanitim_araclari"("tanitimId", "aracId");

-- CreateIndex
CREATE INDEX "operasyon_araclari_operasyonId_idx" ON "operasyon_araclari"("operasyonId");

-- CreateIndex
CREATE INDEX "operasyon_araclari_aracId_idx" ON "operasyon_araclari"("aracId");

-- CreateIndex
CREATE UNIQUE INDEX "operasyon_araclari_operasyonId_aracId_key" ON "operasyon_araclari"("operasyonId", "aracId");

-- AddForeignKey
ALTER TABLE "tanitim_araclari" ADD CONSTRAINT "tanitim_araclari_tanitimId_fkey" FOREIGN KEY ("tanitimId") REFERENCES "tanitimlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanitim_araclari" ADD CONSTRAINT "tanitim_araclari_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "araclar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyon_araclari" ADD CONSTRAINT "operasyon_araclari_operasyonId_fkey" FOREIGN KEY ("operasyonId") REFERENCES "operasyonlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasyon_araclari" ADD CONSTRAINT "operasyon_araclari_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "araclar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
