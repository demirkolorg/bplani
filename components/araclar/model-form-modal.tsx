"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ModelForm } from "./model-form"
import type { CreateModelInput } from "@/lib/validations"

interface ModelFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateModelInput> & { id?: string }
}

export function ModelFormModal({ open, onOpenChange, initialData }: ModelFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Model Düzenle" : "Yeni Model"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Model bilgilerini güncelleyin."
              : "Yeni bir model eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <ModelForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
