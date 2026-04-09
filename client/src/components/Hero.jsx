import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TypeAnimation } from "react-type-animation"
import { FiDownload, FiArrowDown, FiMail, FiLock, FiX } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import API from "../utils/api"

const btnBase = {
  padding: "12px 24px",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
  transition: "all 0.3s",
  fontFamily: "inherit",
}

export default function Hero() {
  const [resumeUrl, setResumeUrl] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [password,  setPassword]  = useState("")
  const [error,     setError]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    API.get("/resume").then((res) => {
      if (res.data?.path) {
  // Force proper PDF download from Cloudinary
  const url = res.data.path.replace("/upload/", "/upload/fl_attachment/")
  setResumeUrl(url)
}
    }).catch(() => {})
  }, [])

  const handleLogin = async () => {
    if (!password.trim()) { setError("Enter password"); return }
    setLoading(true)
    setError("")
    try {
      const res = await API.post("/auth/admin-login", { password })
      localStorage.setItem("token", res.data.token)
      setShowModal(false)
      setPassword("")
      window.open("/admin", "_blank")
    } catch (err) {
      const msg = err.response?.data?.message || "Wrong password. Try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px 40px",
        position: "relative",
      }}
    >
      {/* ── Password Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{    opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                background: "#0d1117",
                border: "1px solid rgba(34,211,238,0.2)",
                borderRadius: 20,
                padding: "36px 32px",
                width: "100%",
                maxWidth: 360,
                position: "relative",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => { setShowModal(false); setPassword(""); setError("") }}
                style={{
                  position: "absolute", top: 16, right: 16,
                  background: "transparent", border: "none",
                  color: "#475569", cursor: "pointer", padding: 4,
                }}
              >
                <FiX size={18} />
              </button>

              {/* Lock icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(34,211,238,0.08)",
                border: "1px solid rgba(34,211,238,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <FiLock size={20} color="#22d3ee" />
              </div>

              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700,
                fontSize: 20, color: "#f1f5f9", marginBottom: 6,
              }}>
                Admin Access
              </h2>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
                Enter password to continue
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Password"
                autoFocus
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${error ? "#f87171" : "rgba(34,211,238,0.2)"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "#f1f5f9",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: error ? 8 : 20,
                }}
              />

              {error && (
                <p style={{ color: "#f87171", fontSize: 12, marginBottom: 16 }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #0e7490, #5b21b6)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  borderRadius: 10,
                  padding: "12px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: "inherit",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Verifying…" : "Enter Dashboard"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          border: "1px solid rgba(57,255,20,0.2)",
          color: "rgba(57,255,20,0.8)",
          fontSize: 11,
          letterSpacing: "0.15em",
          fontFamily: "JetBrains Mono, monospace",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#39ff14", animation: "pulse-dot 2s infinite" }} />
        OPEN TO OPPORTUNITIES
      </motion.div>

    <motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.1 }}
  style={{
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(2.2rem, 10vw, 6rem)",
    fontWeight: 800,
    lineHeight: 1.3,
    marginBottom: 16,
    whiteSpace: "nowrap",
    background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }}
>
  Manoj.CR
  <span
    onClick={() => setShowModal(true)}
    style={{ cursor: "default" }}
  >.</span>
</motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "clamp(0.9rem, 4vw, 1.6rem)",
          fontWeight: 600,
          color: "#22d3ee",
          marginBottom: 20,
          height: 36,
          overflow: "hidden",
        }}
      >
        <TypeAnimation
          sequence={[
            "AI & Machine Learning Engineer", 2000,
            "MERN Stack Developer", 2000,
            "Cloud Computing Enthusiast", 2000,
            "4th Year AIML Student", 2000,
          ]}
          repeat={Infinity}
          cursor={true}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          color: "#94a3b8",
          maxWidth: 520,
          fontSize: "clamp(0.8rem, 3vw, 1rem)",
          lineHeight: 1.7,
          marginBottom: 36,
          padding: "0 8px",
        }}
      >
        Building intelligent systems at the intersection of
        {" "}<span style={{ color: "#a78bfa" }}>AI/ML</span>,
        {" "}<span style={{ color: "#22d3ee" }}>full-stack development</span>, and
        {" "}<span style={{ color: "#39ff14" }}>cloud infrastructure</span>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 48 }}
      >
        <button
          onClick={() => { window.location.href = "#projects" }}
          style={{ ...btnBase, color: "#fff", background: "linear-gradient(135deg, #0e7490, #5b21b6)", border: "1px solid rgba(34,211,238,0.4)" }}
        >
          View Projects
        </button>

        <button
          onClick={() => { if (resumeUrl) window.open(resumeUrl, "_blank") }}
          style={{ ...btnBase, color: "#22d3ee", background: "transparent", border: "1px solid rgba(34,211,238,0.5)", opacity: resumeUrl ? 1 : 0.4, cursor: resumeUrl ? "pointer" : "not-allowed" }}
        >
          <FiDownload size={14} />
          Resume
        </button>

        <button
          onClick={() => { window.location.href = "#contact" }}
          style={{ ...btnBase, color: "#94a3b8", background: "transparent", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <FiMail size={14} />
          Contact
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "#334155",
        }}
      >
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.2em" }}>SCROLL</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <FiArrowDown size={16} />
        </motion.div>
      </motion.div>

    </section>
  )
}