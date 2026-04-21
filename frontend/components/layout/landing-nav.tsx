"use client"

import { useState, useEffect } from "react"
import {
  Sun2,
  Moon,
  HamburgerMenu,
  CloseSquare,
} from "@solar-icons/react"
import { UserAvatar } from "@/components/auth/user-avatar"
import { Logo } from "@/components/ui/logo"

const NAV_LINKS = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Personas", href: "#profile-preview" },
  { label: "FAQ", href: "#faq" },
]

interface LandingNavProps {
  onTryMimic: () => void
  isSignedIn: boolean
  isAuthPending?: boolean
  userId?: string
  userName: string
  onOpenDashboard: () => void
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.5 14.5 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12Z"/>
      <path fill="#34A853" d="M3.6 7.4 6.8 9.8C7.7 7.7 9.7 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.5 14.5 2.5 12 2.5 8.3 2.5 5.1 4.6 3.6 7.4Z"/>
      <path fill="#FBBC05" d="M12 21.5c2.4 0 4.4-.8 5.9-2.3l-2.7-2.2c-.7.5-1.7 1-3.2 1-3.8 0-5.1-2.5-5.4-3.8l-3.2 2.5c1.5 2.9 4.5 4.8 8.6 4.8Z"/>
      <path fill="#4285F4" d="M21.1 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.2 1.1-1 2-2 2.6l2.7 2.2c1.6-1.5 3-4.2 3-7.1Z"/>
    </svg>
  )
}

export function LandingNav({
  onTryMimic,
  isSignedIn,
  isAuthPending = false,
  userId,
  userName,
  onOpenDashboard,
}: Readonly<LandingNavProps>) {
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
    headerBg = scrolled ? "rgba(18,18,18,0.95)" : "rgba(18,18,18,0.85)"
  } else {
    headerBg = scrolled ? "rgba(238,236,234,0.90)" : "rgba(238,236,234,0.80)"
  }

  const headerBorder =
    theme === "dark"
      ? "rgba(224,224,224,0.10)"
      : "rgba(25,23,46,0.10)"

  const navShadow =
    theme === "dark"
      ? "0 4px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 4px 20px rgba(25,23,46,0.10), inset 0 1px 0 rgba(255,255,255,0.70)"

  // Theme-aware icon colors
  const sunColor = theme === "dark" ? "#fbbf24" : "#d97706"
  const moonColor = theme === "dark" ? "#818cf8" : "#6366f1"
  const menuColor = theme === "dark" ? "#94a3b8" : "#64748b"

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
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--text-1)",
              }}
            >
              Mimic
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
              {theme === "dark" ? (
                <Sun2 size={18} weight="Bold" color={sunColor} />
              ) : (
                <Moon size={18} weight="Bold" color={moonColor} />
              )}
            </button>
            {isSignedIn ? (
              <button
                onClick={onOpenDashboard}
                className="hidden sm:inline-flex items-center justify-center"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  overflow: "hidden",
                  border: `1px solid ${headerBorder}`,
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label="Open dashboard"
                title={userName}
              >
                <UserAvatar
                  value={userId || userName}
                  alt={userName}
                  size={38}
                />
              </button>
            ) : (
              <button
                onClick={onTryMimic}
                className="hidden sm:inline-flex btn btn-primary items-center gap-2"
                style={{ fontSize: 13, padding: "8px 18px" }}
                disabled={isAuthPending}
              >
                <GoogleIcon />
                {isAuthPending ? "Redirecting..." : "Login with Google"}
              </button>
            )}
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
              {mobileOpen
                ? <CloseSquare size={15} weight="Bold" color={menuColor} />
                : <HamburgerMenu size={15} weight="Linear" color={menuColor} />
              }
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
              background: `${grainUrl}, ${theme === "dark" ? "rgba(26,26,26,0.97)" : "rgba(238,236,234,0.97)"}`,
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
            {isSignedIn ? (
              <button
                onClick={() => { setMobileOpen(false); onOpenDashboard() }}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-3"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--control-bg)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "999px",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    flexShrink: 0,
                  }}
                >
                  <UserAvatar
                    value={userId || userName}
                    alt={userName}
                    size={28}
                  />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "var(--text-1)", fontSize: 14, fontWeight: 600 }}>{userName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11 }}>Open dashboard</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); onTryMimic() }}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                style={{ fontSize: 14 }}
                disabled={isAuthPending}
              >
                <GoogleIcon />
                {isAuthPending ? "Redirecting..." : "Login with Google"}
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
