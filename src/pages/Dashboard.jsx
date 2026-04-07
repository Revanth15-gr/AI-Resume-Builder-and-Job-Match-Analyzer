import React, { useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Target, LayoutTemplate,
  Kanban, BarChart3, Bell, Settings, LogOut, Sparkles, Menu, X,
  ChevronRight
} from 'lucide-react'

import DashboardHome from './dashboard/DashboardHome'
import ResumeBuilder from './dashboard/ResumeBuilder'
import JobMatch from './dashboard/JobMatch'
import ATSScore from './dashboard/ATSScore'
import Templates from './dashboard/Templates'
import JobTracker from './dashboard/JobTracker'
import Analytics from './dashboard/Analytics'
import Notifications from './dashboard/Notifications'
import DashboardSettings from './dashboard/DashboardSettings'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'resume-builder', label: 'Resume Builder', icon: FileText },
  { path: 'job-match', label: 'Job Match', icon: Target },
  { path: 'ats-score', label: 'ATS Score', icon: BarChart3 },
  { path: 'templates', label: 'Templates', icon: LayoutTemplate },
  { path: 'job-tracker', label: 'Job Tracker', icon: Kanban },
  { path: 'analytics', label: 'Analytics', icon: BarChart3 },
  { path: 'notifications', label: 'Notifications', icon: Bell },
  { path: 'settings', label: 'Settings', icon: Settings },
]

function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function UserBadge({ user }) {
  return (
    <>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow">
        {getInitials(user?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Account'}</p>
        <p className="text-xs text-slate-400 truncate">{user?.email || 'No email'}</p>
      </div>
    </>
  )
}

function Sidebar({ isMobileOpen, setMobileOpen, onLogout }) {
  const { user } = useAuth()
  const { feed } = useNotifications()
  const location = useLocation()
  const currentPath = location.pathname.replace('/dashboard/', '').replace('/dashboard', '')
  const unreadCount = feed.filter((item) => item.unread).length

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isMobileOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-100 shadow-glass lg:hidden"
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-800">
            Resume<span className="gradient-text">AI</span>
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>
          {navItems.slice(0, 6).map(({ path, label, icon: Icon }) => {
            const isActive = currentPath === path
            return (
              <Link
                key={path}
                to={`/dashboard/${path}`}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-500" />}
              </Link>
            )
          })}

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 mt-6">Insights</p>
          {navItems.slice(6).map(({ path, label, icon: Icon }) => {
            const isActive = currentPath === path
            return (
              <Link
                key={path}
                to={`/dashboard/${path}`}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{label}</span>
                {path === 'notifications' && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">{Math.min(unreadCount, 99)}</span>
                )}
                {isActive && !['notifications'].includes(path) && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-500" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
            <UserBadge user={user} />
            <button onClick={onLogout} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Logout">
              <LogOut className="w-4 h-4 text-slate-300 hover:text-rose-400 transition-colors" />
            </button>
          </div>
          <Link to="/" className="block mt-2 text-center text-xs text-slate-400 hover:text-primary-500 transition-colors">
            ← Back to Landing Page
          </Link>
        </div>
      </motion.aside>
    </>
  )
}

function TopBar({ setMobileOpen }) {
  const { user } = useAuth()
  const { feed } = useNotifications()
  const location = useLocation()
  const currentPath = location.pathname.replace('/dashboard/', '').replace('/dashboard', '')
  const currentNav = navItems.find(n => n.path === currentPath) || navItems[0]
  const unreadCount = feed.filter((item) => item.unread).length

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center gap-4 px-6 sticky top-0 z-20">
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="font-display font-bold text-lg text-slate-800">{currentNav.label}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">Welcome back, {user?.name || 'there'} 👋</p>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/dashboard/notifications" className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] leading-4 rounded-full flex items-center justify-center">
              {Math.min(unreadCount, 99)}
            </span>
          )}
        </Link>
        <Link to="/dashboard/settings" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <Settings className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow cursor-pointer">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  )
}

function DesktopNav() {
  const { feed } = useNotifications()
  const location = useLocation()
  const currentPath = location.pathname.replace('/dashboard/', '').replace('/dashboard', '')
  const unreadCount = feed.filter((item) => item.unread).length

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>
      {navItems.slice(0, 6).map(({ path, label, icon: Icon }) => {
        const isActive = currentPath === path
        return (
          <Link key={path} to={`/dashboard/${path}`} className={`sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm">{label}</span>
            {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-500" />}
          </Link>
        )
      })}

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 mt-6">Insights</p>
      {navItems.slice(6).map(({ path, label, icon: Icon }) => {
        const isActive = currentPath === path
        return (
          <Link key={path} to={`/dashboard/${path}`} className={`sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm">{label}</span>
            {path === 'notifications' && unreadCount > 0 && <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">{Math.min(unreadCount, 99)}</span>}
            {isActive && !['notifications'].includes(path) && (
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-500" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-slate-100 shadow-glass">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-800">
              Resume<span className="gradient-text">AI</span>
            </span>
          </div>

          <DesktopNav />

          <div className="px-3 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
              <UserBadge user={user} />
              <button onClick={handleLogout} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Logout">
                <LogOut className="w-4 h-4 text-slate-300 hover:text-rose-400 transition-colors" />
              </button>
            </div>
            <Link to="/" className="block mt-2 text-center text-xs text-slate-400 hover:text-primary-500 transition-colors">
              ← Back to Landing Page
            </Link>
          </div>
        </div>
      </div>

      <Sidebar isMobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <TopBar setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route index element={<DashboardHome />} />
              <Route path="resume-builder" element={<ResumeBuilder />} />
              <Route path="job-match" element={<JobMatch />} />
              <Route path="ats-score" element={<ATSScore />} />
              <Route path="templates" element={<Templates />} />
              <Route path="job-tracker" element={<JobTracker />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
