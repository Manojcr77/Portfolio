const express       = require("express")
const mongoose      = require("mongoose")
const cors          = require("cors")
const dotenv        = require("dotenv")
const helmet        = require("helmet")
const rateLimit     = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const bcrypt        = require("bcryptjs")
const dns           = require("dns")

dns.setDefaultResultOrder("ipv4first")
dotenv.config()

if (!process.env.MONGO_URI)  throw new Error("MONGO_URI is required")
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required")

const app   = express()
const isDev = process.env.NODE_ENV !== "production"

// ── Security headers
app.use(helmet())

// ── CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(isDev ? ["http://localhost:5173", "http://localhost:5174"] : [])
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin && isDev) return callback(null, true)
    if (origin && allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error("Not allowed by CORS"))
  },
  credentials: true
}))

app.use(express.json({ limit: "10kb" }))
app.use(mongoSanitize())

// ── Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests from this IP, try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
})

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Too many messages sent, try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
})

app.use(generalLimiter)

// ── MongoDB connection (cached for serverless)
let isConnected = false

async function connectDB() {
  if (isConnected) return
  await mongoose.connect(process.env.MONGO_URI)
  isConnected = true
  console.log("✅  MongoDB connected")
  await ensureAdmin()
}

// ── Routes (wrapped with DB connect middleware)
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error("❌  DB connection failed:", err.message)
    res.status(500).json({ message: "Database connection failed" })
  }
})

app.use("/api/auth",    authLimiter,    require("./routes/auth"))
app.use("/api/about",                   require("./routes/about"))
app.use("/api/skills",                  require("./routes/skills"))
app.use("/api/projects",                require("./routes/projects"))
app.use("/api/contact", contactLimiter, require("./routes/contact"))
app.use("/api/resume",                  require("./routes/resume"))

// ── Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }))

// ── Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  const status = err.status || 500
  res.status(status).json({ message: isDev ? err.message : "Something went wrong" })
})

// ── Auto-create admin
const User = require("./models/User")

async function ensureAdmin() {
  try {
    const email    = process.env.ADMIN_EMAIL || "admin@manoj.dev"
    const password = process.env.ADMIN_PASSWORD

    if (!password) {
      console.warn("⚠️  ADMIN_PASSWORD not set — skipping admin creation")
      return
    }

    const exists = await User.findOne({ email })
    if (!exists) {
      const hashed = await bcrypt.hash(password, 12)
      await User.create({ name: "Admin", email, password: hashed, role: "admin", isAdmin: true })
      console.log("✅  Admin user created →", email)
    } else {
      console.log("ℹ️  Admin already exists, skipping")
    }
  } catch (err) {
    console.error("❌  ensureAdmin error:", err.message)
  }
}

// ── Local dev only
if (isDev) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log("🚀  Server running on port " + PORT))
}

// ── Vercel needs this
module.exports = app