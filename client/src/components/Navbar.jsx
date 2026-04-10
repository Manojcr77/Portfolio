import { useState, useEffect } from "react"
import { FiMenu, FiX } from "react-icons/fi"

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = ["About", "Skills", "Projects"]

  const handleNav = (section) => {
    setMenuOpen(false)
    const el = document.getElementById(section.toLowerCase())
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#020617]/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo — always visible */}
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Manoj.CR
        </span>

        {/* Desktop links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link}>
              <button
                onClick={() => handleNav(link)}
                className="text-sm text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        {/* Hamburger button — visible only on mobile */}
        <button
          className="md:hidden text-gray-300 hover:text-cyan-400 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#020617]/95 backdrop-blur-md border-t border-cyan-900/30 px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => handleNav(link)}
              className="text-left text-sm text-gray-300 hover:text-cyan-400 transition-colors duration-200 py-1"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}