"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Pencil, Trash2 } from "lucide-react"
import { useIlceler, useDeleteIlce, useIller, type Ilce } from "@/hooks/use-lokasyon"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getIlceColumns } from "./ilce-columns"
import { IlceFormModal } from "./ilce-form-modal"
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

export function IlceTable() {
  const [selectedIlId, setSelectedIlId] = React.useState<string | undefined>()
  const [editingIlce, setEditingIlce] = React.useState<Ilce | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [ilOpen, setIlOpen] = React.useState(false)

  const { data, isLoading } = useIlceler(selectedIlId)
  const { data: iller } = useIller()
  const deleteIlce = useDeleteIlce()

  const columns = React.useMemo(() => getIlceColumns(), [])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteIlce.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const selectedIl = iller?.find((il) => il.id === selectedIlId)

  const rowWrapper = (row: Ilce, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setEditingIlce(row)}>
          <Pencil className="mr-2 h-4 w-4" />
          Düzenle
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setDeleteId(row.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Sil
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
                : "İl filtresi..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
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
                        setSelectedIlId(il.id)
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
            onClick={() => setSelectedIlId(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        searchPlaceholder="İlçe adı ile ara..."
        isLoading={isLoading}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          ad: "İlçe Adı",
          il: "İl",
          mahalleSayisi: "Mahalle Sayısı",
        }}
      />

      <IlceFormModal
        open={!!editingIlce}
        onOpenChange={(open) => !open && setEditingIlce(null)}
        initialData={editingIlce || undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="İlçeyi Sil"
        description="Bu ilçeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. İlçeye bağlı mahalleler varsa silme işlemi engellenecektir."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteIlce.isPending}
      />
    </>
  )
}
