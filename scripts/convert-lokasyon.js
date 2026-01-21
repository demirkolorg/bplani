const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku
const workbook = XLSX.readFile(path.join(__dirname, '../hazirveri/Mahalle_Listesi.xls'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Ham veri olarak oku (header olmadan)
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// İl plaka kodları
const plakaKodlari = {
  'ADANA': 1, 'ADIYAMAN': 2, 'AFYONKARAHİSAR': 3, 'AĞRI': 4, 'AMASYA': 5,
  'ANKARA': 6, 'ANTALYA': 7, 'ARTVİN': 8, 'AYDIN': 9, 'BALIKESİR': 10,
  'BİLECİK': 11, 'BİNGÖL': 12, 'BİTLİS': 13, 'BOLU': 14, 'BURDUR': 15,
  'BURSA': 16, 'ÇANAKKALE': 17, 'ÇANKIRI': 18, 'ÇORUM': 19, 'DENİZLİ': 20,
  'DİYARBAKIR': 21, 'EDİRNE': 22, 'ELAZIĞ': 23, 'ERZİNCAN': 24, 'ERZURUM': 25,
  'ESKİŞEHİR': 26, 'GAZİANTEP': 27, 'GİRESUN': 28, 'GÜMÜŞHANE': 29, 'HAKKARİ': 30,
  'HATAY': 31, 'ISPARTA': 32, 'MERSİN': 33, 'İSTANBUL': 34, 'İZMİR': 35,
  'KARS': 36, 'KASTAMONU': 37, 'KAYSERİ': 38, 'KIRKLARELİ': 39, 'KIRŞEHİR': 40,
  'KOCAELİ': 41, 'KONYA': 42, 'KÜTAHYA': 43, 'MALATYA': 44, 'MANİSA': 45,
  'KAHRAMANMARAŞ': 46, 'MARDİN': 47, 'MUĞLA': 48, 'MUŞ': 49, 'NEVŞEHİR': 50,
  'NİĞDE': 51, 'ORDU': 52, 'RİZE': 53, 'SAKARYA': 54, 'SAMSUN': 55,
  'SİİRT': 56, 'SİNOP': 57, 'SİVAS': 58, 'TEKİRDAĞ': 59, 'TOKAT': 60,
  'TRABZON': 61, 'TUNCELİ': 62, 'ŞANLIURFA': 63, 'UŞAK': 64, 'VAN': 65,
  'YOZGAT': 66, 'ZONGULDAK': 67, 'AKSARAY': 68, 'BAYBURT': 69, 'KARAMAN': 70,
  'KIRIKKALE': 71, 'BATMAN': 72, 'ŞIRNAK': 73, 'BARTIN': 74, 'ARDAHAN': 75,
  'IĞDIR': 76, 'YALOVA': 77, 'KARABÜK': 78, 'KİLİS': 79, 'OSMANİYE': 80, 'DÜZCE': 81
};

// Veri yapıları
const iller = new Map(); // il adı -> { ad, plaka, ilceler: Map }

// 13. satırdan itibaren veri başlıyor (0-indexed: 12)
for (let i = 12; i < rawData.length; i++) {
  const row = rawData[i];
  if (!row || row.length < 6) continue;

  const mahalleAdi = row[3];
  const baglilik = row[5];

  if (!mahalleAdi || !baglilik) continue;

  // Bağlılık formatı: "İL -> İLÇE -> BUCAK" veya "İL -> İLÇE"
  const parts = baglilik.split('->').map(p => p.trim());
  if (parts.length < 2) continue;

  const ilAdi = parts[0];
  const ilceAdi = parts[1];

  // İl ekle veya bul
  if (!iller.has(ilAdi)) {
    iller.set(ilAdi, {
      ad: ilAdi,
      plaka: plakaKodlari[ilAdi] || null,
      ilceler: new Map()
    });
  }
  const il = iller.get(ilAdi);

  // İlçe ekle veya bul
  if (!il.ilceler.has(ilceAdi)) {
    il.ilceler.set(ilceAdi, {
      ad: ilceAdi,
      mahalleler: []
    });
  }
  const ilce = il.ilceler.get(ilceAdi);

  // Mahalle ekle (tekrar kontrolü)
  if (!ilce.mahalleler.includes(mahalleAdi)) {
    ilce.mahalleler.push(mahalleAdi);
  }
}

// Map'leri array'e dönüştür
const result = {
  iller: Array.from(iller.values()).map(il => ({
    ad: il.ad,
    plaka: il.plaka,
    ilceler: Array.from(il.ilceler.values()).map(ilce => ({
      ad: ilce.ad,
      mahalleler: ilce.mahalleler.map(m => ({ ad: m }))
    }))
  }))
};

// İstatistikler
const ilSayisi = result.iller.length;
const ilceSayisi = result.iller.reduce((acc, il) => acc + il.ilceler.length, 0);
const mahalleSayisi = result.iller.reduce((acc, il) =>
  acc + il.ilceler.reduce((acc2, ilce) => acc2 + ilce.mahalleler.length, 0), 0);

console.log('İstatistikler:');
console.log(`- ${ilSayisi} il`);
console.log(`- ${ilceSayisi} ilçe`);
console.log(`- ${mahalleSayisi} mahalle`);

// JSON dosyasına kaydet
const outputPath = path.join(__dirname, '../hazirveri/lokasyonlar.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`\nJSON dosyası kaydedildi: ${outputPath}`);
