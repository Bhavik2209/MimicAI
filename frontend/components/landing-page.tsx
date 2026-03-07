"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowRight,
  Search,
  Database,
  Brain,
  Network,
  FileText,
  MessageSquare,
  ShieldCheck,
  Users,
  BookOpen,
  Zap,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react"

/* ─── Data ─── */

const TYPEWRITER_NAMES = ["Nikola Tesla", "Marie Curie", "Alan Turing"]

interface LandingPageProps {
  onGetStarted: () => void
}

const AGENTS = [
  { name: "Biography Agent", icon: BookOpen },
  { name: "Timeline Engine", icon: Database },
  { name: "Belief Analyzer", icon: Brain },
  { name: "Influence Mapper", icon: Network },
  { name: "Myth Buster", icon: ShieldCheck },
  { name: "Legacy Scorer", icon: FileText },
]

const TRUST_PILLS = [
  "Web Research",
  "Source Validation",
  "Belief Analysis",
  "Myth Busting",
  "Timeline Engine",
  "Influence Mapping",
]

const INTERACTION_CARDS = [
  { title: "Debate Mode", desc: "Two personas face off on contested topics", icon: Users, color: "#38BDF8" },
  { title: "Influence Map", desc: "Node graph of relationships and impact", icon: Network, color: "#A78BFA" },
  { title: "Decision Advisor", desc: "Persona gives advice with doc-style output", icon: MessageSquare, color: "#34D399" },
  { title: "Myth Busting", desc: "Fact vs myth comparison table", icon: ShieldCheck, color: "#FB923C" },
  { title: "Legacy Scoring", desc: "Radar chart and score display", icon: Zap, color: "#F472B6" },
]

const TESTIMONIALS = [
  {
    role: "Researcher",
    name: "Dr. Sarah Chen",
    quote: "Mimic transformed how I explore historical figures. The sourcing is impeccable.",
  },
  {
    role: "Student",
    name: "James Okoro",
    quote: "Finally, a tool that lets me actually converse with the minds I'm studying.",
  },
  {
    role: "Journalist",
    name: "Anna Weber",
    quote: "The myth-busting and controversy tabs alone are worth the subscription.",
  },
]

const FAQ_ITEMS = [
  { q: "How does Mimic prevent hallucinations?", a: "Every claim is retrieval-grounded. Our agents cite primary sources and we surface them inline." },
  { q: "Where does the data come from?", a: "Verified historical records, academic publications, and documented primary sources." },
  { q: "How accurate are the personas?", a: "Personas are built from speech patterns and beliefs extracted from documented writings and accounts." },
  { q: "Is my research private?", a: "Yes. Your projects and conversations are private and never used for training." },
]

const PRICING_PLANS = [
  {
    name: "Explorer",
    price: "Free",
    desc: "For curious minds getting started",
    features: ["3 intelligence profiles", "Basic persona chat", "Timeline view", "Community support"],
    cta: "Start Free",
  },
  {
    name: "Research Pro",
    price: "$19/mo",
    desc: "For serious researchers & students",
    features: ["Unlimited profiles", "All interaction modes", "Source citations export", "Priority support", "API access"],
    cta: "Start Pro Trial",
    featured: true,
  },
  {
    name: "Institution",
    price: "Custom",
    desc: "For teams & organizations",
    features: ["Everything in Pro", "Team seats & admin", "SSO integration", "Custom data sources", "Dedicated support"],
    cta: "Contact Sales",
  },
]

/* ─── Doodle SVG Components ─── */

function DoodleStar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9L22 9.5L16.5 14L18 22L12 17.5L6 22L7.5 14L2 9.5L9.5 9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DoodleCircle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  )
}

