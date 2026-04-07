import React, { createContext, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const NotificationContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-orange-200 bg-orange-50 text-orange-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info
          const tone = STYLES[toast.type] || STYLES.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`glass-card border p-3 shadow-glass-lg ${tone}`}
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message ? <p className="mt-0.5 text-xs opacity-85">{toast.message}</p> : null}
                </div>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="rounded-md p-1 hover:bg-white/70 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [feed, setFeed] = useState(() => {
    try {
      const raw = localStorage.getItem('resumeai_notifications')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (_error) {
      return []
    }
  })

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const pushNotification = ({ type = 'info', title, message, unread = true, time = 'just now' }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const entry = { id, type, title: title || 'Notification', desc: message || '', time, unread }
    setFeed((prev) => {
      const next = [entry, ...prev].slice(0, 60)
      localStorage.setItem('resumeai_notifications', JSON.stringify(next))
      return next
    })
    return entry
  }

  const notify = ({ type = 'info', title, message, duration = 3500 }) => {
    const entry = pushNotification({ type, title, message })
    setToasts((prev) => [...prev, { id: entry.id, type, title: title || 'Notification', message }])
    window.setTimeout(() => {
      dismiss(entry.id)
    }, duration)
    return entry
  }

  const markAllRead = () => {
    setFeed((prev) => {
      const next = prev.map((item) => ({ ...item, unread: false }))
      localStorage.setItem('resumeai_notifications', JSON.stringify(next))
      return next
    })
  }

  const removeNotification = (id) => {
    setFeed((prev) => {
      const next = prev.filter((item) => item.id !== id)
      localStorage.setItem('resumeai_notifications', JSON.stringify(next))
      return next
    })
  }

  const markNotificationRead = (id) => {
    setFeed((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
      localStorage.setItem('resumeai_notifications', JSON.stringify(next))
      return next
    })
  }

  const setNotificationFilter = (predicate) => {
    if (typeof predicate !== 'function') return
    setFeed((prev) => {
      const next = prev.map((item) => predicate(item))
      localStorage.setItem('resumeai_notifications', JSON.stringify(next))
      return next
    })
  }

  const value = useMemo(
    () => ({ notify, dismiss, feed, markAllRead, removeNotification, markNotificationRead, setNotificationFilter, pushNotification }),
    [feed]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}

export default NotificationContext
