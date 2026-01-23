"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, X, Plus } from "lucide-react"
import { useCreateArac, useUpdateArac } from "@/hooks/use-araclar-vehicles"
import { useMarkalar, useModeller, useCreateMarka, useCreateModel } from "@/hooks/use-araclar"
import { useKisiler } from "@/hooks/use-kisiler"
import { createAracSchema, aracRenkLabels, type CreateAracInput, type AracRenk } from "@/lib/validations"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AracFormProps {
  initialData?: Partial<CreateAracInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
  inModal?: boolean
  defaultKisiId?: string
}

// Renk seçenekleri
const renkOptions = Object.entries(aracRenkLabels) as [AracRenk, string][]

export function AracForm({ initialData, onSuccess, onCancel, inModal = false, defaultKisiId }: AracFormProps) {
  const router = useRouter()
  const createArac = useCreateArac()
  const updateArac = useUpdateArac()
  const createMarka = useCreateMarka()
  const createModel = useCreateModel()
  const { data: markalar, isLoading: isLoadingMarkalar } = useMarkalar()
  const { data: kisilerData, isLoading: isLoadingKisiler } = useKisiler({ limit: 100 })

  const isEditing = !!initialData?.id

  // Find initial marka from model
  const initialMarka = React.useMemo(() => {
    if (!initialData?.modelId || !markalar) return ""
    return ""
  }, [initialData?.modelId, markalar])

  const [selectedMarkaId, setSelectedMarkaId] = React.useState(initialMarka)
  const { data: modeller, isLoading: isLoadingModeller } = useModeller(selectedMarkaId || undefined)

  const [formData, setFormData] = React.useState<CreateAracInput>({
    modelId: initialData?.modelId || "",
    renk: initialData?.renk || null,
    plaka: initialData?.plaka || "",
    kisiIds: initialData?.kisiIds || (defaultKisiId ? [defaultKisiId] : []),
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [markaOpen, setMarkaOpen] = React.useState(false)
  const [modelOpen, setModelOpen] = React.useState(false)
  const [kisiOpen, setKisiOpen] = React.useState(false)

  // Inline creation modals
  const [newMarkaModalOpen, setNewMarkaModalOpen] = React.useState(false)
  const [newModelModalOpen, setNewModelModalOpen] = React.useState(false)
  const [newMarkaAd, setNewMarkaAd] = React.useState("")
  const [newModelAd, setNewModelAd] = React.useState("")

  // Set initial marka when models load (for editing)
  React.useEffect(() => {
    if (initialData?.modelId && modeller) {
      const model = modeller.find(m => m.id === initialData.modelId)
      if (model) {
        setSelectedMarkaId(model.markaId)
      }
    }
  }, [initialData?.modelId, modeller])

  // Load all models to find initial marka
  const { data: allModeller } = useModeller()
  React.useEffect(() => {
    if (initialData?.modelId && allModeller && !selectedMarkaId) {
      const model = allModeller.find(m => m.id === initialData.modelId)
      if (model) {
        setSelectedMarkaId(model.markaId)
      }
    }
  }, [initialData?.modelId, allModeller, selectedMarkaId])

  const handleChange = (field: keyof CreateAracInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleMarkaChange = (markaId: string) => {
    setSelectedMarkaId(markaId)
    // Reset model when marka changes
    handleChange("modelId", "")
  }

  const handleKisiToggle = (kisiId: string) => {
    const currentIds = formData.kisiIds || []
    if (currentIds.includes(kisiId)) {
      handleChange("kisiIds", currentIds.filter(id => id !== kisiId))
    } else {
      handleChange("kisiIds", [...currentIds, kisiId])
    }
  }

  const handleCreateMarka = async () => {
    if (!newMarkaAd.trim()) return

    try {
      const newMarka = await createMarka.mutateAsync({ ad: newMarkaAd.trim() })
      setSelectedMarkaId(newMarka.id)
      setNewMarkaAd("")
      setNewMarkaModalOpen(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCreateModel = async () => {
    if (!newModelAd.trim() || !selectedMarkaId) return

    try {
      const newModel = await createModel.mutateAsync({
        ad: newModelAd.trim(),
        markaId: selectedMarkaId,
      })
      handleChange("modelId", newModel.id)
      setNewModelAd("")
      setNewModelModalOpen(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = createAracSchema.safeParse(formData)
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
        await updateArac.mutateAsync({
          id: initialData.id,
          data: result.data,
        })
      } else {
        await createArac.mutateAsync(result.data)
      }

      onSuccess?.()
      if (!inModal) {
        router.push("/araclar")
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

  const isPending = createArac.isPending || updateArac.isPending

  const selectedMarka = markalar?.find((marka) => marka.id === selectedMarkaId)
  const selectedModel = modeller?.find((model) => model.id === formData.modelId)
  const selectedKisiler = kisilerData?.data.filter(k => formData.kisiIds?.includes(k.id)) || []

  const formContent = (
    <>
      {errors.submit && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Marka Selection with + button */}
        <div className="space-y-2">
          <Label htmlFor="markaId">
            Marka <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Popover open={markaOpen} onOpenChange={setMarkaOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={markaOpen}
                  className="flex-1 justify-between"
                  disabled={isLoadingMarkalar}
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
                            handleMarkaChange(marka.id)
                            setMarkaOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMarkaId === marka.id ? "opacity-100" : "opacity-0"
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
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setNewMarkaModalOpen(true)}
              title="Yeni Marka Ekle"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Model Selection with + button */}
        <div className="space-y-2">
          <Label htmlFor="modelId">
            Model <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Popover open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={modelOpen}
                  className="flex-1 justify-between"
                  disabled={!selectedMarkaId || isLoadingModeller}
                >
                  {selectedModel ? selectedModel.ad : "Model seçin..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Model ara..." />
                  <CommandList>
                    <CommandEmpty>Model bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {modeller?.map((model) => (
                        <CommandItem
                          key={model.id}
                          value={model.ad}
                          onSelect={() => {
                            handleChange("modelId", model.id)
                            setModelOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.modelId === model.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {model.ad}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setNewModelModalOpen(true)}
              disabled={!selectedMarkaId}
              title="Yeni Model Ekle"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.modelId && <p className="text-sm text-destructive">{errors.modelId}</p>}
        </div>

        {/* Plaka */}
        <div className="space-y-2">
          <Label htmlFor="plaka">
            Plaka <span className="text-destructive">*</span>
          </Label>
          <Input
            id="plaka"
            value={formData.plaka}
            onChange={(e) => handleChange("plaka", e.target.value.toUpperCase())}
            placeholder="34 ABC 123"
            required
          />
          {errors.plaka && <p className="text-sm text-destructive">{errors.plaka}</p>}
        </div>

        {/* Renk - Select */}
        <div className="space-y-2">
          <Label htmlFor="renk">Renk</Label>
          <Select
            value={formData.renk || ""}
            onValueChange={(value) => handleChange("renk", value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Renk seçin..." />
            </SelectTrigger>
            <SelectContent>
              {renkOptions.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.renk && <p className="text-sm text-destructive">{errors.renk}</p>}
        </div>
      </div>

      {/* Kişi Selection */}
      <div className="space-y-2">
        <Label>Kişiler</Label>
        <Popover open={kisiOpen} onOpenChange={setKisiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={kisiOpen}
              className="w-full justify-between"
              disabled={isLoadingKisiler}
            >
              {selectedKisiler.length > 0
                ? `${selectedKisiler.length} kişi seçildi`
                : "Kişi seçin..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Kişi ara..." />
              <CommandList>
                <CommandEmpty>Kişi bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {kisilerData?.data.map((kisi) => (
                    <CommandItem
                      key={kisi.id}
                      value={`${kisi.ad} ${kisi.soyad}`}
                      onSelect={() => handleKisiToggle(kisi.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.kisiIds?.includes(kisi.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{kisi.ad} {kisi.soyad}</span>
                      {kisi.tc && (
                        <span className="text-muted-foreground text-sm ml-2">
                          ({kisi.tc})
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto",
                          kisi.tip === "MUSTERI"
                            ? "bg-green-50 text-green-700 border-green-300"
                            : "bg-amber-50 text-amber-700 border-amber-300"
                        )}
                      >
                        {kisi.tip === "MUSTERI" ? "Müşteri" : "Aday"}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Kişiler */}
        {selectedKisiler.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedKisiler.map((kisi) => (
              <Badge
                key={kisi.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleKisiToggle(kisi.id)}
              >
                {kisi.ad} {kisi.soyad}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
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

      {/* New Marka Modal */}
      <Dialog open={newMarkaModalOpen} onOpenChange={setNewMarkaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Marka</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newMarkaAd">Marka Adı</Label>
              <Input
                id="newMarkaAd"
                value={newMarkaAd}
                onChange={(e) => setNewMarkaAd(e.target.value)}
                placeholder="Örn: Toyota, Ford, BMW"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCreateMarka()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewMarkaAd("")
                  setNewMarkaModalOpen(false)
                }}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={handleCreateMarka}
                disabled={!newMarkaAd.trim() || createMarka.isPending}
              >
                {createMarka.isPending ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Model Modal */}
      <Dialog open={newModelModalOpen} onOpenChange={setNewModelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Marka</Label>
              <Input
                value={selectedMarka?.ad || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newModelAd">Model Adı</Label>
              <Input
                id="newModelAd"
                value={newModelAd}
                onChange={(e) => setNewModelAd(e.target.value)}
                placeholder="Örn: Corolla, Focus, 320i"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCreateModel()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewModelAd("")
                  setNewModelModalOpen(false)
                }}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={handleCreateModel}
                disabled={!newModelAd.trim() || createModel.isPending}
              >
                {createModel.isPending ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
          <CardTitle>{isEditing ? "Araç Düzenle" : "Yeni Araç"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </form>
  )
}
