"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/components/providers/locale-provider"
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
  const { t } = useLocale()
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.lokasyon.editMahalle : t.lokasyon.newMahalle}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.lokasyon.editMahalleDescription
              : t.lokasyon.newMahalleDescription}
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
