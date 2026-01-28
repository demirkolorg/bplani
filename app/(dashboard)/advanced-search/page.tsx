"use client"

import * as React from "react"
import { QueryBuilder, type ColumnConfig, type QueryOutput } from "@/lib/query-builder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useTabs } from "@/components/providers/tab-provider"

// Define your columns configuration
const columns: ColumnConfig[] = [
  // Kişi Temel Bilgileri
  {
    field: "ad",
    label: "Ad",
    type: "text",
    operators: [
      "contains",
      "doesNotContain",
      "startsWith",
      "endsWith",
      "equals",
      "notEquals",
      "isEmpty",
      "isNotEmpty",
      "inList",
      "notInList",
    ],
    placeholder: "İsim girin...",
  },
  {
    field: "soyad",
    label: "Soyad",
    type: "text",
    operators: [
      "contains",
      "doesNotContain",
      "startsWith",
      "endsWith",
      "equals",
      "notEquals",
      "isEmpty",
      "isNotEmpty",
    ],
    placeholder: "Soyisim girin...",
  },
  {
    field: "tc",
    label: "TC Kimlik No",
    type: "text",
    operators: ["equals", "notEquals", "inList", "notInList"],
    placeholder: "11 haneli TC...",
  },
  {
    field: "tt",
    label: "Müşteri Tipi",
    type: "select",
    operators: ["equals", "notEquals"],
    options: [
      { label: "Müşteri", value: "true" },
      { label: "Aday", value: "false" },
    ],
  },
  {
    field: "pio",
    label: "PIO (Potansiyel İş Ortağı)",
    type: "select",
    operators: ["equals", "notEquals"],
    options: [
      { label: "Evet", value: "true" },
      { label: "Hayır", value: "false" },
    ],
  },
  {
    field: "asli",
    label: "Asli Kişi",
    type: "select",
    operators: ["equals", "notEquals"],
    options: [
      { label: "Evet", value: "true" },
      { label: "Hayır", value: "false" },
    ],
  },
  {
    field: "faaliyet",
    label: "Faaliyet",
    type: "text",
    operators: ["contains", "doesNotContain", "isEmpty", "isNotEmpty"],
    placeholder: "Faaliyet açıklaması...",
  },

  // İletişim Bilgileri
  {
    field: "gsm.numara",
    label: "GSM Numarası",
    type: "text",
    operators: ["contains", "equals", "startsWith", "inList"],
    placeholder: "Telefon numarası...",
  },

  // Adres Bilgileri
  {
    field: "adres.il",
    label: "Adres - İl",
    type: "text",
    operators: ["contains", "equals", "startsWith"],
    placeholder: "İl adı...",
  },
  {
    field: "adres.ilce",
    label: "Adres - İlçe",
    type: "text",
    operators: ["contains", "equals", "startsWith"],
    placeholder: "İlçe adı...",
  },
  {
    field: "adres.mahalle",
    label: "Adres - Mahalle",
    type: "text",
    operators: ["contains", "equals", "startsWith"],
    placeholder: "Mahalle adı...",
  },
  {
    field: "adres.detay",
    label: "Adres Detayı",
    type: "text",
    operators: ["contains", "doesNotContain", "isEmpty", "isNotEmpty"],
    placeholder: "Sokak, bina no, daire...",
  },

  // Araç Bilgileri
  {
    field: "arac.plaka",
    label: "Araç Plakası",
    type: "text",
    operators: ["contains", "equals", "startsWith", "inList"],
    placeholder: "Plaka...",
  },

  // Notlar
  {
    field: "not.icerik",
    label: "Not İçeriği",
    type: "text",
    operators: ["contains", "doesNotContain", "isEmpty", "isNotEmpty"],
    placeholder: "Not içeriği...",
  },

  // Faaliyet Alanı
  {
    field: "faaliyet_alani.ad",
    label: "Faaliyet Alanı",
    type: "text",
    operators: ["contains", "equals"],
    placeholder: "Faaliyet alanı...",
  },

  // Takip Bilgileri
  {
    field: "takip.durum",
    label: "Takip Durumu",
    type: "select",
    operators: ["equals", "notEquals"],
    options: [
      { label: "Uzatılacak", value: "UZATILACAK" },
      { label: "Devam Edecek", value: "DEVAM_EDECEK" },
      { label: "Sonlandırılacak", value: "SONLANDIRILACAK" },
      { label: "Uzatıldı", value: "UZATILDI" },
    ],
  },
  {
    field: "takip.baslama_tarihi",
    label: "Takip Başlama Tarihi",
    type: "date",
    operators: ["before", "after", "equals"],
  },
  {
    field: "takip.bitis_tarihi",
    label: "Takip Bitiş Tarihi",
    type: "date",
    operators: ["before", "after", "equals"],
  },

  // Tanıtım Bilgileri
  {
    field: "tanitim.notlar",
    label: "Tanıtım Notları",
    type: "text",
    operators: ["contains", "doesNotContain", "isEmpty", "isNotEmpty"],
    placeholder: "Tanıtım notları...",
  },
  {
    field: "tanitim.mahalle",
    label: "Tanıtım Mahallesi",
    type: "text",
    operators: ["contains", "equals"],
    placeholder: "Mahalle adı...",
  },

  // Operasyon Bilgileri
  {
    field: "operasyon.notlar",
    label: "Operasyon Notları",
    type: "text",
    operators: ["contains", "doesNotContain", "isEmpty", "isNotEmpty"],
    placeholder: "Operasyon notları...",
  },
  {
    field: "operasyon.mahalle",
    label: "Operasyon Mahallesi",
    type: "text",
    operators: ["contains", "equals"],
    placeholder: "Mahalle adı...",
  },

  // Sistem Bilgileri
  {
    field: "createdAt",
    label: "Oluşturulma Tarihi",
    type: "date",
    operators: ["before", "after", "between", "equals"],
  },
]

