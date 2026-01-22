"use client"

import * as React from "react"
import { Plus, Trash2, Star, StarOff, MapPin, MoreHorizontal } from "lucide-react"
import { useAdreslerByKisi, useCreateAdres, useUpdateAdres, useDeleteAdres } from "@/hooks/use-adres"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LokasyonSelector } from "@/components/lokasyon/lokasyon-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface KisiAdresListProps {
  kisiId: string
}

export function KisiAdresList({ kisiId }: KisiAdresListProps) {
  const { data: adresler, isLoading } = useAdreslerByKisi(kisiId)
  const createAdres = useCreateAdres()
  const updateAdres = useUpdateAdres()
  const deleteAdres = useDeleteAdres()

  const [showAddModal, setShowAddModal] = React.useState(false)
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
        kisiId,
        isPrimary: !adresler || adresler.length === 0,
      })
      setShowAddModal(false)
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
    <>
      <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Adresler
            {adresler && adresler.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({adresler.length})</span>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

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
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
                  adres.isPrimary 
                    ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10' 
                    : 'border-border/50 bg-card'
                }`}
              >
                <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    {/* Adres Adı ve Birincil Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {adres.ad && (
                        <span className="font-semibold text-foreground">{adres.ad}</span>
                      )}
                      {adres.isPrimary && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">Birincil</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Mahalle ve Lokasyon */}
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">{adres.mahalle.ad} Mah.</span>
                      {adres.detay && (
                        <span className="text-muted-foreground"> {adres.detay}</span>
                      )}
                    </div>
                    
                    {/* İlçe / İl */}
                    <div className="text-sm text-muted-foreground">
                      {adres.mahalle.ilce.ad} / {adres.mahalle.ilce.il.ad}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleSetPrimary(adres.id)}
                      disabled={adres.isPrimary || updateAdres.isPending}
                    >
                      {adres.isPrimary ? (
                        <Star className="mr-2 h-4 w-4 fill-amber-500 text-amber-500" />
                      ) : (
                        <StarOff className="mr-2 h-4 w-4" />
                      )}
                      {adres.isPrimary ? "Zaten Birincil" : "Birincil Yap"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(adres.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

    {/* Add Address Modal */}
    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Adres Ekle</DialogTitle>
          <DialogDescription>
            Kişi için yeni bir adres ekleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
                setShowAddModal(false)
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
      </DialogContent>
    </Dialog>
    </>
  )
}
