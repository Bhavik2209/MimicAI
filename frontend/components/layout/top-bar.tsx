"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/hooks/use-theme"
import { Sun2, Moon } from "@/components/ui/solar-icons"
import { AltArrowDown, Logout, Settings } from "@solar-icons/react"
import { authClient } from "@/lib/auth/client"
import { UserAvatar } from "@/components/auth/user-avatar"
import { Logo } from "@/components/ui/logo"
import { toast } from "@/hooks/use-toast"

interface TopBarProps {
  onSettingsClick?: () => void
  onLogoClick?: () => void
  background?: string
}

export function TopBar({ onSettingsClick, onLogoClick, background }: Readonly<TopBarProps>) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { data: session } = authClient.useSession()
  const [logoHovered, setLogoHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const userName = session?.user.name?.trim() || session?.user.email || "User"
  const avatarSeed = session?.user.id || userName

  useEffect(() => {
    router.prefetch("/")
  }, [router])

  const handleSignOut = async () => {
    if (isSigningOut) return

    setMenuOpen(false)
    setIsSigningOut(true)

    try {
      await authClient.signOut()
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("Sign-out failed", error)
      setIsSigningOut(false)
      toast({
        title: "Sign-out failed",
        description: "Authentication service is temporarily unavailable. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    globalThis.addEventListener("mousedown", handlePointerDown)
    return () => globalThis.removeEventListener("mousedown", handlePointerDown)
  }, [menuOpen])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: "var(--topbar-h)",
        background: background || "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left — Unified Logo Lockup */}
      <button
        type="button"
        className={onLogoClick ? "cursor-pointer" : ""}
        onClick={onLogoClick}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        aria-label="Go to landing page"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Logo
            style={{
              height: 20,
              width: "auto",
              flexShrink: 0,
              color: "var(--gold)",
              transition: "transform 0.3s ease",
              transform: logoHovered ? "scale(1.04)" : "scale(1)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-1)",
              lineHeight: 1,
            }}
          >
            Mimic
          </span>
        </div>
      </button>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center"
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
            aria-label="Settings"
          >
            <Settings size={18} color="var(--text-3)" />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center"
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark"
            ? <Sun2 size={18} weight="Bold" color="#fbbf24" />
            : <Moon size={18} weight="Bold" color="#6366f1" />
          }
        </button>
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full"
            style={{
              height: 36,
              padding: "0 4px 0 2px",
              background: "transparent",
              border: "1px solid var(--border)",
              cursor: isSigningOut ? "wait" : "pointer",
              opacity: isSigningOut ? 0.72 : 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            disabled={isSigningOut}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "999px",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--header-avatar-bg)",
              }}
            >
              <UserAvatar
                value={avatarSeed}
                alt={userName}
                size={30}
              />
            </span>
            <AltArrowDown size={14} color="var(--text-3)" />
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: 44,
                right: 0,
                minWidth: 190,
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--surface-1)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
                padding: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px 10px",
                  borderBottom: "1px solid var(--border-soft)",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--header-avatar-bg)",
                    flexShrink: 0,
                  }}
                >
                  <UserAvatar
                    value={avatarSeed}
                    alt={userName}
                    size={32}
                  />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{userName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {session?.user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full rounded-[10px]"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: isSigningOut ? "wait" : "pointer",
                  padding: "10px 12px",
                  color: "var(--text-2)",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: isSigningOut ? 0.72 : 1,
                }}
                disabled={isSigningOut}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)"
                  e.currentTarget.style.color = "var(--text-1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "var(--text-2)"
                }}
              >
                <Logout size={16} color="currentColor" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
