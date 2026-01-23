import { PrismaClient, KisiTip, PersonelRol, TakipDurum, AlarmTip, AlarmDurum, AracRenk, LogIslem } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

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

interface MarkaModelJsonModel {
  name: string;
  slug: string;
  url: string;
}

interface MarkaModelJsonBrand {
  name: string;
  slug: string;
  url: string;
  models: MarkaModelJsonModel[];
}

interface MarkaModelJsonData {
  source: string;
  brands: MarkaModelJsonBrand[];
}

// Personel seed data
const personelData = [
  { visibleId: '000001', ad: 'Ahmet', soyad: 'Yılmaz', rol: PersonelRol.ADMIN },
  { visibleId: '000002', ad: 'Mehmet', soyad: 'Kaya', rol: PersonelRol.YONETICI },
  { visibleId: '000003', ad: 'Ayşe', soyad: 'Demir', rol: PersonelRol.PERSONEL },
  { visibleId: '000004', ad: 'Fatma', soyad: 'Çelik', rol: PersonelRol.PERSONEL },
  { visibleId: '000005', ad: 'Ali', soyad: 'Öztürk', rol: PersonelRol.PERSONEL },
];

// Kişi seed data
const kisiData = [
  { tc: '12345678901', ad: 'Mustafa', soyad: 'Arslan', tip: KisiTip.MUSTERI },
  { tc: '23456789012', ad: 'Zeynep', soyad: 'Yıldız', tip: KisiTip.MUSTERI },
  { tc: '34567890123', ad: 'Hasan', soyad: 'Şahin', tip: KisiTip.LEAD },
  { tc: '45678901234', ad: 'Elif', soyad: 'Koç', tip: KisiTip.LEAD },
  { tc: '56789012345', ad: 'Emre', soyad: 'Aydın', tip: KisiTip.MUSTERI },
  { tc: '67890123456', ad: 'Selin', soyad: 'Yılmaz', tip: KisiTip.MUSTERI },
  { tc: '78901234567', ad: 'Burak', soyad: 'Kara', tip: KisiTip.LEAD },
  { tc: '89012345678', ad: 'Deniz', soyad: 'Özkan', tip: KisiTip.MUSTERI },
  { tc: '90123456789', ad: 'Ceren', soyad: 'Aksoy', tip: KisiTip.LEAD },
  { tc: '01234567890', ad: 'Kaan', soyad: 'Erdoğan', tip: KisiTip.MUSTERI },
];

// GSM numaraları
const gsmData = [
  ['5321234567', '5329876543'],
  ['5331234567'],
  ['5341234567', '5349876543', '5341112233'],
  ['5351234567'],
  ['5361234567', '5369876543'],
  ['5371234567', '5379876543'],
  ['5381234567'],
  ['5391234567', '5399876543'],
  ['5421234567'],
  ['5431234567', '5439876543', '5431112233'],
];

// Araç plakaları (rastgele modeller atanacak)
const aracData = [
  { plaka: '34 ABC 123' },
  { plaka: '06 XYZ 456' },
  { plaka: '35 DEF 789' },
  { plaka: '16 GHI 012' },
  { plaka: '34 JKL 345' },
  { plaka: '07 MNO 678' },
  { plaka: '41 PRS 901' },
  { plaka: '34 TUV 234' },
  { plaka: '06 WYZ 567' },
  { plaka: '35 AAA 890' },
];

// Faaliyet Alanları
const faaliyetAlaniData = [
  { ad: 'Ticaret', children: ['Toptan Ticaret', 'Perakende Ticaret', 'E-Ticaret'] },
  { ad: 'Üretim', children: ['Tekstil', 'Gıda', 'Otomotiv'] },
  { ad: 'Hizmet', children: ['Danışmanlık', 'Eğitim', 'Sağlık'] },
  { ad: 'İnşaat', children: ['Konut', 'Ticari', 'Altyapı'] },
  { ad: 'Teknoloji', children: ['Yazılım', 'Donanım', 'Telekomünikasyon'] },
];

