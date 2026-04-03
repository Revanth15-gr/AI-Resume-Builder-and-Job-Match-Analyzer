import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, CreditCard, Save, Camera, CheckCircle
} from 'lucide-react'

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

export default function DashboardSettings() {
  const [notifications, setNotifications] = useState({
    jobMatches: true,
    atsAlerts: true,
    weeklyDigest: true,
    interviewReminders: true,
    marketing: false,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = ['Profile', 'Security', 'Notifications', 'Appearance', 'Billing']
  const [activeTab, setActiveTab] = useState('Profile')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Settings</h2>
        <p className="text-sm text-slate-400">Manage your account, preferences, and notifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === 'Profile' && (
        <div className="space-y-5">
          <SettingsSection title="Profile Information">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  R
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow hover:bg-slate-50 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Rahul Sharma</p>
                <p className="text-sm text-slate-400">rahul@example.com</p>
                <button className="text-xs text-primary-600 font-semibold mt-1 hover:text-primary-700">Change Photo</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'First Name', value: 'Rahul', type: 'text' },
                { label: 'Last Name', value: 'Sharma', type: 'text' },
                { label: 'Email', value: 'rahul@example.com', type: 'email' },
                { label: 'Phone', value: '+91 98765 43210', type: 'tel' },
                { label: 'Current Role', value: 'Full Stack Developer', type: 'text' },
                { label: 'Location', value: 'Pune, India', type: 'text' },
              ].map(({ label, value, type }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input type={type} defaultValue={value} className="input-glass" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Target Role</label>
              <input type="text" defaultValue="Senior Software Engineer" className="input-glass" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Target Companies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Razorpay'].map(c => (
                  <span key={c} className="badge-green cursor-pointer hover:bg-primary-200 transition-colors">{c} ×</span>
                ))}
              </div>
              <input type="text" placeholder="Add company..." className="input-glass" />
            </div>
          </SettingsSection>

          <SettingsSection title="Target Job Preferences">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Experience Level</label>
                <select className="input-glass">
                  <option>Mid-Level (2-5 years)</option>
                  <option>Junior (0-2 years)</option>
                  <option>Senior (5+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Work Mode</label>
                <select className="input-glass">
                  <option>Hybrid</option>
                  <option>Remote</option>
                  <option>On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Min. Expected Salary</label>
                <input type="text" defaultValue="₹20 LPA" className="input-glass" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Notice Period</label>
                <select className="input-glass">
                  <option>Immediate</option>
                  <option>15 days</option>
                  <option>1 month</option>
                  <option>2 months</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* Notifications Settings */}
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
                <ToggleSwitch
                  checked={notifications[key]}
                  onChange={val => setNotifications(prev => ({ ...prev, [key]: val }))}
                />
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      {/* Security */}
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

      {/* Billing */}
      {activeTab === 'Billing' && (
        <div className="space-y-5">
          <div className="glass-card p-6 border-primary-100 bg-gradient-to-br from-primary-50/50 to-accent-50/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-lg text-slate-800">Free Plan</p>
                <p className="text-sm text-slate-400">5 AI resume generations/month</p>
              </div>
              <span className="badge-green">Active</span>
            </div>
            <button className="btn-primary w-full justify-center">
              <CreditCard className="w-4 h-4" />
              Upgrade to Pro — ₹499/month
            </button>
          </div>
          <SettingsSection title="Pro Plan Includes">
            <div className="space-y-3">
              {['Unlimited AI resume generations', 'Priority ATS scanning', '20+ premium templates', 'Job tracker (unlimited)', 'AI email drafts', 'Resume analytics'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>
          </SettingsSection>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'Appearance' && (
        <SettingsSection title="Theme & Display">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Color Theme</label>
              <div className="flex gap-3">
                {[
                  { name: 'Emerald', from: 'from-primary-500', to: 'to-primary-600' },
                  { name: 'Indigo', from: 'from-accent-500', to: 'to-accent-600' },
                  { name: 'Rose', from: 'from-rose-500', to: 'to-rose-600' },
                  { name: 'Amber', from: 'from-amber-500', to: 'to-amber-600' },
                ].map(({ name, from, to }) => (
                  <button key={name} className={`w-10 h-10 rounded-xl bg-gradient-to-br ${from} ${to} ring-2 ring-offset-2 ring-transparent hover:ring-slate-300 transition-all`} title={name} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Language</label>
              <select className="input-glass">
                <option>English (India)</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-emerald-500' : ''}`}>
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>
    </motion.div>
  )
}
