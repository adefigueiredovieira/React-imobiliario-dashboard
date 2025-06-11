"use client"

import * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

// Tipos
export type ToastProps = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
  onClose?: () => void
}

// Gerenciamento de estado global para toasts
const listeners: Array<(toasts: ToastProps[]) => void> = []
let toastState: ToastProps[] = []

function dispatch(toasts: ToastProps[]) {
  toastState = toasts
  listeners.forEach((listener) => {
    listener(toastState)
  })
}

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// Hook para usar toasts em componentes
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>(toastState)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || generateId()
    const newToast = { ...props, id }
    dispatch([...toastState, newToast])
    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    const toast = toastState.find((t) => t.id === id)
    if (toast?.onClose) {
      toast.onClose()
    }
    dispatch(toastState.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}

// Função global para criar toasts
export function toast(props: ToastProps) {
  const id = props.id || generateId()
  const newToast = { ...props, id }
  dispatch([...toastState, newToast])
  return id
}

// Componente Toaster
export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, onClose, ...props }) => {
        return (
          <Toast
            key={id}
            {...props}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(id!)
              }
            }}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
