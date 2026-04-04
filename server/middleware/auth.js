import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { isDbConnected } from '../config/db.js'

export const protect = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database unavailable. Try again shortly.' })
    }

    let token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized — no token' })
    }

    const decoded = jwt.verify(token, env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    next()
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized — invalid token' })
  }
}

export const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE })
}
