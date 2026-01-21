"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MusteriForm } from "./musteri-form"
import type { CreateMusteriInput } from "@/lib/validations"

interface GsmItem {
  id?: string
  numara: string
  isPrimary: boolean
}

interface AdresItem {
  id?: string
  ad: string | null
  mahalleId: string
  detay: string | null
  isPrimary: boolean
  lokasyonText?: string
}

interface MusteriFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateMusteriInput> & {
    id?: string
    gsmler?: GsmItem[]
    adresler?: AdresItem[]
  }
}

export function MusteriFormModal({
  open,
  onOpenChange,
  initialData,
}: MusteriFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Müşteri Düzenle" : "Yeni Müşteri"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Müşteri bilgilerini güncelleyin."
              : "Yeni bir müşteri eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <MusteriForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
