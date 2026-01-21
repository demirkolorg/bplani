"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IlForm } from "./il-form"
import type { CreateIlInput } from "@/lib/validations"

interface IlFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateIlInput> & { id?: string }
}

export function IlFormModal({ open, onOpenChange, initialData }: IlFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "İl Düzenle" : "Yeni İl"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "İl bilgilerini güncelleyin."
              : "Yeni bir il eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <IlForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
