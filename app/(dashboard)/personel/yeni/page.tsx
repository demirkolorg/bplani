"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreatePersonel } from "@/hooks/use-personel"
import { personelRolLabels, personelRolValues, type PersonelRol } from "@/lib/validations"

export default function YeniPersonelPage() {
  const router = useRouter()
  const createPersonel = useCreatePersonel()

  const [formData, setFormData] = React.useState({
    visibleId: "",
    ad: "",
    soyad: "",
    parola: "",
    rol: "PERSONEL" as PersonelRol,
    fotograf: "",
    isActive: true,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.visibleId) {
      newErrors.visibleId = "Kullanıcı ID zorunludur"
    } else if (!/^\d{6}$/.test(formData.visibleId)) {
      newErrors.visibleId = "Kullanıcı ID 6 haneli rakam olmalıdır"
    }

    if (!formData.ad) {
      newErrors.ad = "Ad zorunludur"
    }
    if (!formData.soyad) {
      newErrors.soyad = "Soyad zorunludur"
    }
    if (!formData.parola) {
      newErrors.parola = "Şifre zorunludur"
    } else if (formData.parola.length < 6) {
      newErrors.parola = "Şifre en az 6 karakter olmalıdır"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await createPersonel.mutateAsync({
        visibleId: formData.visibleId,
        ad: formData.ad,
        soyad: formData.soyad,
        parola: formData.parola,
        rol: formData.rol,
        fotograf: formData.fotograf || null,
        isActive: formData.isActive,
      })
      router.push("/personel")
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Personel oluşturulamadı",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/personel">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Personel</h1>
          <p className="text-muted-foreground">Yeni bir sistem kullanıcısı oluşturun</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personel Bilgileri</CardTitle>
          <CardDescription>
            Yeni personel için gerekli bilgileri girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="visibleId">Kullanıcı ID (6 haneli)</Label>
              <Input
                id="visibleId"
                value={formData.visibleId}
                onChange={(e) => handleChange("visibleId", e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="font-mono max-w-[200px]"
              />
              {errors.visibleId && (
                <p className="text-sm text-destructive">{errors.visibleId}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad">Ad</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => handleChange("ad", e.target.value)}
                  placeholder="Ad"
                />
                {errors.ad && (
                  <p className="text-sm text-destructive">{errors.ad}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="soyad">Soyad</Label>
                <Input
                  id="soyad"
                  value={formData.soyad}
                  onChange={(e) => handleChange("soyad", e.target.value)}
                  placeholder="Soyad"
                />
                {errors.soyad && (
                  <p className="text-sm text-destructive">{errors.soyad}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parola">Şifre</Label>
              <Input
                id="parola"
                type="password"
                value={formData.parola}
                onChange={(e) => handleChange("parola", e.target.value)}
                placeholder="En az 6 karakter"
                className="max-w-[300px]"
              />
              {errors.parola && (
                <p className="text-sm text-destructive">{errors.parola}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => handleChange("rol", value)}
              >
                <SelectTrigger className="max-w-[200px]">
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personelRolValues.map((rol) => (
                    <SelectItem key={rol} value={rol}>
                      {personelRolLabels[rol]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fotograf">Fotoğraf URL (opsiyonel)</Label>
              <Input
                id="fotograf"
                value={formData.fotograf}
                onChange={(e) => handleChange("fotograf", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Aktif Hesap</Label>
                <p className="text-sm text-muted-foreground">
                  Pasif hesaplar sisteme giriş yapamaz
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/personel")}
                disabled={createPersonel.isPending}
              >
                İptal
              </Button>
              <Button type="submit" disabled={createPersonel.isPending}>
                {createPersonel.isPending ? "Oluşturuluyor..." : "Personel Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