async function seedPersonel() {
  console.log('Personel oluşturuluyor...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const personeller = [];
  for (const p of personelData) {
    const personel = await prisma.personel.upsert({
      where: { visibleId: p.visibleId },
      update: {},
      create: {
        visibleId: p.visibleId,
        ad: p.ad,
        soyad: p.soyad,
        parola: hashedPassword,
        rol: p.rol,
        fotograf: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.ad}`,
        isActive: true,
      },
    });
    personeller.push(personel);
  }
  console.log(`${personeller.length} personel oluşturuldu.`);
  return personeller;
}

async function seedFaaliyetAlanlari(adminId: string) {
  console.log('Faaliyet alanları oluşturuluyor...');

  for (const fa of faaliyetAlaniData) {
    const parent = await prisma.faaliyetAlani.create({
      data: {
        ad: fa.ad,
        createdUserId: adminId,
      },
    });

    for (let i = 0; i < fa.children.length; i++) {
      await prisma.faaliyetAlani.create({
        data: {
          ad: fa.children[i],
          parentId: parent.id,
          sira: i,
          createdUserId: adminId,
        },
      });
    }
  }
  console.log('Faaliyet alanları oluşturuldu.');
}

async function seedMarkaModel(adminId: string) {
  console.log('Marka ve modeller oluşturuluyor (JSON dosyasından)...');

  const dataPath = path.join(__dirname, '../hazirveri/markamodel.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data: MarkaModelJsonData = JSON.parse(rawData);

  console.log(`${data.brands.length} marka işlenecek...`);

  let markaSayisi = 0;
  let modelSayisi = 0;

  for (const brand of data.brands) {
    // Marka oluştur
    const marka = await prisma.marka.create({
      data: {
        ad: brand.name,
        createdUserId: adminId,
      },
    });
    markaSayisi++;

    // Modelleri batch olarak oluştur
    if (brand.models.length > 0) {
      await prisma.model.createMany({
        data: brand.models.map((m) => ({
          ad: m.name,
          markaId: marka.id,
          createdUserId: adminId,
        })),
      });
      modelSayisi += brand.models.length;
    }

    // İlerleme göster
    if (markaSayisi % 50 === 0) {
      console.log(`${markaSayisi}/${data.brands.length} marka işlendi...`);
    }
  }

  console.log(`\nMarka ve modeller tamamlandı!`);
  console.log(`- ${markaSayisi} marka`);
  console.log(`- ${modelSayisi} model`);
}

async function seedKisilerVeIliskiler(adminId: string, mahalleler: { id: string }[]) {
  console.log('Kişiler ve ilişkili veriler oluşturuluyor...');

  // Faaliyet alanlarını al (sadece alt kategoriler - parentId olan)
  const faaliyetAlanlari = await prisma.faaliyetAlani.findMany({
    where: { parentId: { not: null } },
  });

  const kisiler = [];
  const gsmler = [];

  for (let i = 0; i < kisiData.length; i++) {
    const k = kisiData[i];
    const kisi = await prisma.kisi.create({
      data: {
        tc: k.tc,
        ad: k.ad,
        soyad: k.soyad,
        tip: k.tip,
        createdUserId: adminId,
      },
    });
    kisiler.push(kisi);

    // GSM numaraları ekle
    for (let j = 0; j < gsmData[i].length; j++) {
      const gsm = await prisma.gsm.create({
        data: {
          numara: gsmData[i][j],
          kisiId: kisi.id,
          isPrimary: j === 0,
          createdUserId: adminId,
        },
      });
      gsmler.push(gsm);
    }

    // Adres ekle
    const randomMahalle = mahalleler[Math.floor(Math.random() * mahalleler.length)];
    await prisma.adres.create({
      data: {
        ad: 'Ev',
        mahalleId: randomMahalle.id,
        detay: `No: ${Math.floor(Math.random() * 100) + 1}, Daire: ${Math.floor(Math.random() * 20) + 1}`,
        kisiId: kisi.id,
        isPrimary: true,
        createdUserId: adminId,
      },
    });

    // Faaliyet alanları ekle (1-3 adet rastgele)
    const shuffledFaaliyetler = [...faaliyetAlanlari].sort(() => 0.5 - Math.random());
    const faaliyetSayisi = 1 + Math.floor(Math.random() * 3);
    for (let f = 0; f < faaliyetSayisi && f < shuffledFaaliyetler.length; f++) {
      await prisma.kisiFaaliyetAlani.create({
        data: {
          kisiId: kisi.id,
          faaliyetAlaniId: shuffledFaaliyetler[f].id,
        },
      });
    }

    // Not ekle
    await prisma.not.create({
      data: {
        kisiId: kisi.id,
        icerik: `${k.ad} ${k.soyad} ile ilgili önemli not.`,
        createdUserId: adminId,
      },
    });
  }

  console.log(`${kisiler.length} kişi, ${gsmler.length} GSM oluşturuldu.`);
  return { kisiler, gsmler };
}

async function seedTakiplerVeAlarmlar(adminId: string, gsmler: { id: string }[]) {
  console.log('Takipler ve alarmlar oluşturuluyor...');

  const now = new Date();
  const takipler = [];

  for (let i = 0; i < 10; i++) {
    const baslama = new Date(now);
    baslama.setDate(baslama.getDate() - Math.floor(Math.random() * 60)); // Son 60 gün içinde başlamış

    const bitis = new Date(baslama);
    bitis.setDate(bitis.getDate() + 90); // 90 gün sonra bitiyor

    const takip = await prisma.takip.create({
      data: {
        gsmId: gsmler[i % gsmler.length].id,
        baslamaTarihi: baslama,
        bitisTarihi: bitis,
        durum: i < 3 ? TakipDurum.UZATILACAK : TakipDurum.DEVAM_EDECEK,
        isActive: true,
        createdUserId: adminId,
      },
    });
    takipler.push(takip);

    // Alarm ekle
    const tetikTarihi = new Date(bitis);
    tetikTarihi.setDate(tetikTarihi.getDate() - 20);

    await prisma.alarm.create({
      data: {
        takipId: takip.id,
        tip: AlarmTip.TAKIP_BITIS,
        baslik: 'Takip Bitiş Uyarısı',
        mesaj: 'Takip süresi 20 gün içinde sona erecek.',
        tetikTarihi: tetikTarihi,
        gunOnce: 20,
        durum: tetikTarihi <= now ? AlarmDurum.TETIKLENDI : AlarmDurum.BEKLIYOR,
        createdUserId: adminId,
      },
    });
  }

  console.log(`${takipler.length} takip ve alarm oluşturuldu.`);
  return takipler;
}

async function seedTanitimlar(adminId: string, kisiler: { id: string }[], mahalleler: { id: string }[]) {
  console.log('Tanıtımlar oluşturuluyor...');

  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const tarih = new Date(now);
    tarih.setDate(tarih.getDate() - Math.floor(Math.random() * 30)); // Son 30 gün

    const randomMahalle = mahalleler[Math.floor(Math.random() * mahalleler.length)];

    const tanitim = await prisma.tanitim.create({
      data: {
        tarih: tarih,
        saat: `${10 + i}:00`,
        mahalleId: randomMahalle.id,
        adresDetay: `Sokak No: ${Math.floor(Math.random() * 50) + 1}`,
        notlar: `Tanıtım ${i + 1} - Başarılı geçti.`,
        createdUserId: adminId,
      },
    });

    // Katılımcı ekle (2-3 kişi)
    const katilimciSayisi = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...kisiler].sort(() => 0.5 - Math.random());

    for (let j = 0; j < katilimciSayisi; j++) {
      await prisma.tanitimKatilimci.create({
        data: {
          tanitimId: tanitim.id,
          kisiId: shuffled[j].id,
        },
      });
    }
  }

  console.log('10 tanıtım oluşturuldu.');
}

async function seedOperasyonlar(adminId: string, kisiler: { id: string }[], mahalleler: { id: string }[]) {
  console.log('Operasyonlar oluşturuluyor...');

  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const tarih = new Date(now);
    tarih.setDate(tarih.getDate() - Math.floor(Math.random() * 30)); // Son 30 gün

    const randomMahalle = mahalleler[Math.floor(Math.random() * mahalleler.length)];

    const operasyon = await prisma.operasyon.create({
      data: {
        tarih: tarih,
        saat: `${14 + i}:00`,
        mahalleId: randomMahalle.id,
        adresDetay: `Cadde No: ${Math.floor(Math.random() * 100) + 1}`,
        notlar: `Operasyon ${i + 1} - Tamamlandı.`,
        createdUserId: adminId,
      },
    });

    // Katılımcı ekle (1-2 kişi)
    const katilimciSayisi = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...kisiler].sort(() => 0.5 - Math.random());

    for (let j = 0; j < katilimciSayisi; j++) {
      await prisma.operasyonKatilimci.create({
        data: {
          operasyonId: operasyon.id,
          kisiId: shuffled[j].id,
        },
      });
    }
  }

  console.log('10 operasyon oluşturuldu.');
}

async function seedAraclar(adminId: string, kisiler: { id: string }[]) {
  console.log('Araçlar oluşturuluyor...');

  // Rastgele modeller al
  const modeller = await prisma.model.findMany({
    take: 50,
    include: { marka: true },
  });

  if (modeller.length === 0) {
    console.log('Model bulunamadı, araçlar oluşturulamadı.');
    return;
  }

  const renkler = Object.values(AracRenk);

  for (let i = 0; i < aracData.length; i++) {
    const a = aracData[i];
    const randomModel = modeller[Math.floor(Math.random() * modeller.length)];

    const arac = await prisma.arac.create({
      data: {
        modelId: randomModel.id,
        plaka: a.plaka,
        renk: renkler[Math.floor(Math.random() * renkler.length)],
        createdUserId: adminId,
      },
    });

    // Araç-Kişi ilişkisi
    await prisma.aracKisi.create({
      data: {
        aracId: arac.id,
        kisiId: kisiler[i % kisiler.length].id,
        aciklama: 'Kişiye ait araç',
      },
    });
  }

  console.log('10 araç oluşturuldu.');
}

async function seedExampleData() {
  console.log('\n========== ÖRNEK VERİLER OLUŞTURULUYOR ==========\n');

  // Personel oluştur
  const personeller = await seedPersonel();
  const adminId = personeller[0].id;

  // Mahalleler al (lokasyon seed'inden)
  const mahalleler = await prisma.mahalle.findMany({ take: 20 });
  if (mahalleler.length === 0) {
    console.log('Uyarı: Mahalle bulunamadı. Önce lokasyon verilerini yükleyin.');
    return;
  }

  // Faaliyet alanları
  await seedFaaliyetAlanlari(adminId);

  // Marka ve Model
  await seedMarkaModel(adminId);

  // Kişiler, GSM, Adres, Not
  const { kisiler, gsmler } = await seedKisilerVeIliskiler(adminId, mahalleler);

  // Takipler ve Alarmlar
  await seedTakiplerVeAlarmlar(adminId, gsmler);

  // Tanıtımlar
  await seedTanitimlar(adminId, kisiler, mahalleler);

  // Operasyonlar
  await seedOperasyonlar(adminId, kisiler, mahalleler);

  // Araçlar
  await seedAraclar(adminId, kisiler);

  console.log('\n========== ÖRNEK VERİLER TAMAMLANDI ==========\n');
}

async function seedLokasyonlar() {
  console.log('\nLokasyon verisi yükleniyor...');

  // Önce mevcut verileri sil (sıra önemli - foreign key)
  console.log('Mevcut lokasyon verileri siliniyor...');
  await prisma.mahalle.deleteMany();
  await prisma.ilce.deleteMany();
  await prisma.il.deleteMany();
  console.log('Mevcut lokasyon verileri silindi.');

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

  console.log('\nLokasyon verileri tamamlandı!');
  console.log(`- ${ilSayisi} il`);
  console.log(`- ${ilceSayisi} ilçe`);
  console.log(`- ${mahalleSayisi} mahalle`);
}

async function clearExampleData() {
  console.log('\nMevcut örnek veriler siliniyor...');

  // Sıra önemli - foreign key constraints
  await prisma.log.deleteMany();
  await prisma.aracKisi.deleteMany();
  await prisma.arac.deleteMany();
  await prisma.model.deleteMany();
  await prisma.marka.deleteMany();
  await prisma.operasyonKatilimci.deleteMany();
  await prisma.operasyon.deleteMany();
  await prisma.tanitimKatilimci.deleteMany();
  await prisma.tanitim.deleteMany();
  await prisma.alarm.deleteMany();
  await prisma.takip.deleteMany();
  await prisma.not.deleteMany();
  await prisma.adres.deleteMany();
  await prisma.gsm.deleteMany();
  await prisma.kisiFaaliyetAlani.deleteMany();
  await prisma.kisi.deleteMany();
  await prisma.faaliyetAlani.deleteMany();

  console.log('Mevcut örnek veriler silindi.');
}

async function main() {
  // Önce mevcut örnek verileri temizle (lokasyonlara bağımlı)
  await clearExampleData();

  // Lokasyon verilerini yükle
  await seedLokasyonlar();

  // Örnek verileri oluştur
  await seedExampleData();
}

main()
  .catch((e) => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
