import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  FileText, Briefcase, Target, Zap, Download, BarChart3,
  CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield,
  Sparkles, ChevronRight, Play, Menu, X
} from 'lucide-react'

// ─── Background Slideshow Images (Unsplash) ───────────────────────────────────
const slideshowImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&q=80',
]

// ─── Nav Component ─────────────────────────────────────────────────────────────
function Navbar({ authTarget }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-glass border-b border-white/60'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-800">
              Resume<span className="gradient-text">AI</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Benefits', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to={authTarget} className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link to={authTarget} className="btn-primary text-sm py-2 px-4">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 pb-4"
            >
              {['Features', 'How it Works', 'Benefits'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="block py-3 text-sm font-medium text-slate-600 border-b border-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <Link to={authTarget} className="btn-secondary text-sm justify-center">Sign In</Link>
                <Link to={authTarget} className="btn-primary text-sm justify-center">Get Started Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ authTarget }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {slideshowImages.map((img, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === currentSlide ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.08) saturate(0.5)' }}
            />
          </motion.div>
        ))}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-primary-50/80" />
        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl" />
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slideshowImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="container-max relative z-10 px-4 sm:px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Resume Platform for 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-slate-900 mb-6"
            >
              AI Resume Builder
              <br />
              <span className="gradient-text animate-gradient bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600">
                for Indian Workforce
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg"
            >
              Generate Resume • Match Jobs • Improve ATS Score
              <br />
              <span className="text-slate-400 text-base mt-1 block">
                Powered by AI. Built for professionals, students & freelancers across India.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to={authTarget} className="btn-primary text-base px-8 py-4">
                <Sparkles className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="btn-secondary text-base px-8 py-4">
                <Play className="w-5 h-5 text-primary-500" />
                Watch Demo
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-6 flex-wrap"
            >
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br ${
                    ['from-primary-400 to-primary-600','from-accent-400 to-accent-600','from-orange-400 to-rose-500','from-sky-400 to-blue-600','from-violet-400 to-purple-600'][i-1]
                  } flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                    {['R','P','A','S','M'][i-1]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-semibold text-slate-700 ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Trusted by 50,000+ professionals</p>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <p className="text-2xl font-bold text-slate-800">92%</p>
                <p className="text-xs text-slate-400">Interview success rate</p>
              </div>
            </motion.div>
          </div>

          {/* Right — Floating Cards Stack */}
          <div className="hidden lg:block relative h-[560px]">
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Floating Cards ────────────────────────────────────────────────────────────
function FloatingCards() {
  return (
    <div className="relative w-full h-full">
      {/* Main Resume Card */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-8 right-0 w-72 glass-card p-5 shadow-glass-lg"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Resume Generated</p>
            <p className="text-xs text-slate-400">Rahul Sharma • Software Engineer</p>
          </div>
        </div>
        <div className="space-y-2">
          {['Skills matched: 95%', 'ATS Score: 92/100', 'Recommendations: 3'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="text-xs text-slate-600">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '92%' }}
            transition={{ delay: 1.5, duration: 1 }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1 text-right">ATS Score: 92%</p>
      </motion.div>

      {/* Job Match Card */}
      <motion.div
        initial={{ opacity: 0, x: -40, y: 40 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute top-48 left-0 w-64 glass-card p-4 shadow-glass-lg"
        style={{ animation: 'float 6s ease-in-out 1.5s infinite' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-800">Job Match</p>
        </div>
        <div className="text-3xl font-extrabold gradient-text mb-1">87%</div>
        <p className="text-xs text-slate-400 mb-3">Match with Google SWE Role</p>
        <div className="flex gap-2 flex-wrap">
          {['React', 'Node.js', 'AWS'].map(s => (
            <span key={s} className="badge-green text-xs">{s}</span>
          ))}
        </div>
      </motion.div>

      {/* Analytics Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-16 right-4 w-60 glass-card p-4 shadow-glass-lg"
        style={{ animation: 'float 6s ease-in-out 3s infinite' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <p className="text-sm font-bold text-slate-800">This Week</p>
        </div>
        <div className="flex items-end gap-1 h-14">
          {[40, 65, 50, 80, 70, 92, 85].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
              className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-primary-500' : 'bg-primary-200'}`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Applications tracked: 24</p>
      </motion.div>

      {/* Notification pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute top-4 left-16 glass-card px-4 py-2 shadow-glass flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-700">AI is generating your resume...</span>
      </motion.div>
    </div>
  )
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '50K+', label: 'Resumes Generated', icon: FileText },
    { value: '92%', label: 'Interview Success Rate', icon: TrendingUp },
    { value: '200+', label: 'Job Platforms Supported', icon: Briefcase },
    { value: '4.9★', label: 'Average Rating', icon: Star },
  ]

  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="container-max px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 mb-3">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <p className="font-display font-extrabold text-3xl text-slate-900">{value}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ──────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: 'AI Resume Builder',
      desc: 'Generate a professional, ATS-optimized resume in seconds. AI fills in bullet points, formats sections, and tailors content to your target role.',
      color: 'from-primary-500 to-primary-600',
      badge: 'Most Popular',
    },
    {
      icon: Target,
      title: 'Job Match Analyzer',
      desc: 'Paste any job description and instantly see how well your resume matches. Get a compatibility score with actionable gap analysis.',
      color: 'from-accent-500 to-accent-600',
      badge: 'AI Powered',
    },
    {
      icon: BarChart3,
      title: 'ATS Score Checker',
      desc: "Know exactly how ATS systems score your resume before applying. We simulate 50+ major ATS parsers used by India's top companies.",
      color: 'from-orange-500 to-rose-500',
      badge: 'Real-Time',
    },
    {
      icon: Zap,
      title: 'Smart Suggestions',
      desc: 'Get AI-powered suggestions to improve your resume language, add missing keywords, and strengthen your impact statements.',
      color: 'from-violet-500 to-purple-600',
      badge: 'Smart AI',
    },
    {
      icon: Download,
      title: 'Export & Share',
      desc: 'Download your resume as PDF, Word, or share a live link. Choose from 20+ premium templates designed by HR professionals.',
      color: 'from-sky-500 to-blue-600',
      badge: 'Premium',
    },
    {
      icon: Shield,
      title: 'Job Tracker',
      desc: 'Track all your applications in one place. Set reminders, track interview stages, and never miss a follow-up again.',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Organized',
    },
  ]

  return (
    <section id="features" className="section-pad bg-section-alt">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-green mb-4">✦ Features</span>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mt-3 mb-4">
            Everything you need to
            <br />
            <span className="gradient-text">land your dream job</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete AI-powered toolkit designed specifically for the Indian job market — from entry-level to C-suite.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, badge }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="badge-green text-xs">{badge}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Fill Your Details', desc: 'Enter your education, experience, skills, and career goals. Takes less than 5 minutes.' },
    { num: '02', title: 'AI Generates Resume', desc: 'Our AI builds a professional, ATS-friendly resume tailored to your profile and target role.' },
    { num: '03', title: 'Paste Job Description', desc: 'Copy-paste any job listing from Naukri, LinkedIn, or any job board.' },
    { num: '04', title: 'Get ATS Score', desc: 'See your compatibility score and a breakdown of matching vs. missing requirements.' },
    { num: '05', title: 'Apply AI Suggestions', desc: 'One-click improvements — add missing keywords, rephrase bullets, boost your score.' },
    { num: '06', title: 'Export & Apply', desc: 'Download a pixel-perfect PDF and start applying with confidence. Track your applications.' },
  ]

  return (
    <section id="how-it-works" className="section-pad bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-indigo mb-4">✦ How It Works</span>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mt-3 mb-4">
            Get hired in
            <span className="gradient-text"> 6 simple steps</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            From blank page to interview-ready resume in under 10 minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative glass-card-hover p-6"
            >
              <div className="font-display font-black text-6xl text-primary-100 mb-3 leading-none">
                {step.num}
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-primary-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Benefits Section ──────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    { icon: '⚡', title: 'Save 10+ Hours', desc: 'What takes days now takes minutes. AI does the heavy lifting.' },
    { icon: '📈', title: 'Better Resume Quality', desc: 'Professional language, ATS-friendly format, tailored content.' },
    { icon: '🎯', title: 'Higher Interview Rate', desc: 'Resumes optimized for ATS get 3x more interview callbacks.' },
    { icon: '🤖', title: 'Full AI Automation', desc: 'From generation to suggestions — everything is automated.' },
    { icon: '🔍', title: 'Smart Job Matching', desc: 'Know before you apply if your profile fits the requirement.' },
    { icon: '🇮🇳', title: 'Built for India', desc: 'Understands Indian job markets, formats, and top recruiters.' },
  ]

  return (
    <section id="benefits" className="section-pad bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
      </div>
      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-4">
            Why professionals choose
            <br />
            ResumeAI
          </h2>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            Join 50,000+ candidates who landed their dream jobs with us
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{b.title}</h3>
              <p className="text-primary-200 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer @ Google', img: 'P', color: 'from-primary-400 to-primary-600', quote: 'ResumeAI increased my ATS score from 54% to 91%. I got 8 interview calls in the first week after updating my resume.' },
    { name: 'Rajan Mehta', role: 'Product Manager @ Flipkart', img: 'R', color: 'from-accent-400 to-accent-600', quote: "The job match analyzer is incredible. It told me exactly what skills I was missing and I upskilled for them. Got the job I wanted!" },
    { name: 'Ananya Singh', role: 'Data Analyst @ Razorpay', img: 'A', color: 'from-rose-400 to-rose-600', quote: "As a fresher, I had no idea how to write a resume. ResumeAI built a professional one in 3 minutes. I'm now placed at a top fintech startup!" },
  ]

  return (
    <section className="section-pad bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-green mb-4">✦ Success Stories</span>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mt-3">
            Real results from
            <span className="gradient-text"> real people</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card-hover p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.img}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ───────────────────────────────────────────────────────────────
function CTASection({ authTarget }) {
  return (
    <section className="section-pad bg-section-alt">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center max-w-3xl mx-auto shadow-glass-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-green">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-4xl text-slate-900 mb-4">
            Ready to transform
            <br />
            <span className="gradient-text">your career?</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join 50,000+ professionals who use ResumeAI daily. Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={authTarget} className="btn-primary text-base px-8 py-4">
              <Sparkles className="w-5 h-5" />
              Start Building Free
            </Link>
            <button className="btn-secondary text-base px-8 py-4">
              View Templates
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-6">
            ✓ No credit card required &nbsp;·&nbsp; ✓ Free ATS scan &nbsp;·&nbsp; ✓ Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container-max px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Resume<span className="text-primary-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered resume builder built for India's growing workforce.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Resume Builder', 'Job Matcher', 'ATS Checker', 'Templates'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Support', links: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm hover:text-primary-400 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 ResumeAI. Built with ❤️ for India.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth()
  const authTarget = user ? '/dashboard' : '/auth'

  return (
    <div className="min-h-screen">
      <Navbar authTarget={authTarget} />
      <HeroSection authTarget={authTarget} />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <CTASection authTarget={authTarget} />
      <Footer />
    </div>
  )
}
