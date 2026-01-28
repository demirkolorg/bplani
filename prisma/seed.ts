import { PrismaClient, PersonelRol, TakipDurum, AlarmTip, AlarmDurum, AracRenk, LogIslem } from '@prisma/client';
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

// Kişi seed data (tt: true = Müşteri, tt: false = Aday)
// TC numaraları gerçekçi ve benzersiz
const kisiData = [
  { tc: '12345678910', ad: 'Mustafa', soyad: 'Arslan', tt: true },
  { tc: '23456789012', ad: 'Zeynep', soyad: 'Yıldız', tt: true },
  { tc: '34567890123', ad: 'Hasan', soyad: 'Şahin', tt: false },
  { tc: '45678901234', ad: 'Elif', soyad: 'Koç', tt: false },
  { tc: '56789012345', ad: 'Emre', soyad: 'Aydın', tt: true },
  { tc: '67890123456', ad: 'Selin', soyad: 'Yılmaz', tt: true },
  { tc: '78901234567', ad: 'Burak', soyad: 'Kara', tt: false },
  { tc: '89012345678', ad: 'Deniz', soyad: 'Özkan', tt: true },
  { tc: '90123456789', ad: 'Ceren', soyad: 'Aksoy', tt: false },
  { tc: '11234567890', ad: 'Kaan', soyad: 'Erdoğan', tt: true },
  { tc: '22345678901', ad: 'Aylin', soyad: 'Şen', tt: false },
  { tc: '33456789012', ad: 'Barış', soyad: 'Güneş', tt: true },
  { tc: '44567890123', ad: 'Cansu', soyad: 'Yurt', tt: false },
  { tc: '55678901234', ad: 'Cem', soyad: 'Kılıç', tt: true },
  { tc: '66789012345', ad: 'Derya', soyad: 'Taş', tt: false },
  { tc: '12398745610', ad: 'Murat', soyad: 'Öz', tt: true },
  { tc: '23498745621', ad: 'Ayşe', soyad: 'Polat', tt: true },
  { tc: '34598745632', ad: 'Serkan', soyad: 'Çetin', tt: false },
  { tc: '45698745643', ad: 'Esra', soyad: 'Aslan', tt: true },
  { tc: '56798745654', ad: 'Okan', soyad: 'Duman', tt: false },
  { tc: '67898745665', ad: 'Gül', soyad: 'Kurt', tt: true },
  { tc: '78998745676', ad: 'Tolga', soyad: 'Acar', tt: false },
  { tc: '89098745687', ad: 'Merve', soyad: 'Vural', tt: true },
  { tc: '90198745698', ad: 'Kemal', soyad: 'Şimşek', tt: true },
  { tc: '11298745609', ad: 'Seda', soyad: 'Tekin', tt: false },
  { tc: '22398745610', ad: 'Volkan', soyad: 'Aydın', tt: true },
  { tc: '33498745621', ad: 'Nilüfer', soyad: 'Çakır', tt: false },
  { tc: '44598745632', ad: 'Onur', soyad: 'Eren', tt: true },
  { tc: '55698745643', ad: 'Pınar', soyad: 'Bozkurt', tt: true },
  { tc: '66798745654', ad: 'Sinan', soyad: 'Yalçın', tt: false },
  { tc: '77898745665', ad: 'Gamze', soyad: 'Doğan', tt: true },
  { tc: '88998745676', ad: 'Erkan', soyad: 'Avcı', tt: false },
  { tc: '99098745687', ad: 'Başak', soyad: 'Yücel', tt: true },
  { tc: '10198745698', ad: 'Taner', soyad: 'Korkmaz', tt: false },
  { tc: '21298745609', ad: 'Burcu', soyad: 'Çelik', tt: true },
  { tc: '32398745610', ad: 'Umut', soyad: 'Güler', tt: true },
  { tc: '43498745621', ad: 'Dilek', soyad: 'Yavuz', tt: false },
  { tc: '54598745632', ad: 'Levent', soyad: 'Çiftçi', tt: true },
  { tc: '65698745643', ad: 'Hülya', soyad: 'Özdemir', tt: false },
  { tc: '76798745654', ad: 'Yasin', soyad: 'Aktaş', tt: true },
  { tc: '87898745665', ad: 'Gizem', soyad: 'Öztürk', tt: true },
  { tc: '98998745676', ad: 'Engin', soyad: 'Karaca', tt: false },
  { tc: '10098745687', ad: 'Tuğba', soyad: 'Şahin', tt: true },
  { tc: '21198745698', ad: 'Berk', soyad: 'Demirtaş', tt: false },
  { tc: '32298745609', ad: 'Ebru', soyad: 'Yıldırım', tt: true },
  { tc: '43398745610', ad: 'Selim', soyad: 'Koçak', tt: true },
  { tc: '54498745621', ad: 'Aslı', soyad: 'Uysal', tt: false },
  { tc: '65598745632', ad: 'Arda', soyad: 'Tunç', tt: true },
  { tc: '76698745643', ad: 'Serap', soyad: 'Çoban', tt: false },
];

