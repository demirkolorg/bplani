"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { useCreateMahalle, useUpdateMahalle, useIller, useIlceler } from "@/hooks/use-lokasyon"
import { useLocale } from "@/components/providers/locale-provider"
import { createMahalleSchema, type CreateMahalleInput } from "@/lib/validations"
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

interface MahalleFormProps {
  initialData?: Partial<CreateMahalleInput> & { id?: string; ilId?: string }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
  defaultIlId?: string
  defaultIlceId?: string
}

export function MahalleForm({
  initialData,
  onSuccess,
  onCancel,
  inModal = false,
  defaultIlId,
  defaultIlceId,
}: MahalleFormProps) {
  const { t } = useLocale()
  const router = useRouter()
  const createMahalle = useCreateMahalle()
  const updateMahalle = useUpdateMahalle()
  const { data: iller, isLoading: isLoadingIller } = useIller()

  const isEditing = !!initialData?.id

  const [selectedIlId, setSelectedIlId] = React.useState<string>(
    initialData?.ilId || defaultIlId || ""
  )

  const { data: ilceler, isLoading: isLoadingIlceler } = useIlceler(selectedIlId || undefined)

  const [formData, setFormData] = React.useState<CreateMahalleInput>({
    ad: initialData?.ad || "",
    ilceId: initialData?.ilceId || defaultIlceId || "",
    isActive: initialData?.isActive ?? true,
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [ilOpen, setIlOpen] = React.useState(false)
  const [ilceOpen, setIlceOpen] = React.useState(false)

  const handleChange = (field: keyof CreateMahalleInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleIlChange = (ilId: string) => {
    setSelectedIlId(ilId)
    handleChange("ilceId", "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = createMahalleSchema.safeParse(formData)
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
        await updateMahalle.mutateAsync({
          id: initialData.id,
          data: { ad: result.data.ad, isActive: result.data.isActive },
        })
      } else {
        await createMahalle.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/lokasyonlar/mahalleler")
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

  const isPending = createMahalle.isPending || updateMahalle.isPending

  const selectedIl = iller?.find((il) => il.id === selectedIlId)
  const selectedIlce = ilceler?.find((ilce) => ilce.id === formData.ilceId)

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
            {t.lokasyon.il} <span className="text-destructive">*</span>
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
                  : t.lokasyon.selectIl}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={t.lokasyon.searchIl} />
                <CommandList>
                  <CommandEmpty>{t.lokasyon.ilNotFound}</CommandEmpty>
                  <CommandGroup>
                    {iller?.map((il) => (
                      <CommandItem
                        key={il.id}
                        value={il.ad}
                        onSelect={() => {
                          handleIlChange(il.id)
                          setIlOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIlId === il.id ? "opacity-100" : "opacity-0"
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="ilceId">
            {t.lokasyon.ilce} <span className="text-destructive">*</span>
          </Label>
          <Popover open={ilceOpen} onOpenChange={setIlceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={ilceOpen}
                className="w-full justify-between"
                disabled={isEditing || !selectedIlId || isLoadingIlceler}
              >
                {selectedIlce ? selectedIlce.ad : t.lokasyon.selectIlce}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={t.lokasyon.searchIlce} />
                <CommandList>
                  <CommandEmpty>{t.lokasyon.ilceNotFound}</CommandEmpty>
                  <CommandGroup>
                    {ilceler?.map((ilce) => (
                      <CommandItem
                        key={ilce.id}
                        value={ilce.ad}
                        onSelect={() => {
                          handleChange("ilceId", ilce.id)
                          setIlceOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.ilceId === ilce.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {ilce.ad}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.ilceId && <p className="text-sm text-destructive">{errors.ilceId}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad">
          {t.lokasyon.mahalleAdi} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ad"
          value={formData.ad}
          onChange={(e) => handleChange("ad", e.target.value)}
          placeholder={t.lokasyon.mahalleAdi}
          required
        />
        {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleChange("isActive", checked)}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          {t.common.active}
        </Label>
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
          <CardTitle>{isEditing ? t.lokasyon.editMahalle : t.lokasyon.newMahalle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </form>
  )
}
