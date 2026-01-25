"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCreateMarka, useUpdateMarka } from "@/hooks/use-araclar"
import { useLocale } from "@/components/providers/locale-provider"
import { createMarkaSchema, type CreateMarkaInput } from "@/lib/validations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MarkaFormProps {
  initialData?: Partial<CreateMarkaInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
}

export function MarkaForm({ initialData, onSuccess, onCancel, inModal = false }: MarkaFormProps) {
  const { t } = useLocale()
  const router = useRouter()
  const createMarka = useCreateMarka()
  const updateMarka = useUpdateMarka()

  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState<CreateMarkaInput>({
    ad: initialData?.ad || "",
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: keyof CreateMarkaInput, value: string) => {
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

    const result = createMarkaSchema.safeParse(formData)
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
        await updateMarka.mutateAsync({
          id: initialData.id,
          data: result.data,
        })
      } else {
        await createMarka.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/marka-model/markalar")
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

  const isPending = createMarka.isPending || updateMarka.isPending

  const formContent = (
    <>
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ad">
          {t.araclar.markaAdi} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ad"
          value={formData.ad}
          onChange={(e) => handleChange("ad", e.target.value)}
          placeholder={t.araclar.markaAdi}
          required
        />
        {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
        >
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isEditing ? t.common.update : t.common.create}
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
          <CardTitle>{isEditing ? t.araclar.editMarka : t.araclar.newMarka}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </form>
  )
}
