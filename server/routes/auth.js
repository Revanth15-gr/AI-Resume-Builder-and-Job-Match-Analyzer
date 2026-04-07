import { Router } from 'express'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { protect, generateToken } from '../middleware/auth.js'
import { isDbConnected } from '../config/db.js'
import { env } from '../config/env.js'
import { sendVerificationEmail } from '../services/email.js'

const router = Router()
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const getVerificationTokenHash = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const issueVerificationToken = () => {
  const plainToken = crypto.randomBytes(32).toString('hex')
  return {
    plainToken,
    tokenHash: getVerificationTokenHash(plainToken),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }
}

const buildVerificationLink = (email, token) => {
  return `${env.APP_BASE_URL.replace(/\/$/, '')}/auth?mode=verify&email=${encodeURIComponent(email)}&token=${token}`
}

const sendVerification = async (user) => {
  const verification = issueVerificationToken()
  user.emailVerificationToken = verification.tokenHash
  user.emailVerificationExpires = verification.expiresAt
  await user.save()

  const verificationLink = buildVerificationLink(user.email, verification.plainToken)
  const emailResult = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationLink,
  })

  return { verificationLink, emailSent: emailResult.sent }
}

router.use((req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({ success: false, message: 'Database unavailable. Auth service is temporarily offline.' })
  }
  next()
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' })
    }

    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      authProvider: 'local',
      isEmailVerified: false,
    })

    const verificationResult = await sendVerification(user)

    res.status(201).json({
      success: true,
      message: verificationResult.emailSent
        ? 'Account created. Check your inbox to verify your email.'
        : 'Account created. We could not send the email right now, so use the fallback verification link shown below.',
      emailSent: verificationResult.emailSent,
      ...(verificationResult.error ? { emailError: verificationResult.error } : {}),
      ...(env.NODE_ENV !== 'production' && !verificationResult.emailSent
        ? { devVerificationLink: verificationResult.verificationLink }
        : {}),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (user?.authProvider === 'google' && !user.password) {
      return res.status(400).json({ success: false, message: 'This account uses Google sign-in. Please continue with Google.' })
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before signing in.',
      })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Email and token are required' })
    }

    const tokenHash = getVerificationTokenHash(token)
    const user = await User.findOne({
      email: normalizedEmail,
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = ''
    user.emailVerificationExpires = null
    await user.save()

    res.json({ success: true, message: 'Email verified successfully. You can sign in now.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email' })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' })
    }

    const verificationResult = await sendVerification(user)
    res.json({
      success: true,
      message: verificationResult.emailSent
        ? 'Verification email sent'
        : 'We could not send the email right now, so use the fallback verification link shown below.',
      emailSent: verificationResult.emailSent,
      ...(verificationResult.error ? { emailError: verificationResult.error } : {}),
      ...(env.NODE_ENV !== 'production' && !verificationResult.emailSent
        ? { devVerificationLink: verificationResult.verificationLink }
        : {}),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google auth is not configured on server' })
    }

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const email = payload?.email
    const emailVerified = payload?.email_verified
    const googleId = payload?.sub

    if (!email || !emailVerified || !googleId) {
      return res.status(400).json({ success: false, message: 'Unable to verify Google account' })
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        name: payload?.name || email.split('@')[0],
        email,
        avatar: payload?.picture || '',
        authProvider: 'google',
        googleId,
        isEmailVerified: true,
      })
    } else {
      let needsSave = false
      if (!user.googleId) {
        user.googleId = googleId
        needsSave = true
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true
        user.emailVerificationToken = ''
        user.emailVerificationExpires = null
        needsSave = true
      }
      if (!user.avatar && payload?.picture) {
        user.avatar = payload.picture
        needsSave = true
      }
      if (needsSave) {
        await user.save()
      }
    }

    const token = generateToken(user._id)
    res.json({ success: true, token, user: user.toJSON() })
  } catch (err) {
    res.status(401).json({ success: false, message: 'Google sign-in failed' })
  }
})

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'location', 'currentRole', 'targetRole', 'targetCompanies', 'experienceLevel', 'workMode', 'avatar', 'preferences']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' })
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
