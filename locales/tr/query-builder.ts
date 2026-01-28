import type { QueryBuilderTranslations } from "@/types/locale"

export const queryBuilder: QueryBuilderTranslations = {
  // Page
  pageTitle: "Gelişmiş Arama",
  pageDescription: "Detaylı filtreleme kriterleriyle arama yapın",

  // Components
  title: "Gelişmiş Filtreleme",
  description: "Arama kriterlerinizi belirleyin",
  submitLabel: "Sonuçları Göster",
  addFilter: "Filtre Ekle",
  addGroup: "Grup Ekle",
  removeFilter: "Filtreyi Kaldır",
  removeGroup: "Grubu Sil",
  clearAll: "Tümünü Temizle",

  // Logic
  logic: "Mantık:",
  logicAnd: "VE (Tüm koşullar)",
  logicOr: "VEYA (Herhangi biri)",
  and: "VE",
  or: "VEYA",
  combinator: "Bağlaç:",

  // Status
  activeFilters: "{count} aktif filtre",
  noFilters: "En az bir filtre ekleyin",
  searching: "Aranıyor...",

  // Operators - Text
  contains: "İçerir",
  doesNotContain: "İçermez",
  startsWith: "İle başlar",
  endsWith: "İle biter",
  equals: "Eşittir",
  notEquals: "Eşit değildir",
  isEmpty: "Boş",
  isNotEmpty: "Boş değil",
  inList: "Listede (Toplu)",
  notInList: "Listede değil (Toplu)",

  // Operators - Number
  greaterThan: "Büyüktür",
  lessThan: "Küçüktür",
  between: "Arasında",

  // Operators - Select
  in: "İçinde (Çoklu)",
  notIn: "İçinde değil (Çoklu)",

  // Operators - Date
  before: "Öncesi",
  after: "Sonrası",

  // Input
  selectColumn: "Kolon seçin",
  selectOperator: "Operatör seçin",
  enterValue: "Değer girin...",
  noValueNeeded: "Değer gerekmiyor",

  // Bulk input
  bulkPaste: "Toplu değer yapıştır...",
  bulkPasteTitle: "Toplu Değer Girişi",
  bulkPasteDescription: "Her satıra bir değer yazın veya Excel'den kopyalayıp yapıştırın",
  bulkPastePlaceholder: "Değer1\nDeğer2\nDeğer3...",
  uniqueValues: "{count} benzersiz değer",
  valuesSelected: "{count} değer seçildi",
  clear: "Temizle",
  apply: "Uygula",

  // Between input
  min: "Min",
  max: "Max",

  // Select input
  selectOption: "Seçim yapın...",
  search: "Ara...",
  noResults: "Sonuç bulunamadı.",

  // Results
  resultsTitle: "Sonuçlar",
  resultsCount: "{count} kayıt bulundu",
  noSearchYet: "Henüz arama yapılmadı",
  noResultsFound: "Sonuç bulunamadı",
  searchInstructions: "Yukarıdaki kriterleri kullanarak arama yapın",

  // Errors
  searchError: "Arama sırasında bir hata oluştu",

  // Debug
  debugTitle: "Son Sorgu (Debug)",

  // Saved Queries
  savedQueries: "Kayıtlı Sorgular",
  saveQuery: "Sorguyu Kaydet",
  loadQuery: "Sorgu Yükle",
  deleteQuery: "Sorguyu Sil",
  queryName: "Sorgu Adı",
  queryNamePlaceholder: "Örn: Aktif Hedefler",
  saveSuccess: "Sorgu başarıyla kaydedildi",
  loadSuccess: "Sorgu yüklendi",
  deleteSuccess: "Sorgu silindi",
  noSavedQueries: "Henüz kayıtlı sorgu yok",

  // Export
  export: "Dışa Aktar",
  exportExcel: "Excel'e Aktar",
  exportCsv: "CSV'ye Aktar",
  exportJson: "JSON'a Aktar",
  exporting: "Dışa aktarılıyor...",
  exportSuccess: "{count} kayıt dışa aktarıldı",
  exportError: "Dışa aktarma hatası",
}
