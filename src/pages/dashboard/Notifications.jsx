import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Sparkles, Target, FileText, Briefcase, CheckCircle, X, Settings } from 'lucide-react'

const notifications = [
  {
    id: 1, type: 'ai', icon: Sparkles, color: 'from-primary-500 to-accent-500',
    title: 'AI Resume Suggestions Ready',
    desc: 'Your resume has been analyzed. We found 4 improvements that can boost your ATS score by 12 points.',
    time: '2 hours ago', unread: true,
  },
  {
    id: 2, type: 'match', icon: Target, color: 'from-accent-500 to-accent-600',
    title: 'New Job Match: 91% — Razorpay SDE-2',
    desc: 'A new job posted matches your profile at 91%. Apply before 200 others do!',
    time: '5 hours ago', unread: true,
  },
  {
    id: 3, type: 'ats', icon: FileText, color: 'from-orange-500 to-rose-500',
    title: 'ATS Report Updated',
    desc: 'Your ATS score improved from 75% to 87% after your last resume edit. Keep going!',
    time: 'Yesterday', unread: true,
  },
  {
    id: 4, type: 'job', icon: Briefcase, color: 'from-emerald-500 to-teal-600',
    title: 'Interview Reminder — Cred',
    desc: 'You have an interview with Cred tomorrow at 11:00 AM. Review your job match report.',
    time: 'Yesterday', unread: false,
  },
  {
    id: 5, type: 'success', icon: CheckCircle, color: 'from-violet-500 to-purple-600',
    title: 'Resume Downloaded Successfully',
    desc: 'Your "Modern Pro" resume template has been exported as PDF (2 pages).',
    time: '2 days ago', unread: false,
  },
  {
    id: 6, type: 'match', icon: Target, color: 'from-accent-500 to-accent-600',
    title: 'Weekly Job Digest — 12 New Matches',
    desc: 'We found 12 new jobs this week matching your profile. Top match: Google India at 89%.',
    time: '3 days ago', unread: false,
  },
]

export default function Notifications() {
  const [items, setItems] = useState(notifications)
  const [filter, setFilter] = useState('all')

  const unreadCount = items.filter(n => n.unread).length
  const filtered = filter === 'unread' ? items.filter(n => n.unread) : items

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })))
  const dismiss = (id) => setItems(prev => prev.filter(n => n.id !== id))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
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
        <button
          onClick={markAllRead}
          className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300'
            }`}
          >
            {f === 'all' ? `All (${items.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass-card p-4 flex items-start gap-4 group transition-all duration-200 ${
              notif.unread ? 'border-l-2 border-l-primary-400' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${notif.color} flex items-center justify-center shrink-0 shadow-md`}>
              <notif.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${notif.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                  {notif.title}
                </p>
                {notif.unread && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.desc}</p>
              <p className="text-xs text-slate-300 mt-2">{notif.time}</p>
            </div>
            <button
              onClick={() => dismiss(notif.id)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No unread notifications</p>
            <p className="text-slate-300 text-sm mt-1">You're all caught up! 🎉</p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800 text-sm">Notification Preferences</p>
          <p className="text-xs text-slate-400 mt-0.5">Manage how and when you receive alerts</p>
        </div>
        <button className="btn-secondary text-sm py-2">
          <Settings className="w-4 h-4" />
          Configure
        </button>
      </div>
    </motion.div>
  )
}
