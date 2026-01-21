import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface MahalleData {
  ad: string;
}

interface IlceData {
  ad: string;
  mahalleler: MahalleData[];
}

interface IlData {
  ad: string;
  plaka: number | null;
  ilceler: IlceData[];
}

interface LokasyonData {
  iller: IlData[];
}

async function seedAdmin() {
  console.log('Admin kullanıcı oluşturuluyor...');

  const existingAdmin = await prisma.personel.findUnique({
    where: { visibleId: '000001' },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  if (!existingAdmin) {
    await prisma.personel.create({
      data: {
        visibleId: '000001',
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        parola: hashedPassword,
        rol: 'ADMIN',
        fotograf: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        isActive: true,
      },
    });
    console.log('Admin kullanıcı oluşturuldu: visibleId=000001, parola=admin123');
  } else {
    // Mevcut admin'i güncelle
    await prisma.personel.update({
      where: { visibleId: '000001' },
      data: {
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        parola: hashedPassword,
        fotograf: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    });
    console.log('Admin kullanıcı güncellendi.');
  }
}

async function main() {
  // Admin kullanıcı oluştur
  await seedAdmin();

  console.log('\nLokasyon verisi yükleniyor...');

  // Önce mevcut verileri sil (sıra önemli - foreign key)
  console.log('Mevcut veriler siliniyor...');
  await prisma.mahalle.deleteMany();
  await prisma.ilce.deleteMany();
  await prisma.il.deleteMany();
  console.log('Mevcut veriler silindi.');

  const dataPath = path.join(__dirname, '../hazirveri/lokasyonlar.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data: LokasyonData = JSON.parse(rawData);

  console.log(`${data.iller.length} il işlenecek...`);

  let ilSayisi = 0;
  let ilceSayisi = 0;
  let mahalleSayisi = 0;

  for (const ilData of data.iller) {
    // İl oluştur
    const il = await prisma.il.create({
      data: {
        ad: ilData.ad,
        plaka: ilData.plaka,
      },
    });
    ilSayisi++;

    // İlçeleri oluştur
    for (const ilceData of ilData.ilceler) {
      const ilce = await prisma.ilce.create({
        data: {
          ad: ilceData.ad,
          ilId: il.id,
        },
      });
      ilceSayisi++;

      // Mahalleleri batch olarak oluştur
      if (ilceData.mahalleler.length > 0) {
        await prisma.mahalle.createMany({
          data: ilceData.mahalleler.map((m) => ({
            ad: m.ad,
            ilceId: ilce.id,
          })),
        });
        mahalleSayisi += ilceData.mahalleler.length;
      }
    }

    // İlerleme göster
    if (ilSayisi % 10 === 0) {
      console.log(`${ilSayisi}/${data.iller.length} il işlendi...`);
    }
  }

  console.log('\nTamamlandı!');
  console.log(`- ${ilSayisi} il`);
  console.log(`- ${ilceSayisi} ilçe`);
  console.log(`- ${mahalleSayisi} mahalle`);
}

main()
  .catch((e) => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
