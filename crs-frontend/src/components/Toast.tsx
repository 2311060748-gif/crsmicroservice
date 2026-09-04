import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  type: ToastType
  text: string
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
}

const DURATION = 3500

let nextId = 1

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: ToastType, text: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, type, text }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: number) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage
  onRemove: (id: number) => void
}) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, DURATION)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, onRemove])

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <div
      className={`toast toast--${toast.type} ${exiting ? 'toast--exit' : ''}`}
      onClick={handleClick}
      role="status"
    >
      <span className="toast__icon">{ICONS[toast.type]}</span>
      <span className="toast__text">{toast.text}</span>
    </div>
  )
}
