"use client"

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
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6"
      style={{
        height: 60,
        background: "rgba(12,14,22,0.7)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Left — Logo + dot */}
      <a href="#hero" className="flex items-center gap-2">
        <span
          className="font-serif"
          style={{
            fontSize: 22,
            fontWeight: 600,
            fontStyle: "italic",
            color: "#F5F7FA",
            letterSpacing: "-0.02em",
          }}
        >
          Mimic
        </span>
        <span
          className="font-serif"
          style={{
            fontSize: 22,
            fontWeight: 600,
            fontStyle: "italic",
            color: "#A3BFFA",
            marginLeft: 2,
            letterSpacing: "-0.02em",
          }}
        >
          AI
        </span>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#A3BFFA",
            boxShadow: "0 0 8px rgba(163,191,250,0.6)",
          }}
        />
      </a>

      {/* Center — Nav links */}
      <nav className="flex-1 flex justify-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-sans text-sm font-medium transition-colors"
            style={{ color: "#94A3B8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#F5F7FA"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94A3B8"
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right — Try Mimic CTA */}
      <button onClick={onTryMimic} className="btn btn-secondary">
        Try Mimic
      </button>
    </header>
  )
}
