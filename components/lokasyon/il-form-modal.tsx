"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/components/providers/locale-provider"
import { IlForm } from "./il-form"
import type { CreateIlInput } from "@/lib/validations"

interface IlFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateIlInput> & { id?: string }
}

export function IlFormModal({ open, onOpenChange, initialData }: IlFormModalProps) {
  const { t } = useLocale()
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.lokasyon.editIl : t.lokasyon.newIl}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.lokasyon.editIlDescription
              : t.lokasyon.newIlDescription}
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
