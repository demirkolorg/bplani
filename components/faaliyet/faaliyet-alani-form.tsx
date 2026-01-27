"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import {
  useCreateFaaliyetAlani,
  useUpdateFaaliyetAlani,
  useFaaliyetAlaniTree,
  type FaaliyetAlani,
} from "@/hooks/use-faaliyet-alani"
import { createFaaliyetAlaniSchema, type CreateFaaliyetAlaniInput } from "@/lib/validations"
import { useLocale } from "@/components/providers/locale-provider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface FaaliyetAlaniFormProps {
  initialData?: Partial<CreateFaaliyetAlaniInput> & { id?: string }
  defaultParentId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
}

// Flatten tree for selection
function flattenTree(
  items: FaaliyetAlani[],
  level = 0
): Array<FaaliyetAlani & { level: number }> {
  const result: Array<FaaliyetAlani & { level: number }> = []
  for (const item of items) {
    result.push({ ...item, level })
    if (item.children?.length) {
      result.push(...flattenTree(item.children, level + 1))
    }
  }
  return result
}

export function FaaliyetAlaniForm({
  initialData,
  defaultParentId,
  onSuccess,
  onCancel,
  inModal = false,
}: FaaliyetAlaniFormProps) {
  const router = useRouter()
  const { t } = useLocale()
  const createFaaliyetAlani = useCreateFaaliyetAlani()
  const updateFaaliyetAlani = useUpdateFaaliyetAlani()
  const { data: tree = [] } = useFaaliyetAlaniTree()

  const isEditing = !!initialData?.id

  const [formData, setFormData] = React.useState<CreateFaaliyetAlaniInput>({
    ad: initialData?.ad || "",
    parentId: initialData?.parentId ?? defaultParentId ?? null,
    sira: initialData?.sira ?? 0,
    isActive: initialData?.isActive ?? true,
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [parentOpen, setParentOpen] = React.useState(false)

  // Get flattened items excluding current item and its children (for editing)
  const flatItems = React.useMemo(() => {
    const flattened = flattenTree(tree)
    if (!isEditing || !initialData?.id) return flattened

    // Filter out current item and all its descendants
    const excludeIds = new Set<string>()
    const collectDescendants = (items: FaaliyetAlani[], parentId: string) => {
      for (const item of items) {
        if (item.id === parentId || excludeIds.has(item.parentId || "")) {
          excludeIds.add(item.id)
        }
        if (item.children?.length) {
          collectDescendants(item.children, parentId)
        }
      }
    }
    excludeIds.add(initialData.id)
    collectDescendants(tree, initialData.id)

    return flattened.filter((item) => !excludeIds.has(item.id))
  }, [tree, isEditing, initialData?.id])

  const selectedParent = flatItems.find((item) => item.id === formData.parentId)

  const handleChange = (field: keyof CreateFaaliyetAlaniInput, value: unknown) => {
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

    const result = createFaaliyetAlaniSchema.safeParse(formData)
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
        await updateFaaliyetAlani.mutateAsync({
          id: initialData.id,
          data: result.data,
        })
      } else {
        await createFaaliyetAlani.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/tanimlamalar")
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

  const isPending = createFaaliyetAlani.isPending || updateFaaliyetAlani.isPending

  const formContent = (
    <>
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ad">
          {t.faaliyet.faaliyetAlaniAdi} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ad"
          value={formData.ad}
          onChange={(e) => handleChange("ad", e.target.value)}
          placeholder={t.faaliyet.faaliyetAlaniAdiPlaceholder}
          required
        />
        {errors.ad && <p className="text-sm text-destructive">{errors.ad}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t.faaliyet.ustKategori}</Label>
        <Popover open={parentOpen} onOpenChange={setParentOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={parentOpen}
              className="w-full justify-between"
            >
              {selectedParent ? (
                <span className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  {selectedParent.ad}
                </span>
              ) : (
                <span className="text-muted-foreground">{t.faaliyet.rootLevel}</span>
              )}
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t.faaliyet.searchUstKategori} />
              <CommandList>
                <CommandEmpty>{t.faaliyet.categoryNotFound}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      handleChange("parentId", null)
                      setParentOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{t.faaliyet.rootLevel}</span>
                    </div>
                  </CommandItem>
                  {flatItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.ad}
                      onSelect={() => {
                        handleChange("parentId", item.id)
                        setParentOpen(false)
                      }}
                    >
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${item.level * 16}px` }}
                      >
                        {item._count.children > 0 ? (
                          <Folder className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span>{item.ad}</span>
                        {!item.isActive && (
                          <span className="text-xs text-muted-foreground">{t.faaliyet.inactive}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.parentId && (
          <p className="text-sm text-destructive">{errors.parentId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sira">{t.faaliyet.order}</Label>
          <Input
            id="sira"
            type="number"
            min={0}
            value={formData.sira}
            onChange={(e) => handleChange("sira", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          {errors.sira && <p className="text-sm text-destructive">{errors.sira}</p>}
        </div>

        <div className="space-y-2 flex items-end pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t.faaliyet.active}
            </Label>
          </div>
        </div>
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
          <CardTitle>
            {isEditing ? "Faaliyet Alanı Düzenle" : "Yeni Faaliyet Alanı"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">{formContent}</CardContent>
      </Card>
    </form>
  )
}
