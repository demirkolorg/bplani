const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku
const wb = XLSX.readFile(path.join(__dirname, '../hazirveri/Mahalle_Listesi.xls'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

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
  'IĞDIR': 76, 'YALOVA': 77, 'KARABÜK': 78, 'KİLİS': 79, 'OSMANİYE': 80,
  'DÜZCE': 81
};

// Veri yapısı
const illerMap = new Map();

// Satırları işle (13. satırdan itibaren veri var)
for (let i = 13; i < rows.length; i++) {
  const row = rows[i];
  if (!row || !row[0] || !row[3] || !row[5]) continue;

  const mahalleAd = row[3].toString().trim();
  const baglantiBilgisi = row[5].toString().trim();

  // "ADANA -> ALADAĞ -> ALADAĞ-İLÇE MERKEZİ" formatını parse et
  const parts = baglantiBilgisi.split(' -> ');
  if (parts.length < 2) continue;

  const ilAd = parts[0].trim();
  const ilceAd = parts[1].trim();

  // İl yoksa oluştur
  if (!illerMap.has(ilAd)) {
    illerMap.set(ilAd, {
      ad: ilAd,
      plaka: plakaKodlari[ilAd] || null,
      ilceler: new Map()
    });
  }

  const il = illerMap.get(ilAd);

  // İlçe yoksa oluştur
  if (!il.ilceler.has(ilceAd)) {
    il.ilceler.set(ilceAd, {
      ad: ilceAd,
      mahalleler: []
    });
  }

  // Mahalle ekle (duplicate kontrolü ile)
  const ilce = il.ilceler.get(ilceAd);
  const mahalleExists = ilce.mahalleler.some(m => m.ad === mahalleAd);
  if (!mahalleExists) {
    ilce.mahalleler.push({ ad: mahalleAd });
  }
}

// Map'leri array'e dönüştür
const result = {
  iller: Array.from(illerMap.values()).map(il => ({
    ad: il.ad,
    plaka: il.plaka,
    ilceler: Array.from(il.ilceler.values())
  }))
};

// İlleri plaka koduna göre sırala
result.iller.sort((a, b) => (a.plaka || 999) - (b.plaka || 999));

// İstatistikler
let ilceSayisi = 0;
let mahalleSayisi = 0;
result.iller.forEach(il => {
  ilceSayisi += il.ilceler.length;
  il.ilceler.forEach(ilce => {
    mahalleSayisi += ilce.mahalleler.length;
  });
});

console.log('İl Sayısı:', result.iller.length);
console.log('İlçe Sayısı:', ilceSayisi);
console.log('Mahalle Sayısı:', mahalleSayisi);

// JSON dosyasına yaz
fs.writeFileSync(
  path.join(__dirname, '../hazirveri/lokasyonlar.json'),
  JSON.stringify(result, null, 2),
  'utf8'
);

console.log('\nlokasyonlar.json dosyası oluşturuldu.');
