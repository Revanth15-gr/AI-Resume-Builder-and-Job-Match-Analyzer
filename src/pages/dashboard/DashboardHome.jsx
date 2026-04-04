import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText, Target, BarChart3, Briefcase, TrendingUp,
  ArrowRight, Plus, CheckCircle, Clock, Zap, Star
} from 'lucide-react'
import api from '../../lib/api'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

function StatCard({ label, value, change, icon: Icon, color, bg }) {
  return (
    <motion.div variants={fadeUp} className="glass-card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="font-display font-bold text-2xl text-slate-900 mt-0.5">{value}</p>
        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-primary-600' : 'text-rose-500'}`}>
          {change} this week
        </p>
      </div>
    </motion.div>
  )
}

function QuickAction({ to, icon: Icon, label, desc, color }) {
  return (
    <Link to={to}>
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
      </motion.div>
    </Link>
  )
}

export default function DashboardHome() {
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const response = await api.getDashboard()
        if (mounted && response?.success) {
          setDashboard(response.dashboard)
        }
      } catch (_error) {
        // Preserve premium UI with static fallback when API is unavailable.
      }
    }

    loadDashboard()
    return () => {
      mounted = false
    }
  }, [])

  const stats = [
    { label: 'Resume Score', value: `${dashboard?.resumeScore ?? 87}/100`, change: '+12', icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Job Matches', value: `${dashboard?.jobMatches ?? 24}`, change: '+6', icon: Target, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Applications', value: `${dashboard?.applications ?? 18}`, change: '+3', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Interviews', value: `${dashboard?.interviews ?? 5}`, change: '+2', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const recentActivity = [
    { icon: CheckCircle, label: 'Resume updated for Software Engineer role', time: '2 hours ago', color: 'text-primary-500' },
    { icon: Target, label: 'Job match analyzed: Google SWE (87%)', time: '5 hours ago', color: 'text-accent-500' },
    { icon: BarChart3, label: 'ATS Score improved: 68% → 87%', time: 'Yesterday', color: 'text-orange-500' },
    { icon: Briefcase, label: 'Applied to Razorpay — Backend Engineer', time: '2 days ago', color: 'text-emerald-500' },
    { icon: Star, label: 'Resume template "Modern Pro" saved', time: '3 days ago', color: 'text-violet-500' },
  ]

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-8 text-white"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 right-20 w-32 h-32 bg-accent-400/20 rounded-full blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-primary-100 text-sm font-medium">AI Ready</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">
              Good morning, Rahul! 👋
            </h2>
            <p className="text-primary-200 text-sm">
              Your resume score is <strong className="text-white">87/100</strong>. You're 5 points away from the top 10% of candidates!
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/dashboard/resume-builder" className="px-5 py-2.5 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors shadow-lg">
              Build Resume
            </Link>
            <Link to="/dashboard/ats-score" className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30">
              Check ATS
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <motion.h3 variants={fadeUp} className="font-display font-bold text-lg text-slate-800 mb-4">
            Quick Actions
          </motion.h3>
          <div className="space-y-3">
            <QuickAction to="/dashboard/resume-builder" icon={Plus} label="Create New Resume" desc="AI-powered resume generation" color="from-primary-500 to-primary-600" />
            <QuickAction to="/dashboard/job-match" icon={Target} label="Analyze Job Match" desc="Paste a job description to analyze" color="from-accent-500 to-accent-600" />
            <QuickAction to="/dashboard/ats-score" icon={BarChart3} label="Check ATS Score" desc="See how ATS systems score you" color="from-orange-500 to-rose-500" />
            <QuickAction to="/dashboard/templates" icon={FileText} label="Browse Templates" desc="20+ premium resume templates" color="from-violet-500 to-purple-600" />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <motion.h3 variants={fadeUp} className="font-display font-bold text-lg text-slate-800 mb-4">
            Recent Activity
          </motion.h3>
          <motion.div variants={fadeUp} className="glass-card p-4 space-y-4">
            {recentActivity.map(({ icon: Icon, label, time, color }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium leading-tight">{label}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <p className="text-xs text-slate-400">{time}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Score Progress */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-6">Resume Score Breakdown</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { label: 'ATS Compatibility', score: 87, color: 'bg-primary-500' },
            { label: 'Keywords Match', score: 74, color: 'bg-accent-500' },
            { label: 'Format & Structure', score: 92, color: 'bg-emerald-500' },
            { label: 'Content Quality', score: 81, color: 'bg-orange-500' },
          ].map(({ label, score, color }, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-800">{score}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ delay: i * 0.15 + 0.5, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full ${color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
