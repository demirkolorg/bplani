"use client"

import { useLocale } from "@/components/providers/locale-provider"
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
  const { t } = useLocale()
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t.kisiler.editKisi : t.kisiler.newKisi}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.kisiler.editKisiDescription
              : t.kisiler.newKisiDescription}
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
