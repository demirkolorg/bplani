"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FaaliyetAlaniForm } from "./faaliyet-alani-form"
import type { CreateFaaliyetAlaniInput } from "@/lib/validations"

interface FaaliyetAlaniFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateFaaliyetAlaniInput> & { id?: string }
  defaultParentId?: string | null
}

export function FaaliyetAlaniFormModal({
  open,
  onOpenChange,
  initialData,
  defaultParentId,
}: FaaliyetAlaniFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Faaliyet Alanı Düzenle" : "Yeni Faaliyet Alanı"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faaliyet alanı bilgilerini güncelleyin."
              : "Yeni bir faaliyet alanı eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <FaaliyetAlaniForm
          initialData={initialData}
          defaultParentId={defaultParentId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
