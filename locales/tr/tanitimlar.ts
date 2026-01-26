import type { TanitimlarTranslations } from "@/types/locale"

export const tanitimlar: TanitimlarTranslations = {
  // Page
  pageTitle: "Etkinlikler",
  pageDescription: "Tüm etkinlikleri görüntüleyin ve yönetin",
  newTanitimButton: "Yeni Etkinlik",
  newTanitimPageTitle: "Yeni Etkinlik",
  newTanitimPageDescription: "Etkinliğe katılacak kişileri seçin ve etkinlik bilgilerini girin",

  newTanitim: "Yeni Etkinlik",
  editTanitim: "Etkinlik Düzenle",
  tanitimDetails: "Etkinlik Detayları",
  addToTanitim: "Etkinliğe Ekle",
  addToExistingTanitim: "Mevcut Etkinliğe Ekle",
  createNewTanitim: "Yeni Etkinlik Oluştur",

  // Fields
  title: "Başlık",
  titlePlaceholder: "Etkinlik başlığı...",
  tanitimDate: "Etkinlik Tarihi",
  tanitimTime: "Etkinlik Saati",
  tanitimAddress: "Etkinlik Adresi",
  dateTime: "Etkinlik Tarihi ve Saati",
  addressDetail: "Adres Detayı",
  addressDetailPlaceholder: "Sokak, bina no, daire...",
  notesPlaceholder: "Etkinlik hakkında notlar...",
  editTanitimDescription: "Etkinlik bilgilerini güncelleyin. Katılımcıları detay sayfasından yönetebilirsiniz.",

  // Modal
  createModalTitle: "Yeni Etkinlik Oluştur",
  createModalDescription: "Yeni bir etkinlik oluşturun. {name} otomatik olarak katılımcı olarak eklenecek.",
  optional: "(Opsiyonel)",
  creating: "Oluşturuluyor...",

  // Table columns
  date: "Tarih",
  address: "Adres",
  count: "Sayı",
  notes: "Notlar",
  unknownPerson: "Bilinmeyen",

  // Sort options
  dateNewOld: "Tarih (Yeni → Eski)",
  dateOldNew: "Tarih (Eski → Yeni)",
  createdNewOld: "Oluşturulma (Yeni → Eski)",
  createdOldNew: "Oluşturulma (Eski → Yeni)",

  // Delete
  deleteTanitim: "Etkinliği Sil",
  deleteTanitimConfirm: "Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm katılımcı kayıtları da silinecektir.",

  // Search
  searchPlaceholder: "Adres veya notlarda ara...",

  // Participants
  participants: "Katılımcılar",
  selectedParticipants: "Seçilen Katılımcılar",
  searchInSelected: "Seçilenler içinde ara...",
  participantCount: "Seçilen Katılımcı:",
  allSelectedWillBeAdded: "Seçilen tüm kişiler bu etkinliğe katılımcı olarak eklenecektir.",
  searchPerson: "Kişi ara...",
  allPersonsParticipants: "Tüm kişiler zaten katılımcı",
  personNotFound: "Kişi bulunamadı",
  noParticipantsYet: "Henüz katılımcı eklenmedi",
  useAddButton: "Yukarıdaki Ekle butonunu kullanın",
  removeParticipant: "Katılımcıyı Kaldır",
  removeParticipantConfirm: "Bu kişiyi etkinlikten kaldırmak istediğinizden emin misiniz?",

  // New Tanitim Page
  availablePeople: "Mevcut Kişiler",
  itemsCount: "{count} adet",
  searchByNameOrTc: "Ad, soyad veya TC ile ara...",
  removeAll: "Tümünü Kaldır",
  noResultsFound: "Sonuç bulunamadı",
  allPeopleSelected: "Tüm kişiler seçildi",
  selectPeopleInstructions: "Etkinliğe katılacak kişileri sol listeden seçin",
  tanitimInfo: "Etkinlik Bilgileri",
  createTanitimButton: "Etkinlik Oluştur",

  // Additional
  selectedCountText: "etkinlik seçildi",
  notFound: "Etkinlik bulunamadı",
}
