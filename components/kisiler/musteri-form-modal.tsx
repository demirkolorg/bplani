"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { KisiForm } from "./musteri-form"
import type { CreateKisiInput } from "@/lib/validations"

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

interface KisiFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CreateKisiInput> & {
    id?: string
    gsmler?: GsmItem[]
    adresler?: AdresItem[]
  }
}

export function KisiFormModal({
  open,
  onOpenChange,
  initialData,
}: KisiFormModalProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Kişi Düzenle" : "Yeni Kişi"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Kişi bilgilerini güncelleyin."
              : "Yeni bir kişi eklemek için aşağıdaki formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <KisiForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          inModal
        />
      </DialogContent>
    </Dialog>
  )
}
