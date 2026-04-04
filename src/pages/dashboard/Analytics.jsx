import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, Target, Briefcase, Award, AlertTriangle } from 'lucide-react'
import api from '../../lib/api'

const fallbackTrend = [
  { label: 'Apr 1', score: 68, company: 'Role A' },
  { label: 'Apr 4', score: 74, company: 'Role B' },
  { label: 'Apr 7', score: 79, company: 'Role C' },
  { label: 'Apr 10', score: 83, company: 'Role D' },
]

const fallbackPieData = [
  { name: 'Applied', value: 6, color: '#6366f1' },
  { name: 'Interview', value: 2, color: '#10b981' },
  { name: 'Offer', value: 1, color: '#f59e0b' },
  { name: 'Rejected', value: 1, color: '#ef4444' },
]

const chartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="glass-card border border-slate-200 px-3 py-2">
      <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-xs" style={{ color: item.color }}>
          {item.name}: <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [insights, setInsights] = useState(null)
  const [trend, setTrend] = useState(fallbackTrend)

  useEffect(() => {
    let mounted = true

    async function loadAnalytics() {
      try {
        const [dashboardRes, insightsRes] = await Promise.all([api.getDashboard(), api.getAnalyticsInsights()])
        if (!mounted) return

        if (dashboardRes?.success) {
          setDashboard(dashboardRes.dashboard)
        }

        if (insightsRes?.success) {
          setInsights(insightsRes.insights)
          if (Array.isArray(insightsRes.insights?.jobMatchTrend) && insightsRes.insights.jobMatchTrend.length) {
            setTrend(insightsRes.insights.jobMatchTrend)
          }
        }
      } catch (_error) {
        // Keep fallback data when API is unavailable.
      }
    }

    loadAnalytics()

    return () => {
      mounted = false
    }
  }, [])

  const pieData = useMemo(() => {
    if (!dashboard?.stageBreakdown) return fallbackPieData
    return [
      { name: 'Applied', value: dashboard.stageBreakdown.applied || 0, color: '#6366f1' },
      { name: 'Interview', value: dashboard.stageBreakdown.interview || 0, color: '#10b981' },
      { name: 'Offer', value: dashboard.stageBreakdown.offer || 0, color: '#f59e0b' },
      { name: 'Rejected', value: dashboard.stageBreakdown.rejected || 0, color: '#ef4444' },
    ]
  }, [dashboard])

  const topStats = useMemo(() => {
    const applications = dashboard?.applications ?? 0
    const interviews = dashboard?.interviews ?? 0
    const interviewRate = applications > 0 ? ((interviews / applications) * 100).toFixed(1) : '0.0'

    return [
      {
        label: 'Resume Strength',
        value: `${insights?.resumeStrengthScore ?? dashboard?.resumeScore ?? 0}`,
        unit: '/100',
        trend: '+',
        icon: Award,
        color: 'text-primary-600',
        bg: 'bg-primary-50',
      },
      {
        label: 'Skill Match %',
        value: `${insights?.skillMatchPercentage ?? 0}`,
        unit: '%',
        trend: '+',
        icon: Target,
        color: 'text-accent-600',
        bg: 'bg-accent-50',
      },
      {
        label: 'Applications Sent',
        value: `${applications}`,
        unit: '',
        trend: '+',
        icon: Briefcase,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      {
        label: 'Interview Rate',
        value: `${interviewRate}`,
        unit: '%',
        trend: '+',
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
    ]
  }, [dashboard, insights])

  const missingSkills = insights?.missingSkills || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map(({ label, value, unit, trend, icon: Icon, color, bg }, idx) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-primary-600 font-semibold">{trend}</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-slate-900">
              {value}
              <span className="text-sm text-slate-400 font-medium">{unit}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-6">Job Match Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={chartTooltip} />
            <Area type="monotone" dataKey="score" name="Match Score" stroke="#10b981" strokeWidth={2.5} fill="url(#matchGrad)" dot={{ fill: '#10b981', r: 3.5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-base text-slate-800 mb-5">Application Pipeline</h3>
          <div className="flex items-center gap-4">
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="space-y-2 flex-1">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-600">{name}</span>
                    <span className="text-xs font-bold text-slate-700">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-base text-slate-800 mb-5">Missing Skills</h3>
          {missingSkills.length ? (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span key={skill} className="badge-orange">{skill}</span>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>No major skill gaps detected from your tracked jobs yet.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-base text-slate-800 mb-5">Trend Comparison</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={trend} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={chartTooltip} />
            <Bar dataKey="score" name="Match Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
