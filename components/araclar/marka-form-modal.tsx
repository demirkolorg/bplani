"use client"

import { useLocale } from "@/components/providers/locale-provider"
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
  const { t } = useLocale()
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.araclar.editMarka : t.araclar.newMarka}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.araclar.editMarkaDescription
              : t.araclar.newMarkaDescription}
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