function DoodleArrow({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="40" height="20" viewBox="0 0 40 20" fill="none">
      <path d="M2 10C8 4 16 4 22 10C28 16 36 14 38 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 8L38 10L34 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DoodleSparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2V18M2 10H18M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

/* ─── Main Component ─── */

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [typewriterName, setTypewriterName] = useState(TYPEWRITER_NAMES[0])
  const [nameInput, setNameInput] = useState("")
  const revealRefs = useRef<HTMLElement[]>([])

  // Typewriter effect
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % TYPEWRITER_NAMES.length
      setTypewriterName(TYPEWRITER_NAMES[i])
    }, 2500)
    return () => clearInterval(id)
  }, [])

  // Scroll reveal IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible")
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  return (
    <div className="overflow-x-hidden" style={{ background: "var(--bg)" }}>

      {/* ═══════ 1. HERO ═══════ */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}
      >
        {/* Ambient gradient */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 55% 45% at 25% 25%, var(--gold-glow) 0%, transparent 60%),
              radial-gradient(ellipse 45% 35% at 75% 75%, var(--ambient-teal) 0%, transparent 60%),
              var(--bg)
            `,
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, black 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, black 0%, transparent 100%)",
            opacity: 0.25,
          }}
        />

        {/* Doodle accents */}
        <DoodleStar className="doodle doodle-float" style={{ top: "15%", left: "8%", color: "var(--gold)" }} />
        <DoodleCircle className="doodle doodle-float-slow" style={{ top: "20%", right: "10%", color: "var(--teal)" }} />
        <DoodleArrow className="doodle doodle-float" style={{ bottom: "25%", left: "5%", color: "var(--text-3)", animationDelay: "1s" }} />
        <DoodleSparkle className="doodle doodle-float-slow" style={{ bottom: "30%", right: "8%", color: "var(--gold)", animationDelay: "2s" }} />
        <DoodleStar className="doodle doodle-float-slow" style={{ top: "55%", left: "15%", color: "var(--teal)", animationDelay: "3s", transform: "scale(0.7)" }} />

        <div className="relative z-10 max-w-3xl">
          {/* Pill badge */}
          <span
            className="hero-enter inline-flex items-center gap-2 text-xs uppercase mb-8 px-4 py-1.5"
            style={{
              color: "var(--gold)",
              border: "1px solid var(--gold-dim)",
              borderRadius: 999,
              background: "var(--gold-glow)",
              fontFamily: "var(--font-primary), monospace",
              letterSpacing: "0.15em",
            }}
          >
            <Sparkles size={12} />
            Retrieval-Grounded Intelligence
          </span>

          {/* Main heading */}
          <h1
            className="hero-enter hero-enter-d1 mb-6"
            style={{
              fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              fontFamily: "var(--font-ui), sans-serif",
            }}
          >
            Every mind,{" "}
            <span className="squiggly-underline gradient-text">mapped</span>
            <br />
            and made accessible.
          </h1>

          {/* Subtitle */}
          <p
            className="hero-enter hero-enter-d2 text-lg max-w-xl mx-auto mb-10"
            style={{ color: "var(--text-2)", lineHeight: 1.7, fontFamily: "var(--font-ui), sans-serif", letterSpacing: "0em" }}
          >
            Enter a name. Our multi-agent system researches, synthesizes, and builds
            a verified intelligence profile — then lets you converse with the persona.
          </p>

          {/* CTA buttons */}
          <div className="hero-enter hero-enter-d3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="btn btn-primary flex items-center gap-2 px-8 py-3.5 text-base"
              style={{ borderRadius: 14 }}
            >
              Explore a Persona
              <ArrowRight size={18} />
            </button>
            <a
              href="#how-it-works"
              className="btn btn-secondary px-6 py-3"
              style={{ borderRadius: 14 }}
            >
              See How It Works
            </a>
          </div>

          {/* Agent Pipeline Visualization */}
          <div
            className="hero-enter hero-enter-d4 glass-card mt-16 mx-auto p-5 relative"
            style={{ maxWidth: 640 }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.12em] mb-4 text-left"
              style={{ color: "var(--teal)" }}
            >
              Agent Pipeline — Active
            </div>
            <div className="flex flex-wrap gap-3 justify-start">
              {AGENTS.map((agent, i) => {
                const Icon = agent.icon
                const isComplete = i % 3 === 0
                return (
                  <div
                    key={agent.name}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      background: "var(--control-bg)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    <Icon size={14} style={{ color: "var(--teal)" }} />
                    <span className="font-mono text-[11px]" style={{ color: "var(--text-2)" }}>
                      {agent.name}
                    </span>
                    <span
                      className="font-mono text-[10px] ml-auto"
                      style={{ color: isComplete ? "var(--gold)" : "var(--teal)" }}
                    >
                      {isComplete ? "✓" : "●"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 2. TRUST BAR ═══════ */}
      <section
        className="py-5 px-6 overflow-hidden"
        style={{ background: "var(--surface-1)", borderTop: "1px solid var(--border-soft)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <span
            className="font-mono text-xs uppercase tracking-[0.12em] shrink-0"
            style={{ color: "var(--text-3)" }}
          >
            Powered by parallel agents
          </span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="flex w-max"
              style={{ animation: "marquee 30s linear infinite" }}
            >
              {[...TRUST_PILLS, ...TRUST_PILLS].map((pill, i) => (
                <div
                  key={`${pill}-${i}`}
                  className="flex items-center gap-2 px-4 py-1.5 shrink-0 ml-3 first:ml-0 rounded-full"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--teal)",
                    }}
                  />
                  <span className="font-sans text-sm" style={{ color: "var(--text-2)" }}>
                    {pill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 3. HOW IT WORKS ═══════ */}
      <section
        id="how-it-works"
        className="landing-section reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-16">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] mb-4 inline-block"
            style={{ color: "var(--gold)" }}
          >
            How It Works
          </span>
          <h2
            className="font-sans text-center section-title"
            style={{ fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Intelligence in{" "}
            <span className="gradient-text">Three Acts</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-card p-7 reveal reveal-d1" ref={addRevealRef}>
            <div className="step-badge mb-5">1</div>
            <h3 className="font-sans text-xl font-semibold mb-3" style={{ color: "var(--text-1)" }}>
              Input a Name
            </h3>
            <p className="font-sans card-body-text mb-5" style={{ color: "var(--text-2)" }}>
              Type any historical or contemporary figure. The system spins up a multi-agent research pipeline.
            </p>
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <Search size={16} style={{ color: "var(--text-3)" }} />
              <span className="font-mono text-sm" style={{ color: "var(--text-2)" }}>
                {typewriterName}
                <span
                  className="inline-block ml-0.5 animate-pulse"
                  style={{ color: "var(--teal)", animationDuration: "0.8s" }}
                  aria-hidden
                >
                  |
                </span>
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-7 reveal reveal-d2" ref={addRevealRef}>
            <div className="step-badge mb-5">2</div>
            <h3 className="font-sans text-xl font-semibold mb-3" style={{ color: "var(--text-1)" }}>
              Agents Activate
            </h3>
            <p className="font-sans card-body-text mb-5" style={{ color: "var(--text-2)" }}>
              Six specialized agents work in parallel — researching, verifying, and synthesizing data.
            </p>
            <div className="space-y-2.5">
              {AGENTS.slice(0, 4).map((agent, i) => {
                const Icon = agent.icon
                return (
                  <div
                    key={agent.name}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                    style={{ background: "var(--control-bg)" }}
                  >
                    <Icon size={13} style={{ color: "var(--teal)" }} />
                    <span className="font-mono text-[11px] flex-1" style={{ color: "var(--text-2)" }}>
                      {agent.name}
                    </span>
                    <div className="flex-1 max-w-[60px] h-1 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: i % 2 === 0 ? "100%" : "65%",
                          background: i % 2 === 0 ? "var(--gold)" : "var(--teal)",
                          animation: i % 2 !== 0 ? "fillBar 2.5s ease-in-out infinite alternate" : "none",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-7 reveal reveal-d3" ref={addRevealRef}>
            <div className="step-badge mb-5">3</div>
            <h3 className="font-sans text-xl font-semibold mb-3" style={{ color: "var(--text-1)" }}>
              Profile + Chat
            </h3>
            <p className="font-sans card-body-text mb-5" style={{ color: "var(--text-2)" }}>
              Get a structured intelligence profile with tabs. Converse with the persona in real time.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-sans text-sm font-semibold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--gold) 0%, var(--teal) 100%)",
                    color: "#fff",
                  }}
                >
                  NT
                </div>
                <div>
                  <div className="font-sans text-base font-semibold" style={{ color: "var(--text-1)" }}>
                    Nikola Tesla
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                    1856–1943 · Score: 94
                  </div>
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "var(--gold-glow)",
                  borderLeft: "3px solid var(--gold)",
                }}
              >
                <p className="font-mono text-[10px] mb-1" style={{ color: "var(--text-3)" }}>
                  PERSONA RESPONSE
                </p>
                <p className="font-serif text-base italic" style={{ color: "var(--text-2)", lineHeight: 1.5 }}>
                  "My work was always guided by one principle..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 4. PROFILE PREVIEW ═══════ */}
      <section
        id="profile-preview"
        className="py-24 px-6 relative reveal"
        ref={addRevealRef}
        style={{
          background: `
            radial-gradient(ellipse 50% 50% at 50% 50%, var(--gold-glow) 0%, transparent 70%),
            var(--surface-1)
          `,
        }}
      >
        {/* Doodle */}
        <DoodleCircle className="doodle doodle-float-slow" style={{ top: "10%", right: "5%", color: "var(--gold)" }} />
        <DoodleStar className="doodle doodle-float" style={{ bottom: "15%", left: "8%", color: "var(--teal)", animationDelay: "2s" }} />

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <span className="text-xs uppercase mb-4 inline-block" style={{ color: "var(--gold)", fontFamily: "var(--font-primary), monospace", letterSpacing: "0.15em" }}>
              Preview
            </span>
            <h2
              className="section-title"
              style={{ fontWeight: 700, color: "var(--text-1)", letterSpacing: "0.02em", fontFamily: "var(--font-primary), monospace" }}
            >
              A Profile Unlike <span className="gradient-text">Any Other</span>
            </h2>
          </div>
          <div
            className="glass-card p-8 relative"
            style={{
              boxShadow: "0 0 60px var(--gold-glow), 0 30px 80px rgba(0,0,0,0.2)",
            }}
          >
            {/* Profile header */}
            <div
              className="flex items-center gap-4 mb-6 p-4 -m-4 mb-6 rounded-t-xl"
              style={{
                background: "linear-gradient(135deg, var(--gold-glow) 0%, transparent 50%)",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--gold), var(--teal))",
                  color: "#fff",
                  outline: "3px solid var(--gold-dim)",
                  outlineOffset: 3,
                  fontFamily: "var(--font-primary), monospace",
                }}
              >
                NT
              </div>
              <div>
                <h3 className="font-sans text-xl font-bold" style={{ color: "var(--text-1)" }}>
                  Nikola Tesla
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-data), monospace" }}>
                    1856–1943
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: "var(--gold)",
                      background: "var(--gold-dim)",
                      fontFamily: "var(--font-primary), monospace",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Intelligence Score: 94
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["Biography", "Timeline", "Beliefs", "Controversies", "Influence Map", "Legacy Score"].map(
                (tab, i) => (
                  <span
                    key={tab}
                    className="font-mono text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                      background: i === 1 ? "var(--gold-dim)" : "transparent",
                      color: i === 1 ? "var(--gold)" : "var(--text-3)",
                      border: `1px solid ${i === 1 ? "var(--gold-dim)" : "var(--border-soft)"}`,
                    }}
                  >
                    {tab}
                  </span>
                )
              )}
            </div>

            {/* Content preview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-sans card-body-text mb-2 font-medium" style={{ color: "var(--text-2)" }}>
                  Timeline preview
                </p>
                <div className="space-y-2">
                  {["1884 — Arrives in America", "1887 — Tesla Electric Co.", "1891 — Tesla Coil"].map(
                    (entry) => (
                      <div
                        key={entry}
                        className="font-mono text-xs py-2.5 px-3 rounded-xl transition-all duration-200"
                        style={{
                          background: "var(--control-bg)",
                          color: "var(--text-2)",
                          borderLeft: "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeftColor = "var(--teal)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeftColor = "transparent"
                        }}
                      >
                        {entry}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--gold-glow)",
                  borderLeft: "3px solid var(--gold)",
                }}
              >
                <p className="font-mono text-[10px] mb-2 mono-label" style={{ color: "var(--text-3)" }}>
                  PERSONA RESPONSE
                </p>
                <p
                  className="font-serif italic"
                  style={{ color: "var(--text-2)", lineHeight: 1.65, fontSize: "clamp(16px, 2vw, 20px)" }}
                >
                  "My work was always guided by one principle: that the forces of nature, properly
                  understood..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 5. INTERACTION MODES — Bento Grid ═══════ */}
      <section
        className="landing-section reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-14">
          <span className="font-mono text-xs uppercase tracking-[0.15em] mb-4 inline-block" style={{ color: "var(--gold)" }}>
            Features
          </span>
          <h2
            className="font-sans section-title"
            style={{ fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Beyond Research — <span className="gradient-text">Live Interaction</span>
          </h2>
        </div>

        <div className="bento-grid">
          {/* Debate Mode — WIDE */}
          <div
            className="glass-card p-6 reveal reveal-d1"
            ref={addRevealRef}
            style={{ gridArea: "debate", borderTop: `2px solid ${INTERACTION_CARDS[0].color}` }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${INTERACTION_CARDS[0].color}15` }}>
                <Users size={18} style={{ color: INTERACTION_CARDS[0].color }} />
              </div>
              <h3 className="font-sans text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                Debate Mode
              </h3>
            </div>
            <p className="font-sans card-body-text mb-5" style={{ color: "var(--text-2)" }}>
              Two personas face off on contested topics with sourced arguments
            </p>
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-mono text-xs font-bold" style={{ background: "var(--control-bg)", border: "1px solid var(--border-soft)", color: "var(--teal)" }}>A</div>
              <span className="font-mono text-sm font-bold" style={{ color: "var(--text-3)" }}>VS</span>
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-mono text-xs font-bold" style={{ background: "var(--control-bg)", border: "1px solid var(--border-soft)", color: "var(--gold)" }}>B</div>
            </div>
          </div>

          {/* Influence Map — TALL */}
          <div
            className="glass-card p-6 reveal reveal-d2"
            ref={addRevealRef}
            style={{ gridArea: "influence", borderTop: `2px solid ${INTERACTION_CARDS[1].color}` }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${INTERACTION_CARDS[1].color}15` }}>
                <Network size={18} style={{ color: INTERACTION_CARDS[1].color }} />
              </div>
              <h3 className="font-sans text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                Influence Map
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "var(--text-2)" }}>
              Interactive node graph of relationships and impact
            </p>
            <div className="flex justify-center py-6">
              <svg width="100" height="80" viewBox="0 0 100 80" style={{ opacity: 0.7 }}>
                {[[50, 12], [25, 50], [75, 50], [15, 30], [85, 30], [50, 68]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={i === 0 ? 6 : 4} fill={i === 0 ? "var(--gold)" : "var(--text-3)"} style={{ filter: i === 0 ? "drop-shadow(0 0 6px var(--gold))" : undefined }} />
                ))}
                <line x1="50" y1="12" x2="25" y2="50" stroke="var(--border)" strokeWidth="1" />
                <line x1="50" y1="12" x2="75" y2="50" stroke="var(--border)" strokeWidth="1" />
                <line x1="50" y1="12" x2="15" y2="30" stroke="var(--border)" strokeWidth="1" />
                <line x1="50" y1="12" x2="85" y2="30" stroke="var(--border)" strokeWidth="1" />
                <line x1="25" y1="50" x2="50" y2="68" stroke="var(--border)" strokeWidth="1" />
                <line x1="75" y1="50" x2="50" y2="68" stroke="var(--border)" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Decision Advisor */}
          <div
            className="glass-card p-6 reveal reveal-d3"
            ref={addRevealRef}
            style={{ gridArea: "decision", borderTop: `2px solid ${INTERACTION_CARDS[2].color}` }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${INTERACTION_CARDS[2].color}15` }}>
                <MessageSquare size={18} style={{ color: INTERACTION_CARDS[2].color }} />
              </div>
              <h3 className="font-sans text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                Decision Advisor
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "var(--text-2)" }}>
              Get advice from any persona with structured, doc-style output
            </p>
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 rounded-sm" style={{ background: "var(--control-bg)", width: `${50 + i * 15}%` }} />
              ))}
            </div>
          </div>

          {/* Myth Busting */}
          <div
            className="glass-card p-6 reveal reveal-d4"
            ref={addRevealRef}
            style={{ gridArea: "myth", borderTop: `2px solid ${INTERACTION_CARDS[3].color}` }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${INTERACTION_CARDS[3].color}15` }}>
                <ShieldCheck size={18} style={{ color: INTERACTION_CARDS[3].color }} />
              </div>
              <h3 className="font-sans text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                Myth Busting
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "var(--text-2)" }}>
              Fact vs myth comparison with source verification
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2.5 rounded-lg text-center" style={{ background: "rgba(248,113,113,0.08)", color: "#F87171" }}>MYTH</div>
              <div className="p-2.5 rounded-lg text-center" style={{ background: "rgba(56,189,248,0.08)", color: "#38BDF8" }}>FACT</div>
              <div className="p-2 rounded-lg" style={{ background: "var(--control-bg)", color: "var(--text-2)" }}>Claim A</div>
              <div className="p-2 rounded-lg" style={{ background: "var(--control-bg)", color: "var(--text-2)" }}>Verified ✓</div>
            </div>
          </div>

          {/* Legacy Scoring */}
          <div
            className="glass-card p-6 reveal reveal-d5"
            ref={addRevealRef}
            style={{ gridArea: "legacy", borderTop: `2px solid ${INTERACTION_CARDS[4].color}` }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${INTERACTION_CARDS[4].color}15` }}>
                <Zap size={18} style={{ color: INTERACTION_CARDS[4].color }} />
              </div>
              <h3 className="font-sans text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                Legacy Scoring
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "var(--text-2)" }}>
              Comprehensive radar chart and composite score
            </p>
            <div className="flex flex-col items-center py-2">
              <div className="font-mono text-3xl font-bold gradient-text">94</div>
              <div className="font-mono text-[11px]" style={{ color: "var(--text-3)" }}>/ 100</div>
              <div className="w-20 h-1.5 mt-3 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                <div className="h-full rounded-full" style={{ width: "94%", background: "linear-gradient(90deg, var(--gold), var(--teal))" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 6. TESTIMONIALS ═══════ */}
      <section
        id="use-cases"
        className="py-24 px-6 reveal"
        ref={addRevealRef}
        style={{ background: "var(--surface-1)" }}
      >
        {/* Doodles */}
        <DoodleArrow className="doodle doodle-float" style={{ top: "8%", right: "12%", color: "var(--gold)", animationDelay: "1s" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <span className="font-mono text-xs uppercase tracking-[0.15em] mb-4 inline-block" style={{ color: "var(--gold)" }}>
              Testimonials
            </span>
            <h2
              className="font-sans section-title"
              style={{ fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}
            >
              What researchers are <span className="gradient-text">saying</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.role}
                className={`glass-card p-8 relative reveal reveal-d${i + 1}`}
                ref={addRevealRef}
              >
                <span
                  className="absolute top-4 right-6 font-serif"
                  style={{ fontSize: 72, opacity: 0.06, color: "var(--gold)" }}
                >
                  "
                </span>
                <div className="flex gap-0.5 mb-4" style={{ fontSize: 13, color: "var(--gold)" }}>
                  {"★★★★★"}
                </div>
                <p
                  className="font-sans text-base mb-6 relative z-10"
                  style={{ color: "var(--text-1)", lineHeight: 1.7 }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-sans text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, var(--gold) 0%, var(--teal) 100%)",
                      color: "#fff",
                    }}
                  >
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-sans text-sm font-semibold" style={{ color: "var(--text-1)" }}>{t.name}</div>
                    <div className="font-mono text-xs" style={{ color: "var(--text-3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. PRICING ═══════ */}
      <section
        id="pricing"
        className="landing-section reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-14">
          <span className="font-mono text-xs uppercase tracking-[0.15em] mb-4 inline-block" style={{ color: "var(--gold)" }}>
            Pricing
          </span>
          <h2
            className="font-sans section-title"
            style={{ fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Simple, transparent <span className="gradient-text">plans</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6" style={{ maxWidth: 1000, margin: "0 auto" }}>
          {PRICING_PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`glass-card p-8 flex flex-col reveal reveal-d${i + 1} ${plan.featured ? "pricing-featured md:scale-[1.03]" : ""}`}
              ref={addRevealRef}
            >
              {plan.featured && (
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.12em] px-3 py-1 rounded-full self-start mb-4"
                  style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
                >
                  Most Popular
                </span>
              )}
              <h3 className="font-sans text-xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
                {plan.name}
              </h3>
              <div className="font-sans text-3xl font-bold mb-2 gradient-text">
                {plan.price}
              </div>
              <p className="font-sans card-body-text mb-6" style={{ color: "var(--text-2)" }}>
                {plan.desc}
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-2)" }}>
                    <Check size={15} className="shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`btn w-full ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: 12 }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ 8. FAQ ═══════ */}
      <section
        className="py-24 px-6 reveal"
        ref={addRevealRef}
        style={{ background: "var(--surface-1)" }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <span className="font-mono text-xs uppercase tracking-[0.15em] mb-4 inline-block" style={{ color: "var(--gold)" }}>
              FAQ
            </span>
            <h2
              className="font-sans section-title"
              style={{ fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}
            >
              Questions & <span className="gradient-text">Answers</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="glass-card overflow-hidden rounded-2xl">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-sans font-medium flex justify-between items-center gap-4"
                  style={{ color: "var(--text-1)" }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`faq-chevron shrink-0 ${faqOpen === i ? "open" : ""}`}
                    style={{ color: "var(--text-3)" }}
                  />
                </button>
                <div className={`faq-answer ${faqOpen === i ? "open" : "closed"}`}>
                  <div className="px-6 pb-4 font-sans text-sm" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 9. CTA FOOTER BANNER ═══════ */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 50%, var(--gold-glow), transparent 60%),
            var(--bg)
          `,
        }}
      >
        {/* Doodles */}
        <DoodleStar className="doodle doodle-float" style={{ top: "20%", left: "10%", color: "var(--gold)" }} />
        <DoodleSparkle className="doodle doodle-float-slow" style={{ bottom: "20%", right: "10%", color: "var(--teal)", animationDelay: "1.5s" }} />

        <div className="relative z-10" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2
            className="font-sans mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "-0.02em",
            }}
          >
            Start with a name.
            <br />
            <span className="gradient-text">Discover a mind.</span>
          </h2>
          <p className="font-sans text-base mb-8" style={{ color: "var(--text-2)" }}>
            Join thousands of researchers, students, and curious minds.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-2 max-w-[420px] mx-auto mb-4"
            style={{
              background: "var(--card-bg)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid var(--border-soft)",
              borderRadius: 14,
              padding: 4,
            }}
          >
            <input
              type="text"
              placeholder="Enter a name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-xl bg-transparent"
              style={{
                border: "none",
                color: "var(--text-1)",
                outline: "none",
                fontFamily: "var(--font-ui), sans-serif",
                letterSpacing: "0.02em",
              }}
            />
            <button
              onClick={onGetStarted}
              className="btn btn-primary flex items-center justify-center gap-2 px-6 py-3"
              style={{ borderRadius: 10 }}
            >
              Begin Research
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="text-[10px]" style={{ color: "var(--text-3)", letterSpacing: "0.15em", fontFamily: "var(--font-primary), monospace", textTransform: "uppercase" }}>
            Fact-grounded · Multi-agent · Retrieval-verified
          </p>
        </div>
      </section>

      {/* ═══════ 10. FOOTER ═══════ */}
      <footer
        className="py-16 px-6"
        style={{
          background: "var(--surface-1)",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-lg italic font-semibold" style={{ color: "var(--text-1)", fontFamily: "var(--font-primary), monospace", letterSpacing: "0.02em" }}>
                Mimic
              </span>
              <span className="text-lg italic font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-primary), monospace", letterSpacing: "0.02em" }}>
                AI
              </span>
            </div>
            <p className="font-sans text-sm" style={{ color: "var(--text-3)" }}>
              Intelligence profiles grounded in research.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase mb-4" style={{ color: "var(--text-2)", fontFamily: "var(--font-primary), monospace", letterSpacing: "0.15em" }}>
              Product
            </h4>
            <div className="space-y-2.5 font-sans text-sm" style={{ color: "var(--text-3)" }}>
              <a href="#how-it-works" className="block hover:underline" style={{ color: "var(--text-3)" }}>How It Works</a>
              <a href="#profile-preview" className="block hover:underline" style={{ color: "var(--text-3)" }}>Personas</a>
              <a href="#pricing" className="block hover:underline" style={{ color: "var(--text-3)" }}>Pricing</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase mb-4" style={{ color: "var(--text-2)", fontFamily: "var(--font-primary), monospace", letterSpacing: "0.15em" }}>
              Resources
            </h4>
            <div className="space-y-2.5 font-sans text-sm" style={{ color: "var(--text-3)" }}>
              <span className="block">Documentation</span>
              <span className="block">API</span>
              <span className="block">Blog</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase mb-4" style={{ color: "var(--text-2)", fontFamily: "var(--font-primary), monospace", letterSpacing: "0.15em" }}>
              Connect
            </h4>
            <div className="space-y-2.5 font-sans text-sm" style={{ color: "var(--text-3)" }}>
              <span className="block">Twitter</span>
              <span className="block">LinkedIn</span>
              <span className="block">GitHub</span>
            </div>
          </div>
        </div>
        <div
          className="max-w-5xl mx-auto mt-12 pt-8 text-xs"
          style={{ color: "var(--text-3)", borderTop: "1px solid var(--border-soft)", fontFamily: "var(--font-data), monospace" }}
        >
          © {new Date().getFullYear()} Mimic AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
