"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/components/providers/locale-provider"
import { IlceForm } from "./ilce-form"
import type { CreateIlceInput } from "@/lib/validations"

interface IlceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateIlceInput> & { id?: string }
  defaultIlId?: string
}

export function IlceFormModal({ open, onOpenChange, initialData, defaultIlId }: IlceFormModalProps) {
  const { t } = useLocale()
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.lokasyon.editIlce : t.lokasyon.newIlce}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.lokasyon.editIlceDescription
              : t.lokasyon.newIlceDescription}
          </DialogDescription>
        </DialogHeader>
        <IlceForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
          defaultIlId={defaultIlId}
        />
      </DialogContent>
    </Dialog>
  )
}
