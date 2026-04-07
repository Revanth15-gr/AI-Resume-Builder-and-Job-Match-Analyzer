import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Sparkles, Target, FileText, Briefcase, CheckCircle, X, Settings, Zap } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

const iconByType = {
  success: CheckCircle,
  warning: FileText,
  error: Briefcase,
  info: Bell,
  ai: Sparkles,
  match: Target,
  ats: FileText,
  job: Briefcase,
}

const gradientByType = {
  success: 'from-primary-500 to-accent-500',
  warning: 'from-orange-500 to-rose-500',
  error: 'from-rose-500 to-rose-600',
  info: 'from-sky-500 to-sky-600',
  ai: 'from-primary-500 to-accent-500',
  match: 'from-accent-500 to-accent-600',
  ats: 'from-orange-500 to-rose-500',
  job: 'from-emerald-500 to-teal-600',
}

export default function Notifications() {
  const { feed, notify, markAllRead, removeNotification, markNotificationRead } = useNotifications()
  const [filter, setFilter] = useState('all')

  const unreadCount = feed.filter((item) => item.unread).length
  const filtered = useMemo(
    () => (filter === 'unread' ? feed.filter((item) => item.unread) : feed),
    [feed, filter]
  )

  const triggerDemo = () => {
    notify({
      type: 'match',
      title: 'New Job Match Detected',
      message: 'A new job with 88% match score was found for your profile.',
    })
  }

  const openSettings = () => {
    notify({
      type: 'info',
      title: 'Notification Preferences',
      message: 'Go to Settings > Notifications to customize delivery rules.',
    })
  }

  const markAsRead = (id) => {
    markNotificationRead(id)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800">Notifications</h2>
            <p className="text-sm text-slate-400">{unreadCount} unread messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={triggerDemo} className="btn-secondary text-sm py-2">
            <Zap className="w-4 h-4" /> Trigger Demo
          </button>
          <button onClick={markAllRead} className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Mark all as read
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map((entry) => (
          <button
            key={entry}
            onClick={() => setFilter(entry)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === entry
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300'
            }`}
          >
            {entry === 'all' ? `All (${feed.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const Icon = iconByType[item.type] || Bell
          const gradient = gradientByType[item.type] || gradientByType.info
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-4 flex items-start gap-4 group transition-all duration-200 ${item.unread ? 'border-l-2 border-l-primary-400' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${item.unread ? 'text-slate-900' : 'text-slate-600'}`}>{item.title}</p>
                  {item.unread && <span className="shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-xs text-slate-300">{item.time || 'just now'}</p>
                  {item.unread ? (
                    <button onClick={() => markAsRead(item.id)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                      Mark as read
                    </button>
                  ) : null}
                </div>
              </div>
              <button onClick={() => removeNotification(item.id)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No notifications found</p>
            <p className="text-slate-300 text-sm mt-1">Try triggering a demo notification to test toasts and feed.</p>
          </div>
        )}
      </div>

      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800 text-sm">Notification Preferences</p>
          <p className="text-xs text-slate-400 mt-0.5">Customize alerts in Settings</p>
        </div>
        <button onClick={openSettings} className="btn-secondary text-sm py-2">
          <Settings className="w-4 h-4" />
          Configure
        </button>
      </div>
    </motion.div>
  )
}