// GSM numaraları - Her kişi için benzersiz ve gerçekçi numaralar
// Operatörler: 532 (Vodafone), 533 (Turkcell), 534 (Vodafone), 535 (Turkcell), 536 (Vodafone)
// Her kişiye 1-3 adet numara
const gsmData = [
  ['5321234567', '5349876543'],              // Mustafa (2 numara)
  ['5331234568'],                             // Zeynep (1 numara)
  ['5341234569', '5529876544', '5341112233'], // Hasan (3 numara)
  ['5351234570'],                             // Elif (1 numara)
  ['5361234571', '5339876545'],               // Emre (2 numara)
  ['5371234572', '5349876546'],               // Selin (2 numara)
  ['5381234573'],                             // Burak (1 numara)
  ['5391234574', '5329876547'],               // Deniz (2 numara)
  ['5421234575'],                             // Ceren (1 numara)
  ['5431234576', '5359876548', '5321112234'], // Kaan (3 numara)
  ['5441234577', '5369876549'],               // Aylin (2 numara)
  ['5451234578'],                             // Barış (1 numara)
  ['5461234579', '5379876550'],               // Cansu (2 numara)
  ['5321234580'],                             // Cem (1 numara)
  ['5331234581', '5389876551'],               // Derya (2 numara)
  ['5321234590', '5341234591'],               // Murat (2 numara)
  ['5331234592'],                             // Ayşe (1 numara)
  ['5341234593', '5351234594'],               // Serkan (2 numara)
  ['5361234595'],                             // Esra (1 numara)
  ['5371234596', '5381234597', '5321234598'], // Okan (3 numara)
  ['5391234599'],                             // Gül (1 numara)
  ['5421234600', '5331234601'],               // Tolga (2 numara)
  ['5431234602'],                             // Merve (1 numara)
  ['5441234603', '5341234604'],               // Kemal (2 numara)
  ['5451234605'],                             // Seda (1 numara)
  ['5461234606', '5351234607'],               // Volkan (2 numara)
  ['5471234608'],                             // Nilüfer (1 numara)
  ['5481234609', '5361234610', '5321234611'], // Onur (3 numara)
  ['5491234612'],                             // Pınar (1 numara)
  ['5521234613', '5331234614'],               // Sinan (2 numara)
  ['5531234615'],                             // Gamze (1 numara)
  ['5541234616', '5341234617'],               // Erkan (2 numara)
  ['5551234618'],                             // Başak (1 numara)
  ['5561234619', '5351234620'],               // Taner (2 numara)
  ['5571234621'],                             // Burcu (1 numara)
  ['5581234622', '5361234623'],               // Umut (2 numara)
  ['5591234624'],                             // Dilek (1 numara)
  ['5321234625', '5331234626', '5341234627'], // Levent (3 numara)
  ['5351234628'],                             // Hülya (1 numara)
  ['5361234629', '5371234630'],               // Yasin (2 numara)
  ['5381234631'],                             // Gizem (1 numara)
  ['5391234632', '5321234633'],               // Engin (2 numara)
  ['5421234634'],                             // Tuğba (1 numara)
  ['5431234635', '5331234636'],               // Berk (2 numara)
  ['5441234637'],                             // Ebru (1 numara)
  ['5451234638', '5341234639', '5351234640'], // Selim (3 numara)
  ['5461234641'],                             // Aslı (1 numara)
  ['5471234642', '5361234643'],               // Arda (2 numara)
  ['5481234644'],                             // Serap (1 numara)
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
  { plaka: '34 BBB 111' },
  { plaka: '16 CCC 222' },
  { plaka: '06 DDD 333' },
  { plaka: '41 EEE 444' },
  { plaka: '35 FFF 555' },
  { plaka: '34 GGG 666' },
  { plaka: '06 HHH 777' },
  { plaka: '35 III 888' },
  { plaka: '16 JJJ 999' },
  { plaka: '34 KKK 000' },
  { plaka: '07 LLL 111' },
  { plaka: '41 MMM 222' },
  { plaka: '34 NNN 333' },
  { plaka: '06 OOO 444' },
  { plaka: '35 PPP 555' },
  { plaka: '34 QQQ 666' },
  { plaka: '16 RRR 777' },
  { plaka: '06 SSS 888' },
  { plaka: '41 TTT 999' },
  { plaka: '35 UUU 000' },
  { plaka: '34 VVV 111' },
  { plaka: '07 WWW 222' },
  { plaka: '34 XXX 333' },
  { plaka: '06 YYY 444' },
  { plaka: '35 ZZZ 555' },
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
        tt: k.tt,
        fotograf: `https://api.dicebear.com/7.x/avataaars/svg?seed=${k.ad}${k.soyad}`,
        createdUserId: adminId,
      },
    });
    kisiler.push(kisi);

    // GSM numaraları ekle - her numara benzersiz
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
        icerik: `${k.ad} ${k.soyad} ile ilgili önemli not. ${k.tt ? 'Müşteri olarak kayıtlı.' : 'Aday durumunda.'}`,
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

  // Her GSM için takip oluştur - bazıları aktif, bazıları pasif (geçmiş)
  for (let i = 0; i < gsmler.length; i++) {
    const gsmId = gsmler[i].id;

    // %60 ihtimalle bu GSM'e takip ekle
    if (Math.random() > 0.4) {
      // Bazı GSM'lere geçmiş takip ekle (isActive: false)
      if (i % 3 === 0) {
        // Eski bir takip oluştur (bitmiş)
        const eskiBaslama = new Date(now);
        eskiBaslama.setDate(eskiBaslama.getDate() - 150); // 150 gün önce başlamış

        const eskiBitis = new Date(eskiBaslama);
        eskiBitis.setDate(eskiBitis.getDate() + 90); // 90 gün sürmüş

        const eskiTakip = await prisma.takip.create({
          data: {
            gsmId: gsmId,
            baslamaTarihi: eskiBaslama,
            bitisTarihi: eskiBitis,
            durum: TakipDurum.UZATILDI,
            isActive: false,
            createdUserId: adminId,
          },
        });
        takipler.push(eskiTakip);
      }

      // Aktif takip oluştur
      const baslama = new Date(now);
      baslama.setDate(baslama.getDate() - Math.floor(Math.random() * 60)); // Son 60 gün içinde başlamış

      const bitis = new Date(baslama);
      bitis.setDate(bitis.getDate() + 90); // 90 gün sonra bitiyor

      // Durum belirle (kalan güne göre)
      const kalanGun = Math.ceil((bitis.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let durum = TakipDurum.DEVAM_EDECEK;

      if (kalanGun < 0) {
        durum = TakipDurum.SONLANDIRILACAK;
      } else if (kalanGun < 30) {
        durum = TakipDurum.UZATILACAK;
      }

      const takip = await prisma.takip.create({
        data: {
          gsmId: gsmId,
          baslamaTarihi: baslama,
          bitisTarihi: bitis,
          durum: durum,
          isActive: true,
          createdUserId: adminId,
        },
      });
      takipler.push(takip);

      // Alarm ekle (20 ve 10 gün önce)
      const tetikTarihi1 = new Date(bitis);
      tetikTarihi1.setDate(tetikTarihi1.getDate() - 20);

      const tetikTarihi2 = new Date(bitis);
      tetikTarihi2.setDate(tetikTarihi2.getDate() - 10);

      await prisma.alarm.create({
        data: {
          takipId: takip.id,
          tip: AlarmTip.TAKIP_BITIS,
          baslik: 'Takip Bitiş Uyarısı (20 gün)',
          mesaj: 'Takip süresi 20 gün içinde sona erecek.',
          tetikTarihi: tetikTarihi1,
          gunOnce: 20,
          durum: tetikTarihi1 <= now ? AlarmDurum.TETIKLENDI : AlarmDurum.BEKLIYOR,
          createdUserId: adminId,
        },
      });

      await prisma.alarm.create({
        data: {
          takipId: takip.id,
          tip: AlarmTip.TAKIP_BITIS,
          baslik: 'Takip Bitiş Uyarısı (10 gün)',
          mesaj: 'Takip süresi 10 gün içinde sona erecek.',
          tetikTarihi: tetikTarihi2,
          gunOnce: 10,
          durum: tetikTarihi2 <= now ? AlarmDurum.TETIKLENDI : AlarmDurum.BEKLIYOR,
          createdUserId: adminId,
        },
      });
    }
  }

  console.log(`${takipler.length} takip ve alarm oluşturuldu.`);
  return takipler;
}

async function seedTanitimlar(adminId: string, kisiler: { id: string }[], mahalleler: { id: string }[]) {
  console.log('Tanıtımlar oluşturuluyor...');

  const now = new Date();

  for (let i = 0; i < 25; i++) {
    const tarih = new Date(now);
    tarih.setDate(tarih.getDate() - Math.floor(Math.random() * 90)); // Son 90 gün

    const randomMahalle = mahalleler[Math.floor(Math.random() * mahalleler.length)];

    const tanitim = await prisma.tanitim.create({
      data: {
        tarih: tarih,
        saat: `${10 + (i % 6)}:00`,
        baslik: `Tanıtım Toplantısı ${i + 1}`,
        mahalleId: randomMahalle.id,
        adresDetay: `Sokak No: ${Math.floor(Math.random() * 50) + 1}`,
        notlar: `Tanıtım ${i + 1} - ${i % 2 === 0 ? 'Başarılı geçti.' : 'Katılım ortalamaydı.'}`,
        createdUserId: adminId,
      },
    });

    // Katılımcı ekle (2-5 kişi)
    const katilimciSayisi = 2 + Math.floor(Math.random() * 4);
    const shuffled = [...kisiler].sort(() => 0.5 - Math.random());

    for (let j = 0; j < katilimciSayisi && j < shuffled.length; j++) {
      await prisma.tanitimKatilimci.create({
        data: {
          tanitimId: tanitim.id,
          kisiId: shuffled[j].id,
        },
      });
    }
  }

  console.log('25 tanıtım oluşturuldu.');
}

async function seedOperasyonlar(adminId: string, kisiler: { id: string }[], mahalleler: { id: string }[]) {
  console.log('Operasyonlar oluşturuluyor...');

  const now = new Date();

  for (let i = 0; i < 25; i++) {
    const tarih = new Date(now);
    tarih.setDate(tarih.getDate() - Math.floor(Math.random() * 90)); // Son 90 gün

    const randomMahalle = mahalleler[Math.floor(Math.random() * mahalleler.length)];

    const operasyon = await prisma.operasyon.create({
      data: {
        tarih: tarih,
        saat: `${14 + (i % 6)}:00`,
        baslik: `Saha Operasyonu ${i + 1}`,
        mahalleId: randomMahalle.id,
        adresDetay: `Cadde No: ${Math.floor(Math.random() * 100) + 1}`,
        notlar: `Operasyon ${i + 1} - ${i % 3 === 0 ? 'Tamamlandı.' : i % 3 === 1 ? 'Devam ediyor.' : 'Ertelendi.'}`,
        createdUserId: adminId,
      },
    });

    // Katılımcı ekle (1-4 kişi)
    const katilimciSayisi = 1 + Math.floor(Math.random() * 4);
    const shuffled = [...kisiler].sort(() => 0.5 - Math.random());

    for (let j = 0; j < katilimciSayisi && j < shuffled.length; j++) {
      await prisma.operasyonKatilimci.create({
        data: {
          operasyonId: operasyon.id,
          kisiId: shuffled[j].id,
        },
      });
    }
  }

  console.log('25 operasyon oluşturuldu.');
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

  console.log(`${aracData.length} araç oluşturuldu.`);
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
