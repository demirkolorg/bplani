"use client"

import { useLocale } from "@/components/providers/locale-provider"
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
  const { t } = useLocale()
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.araclar.editModel : t.araclar.newModel}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.araclar.editModelDescription
              : t.araclar.newModelDescription}
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
