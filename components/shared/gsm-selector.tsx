"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface GsmOption {
  id: string
  numara: string
  musteri?: {
    id: string
    ad: string
    soyad: string
  } | null
}

interface GsmSelectorProps {
  value?: string
  onChange: (gsmId: string | undefined) => void
  gsmler: GsmOption[]
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
}

export function GsmSelector({
  value,
  onChange,
  gsmler,
  isLoading,
  placeholder = "GSM seçin...",
  disabled,
}: GsmSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedGsm = gsmler.find((gsm) => gsm.id === value)

  const getDisplayText = (gsm: GsmOption) => {
    if (gsm.musteri) {
      return `${gsm.numara} - ${gsm.musteri.ad} ${gsm.musteri.soyad}`
    }
    return gsm.numara
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <span className="text-muted-foreground">Yükleniyor...</span>
          ) : selectedGsm ? (
            <span className="truncate">{getDisplayText(selectedGsm)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="GSM numarası veya müşteri ara..." />
          <CommandList>
            <CommandEmpty>GSM bulunamadı.</CommandEmpty>
            <CommandGroup>
              {gsmler.map((gsm) => (
                <CommandItem
                  key={gsm.id}
                  value={`${gsm.numara} ${gsm.musteri?.ad || ""} ${gsm.musteri?.soyad || ""}`}
                  onSelect={() => {
                    onChange(gsm.id === value ? undefined : gsm.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === gsm.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{gsm.numara}</span>
                    {gsm.musteri && (
                      <>
                        <span className="text-muted-foreground">-</span>
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {gsm.musteri.ad} {gsm.musteri.soyad}
                        </span>
                      </>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
