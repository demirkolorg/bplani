"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Pencil, Trash2 } from "lucide-react"
import { useMahalleler, useDeleteMahalle, useIller, useIlceler, type Mahalle } from "@/hooks/use-lokasyon"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getMahalleColumns } from "./mahalle-columns"
import { MahalleFormModal } from "./mahalle-form-modal"
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function MahalleTable() {
  const { t } = useLocale()
  const [selectedIlId, setSelectedIlId] = React.useState<string | undefined>()
  const [selectedIlceId, setSelectedIlceId] = React.useState<string | undefined>()
  const [editingMahalle, setEditingMahalle] = React.useState<Mahalle | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [ilOpen, setIlOpen] = React.useState(false)
  const [ilceOpen, setIlceOpen] = React.useState(false)

  const { data, isLoading } = useMahalleler(
    selectedIlceId ? { ilceId: selectedIlceId } : selectedIlId ? { ilId: selectedIlId } : undefined
  )
  const { data: iller } = useIller()
  const { data: ilceler } = useIlceler(selectedIlId)
  const deleteMahalle = useDeleteMahalle()

  const columns = React.useMemo(() => getMahalleColumns(t), [t])

  const handleIlChange = (ilId: string) => {
    setSelectedIlId(ilId)
    setSelectedIlceId(undefined)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMahalle.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const selectedIl = iller?.find((il) => il.id === selectedIlId)
  const selectedIlce = ilceler?.find((ilce) => ilce.id === selectedIlceId)

  const rowWrapper = (row: Mahalle, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setEditingMahalle(row)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t.common.edit}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setDeleteId(row.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t.common.delete}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-4 pb-4">
        <Popover open={ilOpen} onOpenChange={setIlOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={ilOpen}
              className="w-[250px] justify-between"
            >
              {selectedIl
                ? `${selectedIl.plaka ? `${selectedIl.plaka} - ` : ""}${selectedIl.ad}`
                : t.lokasyon.ilFilter}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
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

        {selectedIlId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedIlId(undefined)
              setSelectedIlceId(undefined)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <Popover open={ilceOpen} onOpenChange={setIlceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={ilceOpen}
              className="w-[250px] justify-between"
              disabled={!selectedIlId}
            >
              {selectedIlce ? selectedIlce.ad : t.lokasyon.ilceFilter}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
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
                        setSelectedIlceId(ilce.id)
                        setIlceOpen(false)
                      }}
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

        {selectedIlceId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedIlceId(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        searchPlaceholder={t.lokasyon.searchMahallePlaceholder}
        isLoading={isLoading}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          ad: t.lokasyon.mahalleAdi,
          ilce: t.lokasyon.ilce,
          il: t.lokasyon.il,
          adresSayisi: t.lokasyon.adresSayisi,
        }}
      />

      <MahalleFormModal
        open={!!editingMahalle}
        onOpenChange={(open) => !open && setEditingMahalle(null)}
        initialData={editingMahalle ? {
          id: editingMahalle.id,
          ad: editingMahalle.ad,
          ilceId: editingMahalle.ilceId,
          ilId: editingMahalle.ilce.il.id,
          isActive: editingMahalle.isActive,
        } : undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.lokasyon.deleteMahalle}
        description={t.lokasyon.deleteMahalleConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteMahalle.isPending}
      />
    </>
  )
}
