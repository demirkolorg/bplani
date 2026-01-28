import { rankItem, compareItems } from "@tanstack/match-sorter-utils"
import type { FilterFn, Row, SortingFn } from "@tanstack/react-table"

/**
 * TanStack Table'ın önerdiği fuzzy filter fonksiyonu
 * match-sorter kütüphanesi kullanarak yaklaşık arama (typo-tolerant) yapar
 */
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Arama değerini al
  const itemValue = row.getValue(columnId)

  // match-sorter ile ranking yap
  const itemRank = rankItem(itemValue, value)

  // Rank bilgisini meta'ya ekle (sorting için kullanılabilir)
  addMeta({ itemRank })

  // Eşleşme başarılı mı?
  return itemRank.passed
}

/**
 * Fuzzy filter ranking'e göre sıralama fonksiyonu (optional)
 * Not: TanStack Table'da columnFiltersMeta'nın type'ı FilterMeta'dır
 * ve itemRank custom property'yi desteklemez. Bu fonksiyon şimdilik devre dışı.
 */
// export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
//   let dir = 0
//   // Her iki row'da da rank bilgisi varsa karşılaştır
//   if (rowA.columnFiltersMeta[columnId] && rowB.columnFiltersMeta[columnId]) {
//     dir = compareItems(
//       (rowA.columnFiltersMeta[columnId] as any)?.itemRank!,
//       (rowB.columnFiltersMeta[columnId] as any)?.itemRank!
//     )
//   }
//   return dir === 0 ? 0 : dir
// }

/**
 * Row'dan aranabilir tüm metinleri çıkarır
 * Global search için kullanılır
 */
export function getSearchableText(row: Row<any>, t?: any): string {
  const values: string[] = []
  const original = row.original as Record<string, any>

  // Tüm görünür hücrelerin değerlerini al
  row.getVisibleCells().forEach(cell => {
    const value = cell.getValue()
    if (value != null && value !== "") {
      // Array ise join et
      if (Array.isArray(value)) {
        values.push(value.join(" "))
      } else {
        values.push(String(value))
      }
    }
  })

  // Computed ve formatted değerleri ekle
  if (t) {
    // Tarih alanları - formatted olarak ekle
    const dateFields = ["baslamaTarihi", "bitisTarihi", "tarih", "tetikTarihi", "lastLoginAt"]
    dateFields.forEach(field => {
      if (original[field]) {
        const date = new Date(original[field])
        if (!isNaN(date.getTime())) {
          values.push(date.toLocaleDateString("tr-TR"))
        }
      }
    })

    // Kalan gün computed field
    if (original.bitisTarihi) {
      const date = new Date(original.bitisTarihi)
      const now = new Date()
      const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 0) {
        values.push(t.common?.expired || "expired")
      } else {
        values.push(`${daysLeft}`)
      }
    }

    // Enum labels (durum, tip, rol)
    if (original.durum && t.enums?.takipDurumu) {
      values.push(t.enums.takipDurumu[original.durum] || original.durum)
    }
    if (original.tip && t.enums?.alarmTipi) {
      values.push(t.enums.alarmTipi[original.tip] || original.tip)
    }
    if (original.rol && t.enums?.personelRol) {
      values.push(t.enums.personelRol[original.rol] || original.rol)
    }

    // Boolean labels
    const boolFields = ["isActive", "isPaused", "pio", "asli", "tt"]
    boolFields.forEach(field => {
      if (field in original && original[field] !== null && original[field] !== undefined) {
        if (field === "tt") {
          // tt: true=Müşteri, false=Aday
          values.push(original[field] ? (t.common?.customer || "customer") : (t.common?.candidate || "candidate"))
        } else {
          values.push(original[field] ? (t.common?.yes || "yes") : (t.common?.no || "no"))
        }
      }
    })

    // Nested kisi (ad + soyad)
    const kisi = original.kisi || original.gsm?.kisi
    if (kisi) {
      values.push(`${kisi.ad || ""} ${kisi.soyad || ""}`)
      if (kisi.tc) values.push(String(kisi.tc))
    }

    // Nested mahalle/ilce/il
    if (original.mahalle) {
      values.push(original.mahalle.ad || "")
      if (original.mahalle.ilce) {
        values.push(original.mahalle.ilce.ad || "")
        if (original.mahalle.ilce.il) {
          values.push(original.mahalle.ilce.il.ad || "")
        }
      }
    }

    // GSM array
    if (original.gsmler && Array.isArray(original.gsmler)) {
      original.gsmler.forEach((gsm: any) => {
        if (gsm.numara) values.push(gsm.numara)
      })
    }

    // Katılımcılar array
    if (original.katilimcilar && Array.isArray(original.katilimcilar)) {
      original.katilimcilar.forEach((k: any) => {
        if (k.kisi) {
          values.push(`${k.kisi.ad || ""} ${k.kisi.soyad || ""}`)
        }
      })
    }

    // CreatedUser
    if (original.createdUser) {
      values.push(`${original.createdUser.ad || ""} ${original.createdUser.soyad || ""}`)
    } else if (original.olusturan === null) {
      values.push(t.common?.system || "system")
    }
  }

  // Tüm değerleri birleştir ve lowercase yap
  return values.join(" ").toLowerCase()
}
