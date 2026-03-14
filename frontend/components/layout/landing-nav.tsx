"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Menu, X } from "lucide-react"
import { Logo } from "@/components/ui/logo"

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features",     href: "#use-cases" },
  { label: "Personas",     href: "#profile-preview" },
  { label: "Pricing",      href: "#pricing" },
]

interface LandingNavProps {
  onTryMimic: () => void
}

export function LandingNav({ onTryMimic }: Readonly<LandingNavProps>) {
  const [theme, setTheme] = useState<"dark" | "light">("light")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("mimic.theme") as "dark" | "light" | null
    const initial = saved === "dark" ? "dark" : "light"
    setTheme(initial)
    document.documentElement.dataset.theme = initial
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem("mimic.theme", next)
  }

  const grainUrl =
    theme === "dark"
      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='0.8'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 0 0 0 -4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='0.8'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 0 0 0 -4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.03'/%3E%3C/svg%3E")`

  let headerBg: string
  if (theme === "dark") {
    headerBg = scrolled ? "rgba(20,20,30,0.88)" : "rgba(20,20,30,0.76)"
  } else {
    headerBg = scrolled ? "rgba(238,236,234,0.90)" : "rgba(238,236,234,0.80)"
  }

  const headerBorder =
    theme === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(25,23,46,0.10)"

  const navShadow =
    theme === "dark"
      ? "0 4px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 4px 20px rgba(25,23,46,0.10), inset 0 1px 0 rgba(255,255,255,0.70)"

  return (
    <>
      <header
        className="fixed z-50"
        style={{
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 48px)",
          maxWidth: 1160,
          height: 60,
          background: `${grainUrl}, ${headerBg}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${headerBorder}`,
          borderRadius: 12,
          boxShadow: navShadow,
          transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ height: "100%", maxWidth: 1200, padding: "0 32px" }}
        >
          {/* LEFT — Logo + wordmark */}
          <a
            href="#hero"
            className="flex items-center gap-2 shrink-0"
            style={{ textDecoration: "none" }}
          >
            <Logo
              style={{
                height: 20,
                width: "auto",
                flexShrink: 0,
                color: "var(--gold)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--text-1)",
              }}
            >
              Mimic<span style={{ color: "var(--gold)", fontWeight: 400 }}>AI</span>
            </span>
          </a>

          {/* CENTER — Nav links */}
          <nav className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={onTryMimic}
              className="hidden sm:inline-flex btn btn-primary"
              style={{ fontSize: 13, padding: "8px 18px" }}
            >
              Get started
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-md md:hidden transition-all"
              style={{
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--text-2)",
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ top: 76 }}>
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 w-full h-full cursor-default"
            style={{
              background: theme === "dark" ? "rgba(0,0,0,0.55)" : "rgba(25,23,46,0.18)",
              backdropFilter: "blur(3px)",
              border: "none",
            }}
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="relative flex flex-col gap-0.5 p-3"
            style={{
              background: `${grainUrl}, ${theme === "dark" ? "rgba(20,20,30,0.95)" : "rgba(238,236,234,0.97)"}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${headerBorder}`,
              borderRadius: 12,
              margin: "8px 24px",
              boxShadow: navShadow,
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium px-4 py-3 rounded-lg"
                style={{ color: "var(--text-1)", textDecoration: "none", letterSpacing: "-0.01em" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--control-bg)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
              >
                {link.label}
              </a>
            ))}
            <div className="h-px my-2" style={{ background: "var(--border)" }} />
            <button
              onClick={() => { setMobileOpen(false); onTryMimic() }}
              className="btn btn-primary w-full"
              style={{ fontSize: 14 }}
            >
              Get started
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
