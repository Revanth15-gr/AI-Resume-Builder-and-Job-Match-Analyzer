const API_ROOT = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api'

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('resumeai_token') || null
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('resumeai_token', token)
    } else {
      localStorage.removeItem('resumeai_token')
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    return headers
  }

  buildUrl(path) {
    if (!path.startsWith('/')) {
      throw new Error('API path must start with /')
    }
    return `${API_ROOT}${API_PREFIX}${path}`
  }

  async request(method, path, body = null) {
    const opts = { method, headers: this.getHeaders() }
    if (body) opts.body = JSON.stringify(body)

    const res = await fetch(this.buildUrl(path), opts)
    const isJson = (res.headers.get('content-type') || '').includes('application/json')
    const data = isJson ? await res.json() : null

    if (!res.ok) {
      const message = data?.message || data?.error?.message || `Request failed: ${res.status}`
      const error = new Error(message)
      error.status = res.status
      throw error
    }

    return data || { success: true }
  }

  // ─── Auth ───
  register(name, email, password) { return this.request('POST', '/auth/register', { name, email, password }) }
  login(email, password) { return this.request('POST', '/auth/login', { email, password }) }
  getProfile() { return this.request('GET', '/auth/me') }
  updateProfile(updates) { return this.request('PUT', '/auth/profile', updates) }
  changePassword(currentPassword, newPassword) { return this.request('PUT', '/auth/password', { currentPassword, newPassword }) }

  // ─── Resumes ───
  getResumes() { return this.request('GET', '/resumes') }
  async getLatestResume() {
    const response = await this.getResumes()
    const resume = Array.isArray(response?.resumes) && response.resumes.length ? response.resumes[0] : null
    return { ...response, resume }
  }
  getResume(id) { return this.request('GET', `/resumes/${id}`) }
  createResume(data) { return this.request('POST', '/resumes', data) }
  updateResume(id, data) { return this.request('PUT', `/resumes/${id}`, data) }
  deleteResume(id) { return this.request('DELETE', `/resumes/${id}`) }
  generateResume(id) { return this.request('POST', `/resumes/${id}/generate`) }
  scanATS(id, jobDescription) { return this.request('POST', `/resumes/${id}/ats-scan`, { jobDescription }) }
  suggestSkills(id, targetRole) { return this.request('POST', `/resumes/${id}/suggest-skills`, { targetRole }) }
  generateResumeAI(payload) { return this.request('POST', '/resumes/generate-ai', payload) }
  atsScanDirect(resumeData, jobDescription) { return this.request('POST', '/resumes/ats-scan-direct', { resumeData, jobDescription }) }
  matchDirect(jobDescription, skills) { return this.request('POST', '/resumes/match-direct', { jobDescription, skills }) }

  // ─── Jobs ───
  getJobs(stage) { return this.request('GET', stage ? `/jobs?stage=${stage}` : '/jobs') }
  addJob(data) { return this.request('POST', '/jobs', data) }
  updateJob(id, data) { return this.request('PUT', `/jobs/${id}`, data) }
  deleteJob(id) { return this.request('DELETE', `/jobs/${id}`) }
  analyzeJob(jobDescription, resumeId, resumeData) { return this.request('POST', '/jobs/analyze', { jobDescription, resumeId, resumeData }) }
  getJobStats() { return this.request('GET', '/jobs/stats') }

  // ─── Analytics ───
  getDashboard() { return this.request('GET', '/analytics/dashboard') }
  getScoreHistory() { return this.request('GET', '/analytics/score-history') }
  getSkillGaps() { return this.request('GET', '/analytics/skill-gaps') }
  getAnalyticsInsights() { return this.request('GET', '/analytics/insights') }

  // ─── Health ───
  health() { return this.request('GET', '/health') }
}

export const api = new ApiClient()
export default api
