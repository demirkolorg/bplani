import type { OperasyonlarTranslations } from "@/types/locale"

export const operasyonlar: OperasyonlarTranslations = {
  // Page
  pageTitle: "Operasyonlar",
  pageDescription: "Tüm operasyonları görüntüleyin ve yönetin",
  newOperasyonButton: "Yeni Operasyon",

  newOperasyon: "Yeni Operasyon",
  editOperasyon: "Operasyon Düzenle",
  operasyonDetails: "Operasyon Detayları",
  addToOperasyon: "Operasyona Ekle",
  addToExistingOperasyon: "Mevcut Operasyona Ekle",
  createNewOperasyon: "Yeni Operasyon Oluştur",

  // Fields
  operasyonDate: "Operasyon Tarihi",
  operasyonTime: "Operasyon Saati",
  operasyonAddress: "Operasyon Adresi",
  dateTime: "Operasyon Tarihi ve Saati",
  addressDetail: "Adres Detayı",
  addressDetailPlaceholder: "Sokak, bina no, daire...",
  notesPlaceholder: "Operasyon hakkında notlar...",
  editOperasyonDescription: "Operasyon bilgilerini güncelleyin. Katılımcıları detay sayfasından yönetebilirsiniz.",

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
  deleteOperasyon: "Operasyonu Sil",
  deleteOperasyonConfirm: "Bu operasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm katılımcı kayıtları da silinecektir.",

  // Search
  searchPlaceholder: "Adres veya notlarda ara...",

  // Participants
  participants: "Katılımcılar",
  selectedParticipants: "Seçilen Katılımcılar",
  participantCount: "Seçilen Katılımcı:",
  allSelectedWillBeAdded: "Seçilen tüm kişiler bu operasyona katılımcı olarak eklenecektir.",
  searchPerson: "Kişi ara...",
  allPersonsParticipants: "Tüm kişiler zaten katılımcı",
  personNotFound: "Kişi bulunamadı",
  noParticipantsYet: "Henüz katılımcı eklenmedi",
  useAddButton: "Yukarıdaki Ekle butonunu kullanın",
  removeParticipant: "Katılımcıyı Kaldır",
  removeParticipantConfirm: "Bu kişiyi operasyondan kaldırmak istediğinizden emin misiniz?",
}
