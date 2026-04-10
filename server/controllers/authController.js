const bcrypt = require("bcryptjs")
const jwt    = require("jsonwebtoken")
const User   = require("../models/User")

// In-memory brute-force protection
const attempts  = {}
const MAX       = 5
const LOCK_TIME = 15 * 60 * 1000

function recordFail(ip) {
  const now = Date.now()
  if (!attempts[ip] || now - attempts[ip].first > LOCK_TIME) {
    attempts[ip] = { count: 1, first: now }
  } else {
    attempts[ip].count++
  }
}

function isLocked(ip) {
  const a = attempts[ip]
  if (!a) return false
  if (Date.now() - a.first > LOCK_TIME) { delete attempts[ip]; return false }
  return a.count >= MAX
}

exports.login = async (req, res) => {
  const ip = req.ip
  if (isLocked(ip)) return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." })

  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: "Email and password required" })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) { recordFail(ip); return res.status(401).json({ message: "Invalid credentials" }) }

    const match = await bcrypt.compare(password, user.password)
    if (!match) { recordFail(ip); return res.status(401).json({ message: "Invalid credentials" }) }

    delete attempts[ip]

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({ token })
  } catch (err) {
    console.error("login error:", err.message)
    res.status(500).json({ message: "Server error" })
  }
}

exports.adminLogin = async (req, res) => {
  const ip = req.ip
  if (isLocked(ip)) return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." })

  try {
    const { password } = req.body
    if (!password) return res.status(400).json({ message: "Password required" })

    const user = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (!user) { recordFail(ip); return res.status(401).json({ message: "Invalid credentials" }) }

    const match = await bcrypt.compare(password, user.password)
    if (!match) { recordFail(ip); return res.status(401).json({ message: "Wrong password" }) }

    delete attempts[ip]

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({ token })
  } catch (err) {
    console.error("adminLogin error:", err.message)
    res.status(500).json({ message: "Server error" })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(401).json({ message: "Current password is incorrect" })

    // Hash and save new password — old password will NOT work after this
    const hashed = await bcrypt.hash(newPassword, 12)
    user.password = hashed
    await user.save()

    res.json({ message: "Password updated successfully. Please log in again." })
  } catch (err) {
    console.error("changePassword error:", err.message)
    res.status(500).json({ message: "Server error" })
  }
}