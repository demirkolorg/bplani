"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, parse, isValid } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useCreateTakip, useUpdateTakip } from "@/hooks/use-takip"
import { useAllGsmler } from "@/hooks/use-gsm"
import { createTakipSchema, takipDurumLabels, type TakipDurum } from "@/lib/validations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GsmSelector } from "@/components/shared/gsm-selector"

interface TakipFormProps {
  initialData?: {
    id?: string
    gsmId?: string
    baslamaTarihi?: string
    bitisTarihi?: string
    durum?: TakipDurum
  }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
}

export function TakipForm({ initialData, onSuccess, onCancel, inModal }: TakipFormProps) {
  const router = useRouter()
  const createTakip = useCreateTakip()
  const updateTakip = useUpdateTakip()
  const { data: gsmler, isLoading: gsmlerLoading } = useAllGsmler()

  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState({
    gsmId: initialData?.gsmId || "",
    baslamaTarihi: initialData?.baslamaTarihi
      ? new Date(initialData.baslamaTarihi)
      : new Date(),
    bitisTarihi: initialData?.bitisTarihi
      ? new Date(initialData.bitisTarihi)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    durum: initialData?.durum || ("UZATILACAK" as TakipDurum),
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  // Başlama tarihi değiştiğinde bitiş tarihini +90 gün olarak güncelle
  const handleBaslamaTarihiChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      baslamaTarihi: date,
      bitisTarihi: new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000),
    }))
    if (errors.baslamaTarihi) {
      setErrors((prev) => {
        const { baslamaTarihi: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Prepare data for validation
    const dataToValidate = {
      gsmId: formData.gsmId,
      baslamaTarihi: formData.baslamaTarihi,
      bitisTarihi: formData.bitisTarihi,
      durum: formData.durum,
    }

    // Validate
    const result = createTakipSchema.safeParse(dataToValidate)
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
        await updateTakip.mutateAsync({
          id: initialData.id,
          data: {
            baslamaTarihi: result.data.baslamaTarihi,
            bitisTarihi: result.data.bitisTarihi,
            durum: result.data.durum,
          },
        })
      } else {
        await createTakip.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/takipler")
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

  const isPending = createTakip.isPending || updateTakip.isPending

  const formContent = (
    <div className="space-y-6">
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      {/* GSM Seçimi */}
      {!isEditing && (
        <div className="space-y-2">
          <Label>
            GSM <span className="text-destructive">*</span>
          </Label>
          <GsmSelector
            value={formData.gsmId}
            onChange={(value) => handleChange("gsmId", value)}
            gsmler={gsmler || []}
            isLoading={gsmlerLoading}
            placeholder="GSM numarası seçin..."
          />
          {errors.gsmId && <p className="text-sm text-destructive">{errors.gsmId}</p>}
        </div>
      )}

      {/* Tarihler */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Başlama Tarihi</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="GG.AA.YYYY"
              value={format(formData.baslamaTarihi, "dd.MM.yyyy")}
              onChange={(e) => {
                const parsed = parse(e.target.value, "dd.MM.yyyy", new Date())
                if (isValid(parsed)) {
                  handleBaslamaTarihiChange(parsed)
                }
              }}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" type="button">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={formData.baslamaTarihi}
                  onSelect={(date) => date && handleBaslamaTarihiChange(date)}
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.baslamaTarihi && (
            <p className="text-sm text-destructive">{errors.baslamaTarihi}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Bitiş Tarihi</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="GG.AA.YYYY"
              value={format(formData.bitisTarihi, "dd.MM.yyyy")}
              onChange={(e) => {
                const parsed = parse(e.target.value, "dd.MM.yyyy", new Date())
                if (isValid(parsed)) {
                  handleChange("bitisTarihi", parsed)
                }
              }}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" type="button">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={formData.bitisTarihi}
                  onSelect={(date) => date && handleChange("bitisTarihi", date)}
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.bitisTarihi && (
            <p className="text-sm text-destructive">{errors.bitisTarihi}</p>
          )}
        </div>
      </div>

      {/* Durum */}
      <div className="space-y-2">
        <Label htmlFor="durum">Durum</Label>
        <Select
          value={formData.durum}
          onValueChange={(value) => handleChange("durum", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(takipDurumLabels) as TakipDurum[]).map((durum) => (
              <SelectItem key={durum} value={durum}>
                {takipDurumLabels[durum]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.durum && <p className="text-sm text-destructive">{errors.durum}</p>}
      </div>

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

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Takip Düzenle" : "Yeni Takip"}</CardTitle>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </form>
  )
}
