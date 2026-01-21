"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCreateIl, useUpdateIl } from "@/hooks/use-lokasyon"
import { createIlSchema, type CreateIlInput } from "@/lib/validations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IlFormProps {
  initialData?: Partial<CreateIlInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
}

export function IlForm({ initialData, onSuccess, onCancel, inModal = false }: IlFormProps) {
  const router = useRouter()
  const createIl = useCreateIl()
  const updateIl = useUpdateIl()

  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState<CreateIlInput>({
    ad: initialData?.ad || "",
    plaka: initialData?.plaka ?? null,
    isActive: initialData?.isActive ?? true,
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: keyof CreateIlInput, value: unknown) => {
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

    const result = createIlSchema.safeParse(formData)
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
        await updateIl.mutateAsync({
          id: initialData.id,
          data: result.data,
        })
      } else {
        await createIl.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/lokasyonlar/iller")
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

  const isPending = createIl.isPending || updateIl.isPending

  const formContent = (
    <>
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ad">
            İl Adı <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ad"
            value={formData.ad}
            onChange={(e) => handleChange("ad", e.target.value)}
            placeholder="İl adı"
            required
          />
          {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="plaka">Plaka Kodu</Label>
          <Input
            id="plaka"
            type="number"
            min={1}
            max={81}
            value={formData.plaka ?? ""}
            onChange={(e) => handleChange("plaka", e.target.value ? parseInt(e.target.value) : null)}
            placeholder="1-81"
          />
          {errors.plaka && <p className="text-sm text-destructive">{errors.plaka}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleChange("isActive", checked)}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Aktif
        </Label>
      </div>

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
    </>
  )

  if (inModal) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {formContent}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "İl Düzenle" : "Yeni İl"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </form>
  )
}