export default function AdvancedSearchPage() {
  const { openTab } = useTabs()
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSearch = async (query: QueryOutput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/advanced-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      })

      if (!response.ok) {
        throw new Error("Arama başarısız oldu")
      }

      const data = await response.json()
      setResults(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Gelişmiş Arama</h1>
        <p className="text-muted-foreground mt-2">
          Detaylı filtreleme kriterleriyle arama yapın. Toplu veri yapıştırma özelliği ile
          Excel'den kopyaladığınız verileri kullanabilirsiniz.
        </p>
      </div>

      {/* Query Builder */}
      <QueryBuilder
        columns={columns}
        onSubmit={handleSearch}
        title="Arama Kriterleri"
        description="Filtreleme koşullarınızı belirleyin. İç içe gruplar oluşturabilirsiniz."
        submitLabel="Ara"
        useNestedGroups={true}
      />

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Sonuçlar</CardTitle>
          <CardDescription>
            {loading ? (
              <span>Aranıyor...</span>
            ) : results.length > 0 ? (
              <span>{results.length} kayıt bulundu</span>
            ) : (
              <span>Henüz arama yapılmadı</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">Hata</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => openTab(`/kisiler/${result.id}`)}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-lg">
                        {result.ad} {result.soyad}
                      </p>
                      {result.tc && (
                        <p className="text-sm text-muted-foreground">
                          TC: {result.tc}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {result.tt && <Badge variant="default">Müşteri</Badge>}
                      {!result.tt && <Badge variant="secondary">Aday</Badge>}
                      {result.pio && <Badge variant="outline">PIO</Badge>}
                      {result.asli && <Badge variant="outline">Asli</Badge>}
                    </div>
                  </div>

                  {/* İletişim ve Lokasyon Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* GSM */}
                    {result.gsmler && result.gsmler.length > 0 && (
                      <div>
                        <span className="font-medium">📱 Telefon: </span>
                        <span className="text-muted-foreground">
                          {result.gsmler.map((g: any) => g.numara).join(", ")}
                        </span>
                        {result.gsmler.some((g: any) => g.takipler?.length > 0) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Takip var
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Adres */}
                    {result.adresler && result.adresler.length > 0 && (
                      <div>
                        <span className="font-medium">📍 Adres: </span>
                        <span className="text-muted-foreground">
                          {result.adresler[0].mahalle.ad}, {result.adresler[0].mahalle.ilce.ad}, {result.adresler[0].mahalle.ilce.il.ad}
                        </span>
                      </div>
                    )}

                    {/* Araç */}
                    {result.araclar && result.araclar.length > 0 && (
                      <div>
                        <span className="font-medium">🚗 Araç: </span>
                        <span className="text-muted-foreground">
                          {result.araclar.map((a: any) => a.arac.plaka).join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Faaliyet Alanı */}
                    {result.faaliyetAlanlari && result.faaliyetAlanlari.length > 0 && (
                      <div>
                        <span className="font-medium">💼 Faaliyet: </span>
                        <span className="text-muted-foreground">
                          {result.faaliyetAlanlari.map((f: any) => f.faaliyetAlani.ad).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ek Bilgiler */}
                  <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                    {result.notlar && result.notlar.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {result.notlar.length} Not
                      </Badge>
                    )}
                    {result.tanitimlar && result.tanitimlar.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {result.tanitimlar.length} Tanıtım
                      </Badge>
                    )}
                    {result.operasyonlar && result.operasyonlar.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {result.operasyonlar.length} Operasyon
                      </Badge>
                    )}
                  </div>

                  {/* Faaliyet Açıklaması */}
                  {result.faaliyet && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.faaliyet}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Yukarıdaki kriterleri kullanarak arama yapın</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
