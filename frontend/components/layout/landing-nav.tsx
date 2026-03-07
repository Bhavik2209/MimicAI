"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Menu, X } from "lucide-react"
import { Logo } from "@/components/ui/logo"

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Personas", href: "#profile-preview" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
]

interface LandingNavProps {
  onTryMimic: () => void
}

export function LandingNav({ onTryMimic }: LandingNavProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("mimic.theme") as "dark" | "light" | null
    const initial = saved || "dark"
    setTheme(initial)
    document.documentElement.setAttribute("data-theme", initial)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("mimic.theme", next)
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: 64,
        background: scrolled ? "var(--panel-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(28px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(28px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-soft)" : "1px solid transparent",
        transition: "all 0.35s ease",
      }}
    >
      {/* Absolute-positioned logo — does NOT affect nav layout */}
      {/* Logo lockup — baseline aligned so SVG bottom = text baseline */}
      <a
        href="#hero"
        className="absolute top-0 bottom-0 left-6 md:left-10 flex items-center"
        style={{ textDecoration: "none", zIndex: 1 }}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo
            style={{
              height: 24,
              width: "auto",
              flexShrink: 0,
              color: "var(--gold)",
              transition: "transform 0.3s ease",
              transform: logoHovered ? "scale(1.04)" : "scale(1)",
            }}
          />
          <div className="flex items-center gap-1 font-ui text-[20px] font-bold tracking-tight">
            <span style={{ color: scrolled ? "var(--text-1)" : "var(--text-1)" }}>Mimic</span>
            <span style={{ color: "var(--gold)", fontWeight: 400 }}>AI</span>
          </div>
        </div>
      </a>

      {/* Center — Nav links (desktop only, perfectly centered) */}
      <nav
        className="hidden md:flex items-center justify-center gap-8"
        style={{ height: "100%" }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-sans text-sm font-medium transition-colors"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)" }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right — absolute-positioned actions */}
      <div
        className="absolute top-0 bottom-0 right-6 md:right-10 flex items-center gap-3"
        style={{ zIndex: 1 }}
      >
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={onTryMimic}
          className="hidden sm:inline-flex btn btn-primary text-sm px-5 py-2.5"
        >
          Try Mimic
        </button>

        {/* Mobile menu toggle — hidden on md+ */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center w-9 h-9 border border-soft rounded-[10px] md:hidden transition-all text-text-2 hover:text-gold hover:border-gold hover:bg-gold-dim hover:scale-105"
          style={{ background: "var(--control-bg)", borderColor: "var(--border-soft)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ top: 64 }}>
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="relative flex flex-col gap-1 p-4"
            style={{
              background: "var(--surface-1)",
              borderBottom: "1px solid var(--border-soft)",
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-sans text-base font-medium px-4 py-3 rounded-lg transition-colors"
                style={{ color: "var(--text-1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-dim)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMobileOpen(false); onTryMimic() }}
              className="btn btn-primary mt-2 w-full"
            >
              Try Mimic
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
