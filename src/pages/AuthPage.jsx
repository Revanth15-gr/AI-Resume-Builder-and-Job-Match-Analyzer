import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const verificationHandledRef = useRef(false)
  const { login, register, loginWithGoogle, verifyEmail, resendVerification } = useAuth()

  useEffect(() => {
    const queryMode = searchParams.get('mode')
    const queryEmail = searchParams.get('email')
    const queryToken = searchParams.get('token')

    if (queryMode === 'register') {
      setMode('register')
    }

    if (
      queryMode === 'verify' &&
      queryEmail &&
      queryToken &&
      !verificationHandledRef.current
    ) {
      verificationHandledRef.current = true
      setLoading(true)
      setError('')
      setMessage('')

      verifyEmail(queryEmail, queryToken)
        .then((data) => {
          setMessage(data.message || 'Email verified successfully. You can sign in now.')
          setMode('login')
          setForm((prev) => ({ ...prev, email: queryEmail, password: '' }))
          setSearchParams({})
        })
        .catch((err) => {
          setError(err.message || 'Email verification failed')
          setSearchParams({})
        })
        .finally(() => setLoading(false))
    }
  }, [searchParams, setSearchParams, verifyEmail])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!form.name) throw new Error('Name is required')
        const data = await register(form.name, form.email, form.password)
        setPendingVerificationEmail(form.email)
        setMessage(data.message || 'Account created. Please verify your email before sign in.')
        const fallbackLink = data.fallbackVerificationLink || data.devVerificationLink
        if (fallbackLink) {
          setMessage((msg) => `${msg} Verification link: ${fallbackLink}`)
        }
        setMode('login')
        setForm((prev) => ({ ...prev, password: '' }))
      } else {
        await login(form.email, form.password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setPendingVerificationEmail(form.email)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in failed. Please try again.')
      return
    }

    setError('')
    setMessage('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle(credentialResponse.credential)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return
    setResendLoading(true)
    setError('')
    try {
      const data = await resendVerification(pendingVerificationEmail)
      setMessage(data.message || 'Verification email sent')
      const fallbackLink = data.fallbackVerificationLink || data.devVerificationLink
      if (fallbackLink) {
        setMessage((msg) => `${msg} Verification link: ${fallbackLink}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-green">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-800">
              Resume<span className="gradient-text">AI</span>
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-800">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login' ? 'Sign in to your AI-powered dashboard' : 'Start building ATS-optimized resumes in minutes'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-glass pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-glass pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600"
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 break-words"
              >
                {message}
              </motion.div>
            )}

            {pendingVerificationEmail && mode === 'login' && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {resendLoading ? 'Sending verification email...' : `Resend verification email to ${pendingVerificationEmail}`}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {googleClientId && (
              <>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs uppercase tracking-wide text-slate-400">Or</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-in failed. Please try again.')}
                    text={mode === 'login' ? 'signin_with' : 'signup_with'}
                    shape="pill"
                    width="320"
                  />
                </div>

                {googleLoading && (
                  <p className="text-center text-sm text-slate-500">Signing in with Google...</p>
                )}
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Social proof */}
        <p className="text-center text-xs text-slate-300 mt-6">
          Trusted by 50,000+ professionals across India 🇮🇳
        </p>
      </motion.div>
    </div>
  )
}
