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
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"

export default function AyarlarPage() {
  const { t } = useLocale()
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
          <span className="ml-2">{t.ayarlar.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.ayarlar.pageTitle}</h1>
          <p className="text-muted-foreground">{t.ayarlar.pageDescription}</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || updateAyarlar.isPending}>
          {updateAyarlar.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t.ayarlar.save}
        </Button>
      </div>

      <Tabs defaultValue="alarm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="alarm" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t.ayarlar.alarmTab}</span>
          </TabsTrigger>
          <TabsTrigger value="takip" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{t.ayarlar.takipTab}</span>
          </TabsTrigger>
          <TabsTrigger value="bildirim" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{t.ayarlar.bildirimTab}</span>
          </TabsTrigger>
          <TabsTrigger value="gorunum" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">{t.ayarlar.gorunumTab}</span>
          </TabsTrigger>
        </TabsList>

        {/* Alarm Ayarları */}
        <TabsContent value="alarm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.ayarlar.alarmTitle}
              </CardTitle>
              <CardDescription>
                {t.ayarlar.alarmDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alarm1">{t.ayarlar.firstAlarm}</Label>
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
                    {t.ayarlar.firstAlarmDesc}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alarm2">{t.ayarlar.secondAlarm}</Label>
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
                    {t.ayarlar.secondAlarmDesc}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium mb-2">{t.ayarlar.currentRules}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>{interpolate(t.ayarlar.beforeEndDate1, { days: alarmGunOnce1 || "20" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>{interpolate(t.ayarlar.beforeEndDate2, { days: alarmGunOnce2 || "15" })}</span>
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
                {t.ayarlar.takipTitle}
              </CardTitle>
              <CardDescription>
                {t.ayarlar.takipDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-sm space-y-2">
                <Label htmlFor="takipSure">{t.ayarlar.defaultDuration}</Label>
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
                  {t.ayarlar.defaultDurationDesc}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium mb-2">{t.ayarlar.exampleScenario}</p>
                <p className="text-sm text-muted-foreground">
                  {interpolate(t.ayarlar.exampleScenarioText, {
                    duration: takipSure || "90",
                    alarm1: Number(takipSure || 90) - Number(alarmGunOnce1 || 20),
                    alarm2: Number(takipSure || 90) - Number(alarmGunOnce2 || 15),
                  })}
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
                {t.ayarlar.notificationTitle}
              </CardTitle>
              <CardDescription>
                {t.ayarlar.notificationDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.ayarlar.emailNotifications}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t.ayarlar.emailNotificationsDesc}
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
                  <Label>{t.ayarlar.browserNotifications}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t.ayarlar.browserNotificationsDesc}
                  </p>
                </div>
                <Switch
                  checked={browserBildirim}
                  onCheckedChange={setBrowserBildirim}
                  disabled
                />
              </div>

              <div className="max-w-sm space-y-2">
                <Label>{t.ayarlar.checkFrequency}</Label>
                <Select value={bildirimSikligi} onValueChange={setBildirimSikligi} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t.ayarlar.seconds30}</SelectItem>
                    <SelectItem value="60">{t.ayarlar.minute1}</SelectItem>
                    <SelectItem value="300">{t.ayarlar.minutes5}</SelectItem>
                    <SelectItem value="600">{t.ayarlar.minutes10}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.ayarlar.checkFrequencyDesc}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  {t.ayarlar.notificationComingSoon}
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
                {t.ayarlar.appearanceTitle}
              </CardTitle>
              <CardDescription>
                {t.ayarlar.appearanceDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-sm space-y-2">
                <Label>{t.ayarlar.defaultTheme}</Label>
                <Select value={varsayilanTema} onValueChange={setVarsayilanTema} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t.ayarlar.themeLight}</SelectItem>
                    <SelectItem value="dark">{t.ayarlar.themeDark}</SelectItem>
                    <SelectItem value="system">{t.ayarlar.themeSystem}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.ayarlar.defaultThemeDesc}
                </p>
              </div>

              <div className="max-w-sm space-y-2">
                <Label>{t.ayarlar.tableDensity}</Label>
                <Select value={tabloYogunlugu} onValueChange={setTabloYogunlugu} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">{t.ayarlar.densityCompact}</SelectItem>
                    <SelectItem value="normal">{t.ayarlar.densityNormal}</SelectItem>
                    <SelectItem value="wide">{t.ayarlar.densityWide}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.ayarlar.tableDensityDesc}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  {t.ayarlar.appearanceComingSoon}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
