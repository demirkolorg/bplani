-- CreateEnum
CREATE TYPE "DuyuruOncelik" AS ENUM ('NORMAL', 'ONEMLI', 'KRITIK');

-- CreateTable
CREATE TABLE "duyurular" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "oncelik" "DuyuruOncelik" NOT NULL DEFAULT 'NORMAL',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdUserId" TEXT,
    "updatedUserId" TEXT,

    CONSTRAINT "duyurular_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "duyurular_isActive_idx" ON "duyurular"("isActive");

-- CreateIndex
CREATE INDEX "duyurular_publishedAt_idx" ON "duyurular"("publishedAt");

-- CreateIndex
CREATE INDEX "duyurular_oncelik_idx" ON "duyurular"("oncelik");

-- AddForeignKey
ALTER TABLE "duyurular" ADD CONSTRAINT "duyurular_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duyurular" ADD CONSTRAINT "duyurular_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "personeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
