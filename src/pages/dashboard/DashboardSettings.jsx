import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CreditCard, Save, Camera, CheckCircle, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

function SettingsSection({ title, children }) {
  return (
    <div className="glass-card p-6 space-y-5">
      <h3 className="font-display font-bold text-base text-slate-800 border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  currentRole: '',
  targetRole: '',
  targetCompanies: '',
  experienceLevel: 'mid',
  workMode: 'hybrid',
}

export default function DashboardSettings() {
  const { user, updateProfile } = useAuth()
  const { notify } = useNotifications()

  const [notifications, setNotifications] = useState({
    jobMatches: true,
    atsAlerts: true,
    weeklyDigest: true,
    interviewReminders: true,
    marketing: false,
  })

  const [activeTab, setActiveTab] = useState('Profile')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [appearanceMode, setAppearanceMode] = useState('light')
  const [language, setLanguage] = useState('en-IN')
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      currentRole: user.currentRole || '',
      targetRole: user.targetRole || '',
      targetCompanies: Array.isArray(user.targetCompanies) ? user.targetCompanies.join(', ') : '',
      experienceLevel: user.experienceLevel || 'mid',
      workMode: user.workMode || 'hybrid',
    })
    setAvatarPreview(user.avatar || '')
    setAppearanceMode(user.preferences?.mode || 'light')
    setLanguage(user.preferences?.language || 'en-IN')
    setNotifications({
      jobMatches: user.preferences?.notifications?.jobMatches ?? true,
      atsAlerts: user.preferences?.notifications?.atsAlerts ?? true,
      weeklyDigest: user.preferences?.notifications?.weeklyDigest ?? true,
      interviewReminders: user.preferences?.notifications?.interviewReminders ?? true,
      marketing: user.preferences?.notifications?.marketing ?? false,
    })
  }, [user])

  const tabs = ['Profile', 'Security', 'Notifications', 'Appearance', 'Billing']

  const initials = useMemo(() => {
    const name = form.name || user?.name || 'User'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [form.name, user?.name])

  const onAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setAvatarPreview(result)
      notify({ type: 'success', title: 'Photo Selected', message: 'Profile photo preview updated.' })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        currentRole: form.currentRole.trim(),
        targetRole: form.targetRole.trim(),
        targetCompanies: form.targetCompanies
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
        experienceLevel: form.experienceLevel,
        workMode: form.workMode,
        avatar: avatarPreview || '',
        preferences: {
          notifications,
          mode: appearanceMode,
          theme: user?.preferences?.theme || 'emerald',
          language,
        },
      })
      setSaved(true)
      notify({ type: 'success', title: 'Settings Saved', message: 'Your preferences were saved successfully.' })
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      notify({ type: 'error', title: 'Save Failed', message: err.message || 'Could not save settings.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Settings</h2>
        <p className="text-sm text-slate-400">Manage profile, notifications, appearance, and billing preferences</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' && (
        <div className="space-y-5">
          <SettingsSection title="Profile Information">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow hover:bg-slate-50 transition-colors cursor-pointer">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{form.name || 'Your Profile'}</p>
                <p className="text-sm text-slate-400">{form.email || user?.email}</p>
                <p className="text-xs text-primary-600 font-semibold mt-1">Upload JPG/PNG for profile photo</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email', disabled: true },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'currentRole', label: 'Current Role', type: 'text' },
                { key: 'targetRole', label: 'Target Role', type: 'text' },
              ].map(({ key, label, type, disabled }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    disabled={disabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="input-glass disabled:opacity-60 disabled:bg-slate-50"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Target Companies</label>
              <input
                type="text"
                value={form.targetCompanies}
                onChange={(e) => setForm((prev) => ({ ...prev, targetCompanies: e.target.value }))}
                placeholder="Google, Amazon, Microsoft"
                className="input-glass"
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Target Job Preferences">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => setForm((prev) => ({ ...prev, experienceLevel: e.target.value }))} className="input-glass">
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid-Level (2-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Work Mode</label>
                <select value={form.workMode} onChange={(e) => setForm((prev) => ({ ...prev, workMode: e.target.value }))} className="input-glass">
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </div>
      )}

      {activeTab === 'Notifications' && (
        <SettingsSection title="Notification Preferences">
          <div className="space-y-4">
            {[
              { key: 'jobMatches', label: 'New Job Matches', desc: 'Alert when a new job matches your profile above 80%' },
              { key: 'atsAlerts', label: 'ATS Score Alerts', desc: 'Notify when your ATS score changes significantly' },
              { key: 'weeklyDigest', label: 'Weekly Job Digest', desc: 'Get a weekly summary of top matching jobs' },
              { key: 'interviewReminders', label: 'Interview Reminders', desc: 'Send reminders before scheduled interviews' },
              { key: 'marketing', label: 'Product Updates & Tips', desc: 'Learn about new features and resume tips' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
                <ToggleSwitch checked={notifications[key]} onChange={(value) => setNotifications((prev) => ({ ...prev, [key]: value }))} />
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      {activeTab === 'Security' && (
        <SettingsSection title="Security Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Current Password</label>
              <input type="password" placeholder="Enter current password" className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
              <input type="password" placeholder="Enter new password" className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <input type="password" placeholder="Confirm new password" className="input-glass" />
            </div>
          </div>
        </SettingsSection>
      )}

      {activeTab === 'Billing' && (
        <div className="space-y-5">
          <div className="glass-card p-6 border-primary-100 bg-gradient-to-br from-primary-50/50 to-accent-50/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-lg text-slate-800">{user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
                <p className="text-sm text-slate-400">{user?.plan === 'pro' ? 'Unlimited AI features enabled' : '5 AI resume generations/month'}</p>
              </div>
              <span className="badge-green">Active</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Current Plan</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{user?.plan || 'free'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Billing Status</p>
                <p className="text-sm font-bold text-slate-800 mt-1">No payment due</p>
              </div>
            </div>
            <button className="btn-primary w-full justify-center">
              <CreditCard className="w-4 h-4" />
              Upgrade to Pro — Placeholder
            </button>
          </div>

          <SettingsSection title="Pro Plan Includes">
            <div className="space-y-3">
              {[
                'Unlimited AI resume generations',
                'Priority ATS scanning',
                '20+ premium templates',
                'Job tracker (unlimited)',
                'AI email drafts',
                'Advanced analytics',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </SettingsSection>
        </div>
      )}

      {activeTab === 'Appearance' && (
        <SettingsSection title="Theme & Display">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Appearance Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAppearanceMode('light')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    appearanceMode === 'light' ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => setAppearanceMode('dark')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    appearanceMode === 'dark' ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-glass">
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi</option>
                <option value="ta-IN">Tamil</option>
              </select>
            </div>
          </div>
        </SettingsSection>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className={`btn-primary ${saved ? 'bg-emerald-500' : ''} disabled:opacity-70`}>
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : saving ? (
            <span className="inline-flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</span>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>
    </motion.div>
  )
}
