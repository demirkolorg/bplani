"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { useCreateModel, useUpdateModel, useMarkalar } from "@/hooks/use-araclar"
import { createModelSchema, type CreateModelInput } from "@/lib/validations"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ModelFormProps {
  initialData?: Partial<CreateModelInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
  defaultMarkaId?: string
}

export function ModelForm({ initialData, onSuccess, onCancel, inModal = false, defaultMarkaId }: ModelFormProps) {
  const router = useRouter()
  const createModel = useCreateModel()
  const updateModel = useUpdateModel()
  const { data: markalar, isLoading: isLoadingMarkalar } = useMarkalar()

  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState<CreateModelInput>({
    ad: initialData?.ad || "",
    markaId: initialData?.markaId || defaultMarkaId || "",
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [markaOpen, setMarkaOpen] = React.useState(false)

  const handleChange = (field: keyof CreateModelInput, value: unknown) => {
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

    const result = createModelSchema.safeParse(formData)
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
        await updateModel.mutateAsync({
          id: initialData.id,
          data: { ad: result.data.ad },
        })
      } else {
        await createModel.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/marka-model/modeller")
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

  const isPending = createModel.isPending || updateModel.isPending

  const selectedMarka = markalar?.find((marka) => marka.id === formData.markaId)

  const formContent = (
    <>
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="markaId">
            Marka <span className="text-destructive">*</span>
          </Label>
          <Popover open={markaOpen} onOpenChange={setMarkaOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={markaOpen}
                className="w-full justify-between"
                disabled={isEditing || isLoadingMarkalar}
              >
                {selectedMarka ? selectedMarka.ad : "Marka seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Marka ara..." />
                <CommandList>
                  <CommandEmpty>Marka bulunamadı.</CommandEmpty>
                  <CommandGroup>
                    {markalar?.map((marka) => (
                      <CommandItem
                        key={marka.id}
                        value={marka.ad}
                        onSelect={() => {
                          handleChange("markaId", marka.id)
                          setMarkaOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.markaId === marka.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {marka.ad}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.markaId && <p className="text-sm text-destructive">{errors.markaId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ad">
            Model Adı <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ad"
            value={formData.ad}
            onChange={(e) => handleChange("ad", e.target.value)}
            placeholder="Model adı"
            required
          />
          {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
        </div>
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
          <CardTitle>{isEditing ? "Model Düzenle" : "Yeni Model"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </form>
  )
}
