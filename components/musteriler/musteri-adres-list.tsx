"use client"

import * as React from "react"
import { Plus, Trash2, Star, StarOff } from "lucide-react"
import { useAdreslerByMusteri, useCreateAdres, useUpdateAdres, useDeleteAdres } from "@/hooks/use-adres"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LokasyonSelector } from "@/components/lokasyon/lokasyon-selector"

interface MusteriAdresListProps {
  musteriId: string
}

export function MusteriAdresList({ musteriId }: MusteriAdresListProps) {
  const { data: adresler, isLoading } = useAdreslerByMusteri(musteriId)
  const createAdres = useCreateAdres()
  const updateAdres = useUpdateAdres()
  const deleteAdres = useDeleteAdres()

  const [showAddForm, setShowAddForm] = React.useState(false)
  const [adresAd, setAdresAd] = React.useState("")
  const [lokasyon, setLokasyon] = React.useState<{
    ilId?: string
    ilceId?: string
    mahalleId?: string
  }>({})
  const [detay, setDetay] = React.useState("")
  const [error, setError] = React.useState("")
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const handleAdd = async () => {
    if (!lokasyon.mahalleId) {
      setError("Lütfen mahalle seçin")
      return
    }

    setError("")
    try {
      await createAdres.mutateAsync({
        ad: adresAd || null,
        mahalleId: lokasyon.mahalleId,
        detay: detay || null,
        musteriId,
        isPrimary: !adresler || adresler.length === 0,
      })
      setShowAddForm(false)
      setAdresAd("")
      setLokasyon({})
      setDetay("")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleSetPrimary = async (id: string) => {
    await updateAdres.mutateAsync({
      id,
      data: { isPrimary: true },
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteAdres.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const formatAdres = (adres: typeof adresler extends (infer T)[] | undefined ? T : never) => {
    const parts = [
      adres.mahalle.ad,
      adres.mahalle.ilce.ad,
      adres.mahalle.ilce.il.ad,
    ]
    return parts.join(", ")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Adresler</CardTitle>
        {!showAddForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adres Ekle
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new address form */}
        {showAddForm && (
          <div className="space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <Label htmlFor="adresAd">Adres Adı</Label>
              <Input
                id="adresAd"
                value={adresAd}
                onChange={(e) => setAdresAd(e.target.value)}
                placeholder="Ev, İş, vb."
              />
            </div>
            <LokasyonSelector
              value={lokasyon}
              onChange={setLokasyon}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="adresDetay">Adres Detayı</Label>
              <Textarea
                id="adresDetay"
                value={detay}
                onChange={(e) => setDetay(e.target.value)}
                placeholder="Sokak, kapı no, daire, kat vb. detaylar..."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setAdresAd("")
                  setLokasyon({})
                  setDetay("")
                  setError("")
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleAdd}
                disabled={createAdres.isPending || !lokasyon.mahalleId}
              >
                {createAdres.isPending && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                Ekle
              </Button>
            </div>
          </div>
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : adresler && adresler.length > 0 ? (
          <ul className="space-y-2">
            {adresler.map((adres) => (
              <li
                key={adres.id}
                className="flex items-start justify-between rounded-md border p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {adres.ad && (
                      <span className="font-semibold">{adres.ad}:</span>
                    )}
                    <span className="font-medium">{formatAdres(adres)}</span>
                    {adres.isPrimary && (
                      <span className="text-xs text-primary">(Birincil)</span>
                    )}
                  </div>
                  {adres.detay && (
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{adres.detay}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSetPrimary(adres.id)}
                    disabled={adres.isPrimary || updateAdres.isPending}
                    title={adres.isPrimary ? "Zaten birincil" : "Birincil yap"}
                  >
                    {adres.isPrimary ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(adres.id)}
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Henüz adres eklenmemiş
          </p>
        )}

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Adresi Sil"
          description="Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          confirmText="Sil"
          onConfirm={handleDelete}
          isLoading={deleteAdres.isPending}
        />
      </CardContent>
    </Card>
  )
}
