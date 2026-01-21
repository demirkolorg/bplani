"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TakipForm } from "./takip-form"
import type { TakipDurum } from "@/lib/validations"

interface TakipFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id?: string
    gsmId?: string
    baslamaTarihi?: string
    bitisTarihi?: string
    durum?: TakipDurum
  }
}

export function TakipFormModal({
  open,
  onOpenChange,
  initialData,
}: TakipFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Takip Düzenle" : "Yeni Takip"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Takip bilgilerini güncelleyin."
              : "Yeni bir takip kaydı oluşturun."}
          </DialogDescription>
        </DialogHeader>
        <TakipForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
