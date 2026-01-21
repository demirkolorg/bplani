"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MahalleForm } from "./mahalle-form"
import type { CreateMahalleInput } from "@/lib/validations"

interface MahalleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateMahalleInput> & { id?: string; ilId?: string }
  defaultIlId?: string
  defaultIlceId?: string
}

export function MahalleFormModal({
  open,
  onOpenChange,
  initialData,
  defaultIlId,
  defaultIlceId,
}: MahalleFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Mahalle Düzenle" : "Yeni Mahalle"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Mahalle bilgilerini güncelleyin."
              : "Yeni bir mahalle eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <MahalleForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
          defaultIlId={defaultIlId}
          defaultIlceId={defaultIlceId}
        />
      </DialogContent>
    </Dialog>
  )
}
