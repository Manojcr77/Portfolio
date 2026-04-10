// pages/Admin.jsx — Full admin dashboard: messages, about, skills, projects, resume, change password

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  FiLogOut, FiMail, FiUser, FiCode, FiCpu,
  FiPlus, FiTrash2, FiSave, FiUpload, FiFileText,
  FiExternalLink, FiRefreshCw, FiLock, FiEye, FiEyeOff
} from "react-icons/fi"
import API from "../utils/api"
import ResumeManager from "../components/admin/ResumeManager"

/* ── reusable section wrapper ─────────────────────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800">
        <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="text-blue-600" size={16} />
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function Admin() {
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.replace("/")
    }
  }, [])

  const [messages,    setMessages]    = useState([])
  const [projects,    setProjects]    = useState([])
  const [skills,      setSkills]      = useState([])
  const [about,       setAbout]       = useState("")
  const [skillName,   setSkillName]   = useState("")
  const [skillLevel,  setSkillLevel]  = useState(80)
  const [skillCat,    setSkillCat]    = useState("General")
  const [preview,     setPreview]     = useState(null)
  const [image,       setImage]       = useState(null)
  const [loading,     setLoading]     = useState(false)

  const [pForm, setPForm] = useState({
    title: "", tech: "", description: "", github: "", live: ""
  })

  // Change password state
  const [pwForm,    setPwForm]    = useState({ current: "", next: "", confirm: "" })
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw,    setShowPw]    = useState({ current: false, next: false, confirm: false })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = () => {
    fetchMessages()
    fetchProjects()
    fetchSkills()
    fetchAbout()
  }

  /* ── Contact ──────────────────────────────────────────────────────────── */
  const fetchMessages = async () => {
    try {
      const res = await API.get("/contact")
      setMessages(Array.isArray(res.data) ? res.data : [])
    } catch { setMessages([]) }
  }

  const deleteMessage = async (id) => {
    setLoading(true)
    try {
      await API.delete(`/contact/${id}`)
      toast.success("Message deleted")
      fetchMessages()
    } catch { toast.error("Failed to delete") }
    finally { setLoading(false) }
  }

  /* ── About ────────────────────────────────────────────────────────────── */
  const fetchAbout = async () => {
    try {
      const res = await API.get("/about")
      setAbout(res.data?.description || "")
    } catch {}
  }

  const updateAbout = async () => {
    setLoading(true)
    try {
      await API.put("/about", { description: about })
      toast.success("About section updated!")
    } catch { toast.error("Update failed") }
    finally { setLoading(false) }
  }

  /* ── Skills ───────────────────────────────────────────────────────────── */
  const fetchSkills = async () => {
    try {
      const res = await API.get("/skills")
      setSkills(Array.isArray(res.data) ? res.data : [])
    } catch { setSkills([]) }
  }

  const addSkill = async () => {
    if (!skillName.trim()) { toast.error("Skill name required"); return }
    setLoading(true)
    try {
      await API.post("/skills", { name: skillName, level: Number(skillLevel), category: skillCat })
      toast.success("Skill added!")
      setSkillName("")
      setSkillLevel(80)
      fetchSkills()
    } catch { toast.error("Failed to add skill") }
    finally { setLoading(false) }
  }

  const deleteSkill = async (id) => {
    setLoading(true)
    try {
      await API.delete(`/skills/${id}`)
      toast.success("Skill removed")
      fetchSkills()
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  /* ── Projects ─────────────────────────────────────────────────────────── */
  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects")
      setProjects(Array.isArray(res.data) ? res.data : [])
    } catch { setProjects([]) }
  }

  const handleImage = (e) => {
    const f = e.target.files[0]
    setImage(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  const addProject = async () => {
    const { title, tech, description } = pForm
    if (!title.trim() || !tech.trim() || !description.trim()) {
      toast.error("Title, tech and description are required"); return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(pForm).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append("image", image)
      await API.post("/projects", fd)
      toast.success("Project added!")
      setPForm({ title: "", tech: "", description: "", github: "", live: "" })
      setImage(null); setPreview(null)
      fetchProjects()
    } catch { toast.error("Failed to add project") }
    finally { setLoading(false) }
  }

  const deleteProject = async (id) => {
    setLoading(true)
    try {
      await API.delete(`/projects/${id}`)
      toast.success("Project deleted")
      fetchProjects()
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  /* ── Change Password ──────────────────────────────────────────────────── */
  const changePassword = async () => {
    const { current, next, confirm } = pwForm
    if (!current || !next || !confirm) { toast.error("All password fields are required"); return }
    if (next.length < 6)              { toast.error("New password must be at least 6 characters"); return }
    if (next !== confirm)             { toast.error("New passwords do not match"); return }

    setPwLoading(true)
    try {
      await API.put("/auth/change-password", { currentPassword: current, newPassword: next })
      toast.success("Password changed! Logging you out…")
      localStorage.removeItem("token")
      setTimeout(() => { window.location.href = "/" }, 1500)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password")
    } finally {
      setPwLoading(false)
    }
  }

  /* ── Logout ───────────────────────────────────────────────────────────── */
  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div className="admin-surface min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 font-mono">manoj.dev / admin</p>
          </div>
          <div className="flex gap-3 items-center">
            {loading && <span className="text-xs text-blue-500 animate-pulse">Processing…</span>}
            <button
              onClick={fetchAll}
              className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition"
              title="Refresh all"
            >
              <FiRefreshCw size={15} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── MESSAGES ───────────────────────────────────────────────────── */}
        <Section icon={FiMail} title={`Contact Messages (${messages.length})`}>
          {messages.length === 0
            ? <p className="text-gray-400 text-sm">No messages yet.</p>
            : messages.map((m) => (
              <div key={m._id} className="border border-gray-100 rounded-xl p-4 mb-3 flex justify-between items-start bg-gray-50">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-semibold text-gray-800 text-sm">{m.name}</p>
                  <p className="text-blue-600 text-xs">{m.email}</p>
                  <p className="text-gray-600 text-sm mt-1">{m.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => deleteMessage(m._id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
        </Section>

        {/* ── ABOUT ──────────────────────────────────────────────────────── */}
        <Section icon={FiUser} title="About Section">
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={5}
            placeholder="Write your bio here…"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />
          <button
            onClick={updateAbout}
            className="mt-3 flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm transition"
          >
            <FiSave size={13} /> Save About
          </button>
        </Section>

        {/* ── SKILLS ─────────────────────────────────────────────────────── */}
        <Section icon={FiCpu} title="Skills">
          <div className="grid sm:grid-cols-4 gap-2 mb-4">
            <input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Skill name"
              className="sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="number"
              min={0} max={100}
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              placeholder="Level %"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
            <select
              value={skillCat}
              onChange={(e) => setSkillCat(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              {["AI/ML","Frontend","Backend","Cloud","DevOps","General"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={addSkill}
            className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 text-sm transition mb-4"
          >
            <FiPlus size={13} /> Add Skill
          </button>

          <div className="grid sm:grid-cols-2 gap-2">
            {skills.map((s) => (
              <div key={s._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{s.level ?? 80}% · {s.category}</span>
                </div>
                <button onClick={() => deleteSkill(s._id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* ── PROJECTS ───────────────────────────────────────────────────── */}
        <Section icon={FiCode} title="Projects">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {[
              { name: "title",       placeholder: "Project Title",    span: "sm:col-span-2" },
              { name: "tech",        placeholder: "Tech Stack (e.g. React · Node.js)" },
              { name: "github",      placeholder: "GitHub URL" },
              { name: "live",        placeholder: "Live Demo URL" },
            ].map(({ name, placeholder, span = "" }) => (
              <input
                key={name}
                value={pForm[name]}
                onChange={(e) => setPForm({ ...pForm, [name]: e.target.value })}
                placeholder={placeholder}
                className={`${span} border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400`}
              />
            ))}
            <textarea
              value={pForm.description}
              onChange={(e) => setPForm({ ...pForm, description: e.target.value })}
              placeholder="Project Description"
              rows={3}
              className="sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Image upload */}
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-3 cursor-pointer hover:border-blue-400 transition mb-3 w-fit">
            <FiUpload className="text-gray-400" />
            <span className="text-sm text-gray-500">{image ? image.name : "Upload project image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
          {preview && <img src={preview} alt="preview" className="w-40 mb-3 rounded-xl object-cover" />}

          <button
            onClick={addProject}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm transition mb-6"
          >
            <FiPlus size={13} /> Add Project
          </button>

          {/* Project list */}
          <div className="flex flex-col gap-3">
            {projects.map((p) => (
              <div key={p._id} className="border border-gray-100 rounded-xl p-4 flex gap-4 items-start bg-gray-50">
                {p.image && (
                  <img src={p.image} alt={p.title} className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{p.title}</p>
                  <p className="text-xs text-blue-600 mb-1">{p.tech}</p>
                  <p className="text-gray-500 text-xs line-clamp-2">{p.description}</p>
                  <div className="flex gap-3 mt-1">
                    {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-0.5">GitHub <FiExternalLink size={10}/></a>}
                    {p.live   && <a href={p.live}   target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-0.5">Live <FiExternalLink size={10}/></a>}
                  </div>
                </div>
                <button onClick={() => deleteProject(p._id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition flex-shrink-0">
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* ── RESUME ─────────────────────────────────────────────────────── */}
        <ResumeManager />

        {/* ── CHANGE PASSWORD ────────────────────────────────────────────── */}
        <Section icon={FiLock} title="Change Password">
          <p className="text-xs text-gray-400 mb-4">
            After saving, you will be logged out automatically. Use the new password to log back in.
            The old password will <strong>no longer work</strong>.
          </p>

          {[
            { key: "current", label: "Current Password",    placeholder: "Enter your current password" },
            { key: "next",    label: "New Password",         placeholder: "At least 6 characters" },
            { key: "confirm", label: "Confirm New Password", placeholder: "Re-enter new password" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={showPw[key] ? "text" : "password"}
                  value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, [key]: !showPw[key] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw[key] ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={changePassword}
            disabled={pwLoading}
            className="mt-2 flex items-center gap-1.5 bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 text-sm transition disabled:opacity-50"
          >
            <FiLock size={13} />
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </Section>

      </div>
    </div>
  )
}