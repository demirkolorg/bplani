"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2, Key, Shield, Power } from "lucide-react"

import { usePersoneller, useDeletePersonel, useToggleActive, type Personel } from "@/hooks/use-personel"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getPersonelColumns, personelSortOptions } from "./personel-columns"
import { PersonelPasswordModal } from "./personel-password-modal"
import { PersonelRolModal } from "./personel-rol-modal"

interface PersonelTableProps {
  currentUserRol: string
  currentUserId: string
}

export function PersonelTable({ currentUserRol, currentUserId }: PersonelTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [passwordPersonel, setPasswordPersonel] = React.useState<Personel | null>(null)
  const [rolPersonel, setRolPersonel] = React.useState<Personel | null>(null)

  const { data, isLoading } = usePersoneller()
  const deletePersonel = useDeletePersonel()
  const toggleActive = useToggleActive()

  const columns = React.useMemo(() => getPersonelColumns(), [])

  const isAdmin = currentUserRol === "ADMIN"

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePersonel.mutateAsync(deleteId)
    } catch (error) {
      console.error("Delete error:", error)
    }
    setDeleteId(null)
  }

  const handleToggleActive = async (personel: Personel) => {
    try {
      await toggleActive.mutateAsync(personel.id)
    } catch (error) {
      console.error("Toggle active error:", error)
    }
  }

  const handleRowClick = (personel: Personel) => {
    router.push(`/personel/${personel.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Personel, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr
          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => handleRowClick(row)}
        >
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/personel/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Görüntüle
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/personel/${row.id}?edit=true`)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Düzenle
        </ContextMenuItem>

        <ContextMenuSeparator />

        {isAdmin && (
          <>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setPasswordPersonel(row)
              }}
            >
              <Key className="mr-2 h-4 w-4" />
              Şifre Değiştir
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setRolPersonel(row)
              }}
              disabled={row.id === currentUserId}
            >
              <Shield className="mr-2 h-4 w-4" />
              Rol Değiştir
            </ContextMenuItem>
          </>
        )}

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleToggleActive(row)
          }}
          disabled={row.id === currentUserId}
        >
          <Power className="mr-2 h-4 w-4" />
          {row.isActive ? "Deaktive Et" : "Aktive Et"}
        </ContextMenuItem>

        {isAdmin && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteId(row.id)
              }}
              disabled={row.id === currentUserId}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder="Ad, soyad veya ID ile ara..."
        isLoading={isLoading}
        sortOptions={personelSortOptions}
        defaultSort={{ column: "createdAt", direction: "desc" }}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          visibleId: "ID",
          adSoyad: "Ad Soyad",
          rol: "Rol",
          isActive: "Durum",
          aktivite: "Aktivite",
          sonGiris: "Son Giriş",
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Personeli Sil"
        description="Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deletePersonel.isPending}
      />

      {passwordPersonel && (
        <PersonelPasswordModal
          open={!!passwordPersonel}
          onOpenChange={(open) => !open && setPasswordPersonel(null)}
          personel={passwordPersonel}
        />
      )}

      {rolPersonel && (
        <PersonelRolModal
          open={!!rolPersonel}
          onOpenChange={(open) => !open && setRolPersonel(null)}
          personel={rolPersonel}
        />
      )}
    </>
  )
}
