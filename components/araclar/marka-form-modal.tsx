"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MarkaForm } from "./marka-form"
import type { CreateMarkaInput } from "@/lib/validations"

interface MarkaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateMarkaInput> & { id?: string }
}

export function MarkaFormModal({ open, onOpenChange, initialData }: MarkaFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Marka Düzenle" : "Yeni Marka"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Marka bilgilerini güncelleyin."
              : "Yeni bir marka eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <MarkaForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
