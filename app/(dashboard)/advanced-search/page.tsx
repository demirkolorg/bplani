"use client"

import * as React from "react"
import { QueryBuilder, type ColumnConfig, type QueryOutput } from "@/lib/query-builder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Define your columns configuration
const columns: ColumnConfig[] = [
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
  {
    field: "createdAt",
    label: "Oluşturulma Tarihi",
    type: "date",
    operators: ["before", "after", "between", "equals"],
  },
]

export default function AdvancedSearchPage() {
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastQuery, setLastQuery] = React.useState<QueryOutput | null>(null)

  const handleSearch = async (query: QueryOutput) => {
    setLoading(true)
    setError(null)
    setLastQuery(query)

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
        description="Filtreleme koşullarınızı belirleyin"
        submitLabel="Ara"
      />

      {/* Debug: Last Query */}
      {lastQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Son Sorgu (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(lastQuery, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

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
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {result.ad} {result.soyad}
                    </p>
                    {result.tc && (
                      <p className="text-sm text-muted-foreground">
                        TC: {result.tc}
                      </p>
                    )}
                    {result.faaliyet && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.faaliyet}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {result.tt && (
                      <Badge variant="default">Müşteri</Badge>
                    )}
                    {!result.tt && (
                      <Badge variant="secondary">Aday</Badge>
                    )}
                    {result.pio && (
                      <Badge variant="outline">PIO</Badge>
                    )}
                    {result.asli && (
                      <Badge variant="outline">Asli</Badge>
                    )}
                  </div>
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
