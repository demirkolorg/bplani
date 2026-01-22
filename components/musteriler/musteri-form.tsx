"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Star, StarOff, User, Upload, X } from "lucide-react"
import { useCreateKisi, useUpdateKisi } from "@/hooks/use-kisiler"
import { createKisiSchema, type CreateKisiInput, type KisiTip } from "@/lib/validations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/shared/rich-text-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LokasyonSelector } from "@/components/lokasyon/lokasyon-selector"
import { Phone, MapPin } from "lucide-react"

interface GsmItem {
  id?: string
  numara: string
  isPrimary: boolean
  isNew?: boolean
}

interface AdresItem {
  id?: string
  ad: string | null  // Adres adı (Ev, İş, vb.)
  ilId?: string
  ilceId?: string
  mahalleId: string
  detay: string | null
  isPrimary: boolean
  isNew?: boolean
  lokasyonText?: string
}

interface KisiFormProps {
  initialData?: Partial<CreateKisiInput> & {
    id?: string
    gsmler?: GsmItem[]
    adresler?: AdresItem[]
  }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
}

export function KisiForm({ initialData, onSuccess, onCancel, inModal }: KisiFormProps) {
  const router = useRouter()
  const createKisi = useCreateKisi()
  const updateKisi = useUpdateKisi()

  const isEditing = !!initialData?.id

  // Main form data
  const [formData, setFormData] = React.useState<CreateKisiInput>({
    tip: (initialData as { tip?: KisiTip })?.tip || "MUSTERI",
    tc: initialData?.tc || null,
    ad: initialData?.ad || "",
    soyad: initialData?.soyad || "",
    faaliyet: initialData?.faaliyet || null,
    pio: initialData?.pio || false,
    asli: initialData?.asli || false,
    fotograf: initialData?.fotograf || null,
  })

  // GSM list
  const [gsmler, setGsmler] = React.useState<GsmItem[]>(
    initialData?.gsmler || []
  )
  const [newGsmNumara, setNewGsmNumara] = React.useState("")

  // Adres list
  const [adresler, setAdresler] = React.useState<AdresItem[]>(
    initialData?.adresler || []
  )
  const [showAdresForm, setShowAdresForm] = React.useState(false)
  const [newAdresAd, setNewAdresAd] = React.useState("")
  const [newAdresLokasyon, setNewAdresLokasyon] = React.useState<{
    ilId?: string
    ilceId?: string
    mahalleId?: string
  }>({})
  const [newAdresDetay, setNewAdresDetay] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        fotograf: "Geçersiz dosya türü. Sadece JPEG, PNG, WebP ve GIF desteklenir.",
      }))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        fotograf: "Dosya boyutu 5MB'dan büyük olamaz",
      }))
      return
    }

    setIsUploading(true)
    setErrors((prev) => {
      const { fotograf, ...rest } = prev
      return rest
    })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Dosya yüklenirken hata oluştu")
      }

      const { url } = await response.json()
      handleChange("fotograf", url)
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        fotograf: error instanceof Error ? error.message : "Dosya yüklenirken hata oluştu",
      }))
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemovePhoto = () => {
    handleChange("fotograf", null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleChange = (field: keyof CreateKisiInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  // GSM handlers
  const handleAddGsm = () => {
    if (!newGsmNumara.trim()) return

    const isFirst = gsmler.length === 0
    setGsmler((prev) => [
      ...prev,
      {
        numara: newGsmNumara.trim(),
        isPrimary: isFirst,
        isNew: true,
      },
    ])
    setNewGsmNumara("")
  }

  const handleRemoveGsm = (index: number) => {
    setGsmler((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      // If removed was primary and there are still GSMs, make first one primary
      if (prev[index].isPrimary && updated.length > 0) {
        updated[0].isPrimary = true
      }
      return updated
    })
  }

  const handleSetGsmPrimary = (index: number) => {
    setGsmler((prev) =>
      prev.map((gsm, i) => ({
        ...gsm,
        isPrimary: i === index,
      }))
    )
  }

  // Adres handlers
  const handleAddAdres = () => {
    const mahalleId = newAdresLokasyon.mahalleId
    if (!mahalleId) return

    const isFirst = adresler.length === 0
    const newAdres: AdresItem = {
      ad: newAdresAd || null,
      ilId: newAdresLokasyon.ilId,
      ilceId: newAdresLokasyon.ilceId,
      mahalleId,
      detay: newAdresDetay || null,
      isPrimary: isFirst,
      isNew: true,
    }
    setAdresler((prev) => [...prev, newAdres])
    setNewAdresAd("")
    setNewAdresLokasyon({})
    setNewAdresDetay("")
    setShowAdresForm(false)
  }

  const handleRemoveAdres = (index: number) => {
    setAdresler((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (prev[index].isPrimary && updated.length > 0) {
        updated[0].isPrimary = true
      }
      return updated
    })
  }

  const handleSetAdresPrimary = (index: number) => {
    setAdresler((prev) =>
      prev.map((adres, i) => ({
        ...adres,
        isPrimary: i === index,
      }))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate main form
    const result = createKisiSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (isEditing && initialData?.id) {
        await updateKisi.mutateAsync({
          id: initialData.id,
          data: result.data,
        })
      } else {
        const kisi = await createKisi.mutateAsync(result.data)

        // Create GSMs for new kişi
        if (gsmler.length > 0 && kisi.id) {
          await fetch("/api/gsmler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kisiId: kisi.id,
              gsmler: gsmler.map((g) => ({
                numara: g.numara,
                isPrimary: g.isPrimary,
              })),
            }),
          })
        }

        // Create Addresses for new kişi
        if (adresler.length > 0 && kisi.id) {
          await fetch("/api/adresler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kisiId: kisi.id,
              adresler: adresler.map((a) => ({
                ad: a.ad,
                mahalleId: a.mahalleId,
                detay: a.detay,
                isPrimary: a.isPrimary,
              })),
            }),
          })
        }
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/musteriler")
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  const isPending = createKisi.isPending || updateKisi.isPending

  const formContent = (
    <div className="space-y-6">
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      {/* 3 Column Layout for New Kişi */}
      {!isEditing ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sol Sütun - Kişisel Bilgiler */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fotoğraf */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden">
                    {formData.fotograf ? (
                      <img
                        src={formData.fotograf}
                        alt="Profil"
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  {formData.fotograf && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                      onClick={handleRemovePhoto}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fotograf-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-3 w-3" />
                        Fotoğraf
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Maks. 5MB
                  </p>
                  {errors.fotograf && (
                    <p className="text-xs text-destructive">{errors.fotograf}</p>
                  )}
                </div>
              </div>

              {/* TC */}
              <div className="space-y-1">
                <Label htmlFor="tc" className="text-xs">TC Kimlik No</Label>
                <Input
                  id="tc"
                  value={formData.tc || ""}
                  onChange={(e) => handleChange("tc", e.target.value || null)}
                  placeholder="11 haneli"
                  maxLength={11}
                  className="h-9"
                />
                {errors.tc && <p className="text-xs text-destructive">{errors.tc}</p>}
              </div>

              {/* Ad Soyad */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="ad" className="text-xs">
                    Ad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ad"
                    value={formData.ad}
                    onChange={(e) => handleChange("ad", e.target.value)}
                    placeholder="Ad"
                    className="h-9"
                    required
                  />
                  {errors.ad && <p className="text-xs text-destructive">{errors.ad}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="soyad" className="text-xs">
                    Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="soyad"
                    value={formData.soyad}
                    onChange={(e) => handleChange("soyad", e.target.value)}
                    placeholder="Soyad"
                    className="h-9"
                    required
                  />
                  {errors.soyad && <p className="text-xs text-destructive">{errors.soyad}</p>}
                </div>
              </div>

              {/* Faaliyet */}
              <div className="space-y-1">
                <Label htmlFor="faaliyet" className="text-xs">Faaliyet</Label>
                <Textarea
                  id="faaliyet"
                  value={formData.faaliyet || ""}
                  onChange={(e) => handleChange("faaliyet", e.target.value || null)}
                  placeholder="Faaliyet alanı..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pio"
                    checked={formData.pio}
                    onCheckedChange={(checked) => handleChange("pio", checked)}
                  />
                  <Label htmlFor="pio" className="cursor-pointer text-xs">
                    PIO
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="asli"
                    checked={formData.asli}
                    onCheckedChange={(checked) => handleChange("asli", checked)}
                  />
                  <Label htmlFor="asli" className="cursor-pointer text-xs">
                    Asli
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orta Sütun - GSM Numaraları */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                GSM Numaraları
                {gsmler.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({gsmler.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add GSM */}
              <div className="flex gap-2">
                <Input
                  value={newGsmNumara}
                  onChange={(e) => setNewGsmNumara(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="flex-1 h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddGsm()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleAddGsm}
                  disabled={!newGsmNumara.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* GSM List */}
              {gsmler.length > 0 ? (
                <ul className="space-y-2">
                  {gsmler.map((gsm, index) => (
                    <li
                      key={index}
                      className={`flex items-center justify-between rounded-lg border p-2.5 transition-colors ${
                        gsm.isPrimary
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-mono text-sm">{gsm.numara}</span>
                        {gsm.isPrimary && (
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleSetGsmPrimary(index)}
                          disabled={gsm.isPrimary}
                          title="Birincil yap"
                        >
                          {gsm.isPrimary ? (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOff className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveGsm(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz GSM eklenmedi</p>
                  <p className="text-xs">Yukarıdan numara ekleyin</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sağ Sütun - Adresler */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Adresler
                {adresler.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({adresler.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Adres Form - Always visible */}
              <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                <div className="space-y-1">
                  <Label htmlFor="adresAd" className="text-xs">Adres Adı</Label>
                  <Input
                    id="adresAd"
                    value={newAdresAd}
                    onChange={(e) => setNewAdresAd(e.target.value)}
                    placeholder="Ev, İş, vb."
                    className="h-9"
                  />
                </div>
                <LokasyonSelector
                  value={newAdresLokasyon}
                  onChange={setNewAdresLokasyon}
                  required
                  compact
                />
                <div className="space-y-1">
                  <Label htmlFor="adresDetay" className="text-xs">Detay</Label>
                  <Textarea
                    id="adresDetay"
                    value={newAdresDetay}
                    onChange={(e) => setNewAdresDetay(e.target.value)}
                    placeholder="Sokak, kapı no..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddAdres}
                  disabled={!newAdresLokasyon.mahalleId}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adres Ekle
                </Button>
              </div>

              {/* Adres List */}
              {adresler.length > 0 && (
                <ul className="space-y-2">
                  {adresler.map((adres, index) => (
                    <li
                      key={index}
                      className={`rounded-lg border p-2.5 transition-colors ${
                        adres.isPrimary
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-green-600 shrink-0" />
                            {adres.ad && (
                              <span className="font-medium text-xs">{adres.ad}</span>
                            )}
                            {adres.isPrimary && (
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {adres.lokasyonText || "Mahalle seçildi"}
                          </p>
                          {adres.detay && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {adres.detay}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSetAdresPrimary(index)}
                            disabled={adres.isPrimary}
                          >
                            {adres.isPrimary ? (
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAdres(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Editing Mode - Single column */
        <div className="space-y-6">
          {/* Fotoğraf */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted overflow-hidden">
                {formData.fotograf ? (
                  <img
                    src={formData.fotograf}
                    alt="Profil"
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              {formData.fotograf && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Fotoğraf</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                className="hidden"
                id="fotograf-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Fotoğraf Yükle
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP veya GIF. Maks. 5MB
              </p>
              {errors.fotograf && (
                <p className="text-sm text-destructive">{errors.fotograf}</p>
              )}
            </div>
          </div>

          {/* Temel Bilgiler */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tc">TC Kimlik No</Label>
              <Input
                id="tc"
                value={formData.tc || ""}
                onChange={(e) => handleChange("tc", e.target.value || null)}
                placeholder="11 haneli TC Kimlik No"
                maxLength={11}
              />
              {errors.tc && <p className="text-sm text-destructive">{errors.tc}</p>}
            </div>

            <div />

            <div className="space-y-2">
              <Label htmlFor="ad">
                Ad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ad"
                value={formData.ad}
                onChange={(e) => handleChange("ad", e.target.value)}
                placeholder="Ad"
                required
              />
              {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="soyad">
                Soyad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="soyad"
                value={formData.soyad}
                onChange={(e) => handleChange("soyad", e.target.value)}
                placeholder="Soyad"
                required
              />
              {errors.soyad && (
                <p className="text-sm text-destructive">{errors.soyad}</p>
              )}
            </div>
          </div>

          {/* Faaliyet */}
          <RichTextEditor
            id="faaliyet"
            label="Faaliyet"
            value={formData.faaliyet || ""}
            onChange={(value) => handleChange("faaliyet", value || null)}
            placeholder="Kişinin faaliyet alanı..."
            rows={3}
            error={errors.faaliyet}
          />

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pio"
                checked={formData.pio}
                onCheckedChange={(checked) => handleChange("pio", checked)}
              />
              <Label htmlFor="pio" className="cursor-pointer">
                PIO (Potansiyel İş Ortağı)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="asli"
                checked={formData.asli}
                onCheckedChange={(checked) => handleChange("asli", checked)}
              />
              <Label htmlFor="asli" className="cursor-pointer">
                Asli Kişi
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
        >
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isEditing ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </div>
  )

  if (inModal) {
    return <form onSubmit={handleSubmit}>{formContent}</form>
  }

  // Yeni kişi için Card'sız layout (3 sütunlu düzen kendi Card'larına sahip)
  if (!isEditing) {
    return <form onSubmit={handleSubmit}>{formContent}</form>
  }

  // Düzenleme modu için Card'lı layout
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Kişi Düzenle</CardTitle>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </form>
  )
}
