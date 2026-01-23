"use client"

import * as React from "react"
import { Bell, Clock, Save, Loader2, Palette, Mail, Settings2 } from "lucide-react"

import { useAyarlar, useUpdateAyarlar } from "@/hooks/use-ayarlar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AyarlarPage() {
  const { data: ayarlar, isLoading } = useAyarlar()
  const updateAyarlar = useUpdateAyarlar()

  // Alarm ayarları
  const [alarmGunOnce1, setAlarmGunOnce1] = React.useState("")
  const [alarmGunOnce2, setAlarmGunOnce2] = React.useState("")

  // Takip ayarları
  const [takipSure, setTakipSure] = React.useState("")

  // Bildirim ayarları (henüz DB'de yok, UI için)
  const [emailBildirim, setEmailBildirim] = React.useState(false)
  const [browserBildirim, setBrowserBildirim] = React.useState(true)
  const [bildirimSikligi, setBildirimSikligi] = React.useState("60")

  // Görünüm ayarları (henüz DB'de yok, UI için)
  const [varsayilanTema, setVarsayilanTema] = React.useState("system")
  const [tabloYogunlugu, setTabloYogunlugu] = React.useState("compact")

  // Ayarlar yüklendiğinde formu doldur
  React.useEffect(() => {
    if (ayarlar) {
      setAlarmGunOnce1(ayarlar.alarm_gun_once_1?.value || "20")
      setAlarmGunOnce2(ayarlar.alarm_gun_once_2?.value || "15")
      setTakipSure(ayarlar.takip_varsayilan_sure?.value || "90")
    }
  }, [ayarlar])

  const handleSave = async () => {
    await updateAyarlar.mutateAsync({
      ayarlar: [
        { key: "alarm_gun_once_1", value: alarmGunOnce1 },
        { key: "alarm_gun_once_2", value: alarmGunOnce2 },
        { key: "takip_varsayilan_sure", value: takipSure },
      ],
    })
  }

  const hasChanges = ayarlar && (
    alarmGunOnce1 !== ayarlar.alarm_gun_once_1?.value ||
    alarmGunOnce2 !== ayarlar.alarm_gun_once_2?.value ||
    takipSure !== ayarlar.takip_varsayilan_sure?.value
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">Sistem ayarlarını yapılandırın</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || updateAyarlar.isPending}>
          {updateAyarlar.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Kaydet
        </Button>
      </div>

      <Tabs defaultValue="alarm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="alarm" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alarm</span>
          </TabsTrigger>
          <TabsTrigger value="takip" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Takip</span>
          </TabsTrigger>
          <TabsTrigger value="bildirim" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Bildirim</span>
          </TabsTrigger>
          <TabsTrigger value="gorunum" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Görünüm</span>
          </TabsTrigger>
        </TabsList>

        {/* Alarm Ayarları */}
        <TabsContent value="alarm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alarm Ayarları
              </CardTitle>
              <CardDescription>
                Takip bitiş alarmları için varsayılan gün sayılarını ayarlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alarm1">İlk Alarm (gün önce)</Label>
                  <Input
                    id="alarm1"
                    type="number"
                    min="1"
                    max="365"
                    value={alarmGunOnce1}
                    onChange={(e) => setAlarmGunOnce1(e.target.value)}
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Takip bitiş tarihinden kaç gün önce ilk alarm tetiklensin
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alarm2">İkinci Alarm (gün önce)</Label>
                  <Input
                    id="alarm2"
                    type="number"
                    min="1"
                    max="365"
                    value={alarmGunOnce2}
                    onChange={(e) => setAlarmGunOnce2(e.target.value)}
                    placeholder="15"
                  />
                  <p className="text-xs text-muted-foreground">
                    Takip bitiş tarihinden kaç gün önce ikinci alarm tetiklensin
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium mb-2">Mevcut Alarm Kuralları</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Bitiş tarihinden <strong className="text-foreground">{alarmGunOnce1 || "20"}</strong> gün önce ilk alarm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Bitiş tarihinden <strong className="text-foreground">{alarmGunOnce2 || "15"}</strong> gün önce ikinci alarm</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Takip Ayarları */}
        <TabsContent value="takip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Takip Ayarları
              </CardTitle>
              <CardDescription>
                Yeni takip oluşturma için varsayılan değerleri ayarlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-sm space-y-2">
                <Label htmlFor="takipSure">Varsayılan Takip Süresi (gün)</Label>
                <Input
                  id="takipSure"
                  type="number"
                  min="1"
                  max="365"
                  value={takipSure}
                  onChange={(e) => setTakipSure(e.target.value)}
                  placeholder="90"
                />
                <p className="text-xs text-muted-foreground">
                  Yeni takip oluşturulduğunda varsayılan süre (başlama tarihinden itibaren)
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium mb-2">Örnek Senaryo</p>
                <p className="text-sm text-muted-foreground">
                  Bugün oluşturulan bir takip, <strong className="text-foreground">{takipSure || "90"}</strong> gün sonra sona erecek.
                  İlk alarm <strong className="text-foreground">{Number(takipSure || 90) - Number(alarmGunOnce1 || 20)}</strong>. günde,
                  ikinci alarm <strong className="text-foreground">{Number(takipSure || 90) - Number(alarmGunOnce2 || 15)}</strong>. günde tetiklenecek.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bildirim Ayarları */}
        <TabsContent value="bildirim" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Bildirim Ayarları
              </CardTitle>
              <CardDescription>
                Bildirim tercihlerinizi yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-xs text-muted-foreground">
                    Alarm tetiklendiğinde e-posta gönder
                  </p>
                </div>
                <Switch
                  checked={emailBildirim}
                  onCheckedChange={setEmailBildirim}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tarayıcı Bildirimleri</Label>
                  <p className="text-xs text-muted-foreground">
                    Alarm tetiklendiğinde tarayıcı bildirimi göster
                  </p>
                </div>
                <Switch
                  checked={browserBildirim}
                  onCheckedChange={setBrowserBildirim}
                  disabled
                />
              </div>

              <div className="max-w-sm space-y-2">
                <Label>Bildirim Kontrol Sıklığı</Label>
                <Select value={bildirimSikligi} onValueChange={setBildirimSikligi} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 saniye</SelectItem>
                    <SelectItem value="60">1 dakika</SelectItem>
                    <SelectItem value="300">5 dakika</SelectItem>
                    <SelectItem value="600">10 dakika</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Yeni bildirimlerin ne sıklıkta kontrol edileceği
                </p>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Bildirim ayarları yakında aktif olacak.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Görünüm Ayarları */}
        <TabsContent value="gorunum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Görünüm Ayarları
              </CardTitle>
              <CardDescription>
                Uygulama görünümünü özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-sm space-y-2">
                <Label>Varsayılan Tema</Label>
                <Select value={varsayilanTema} onValueChange={setVarsayilanTema} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Açık</SelectItem>
                    <SelectItem value="dark">Koyu</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Uygulama açıldığında kullanılacak tema
                </p>
              </div>

              <div className="max-w-sm space-y-2">
                <Label>Tablo Yoğunluğu</Label>
                <Select value={tabloYogunlugu} onValueChange={setTabloYogunlugu} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Sıkışık</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="wide">Geniş</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tablolardaki satır yüksekliği
                </p>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Görünüm ayarları yakında aktif olacak.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
