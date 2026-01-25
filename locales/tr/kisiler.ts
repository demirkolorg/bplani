import type { KisilerTranslations } from "@/types/locale"

export const kisiler: KisilerTranslations = {
  // Page
  pageTitle: "Kişiler",
  pageDescription: "Tüm kişileri görüntüleyin ve yönetin",
  newKisiButton: "Yeni Kişi",
  newKisi: "Yeni Kişi",
  editKisi: "Kişi Düzenle",
  kisiDetails: "Kişi Detayları",

  // Sections
  personalInfo: "Kişisel Bilgiler",
  contactInfo: "İletişim Bilgileri",
  additionalInfo: "Ek Bilgi",
  overview: "Genel Bakış",

  // Fields
  tcKimlik: "TC Kimlik No",
  tc11Digit: "11 haneli",
  tip: "Tip",
  tt: "TT",
  tipMusteri: "Müşteri",
  tipAday: "Aday",
  tipLead: "Aday",
  faaliyet: "Faaliyet",
  pio: "PIO",
  pioFull: "PIO (Potansiyel İş Ortağı)",
  asli: "Asli",
  asliFull: "Asli Kişi",
  faaliyetAlanlari: "Faaliyet Alanları",

  // Photo
  photo: "Fotoğraf",
  profile: "Profil",
  uploadPhoto: "Fotoğraf Yükle",
  changePhoto: "Fotoğraf Değiştir",
  editPhoto: "Fotoğraf Düzenle",
  editPhotoDescription: "Kişinin profil fotoğrafını değiştirin veya kaldırın.",
  photoFormats: "JPEG, PNG, WebP veya GIF. Maks. 5MB",
  maxFileSize: "Maks. 5MB",

  // Additional info
  additionalInfoPlaceholder: "Ek bilgi veya notlar...",

  // GSM
  gsmNumbers: "GSM Numaraları",
  gsmPlaceholder: "05XX XXX XX XX",
  addGsm: "GSM Ekle",
  noGsmYet: "Henüz GSM eklenmedi",
  addNumberFromAbove: "Yukarıdan numara ekleyin",
  noGsmNumber: "GSM numarası yok",
  deleteGsm: "GSM Sil",
  deleteGsmConfirm: "Bu GSM ve tüm takip kayıtları silinecek. Devam edilsin mi?",

  // Address
  addresses: "Adresler",
  newAddress: "Yeni Adres Ekle",
  newAddressDescription: "Kişi için yeni bir adres ekleyin.",
  addressName: "Adres Adı",
  addressNamePlaceholder: "Ev, İş, vb.",
  addressDetail: "Adres Detayı",
  addressDetailPlaceholder: "Sokak, kapı no, daire, kat vb. detaylar...",
  addressDetailShort: "Sokak, kapı no...",
  addAddress: "Adres Ekle",
  noAddressYet: "Henüz adres eklenmemiş",
  deleteAddress: "Adresi Sil",
  deleteAddressConfirm: "Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
  neighborhoodSelected: "Mahalle seçildi",

  // Relations
  takipVar: "Takip Var",
  takipEkle: "Takip Ekle",
  activeTakipSummary: "Aktif Takip Özeti",
  noTakip: "Takip Yok",
  history: "Geçmiş",

  // Notes
  newNote: "Yeni Not",
  editNote: "Notu Düzenle",
  noteContent: "Not İçeriği",
  noteContentPlaceholder: "Not içeriğini yazın...",
  noNotesYet: "Henüz not eklenmemiş",
  deleteNote: "Notu Sil",
  deleteNoteConfirm: "Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
  noteRequired: "Not içeriği zorunludur",
  noteDescription: "Kişi için yeni bir not ekleyin.",
  editNoteDescription: "Not içeriğini güncelleyin.",
  addGsmTitle: "Yeni GSM Ekle",
  addGsmDescription: "Kişiye yeni bir GSM numarası ekleyin",
  gsmRequired: "GSM numarası gerekli",
  editKisiDescription: "Kişi bilgilerini güncelleyin.",
  newKisiDescription: "Yeni bir kişi eklemek için aşağıdaki formu doldurun.",

  // Edit modals
  editDetails: "Detayları Düzenle",
  editDetailsDescription: "Kişinin temel bilgilerini güncelleyin.",
  editFaaliyetAlanlari: "Faaliyet Alanlarını Düzenle",
  editFaaliyetAlanlariDescription: "Kişinin faaliyet alanlarını güncelleyin.",
  selectFaaliyetAlanlari: "Faaliyet alanı seçin...",

  // Validation
  nameRequired: "Ad zorunludur",
  surnameRequired: "Soyad zorunludur",
  tcInvalid: "TC kimlik no 11 haneli olmalıdır",

  // Search
  searchPlaceholder: "Ad, soyad, TC veya GSM ile ara...",
}
