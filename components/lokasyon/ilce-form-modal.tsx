"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IlceForm } from "./ilce-form"
import type { CreateIlceInput } from "@/lib/validations"

interface IlceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateIlceInput> & { id?: string }
  defaultIlId?: string
}

export function IlceFormModal({ open, onOpenChange, initialData, defaultIlId }: IlceFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "İlçe Düzenle" : "Yeni İlçe"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "İlçe bilgilerini güncelleyin."
              : "Yeni bir ilçe eklemek için aşağıdaki formu doldurun."}
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
