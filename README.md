# BPlani - Müşteri ve Takip Yönetim Sistemi

Next.js 15, Prisma, PostgreSQL ve shadcn/ui ile geliştirilmiş müşteri takip yönetim sistemi.

## Özellikler

### Müşteri Yönetimi
- Müşteri listesi (DataTable ile arama, sıralama, sayfalama)
- Müşteri ekleme, düzenleme, silme (soft delete)
- Müşteri detay sayfası (GSM, Adres, Not bölümleri)
- Fotoğraf yükleme desteği

### GSM ve Takip Yönetimi
- Her müşteriye birden fazla GSM numarası tanımlama
- Birincil GSM belirleme
- GSM bazında takip kaydı oluşturma
- Takip durumları: Uzatılacak, Devam Edecek, Sonlandırılacak, Uzatıldı
- Otomatik +90 gün hesaplama
- Kalan gün gösterimi (renk kodlu)
- Yeni takip eklendiğinde eski takipler otomatik "Uzatıldı" olarak işaretlenir

### Lokasyon Yönetimi
- İl, İlçe, Mahalle tam CRUD
- Cascade filtreleme (İl → İlçe → Mahalle)
- 81 il, tüm ilçe ve mahalleler hazır veri olarak yüklenir

### Diğer
- Session tabanlı kimlik doğrulama (JWT)
- Kullanıcı işlem logları (kim, ne zaman oluşturdu/güncelledi)
- Light/Dark tema desteği
- Responsive tasarım
- Docker desteği

---

## Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript |
| Veritabanı | PostgreSQL 16 |
| ORM | Prisma |
| UI | shadcn/ui, Tailwind CSS 4 |
| State | TanStack Query (React Query) |
| Tablo | TanStack Table |
| Form | Zod validation |
| Auth | JWT (jose) |
| Container | Docker |

---

## Gereksinimler

- **Node.js** 18.0 veya üstü
- **Docker** (PostgreSQL için önerilen) veya local PostgreSQL kurulumu
- **npm** veya **pnpm**

---

## Kurulum

### 1. Repo'yu klonla

```bash
git clone https://github.com/demirkolorg/bplani.git
cd bplani
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Environment dosyası oluştur

Proje kök dizininde `.env` dosyası oluştur:

```env
# Veritabanı bağlantısı
DATABASE_URL="postgresql://bplani:bplani_dev_2024@localhost:5432/bplani"

# JWT için secret key (production'da değiştirin!)
JWT_SECRET="bplani-jwt-secret-change-in-production-2024"
```

### 4. PostgreSQL veritabanını başlat

#### Docker ile (Önerilen)

```bash
npm run docker:dev
```

Bu komut aşağıdaki ayarlarla PostgreSQL container'ı başlatır:
- **Host:** localhost
- **Port:** 5432
- **Database:** bplani
- **User:** bplani
- **Password:** bplani_dev_2024

#### Manuel PostgreSQL

Eğer Docker kullanmıyorsanız, local PostgreSQL'de `bplani` adında bir veritabanı oluşturun ve `.env` dosyasındaki `DATABASE_URL`'i buna göre güncelleyin.

### 5. Prisma kurulumu

```bash
# Prisma client oluştur
npm run db:generate

# Veritabanı şemasını uygula
npm run db:push
```

### 6. Seed data yükle

```bash
npm run db:seed
```

Bu komut şunları yükler:
- **Admin kullanıcısı** (giriş için)
- **81 il**, tüm ilçeler ve mahalleler (~50.000+ kayıt)

### 7. Uygulamayı başlat

```bash
npm run dev
```

Uygulama **http://localhost:3000** adresinde çalışacak.

---

## Varsayılan Giriş Bilgileri

| Alan | Değer |
|------|-------|
| Kullanıcı ID | `000001` |
| Şifre | `admin123` |

> **Not:** Production ortamında bu bilgileri mutlaka değiştirin!

---

## Proje Yapısı

```
bplani/
├── app/
│   ├── (auth)/              # Login sayfası
│   ├── (dashboard)/         # Ana uygulama sayfaları
│   │   ├── lokasyonlar/     # İl, İlçe, Mahalle yönetimi
│   │   ├── musteriler/      # Müşteri listesi ve detay
│   │   └── takipler/        # Takip listesi ve yönetimi
│   └── api/                 # API routes
│       ├── auth/            # Login, logout, me
│       ├── gsmler/          # GSM CRUD
│       ├── lokasyon/        # İl, İlçe, Mahalle API
│       ├── musteriler/      # Müşteri CRUD
│       └── takipler/        # Takip CRUD
├── components/
│   ├── lokasyon/            # Lokasyon form ve tablo bileşenleri
│   ├── musteriler/          # Müşteri bileşenleri
│   ├── takipler/            # Takip bileşenleri
│   ├── shared/              # Ortak bileşenler (DataTable, vb.)
│   └── ui/                  # shadcn/ui bileşenleri
├── hooks/                   # React Query hooks
├── lib/
│   ├── validations/         # Zod şemaları
│   ├── auth.ts              # JWT işlemleri
│   └── prisma.ts            # Prisma client
├── prisma/
│   ├── schema.prisma        # Veritabanı şeması
│   └── seed.ts              # Seed script
├── hazirveri/
│   └── lokasyonlar.json     # İl, ilçe, mahalle verileri
└── public/
    └── uploads/             # Yüklenen dosyalar
```

---

## NPM Scripts

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development server başlat |
| `npm run build` | Production build oluştur |
| `npm run start` | Production server başlat |
| `npm run lint` | ESLint ile kod kontrolü |
| `npm run docker:dev` | PostgreSQL container başlat |
| `npm run docker:dev:down` | PostgreSQL container durdur |
| `npm run db:generate` | Prisma client oluştur |
| `npm run db:push` | Schema değişikliklerini DB'ye uygula |
| `npm run db:migrate` | Migration oluştur ve uygula |
| `npm run db:studio` | Prisma Studio aç (DB yönetimi) |
| `npm run db:seed` | Seed data yükle |

---

## Veritabanı Yönetimi

### Prisma Studio

Veritabanını görsel olarak yönetmek için:

```bash
npm run db:studio
```

Tarayıcıda **http://localhost:5555** adresinde açılır.

### Schema Değişiklikleri

1. `prisma/schema.prisma` dosyasını düzenle
2. Değişiklikleri uygula:
   ```bash
   npm run db:push
   ```
3. Prisma client'ı yenile:
   ```bash
   npm run db:generate
   ```

---

## Docker ile Production

### Build ve çalıştır

```bash
# Production build
docker-compose up -d --build
```

### Sadece veritabanı

```bash
# Development DB
docker-compose -f docker-compose.dev.yml up -d

# Durdur
docker-compose -f docker-compose.dev.yml down

# Verileri de sil
docker-compose -f docker-compose.dev.yml down -v
```

---

## Sık Karşılaşılan Sorunlar

### Prisma client hatası

```bash
# Prisma client'ı yeniden oluştur
npm run db:generate
```

### Veritabanı bağlantı hatası

1. Docker container'ın çalıştığını kontrol et:
   ```bash
   docker ps
   ```
2. `.env` dosyasındaki `DATABASE_URL`'in doğru olduğundan emin ol

### Port kullanımda hatası

PostgreSQL varsayılan olarak 5432 portunu kullanır. Bu port başka bir uygulama tarafından kullanılıyorsa `docker-compose.dev.yml` dosyasında portu değiştir.

---

## Lisans

MIT

---

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın
