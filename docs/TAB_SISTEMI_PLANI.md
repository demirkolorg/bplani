# ALTAY - Proje İçi Tab Sistemi Tasarım Dokümanı

> **Tarih**: 23 Ocak 2026
> **Durum**: Tasarım Aşaması - Tartışılacak

---

## 1. Amaç

Kullanıcıların birden fazla sayfayı (özellikle kişi detayları) eş zamanlı açabilmesi ve aralarında state kaybetmeden geçiş yapabilmesi için tarayıcı benzeri bir tab sistemi oluşturmak.

**Kullanım Senaryosu:**
- Kişi A'yı açıp incelemeye başla
- Kişi B'yi yeni tab'da aç
- Kişi C'yi yeni tab'da aç
- Üçü arasında hızlıca geçiş yap, karşılaştır
- Her tab kendi scroll pozisyonunu ve form state'ini korur

---

## 2. Mevcut Yapı Analizi

### Şu Anki Mimari
```
app/layout.tsx
└── QueryProvider (React Query)
    └── ThemeProvider
        └── app/(dashboard)/layout.tsx
            └── AuthProvider
                └── SidebarLayout
                    ├── AppSidebar (sol menü)
                    ├── Header (üst bar)
                    └── main {children} (sayfa içeriği)
```

### Mevcut Dosyalar
| Dosya | Rol |
|-------|-----|
| `app/(dashboard)/layout.tsx` | Dashboard wrapper |
| `components/sidebar-layout.tsx` | Sidebar + Header + Main |
| `components/app-sidebar.tsx` | Sol navigasyon menüsü |
| `components/providers/auth-provider.tsx` | Kullanıcı auth context |

### Mevcut State Yönetimi
- **React Query**: Sunucu verisi (kisiler, tanitimlar, vs.)
- **React Context**: Auth state
- **localStorage**: Sadece sidebar açık/kapalı durumu

---

## 3. Önerilen Tab Sistemi Mimarisi

### Hedef Yapı
```
app/(dashboard)/layout.tsx
└── AuthProvider
    └── TabProvider  ← YENİ
        └── SidebarLayout (veya HeaderLayout - alternatif)
            ├── Sidebar/Header
            ├── TabBar ← YENİ (tab listesi)
            └── TabContentRenderer ← YENİ
                └── TabPanel[] (her açık sayfa için)
```

### Tab State Yapısı
```typescript
interface Tab {
  id: string;           // Benzersiz ID (UUID)
  path: string;         // Route path (örn: "/kisiler/abc123")
  title: string;        // Görünen başlık (örn: "Ahmet Yılmaz")
  icon?: string;        // İkon adı (lucide-react)
  scrollPosition: number; // Kaydedilen scroll pozisyonu
  openedAt: number;     // Açılma zamanı
  lastActiveAt: number; // Son aktif olma zamanı
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  maxTabs: number; // Varsayılan: 10
}
```

---

## 4. Temel Özellikler

### 4.1 Tab Açma/Kapama
- [x] Sidebar'dan tıklayınca yeni tab aç
- [x] Zaten açık sayfaya tıklayınca o tab'a git
- [x] Ctrl+Click veya Middle-click ile background'da aç
- [x] Tab'da X butonuyla kapat
- [x] Middle-click ile tab'ı kapat

### 4.2 Tab Navigasyonu
- [x] Tab'a tıklayınca aktif yap
- [x] Keyboard: Ctrl+Tab / Ctrl+Shift+Tab
- [x] Keyboard: Ctrl+W ile aktif tab'ı kapat
- [ ] Keyboard: Ctrl+1-9 ile direkt tab'a git (opsiyonel)

### 4.3 Tab Yönetimi
- [x] Sağ-tık menüsü: Kapat, Diğerlerini Kapat, Tümünü Kapat
- [ ] Drag-and-drop ile tab sıralama (opsiyonel)
- [ ] Tab'ı sabitle/pin (opsiyonel)
- [x] URL kopyala

### 4.4 State Yönetimi
- [x] Tab state'i localStorage'da sakla
- [x] Sayfa yenilemesinde tab'ları geri getir
- [x] Her tab kendi scroll pozisyonunu hatırla
- [x] Max 10 tab limiti (en eski otomatik kapanır)

### 4.5 Performans
- [x] Tüm tab'lar mount kalır (state korunur)
- [x] Aktif olmayan tab'lar CSS ile gizlenir
- [x] Background'da açılan tab'lar lazy render
- [x] React Query cache tab'lar arası paylaşılır

---

## 5. Layout Alternatifleri

### Alternatif A: Mevcut Sidebar + Tab Bar (Önerilen)
```
┌─────────────────────────────────────────────────────────┐
│ ☰ │ ALTAY                          🔔 🌙 👤            │ ← Header
├───┼─────────────────────────────────────────────────────┤
│ S │ [Kişi A] [Kişi B] [Kişi C]  [+]                     │ ← TabBar
│ I ├─────────────────────────────────────────────────────┤
│ D │                                                     │
│ E │              Tab İçeriği                            │
│ B │                                                     │
│ A │                                                     │
│ R │                                                     │
└───┴─────────────────────────────────────────────────────┘
```

**Artıları:**
- Mevcut yapıyı korur
- Minimal değişiklik
- Kullanıcılar alışık

**Eksileri:**
- Yatay alan biraz daralır
- Tab bar için dikey alan harcanır

---

### Alternatif B: Header Menü + Tab Bar (Sidebar Kaldırılır)
```
┌─────────────────────────────────────────────────────────┐
│ ☰ Menü │ ALTAY                      🔔 🌙 👤           │ ← Header + Menü
├─────────────────────────────────────────────────────────┤
│ [Kişi A] [Kişi B] [Kişi C]  [+]                         │ ← TabBar
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    Tab İçeriği                          │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Artıları:**
- Daha geniş içerik alanı
- Modern görünüm
- Tam yatay alan

**Eksileri:**
- Navigasyon dropdown menüde (2 tık gerekir)
- Büyük yapısal değişiklik
- Menü açık tutmak zorlaşır

---

### Alternatif C: Sidebar + Tab'lar Sidebar İçinde
```
┌───┬─────────────────────────────────────────────────────┐
│ S │ ALTAY                          🔔 🌙 👤            │
│ I ├─────────────────────────────────────────────────────┤
│ D │                                                     │
│ E │              İçerik                                 │
│ B │                                                     │
│ A │                                                     │
│ R │                                                     │
├───┤                                                     │
│Tab│                                                     │
│ A │                                                     │
│Tab│                                                     │
│ B │                                                     │
└───┴─────────────────────────────────────────────────────┘
```

**Artıları:**
- Tab'lar sidebar'da dikey liste olarak
- Header'da alan harcanmaz

**Eksileri:**
- Tab isimleri kısa olmak zorunda
- Alışılmadık UX

---

## 6. Oluşturulacak Dosyalar

### Yeni Dosyalar
```
types/
  └── tabs.ts                          # Tab interface tanımları

components/
  └── providers/
      └── tab-provider.tsx             # Tab state context
      └── params-provider.tsx          # Dynamic route params
  └── tabs/
      └── tab-bar.tsx                  # Tab bar container
      └── tab-item.tsx                 # Tekil tab bileşeni
      └── tab-content-renderer.tsx     # Tab içerik renderer
      └── tab-panel.tsx                # Tekil tab panel
      └── tab-page-content.tsx         # Dinamik sayfa loader
      └── tab-link.tsx                 # Tab-aware link

lib/
  └── page-registry.ts                 # Sayfa component registry
  └── tab-titles.ts                    # Route başlık eşlemesi

hooks/
  └── use-tabs.ts                      # Tab hook
  └── use-tab-title.ts                 # Dinamik başlık hook
  └── use-tab-params.ts                # Tab params hook
```

### Değiştirilecek Dosyalar
```
app/(dashboard)/layout.tsx             # TabProvider ekle
components/sidebar-layout.tsx          # TabBar ekle, içerik değiştir
components/app-sidebar.tsx             # TabLink kullan

# Detail sayfalar (useParams → useTabParams)
app/(dashboard)/kisiler/[id]/page.tsx
app/(dashboard)/tanitimlar/[id]/page.tsx
app/(dashboard)/personel/[id]/page.tsx
app/(dashboard)/takipler/[id]/page.tsx
app/(dashboard)/operasyonlar/[id]/page.tsx
```

---

## 7. Teknik Zorluklar ve Çözümler

### Zorluk 1: Next.js useParams
**Problem:** Tab içinde render edilen sayfalar `useParams()` kullanamaz.
**Çözüm:** Custom `useTabParams()` hook ve ParamsProvider context.

### Zorluk 2: Sayfa Component'lerini Yüklemek
**Problem:** App Router sayfaları direkt import edilemez.
**Çözüm:** Page Registry pattern ile dynamic import.

### Zorluk 3: State Koruma
**Problem:** Tab değişince component unmount olursa state kaybolur.
**Çözüm:** Tüm tab'lar mount kalır, CSS visibility ile gizlenir.

### Zorluk 4: URL Senkronizasyonu
**Problem:** Browser URL hangi tab'ı göstermeli?
**Çözüm:** Aktif tab'ın path'i URL'ye yansır (deep linking).

---

## 8. Uygulama Fazları

### Faz 1: Temel Altyapı (1-2 gün)
- [ ] Type tanımları
- [ ] TabProvider context
- [ ] Page registry
- [ ] Tab titles mapping

### Faz 2: Navigasyon (1 gün)
- [ ] TabLink component
- [ ] ParamsProvider
- [ ] Sidebar entegrasyonu

### Faz 3: Tab Rendering (1-2 gün)
- [ ] TabContentRenderer
- [ ] TabPanel (scroll koruma)
- [ ] TabPageContent (dynamic loader)

### Faz 4: Tab Bar UI (1 gün)
- [ ] TabBar component
- [ ] TabItem component
- [ ] Context menu

### Faz 5: Entegrasyon (1 gün)
- [ ] SidebarLayout güncelleme
- [ ] Detail page'lerde useTabParams
- [ ] useTabTitle hook

### Faz 6: Polish (1 gün)
- [ ] Keyboard shortcuts
- [ ] localStorage persistence
- [ ] Max tab handling
- [ ] Test ve düzeltmeler

**Toplam Tahmini Süre: 6-8 gün**

---

## 9. Tartışılacak Konular

1. **Layout tercihi**: Sidebar kalacak mı, header menüye mi geçilecek?
2. **Tab limiti**: 10 yeterli mi?
3. **Pinned tabs**: Sabitlenebilir tab'lar olsun mu?
4. **Drag-drop**: Tab sıralama gerekli mi?
5. **Tab grupları**: İleri aşamada tab grupları olsun mu?
6. **Session sync**: Farklı browser tab'larında aynı session?

---

## 10. Referans Projeler

- VS Code tab sistemi
- Chrome/Firefox browser tabs
- Notion page tabs
- Figma tab sistemi

---

## Notlar

_Bu bölümü tartışma sırasında doldurabiliriz._

```
Tarih:
Karar:
Notlar:
```
