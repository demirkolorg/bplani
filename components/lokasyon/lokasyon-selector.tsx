"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useIller, useIlceler, useMahalleler } from "@/hooks/use-lokasyon"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface LokasyonSelectorProps {
  value?: {
    ilId?: string
    ilceId?: string
    mahalleId?: string
  }
  onChange?: (value: { ilId?: string; ilceId?: string; mahalleId?: string }) => void
  error?: {
    il?: string
    ilce?: string
    mahalle?: string
  }
  disabled?: boolean
  required?: boolean
  className?: string
  defaultIlPlaka?: number // Varsayılan il plaka kodu (örn: 65 için Van)
  compact?: boolean // Dikey düzen için kompakt mod
}

// Van'ın plaka kodu
const DEFAULT_IL_PLAKA = 65

export function LokasyonSelector({
  value,
  onChange,
  error,
  disabled,
  required,
  className,
  defaultIlPlaka = DEFAULT_IL_PLAKA,
  compact = false,
}: LokasyonSelectorProps) {
  const { t } = useLocale()
  const [selectedIlId, setSelectedIlId] = React.useState(value?.ilId || "")
  const [selectedIlceId, setSelectedIlceId] = React.useState(value?.ilceId || "")
  const [selectedMahalleId, setSelectedMahalleId] = React.useState(value?.mahalleId || "")

  const [ilOpen, setIlOpen] = React.useState(false)
  const [ilceOpen, setIlceOpen] = React.useState(false)
  const [mahalleOpen, setMahalleOpen] = React.useState(false)

  const { data: iller, isLoading: illerLoading } = useIller()
  const { data: ilceler, isLoading: ilcelerLoading } = useIlceler(selectedIlId || undefined)
  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler(
    selectedIlceId ? { ilceId: selectedIlceId } : undefined
  )

  // Varsayılan il seçimi (Van - 65)
  React.useEffect(() => {
    if (!selectedIlId && !value?.ilId && iller && iller.length > 0) {
      const defaultIl = iller.find((il) => il.plaka === defaultIlPlaka)
      if (defaultIl) {
        setSelectedIlId(defaultIl.id)
        onChange?.({ ilId: defaultIl.id, ilceId: undefined, mahalleId: undefined })
      }
    }
  }, [iller, defaultIlPlaka, selectedIlId, value?.ilId, onChange])

  // Sync internal state with external value
  React.useEffect(() => {
    if (value?.ilId !== undefined && value?.ilId !== selectedIlId) {
      setSelectedIlId(value?.ilId || "")
    }
    if (value?.ilceId !== undefined && value?.ilceId !== selectedIlceId) {
      setSelectedIlceId(value?.ilceId || "")
    }
    if (value?.mahalleId !== undefined && value?.mahalleId !== selectedMahalleId) {
      setSelectedMahalleId(value?.mahalleId || "")
    }
  }, [value?.ilId, value?.ilceId, value?.mahalleId])

  const handleIlChange = (ilId: string) => {
    setSelectedIlId(ilId)
    setSelectedIlceId("")
    setSelectedMahalleId("")
    setIlOpen(false)
    onChange?.({ ilId, ilceId: undefined, mahalleId: undefined })
  }

  const handleIlceChange = (ilceId: string) => {
    setSelectedIlceId(ilceId)
    setSelectedMahalleId("")
    setIlceOpen(false)
    onChange?.({ ilId: selectedIlId, ilceId, mahalleId: undefined })
  }

  const handleMahalleChange = (mahalleId: string) => {
    setSelectedMahalleId(mahalleId)
    setMahalleOpen(false)
    onChange?.({ ilId: selectedIlId, ilceId: selectedIlceId, mahalleId })
  }

  const selectedIl = iller?.find((il) => il.id === selectedIlId)
  const selectedIlce = ilceler?.find((ilce) => ilce.id === selectedIlceId)
  const selectedMahalle = mahalleler?.find((m) => m.id === selectedMahalleId)

  return (
    <div className={cn(compact ? "space-y-2" : "grid gap-4 sm:grid-cols-3", className)}>
      {/* İl */}
      <div className={compact ? "space-y-1" : "space-y-2"}>
        <Label className={compact ? "text-xs" : ""}>
          {t.lokasyon.il} {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover open={ilOpen} onOpenChange={setIlOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={ilOpen}
              className={cn(
                "w-full justify-between font-normal",
                compact && "h-9 text-sm",
                error?.il && "border-destructive",
                !selectedIl && "text-muted-foreground"
              )}
              disabled={disabled || illerLoading}
            >
              {illerLoading
                ? t.common.loading
                : selectedIl
                ? `${selectedIl.plaka ? `${selectedIl.plaka} - ` : ""}${selectedIl.ad}`
                : t.lokasyon.selectIl}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t.lokasyon.searchIl} />
              <CommandList>
                <CommandEmpty>{t.lokasyon.ilNotFound}</CommandEmpty>
                <CommandGroup>
                  {iller?.map((il) => (
                    <CommandItem
                      key={il.id}
                      value={`${il.plaka || ""} ${il.ad}`}
                      onSelect={() => handleIlChange(il.id)}
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
        {error?.il && <p className={cn(compact ? "text-xs" : "text-sm", "text-destructive")}>{error.il}</p>}
      </div>

      {/* İlçe */}
      <div className={compact ? "space-y-1" : "space-y-2"}>
        <Label className={compact ? "text-xs" : ""}>
          {t.lokasyon.ilce} {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover open={ilceOpen} onOpenChange={setIlceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={ilceOpen}
              className={cn(
                "w-full justify-between font-normal",
                compact && "h-9 text-sm",
                error?.ilce && "border-destructive",
                !selectedIlce && "text-muted-foreground"
              )}
              disabled={disabled || !selectedIlId || ilcelerLoading}
            >
              {!selectedIlId
                ? t.lokasyon.selectIlFirst
                : ilcelerLoading
                ? t.common.loading
                : selectedIlce
                ? selectedIlce.ad
                : t.lokasyon.selectIlce}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t.lokasyon.searchIlce} />
              <CommandList>
                <CommandEmpty>{t.lokasyon.ilceNotFound}</CommandEmpty>
                <CommandGroup>
                  {ilceler?.map((ilce) => (
                    <CommandItem
                      key={ilce.id}
                      value={ilce.ad}
                      onSelect={() => handleIlceChange(ilce.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIlceId === ilce.id ? "opacity-100" : "opacity-0"
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
        {error?.ilce && <p className={cn(compact ? "text-xs" : "text-sm", "text-destructive")}>{error.ilce}</p>}
      </div>

      {/* Mahalle */}
      <div className={compact ? "space-y-1" : "space-y-2"}>
        <Label className={compact ? "text-xs" : ""}>
          {t.lokasyon.mahalle} {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover open={mahalleOpen} onOpenChange={setMahalleOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={mahalleOpen}
              className={cn(
                "w-full justify-between font-normal",
                compact && "h-9 text-sm",
                error?.mahalle && "border-destructive",
                !selectedMahalle && "text-muted-foreground"
              )}
              disabled={disabled || !selectedIlceId || mahallelerLoading}
            >
              {!selectedIlceId
                ? t.lokasyon.selectIlceFirst
                : mahallelerLoading
                ? t.common.loading
                : selectedMahalle
                ? selectedMahalle.ad
                : t.lokasyon.selectMahalle}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t.lokasyon.searchMahalle} />
              <CommandList>
                <CommandEmpty>{t.lokasyon.mahalleNotFound}</CommandEmpty>
                <CommandGroup>
                  {mahalleler?.map((mahalle) => (
                    <CommandItem
                      key={mahalle.id}
                      value={mahalle.ad}
                      onSelect={() => handleMahalleChange(mahalle.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMahalleId === mahalle.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {mahalle.ad}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error?.mahalle && <p className={cn(compact ? "text-xs" : "text-sm", "text-destructive")}>{error.mahalle}</p>}
      </div>
    </div>
  )
}
