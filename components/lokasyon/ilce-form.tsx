"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { useCreateIlce, useUpdateIlce, useIller } from "@/hooks/use-lokasyon"
import { createIlceSchema, type CreateIlceInput } from "@/lib/validations"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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

interface IlceFormProps {
  initialData?: Partial<CreateIlceInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
  defaultIlId?: string
}

export function IlceForm({ initialData, onSuccess, onCancel, inModal = false, defaultIlId }: IlceFormProps) {
  const router = useRouter()
  const createIlce = useCreateIlce()
  const updateIlce = useUpdateIlce()
  const { data: iller, isLoading: isLoadingIller } = useIller()

  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState<CreateIlceInput>({
    ad: initialData?.ad || "",
    ilId: initialData?.ilId || defaultIlId || "",
    isActive: initialData?.isActive ?? true,
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [ilOpen, setIlOpen] = React.useState(false)

  const handleChange = (field: keyof CreateIlceInput, value: unknown) => {
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

    const result = createIlceSchema.safeParse(formData)
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
        await updateIlce.mutateAsync({
          id: initialData.id,
          data: { ad: result.data.ad, isActive: result.data.isActive },
        })
      } else {
        await createIlce.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/lokasyonlar/ilceler")
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

  const isPending = createIlce.isPending || updateIlce.isPending

  const selectedIl = iller?.find((il) => il.id === formData.ilId)

  const formContent = (
    <>
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ilId">
            İl <span className="text-destructive">*</span>
          </Label>
          <Popover open={ilOpen} onOpenChange={setIlOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={ilOpen}
                className="w-full justify-between"
                disabled={isEditing || isLoadingIller}
              >
                {selectedIl
                  ? `${selectedIl.plaka ? `${selectedIl.plaka} - ` : ""}${selectedIl.ad}`
                  : "İl seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="İl ara..." />
                <CommandList>
                  <CommandEmpty>İl bulunamadı.</CommandEmpty>
                  <CommandGroup>
                    {iller?.map((il) => (
                      <CommandItem
                        key={il.id}
                        value={il.ad}
                        onSelect={() => {
                          handleChange("ilId", il.id)
                          setIlOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.ilId === il.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {il.plaka ? `${il.plaka} - ` : ""}{il.ad}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.ilId && <p className="text-sm text-destructive">{errors.ilId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ad">
            İlçe Adı <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ad"
            value={formData.ad}
            onChange={(e) => handleChange("ad", e.target.value)}
            placeholder="İlçe adı"
            required
          />
          {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
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
          <CardTitle>{isEditing ? "İlçe Düzenle" : "Yeni İlçe"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </form>
  )
}
