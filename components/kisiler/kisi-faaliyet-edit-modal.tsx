"use client"

import * as React from "react"
import { Briefcase } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useLocale } from "@/components/providers/locale-provider"
import { kisiKeys } from "@/hooks/use-kisiler"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FaaliyetSelector } from "@/components/faaliyet/faaliyet-selector"

interface KisiFaaliyetAlani {
  id: string
  faaliyetAlani: {
    id: string
    ad: string
  }
}

interface KisiFaaliyetEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kisiId: string
  faaliyetAlanlari: KisiFaaliyetAlani[]
}

export function KisiFaaliyetEditModal({
  open,
  onOpenChange,
  kisiId,
  faaliyetAlanlari,
}: KisiFaaliyetEditModalProps) {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [error, setError] = React.useState("")

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedIds(faaliyetAlanlari.map((f) => f.faaliyetAlani.id))
      setError("")
    }
  }, [open, faaliyetAlanlari])

  const updateMutation = useMutation({
    mutationFn: async ({
      kisiId,
      faaliyetAlaniIds,
    }: {
      kisiId: string
      faaliyetAlaniIds: string[]
    }): Promise<KisiFaaliyetAlani[]> => {
      const response = await fetch(`/api/kisiler/${kisiId}/faaliyet-alanlari`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faaliyetAlaniIds }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.kisiler.updateFaaliyetError)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.lists() })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    updateMutation.mutate({ kisiId, faaliyetAlaniIds: selectedIds })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t.kisiler.editFaaliyetAlanlari}
            </DialogTitle>
            <DialogDescription>
              {t.kisiler.editFaaliyetAlanlariDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>{t.kisiler.faaliyetAlanlari}</Label>
              <FaaliyetSelector
                value={selectedIds}
                onChange={setSelectedIds}
                placeholder={t.kisiler.selectFaaliyetAlanlari}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
