"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  trigger?: React.ReactNode
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isLoading?: boolean
}

export function ConfirmDialog({
  trigger,
  title = "Emin misiniz?",
  description = "Bu işlem geri alınamaz.",
  confirmText = "Onayla",
  cancelText = "İptal",
  onConfirm,
  onCancel,
  variant = "destructive",
  open,
  onOpenChange,
  isLoading,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading || isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant}
              onClick={handleConfirm}
              disabled={loading || isLoading}
            >
              {(loading || isLoading) && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
