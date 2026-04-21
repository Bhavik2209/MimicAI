"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import {
  ArrowRight,
  ArrowRightUp,
  Magnifier,
  BookBookmark,
  CheckCircle,
  ClockCircle,
  DangerTriangle,
  Siren,
  ChatRoundDots,
  ChatLine,
  FolderOpen,
  Record,
  RecordCircle,
  ArrowUp,
  Restart,
  PenNewSquare,
  Export,
  ShareCircle,
  SortByTime,
  SquareAltArrowLeft,
  Settings,
  Widget,
  UserRounded,
  Suitcase,
  Documents,
  Database,
  FileText,
  DocumentText,
  UserId,
  Link,
} from "@/components/ui/solar-icons"

/* ─── Data ─── */

const TYPEWRITER_NAMES = ["Ada Lovelace", "Marie Curie", "Alan Turing"]

interface LandingPageProps {
  onGetStarted: () => void
  isSignedIn?: boolean
  isAuthPending?: boolean
}

type PipelineStatus = "done" | "active" | "pending"

interface PipelineAgent {
  step: number
  name: string
  icon: React.ComponentType<any>
  status: PipelineStatus
  description: string
  duration?: string
  activeText?: string
}

const PIPELINE_ROWS: PipelineAgent[][] = [
  [
    {
      step: 1,
      name: "Biography Agent",
      icon: BookBookmark,
      status: "done",
      description: "Extracting core biography and factual records",
      duration: "3.2s",
    },
    {
      step: 2,
      name: "Timeline Agent",
      icon: ClockCircle,
      status: "done",
      description: "Sequencing milestones into a verified chronology",
      duration: "2.7s",
    },
  ],
  [
    {
      step: 3,
      name: "Controversies Finder",
      icon: DangerTriangle,
      status: "active",
      description: "Cross-checking contested claims across sources",
      activeText: "Analyzing 23 sources...",
    },
    {
      step: 4,
      name: "News Agent",
      icon: Siren,
      status: "pending",
      description: "Scanning recent publications and headlines",
    },
  ],
  [
    {
      step: 5,
      name: "Social Media Agent",
      icon: ChatRoundDots,
      status: "pending",
      description: "Mapping public discourse and sentiment signals",
    },
    {
      step: 6,
      name: "Resources",
      icon: FolderOpen,
      status: "pending",
      description: "Preparing citations, links, and supporting evidence",
    },
  ],
]

const AGENTS = PIPELINE_ROWS.flat()

const TRUST_PILLS = [
  "Web Research",
  "Source Validation",
  "Belief Analysis",
  "Myth Busting",
  "Timeline Engine",
  "Influence Mapping",
]

const HERO_METRICS = [
  { label: "Avg profile time", value: "< 60s" },
  { label: "Parallel agents", value: "6" },
  { label: "Citation mode", value: "Always on" },
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

const USE_CASES = [
  {
    title: "Researchers",
    icon: BookBookmark,
    summary: "Build a source-backed profile in minutes, then drill into citations and timelines.",
    points: ["Structured evidence graph", "Controversy and confidence labeling"],
  },
  {
    title: "Students",
    icon: UserId,
    summary: "Understand historical figures quickly, then ask grounded follow-up questions in chat.",
    points: ["Digestible profile tabs", "Persona Q&A with retrieval grounding"],
  },
  {
    title: "Journalists",
    icon: FileText,
    summary: "Cross-check claims, review source provenance, and export summaries for editorial workflows.",
    points: ["Rapid source triangulation", "Export-ready intelligence snapshots"],
  },
]



/* ─── Main Component ─── */

export function LandingPage({
  onGetStarted,
  isSignedIn = false,
  isAuthPending = false,
}: Readonly<LandingPageProps>) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [typewriterName, setTypewriterName] = useState(TYPEWRITER_NAMES[0])
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

  let authCtaLabel = "Login with Google"
  if (isSignedIn) {
    authCtaLabel = "Go to dashboard"
  } else if (isAuthPending) {
    authCtaLabel = "Redirecting..."
  }

  return (
    <div className="overflow-x-hidden" style={{ background: "transparent" }}>

      {/* ═══════ 1. HERO ═══════ */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 0, overflow: "hidden" }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="hero-enter hero-enter-d1">
            <span className="hero-badge">
              <span className="hero-badge-new">New</span>
              Public docs + private project workspaces
            </span>
          </div>

          {/* Main heading — large editorial mixed-type */}
          <h1
            className="hero-enter hero-enter-d1 mb-6"
            style={{
              fontSize: "clamp(3.25rem, 7vw, 5.25rem)",
              fontWeight: 800,
              color: "var(--text-1)",
              letterSpacing: "-0.034em",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "0.9em",
                letterSpacing: "-0.02em",
                marginBottom: "0.08em",
              }}
            >
              <span style={{ WebkitTextFillColor: "var(--text-1)" }}>Every mind </span>
              <span className="gradient-text">mapped</span>
            </span>
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "0.9em",
                letterSpacing: "-0.02em",
                WebkitTextFillColor: "var(--text-1)",
              }}
            >
              and accessible
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-enter hero-enter-d2 text-lg max-w-xl mx-auto mb-10"
            style={{ color: "var(--text-2)", lineHeight: 1.7, fontSize: "clamp(16px, 2vw, 18px)" }}
          >
            Enter a name. Our multi-agent system researches, synthesizes, and builds
            a verified intelligence profile — then lets you converse with the persona.
          </p>

          {/* CTA buttons */}
          <div className="hero-enter hero-enter-d3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button
              onClick={onGetStarted}
              className="btn btn-primary flex items-center gap-2 px-8 py-3.5 text-base"
              style={{ fontSize: 15, borderRadius: 8 }}
              disabled={isAuthPending}
            >
              {authCtaLabel}
              <ArrowRight size={16} weight="Bold" />
            </button>
            <a
              href="/how-it-works"
              className="btn btn-secondary px-7 py-3.5"
              style={{ fontSize: 15, borderRadius: 8 }}
            >
              Read docs
            </a>
          </div>

          <div
            className="hero-enter hero-enter-d3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 10,
              maxWidth: 560,
              margin: "0 auto 8px",
            }}
          >
            {HERO_METRICS.map((metric) => (
              <div
                key={metric.label}
                style={{
                  border: "1px solid var(--border-soft)",
                  borderRadius: 10,
                  background: "var(--control-bg)",
                  padding: "10px 12px",
                }}
              >
                <p
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  {metric.label}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Agent Pipeline Visualization — peeks below the fold */}
        </div>
        <div
          className="hero-enter hero-enter-d4 agent-pipeline-card mx-auto w-full hero-pipeline-peek"
          style={{
            maxWidth: 860,
            borderRadius: 8,
            marginTop: 48,
          }}
        >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.14em] mb-5 text-left"
              style={{ color: "var(--gold)" }}
            >
              Agent Pipeline — Active
            </div>
            <div className="snake-pipeline-board" aria-label="Agent pipeline status">
              {PIPELINE_ROWS.map((row, rowIndex) => {
                const isLTR = rowIndex % 2 === 0
                // RTL rows are visually displayed right→left, so reverse card order
                const displayRow = isLTR ? row : [...row].reverse()
                return (
                  <div key={`pipeline-row-step${row[0].step}`} className="snake-row-wrap">
                    <div className="snake-row">
                      {displayRow.map((agent, colIndex) => {
                        const Icon = agent.icon
                        let StatusIcon = Record
                        if (agent.status === "done") StatusIcon = CheckCircle
                        if (agent.status === "active") StatusIcon = RecordCircle
                        return (
                          <Fragment key={agent.name}>
                            <article className="snake-card" aria-label={`${agent.name} ${agent.status}`}>
                              <div className="snake-card-top">
                                <div className="snake-card-left">
                                  <span className="snake-step">{String(agent.step).padStart(2, "0")}</span>
                                  <span className="snake-icon" aria-hidden="true">
                                    <Icon size={14} weight="Broken" />
                                  </span>
                                  <span className="snake-name">{agent.name}</span>
                                </div>
                                <div className="snake-card-status-wrap">
                                  <span className={`snake-status snake-status-${agent.status}`} aria-hidden="true">
                                    <StatusIcon size={9} weight={agent.status === "active" ? "Linear" : "Bold"} />
                                  </span>
                                  {agent.status === "done" && agent.duration && (
                                    <span className="snake-duration">{agent.duration}</span>
                                  )}
                                </div>
                              </div>
                              <p className="snake-desc">{agent.description}</p>
                              {agent.status === "active" && agent.activeText && (
                                <div className="snake-active-meta">
                                  <span className="snake-active-text">{agent.activeText}</span>
                                  <span className="snake-progress-track" aria-hidden="true">
                                    <span className="snake-progress-fill" />
                                  </span>
                                </div>
                              )}
                            </article>
                            {colIndex === 0 && (
                              <div className="snake-h-conn" aria-hidden="true">
                                {isLTR ? (
                                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                                    <path d="M2 8 H24 M20 4.5 L27.5 8 L20 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                ) : (
                                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                                    <path d="M30 8 H8 M12 4.5 L4.5 8 L12 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </Fragment>
                        )
                      })}
                    </div>

                    {rowIndex < PIPELINE_ROWS.length - 1 && (
                      <div
                        className={`snake-v-conn snake-v-${isLTR ? "right" : "left"}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
      </section>

      {/* ═══════ 2. TRUST BAR ═══════ */}
      <hr className="section-divider" />
      <section className="overflow-hidden section-cool" style={{ paddingTop: 60, paddingBottom: 72 }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-mono uppercase mb-14" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--text-3)" }}>
            Powered by
          </p>

          {/* Row 1 — 3 sources */}
          <div
            className="flex flex-wrap justify-center items-center"
            style={{ gap: "48px 112px", marginBottom: 56 }}
          >

            {/* Wikipedia — globe icon is instantly recognizable */}
            <div className="powered-source-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
                <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="2" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <span>Wikipedia</span>
            </div>

            {/* OpenAlex — text only, no recognizable brand icon */}
            <div className="powered-source-logo">
              <span>OpenAlex</span>
            </div>

            {/* arXiv — text only, brand is the name itself */}
            <div className="powered-source-logo">
              <span style={{ fontStyle: "italic", letterSpacing: "-0.02em" }}>ar</span><span style={{ fontStyle: "normal" }}>Xiv</span>
            </div>
          </div>

          {/* Row 2 — 3 sources (tapered center) */}
          <div
            className="flex flex-wrap justify-center items-center"
            style={{ gap: "48px 112px" }}
          >

            {/* Google Scholar — mortarboard is recognizable */}
            <div className="powered-source-logo">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 9h20L12 3z"/>
                <path d="M6 11v5a6 6 0 0 0 12 0v-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                <line x1="3" y1="9" x2="3" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="3" cy="18" r="1.4" fill="currentColor"/>
              </svg>
              <span>Google Scholar</span>
            </div>

            {/* News APIs — text only */}
            <div className="powered-source-logo">
              <span>News APIs</span>
            </div>

            {/* YouTube — play-button rect is iconic */}
            <div className="powered-source-logo">
              <svg width="44" height="32" viewBox="0 0 30 22" fill="currentColor">
                <rect x="0" y="0" width="30" height="22" rx="5" fill="currentColor"/>
                <polygon points="12,6 12,16 21,11" fill="white"/>
              </svg>
              <span>YouTube</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 3. HOW IT WORKS ═══════ */}
      <hr className="section-divider" />
      <section
        id="how-it-works"
        className="landing-section reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-16">
          <p className="hex-eyebrow">How It Works</p>
          <h2 className="section-title mx-auto">
            <span
              style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88em", letterSpacing: "-0.01em" }}
            >
              Intelligence built in
            </span>
            <span className="gradient-text">three acts</span>
          </h2>
        </div>

        {/* ── Horizontal timeline track ── */}
        <div className="hiw-timeline">
          {/* connector line */}
          <div className="hiw-line" aria-hidden />

          {/* Step 1 — offset 0 */}
          <div className="hiw-station reveal reveal-d1" ref={addRevealRef} style={{ marginTop: 0 }}>
            <div className="hiw-node">1</div>
            <div className="hiw-panel">
              {/* mockup */}
              <div className="hiw-mockup">
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl w-full"
                  style={{ background: "var(--control-bg)", border: "1px solid var(--border)" }}
                >
                  <Magnifier size={15} weight="Linear" style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  <span className="font-mono text-sm" style={{ color: "var(--text-2)" }}>
                    <span key={typewriterName} className="name-fade" aria-live="polite">{typewriterName}</span>
                    <span className="inline-block ml-0.5 animate-pulse" style={{ color: "var(--teal)", animationDuration: "0.8s" }} aria-hidden>|</span>
                  </span>
                </div>
              </div>
              {/* text */}
              <h3 className="hiw-title">Input a Name</h3>
              <p className="hiw-body">Type any historical or contemporary figure. The system spins up a multi-agent research pipeline.</p>
              <a href="/how-it-works" className="card-learn-more hiw-cta">Read full breakdown →</a>
            </div>
          </div>

          {/* Step 2 — offset 0 */}
          <div className="hiw-station reveal reveal-d2" ref={addRevealRef} style={{ marginTop: 0 }}>
            <div className="hiw-node">2</div>
            <div className="hiw-panel">
              {/* mockup */}
              <div className="hiw-mockup">
                <div className="space-y-1.5 w-full">
                  {AGENTS.slice(0, 4).map((agent, i) => {
                    const Icon = agent.icon
                    return (
                      <div
                        key={agent.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{ background: "var(--control-bg)" }}
                      >
                        <Icon size={12} weight="Bold" color="var(--gold)" style={{ flexShrink: 0 }} />
                        <span className="font-mono text-[10px] flex-1" style={{ color: "var(--text-2)" }}>{agent.name}</span>
                        <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: "var(--border-soft)", flexShrink: 0 }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: i % 2 === 0 ? "100%" : "65%",
                              background: "var(--gold)",
                              animation: i % 2 === 0 ? "none" : "fillBar 2.5s ease-in-out infinite alternate",
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* text */}
              <h3 className="hiw-title">Agents Activate</h3>
              <p className="hiw-body">Six specialized agents work in parallel — researching, verifying, and synthesizing data.</p>
              <a href="/how-it-works" className="card-learn-more hiw-cta">Read full breakdown →</a>
            </div>
          </div>

          {/* Step 3 — offset 0 */}
          <div className="hiw-station reveal reveal-d3" ref={addRevealRef} style={{ marginTop: 0 }}>
            <div className="hiw-node">3</div>
            <div className="hiw-panel">
              {/* mockup */}
              <div className="hiw-mockup">
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-xs font-semibold shrink-0"
                      style={{ background: "var(--text-1)", color: "#fff" }}
                    >AL</div>
                    <div>
                      <div className="font-sans text-sm font-semibold" style={{ color: "var(--text-1)" }}>Ada Lovelace</div>
                      <div className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>1815–1852 · Score: 94</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ background: "var(--gold-dim)", borderLeft: "3px solid var(--gold)" }}>
                    <p className="font-mono text-[9px] mb-1" style={{ color: "var(--text-3)" }}>PERSONA RESPONSE</p>
                    <p className="display-serif text-xs" style={{ color: "var(--text-2)", lineHeight: 1.5 }}>
                      "My work was always guided by one principle..."
                    </p>
                  </div>
                </div>
              </div>
              {/* text */}
              <h3 className="hiw-title">Profile + Chat</h3>
              <p className="hiw-body">Get a structured intelligence profile with tabs. Converse with the persona in real time.</p>
              <a href="/how-it-works" className="card-learn-more hiw-cta">Read full breakdown →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 4. PROFILE PREVIEW ═══════ */}
      <hr className="section-divider" />
      <section
        id="profile-preview"
        className="py-24 px-6 relative reveal section-cool"
        ref={addRevealRef}
        style={{ overflow: "hidden" }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <p className="hex-eyebrow">Preview</p>
            <h2 className="section-title">
              <span
                style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88em", letterSpacing: "-0.01em" }}
              >
                A profile unlike
              </span>
              <span className="gradient-text">any other</span>
            </h2>
          </div>
          {/* ── Cards stage ── */}
          <div style={{ position: "relative", height: 480 }}>

            {/* ── Overview card — center ── */}
            <div className="preview-card-center" style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 20,
              width: 800,
              height: 460,
              zIndex: 2,
              borderRadius: 12,
              border: "1px solid var(--border)",
              boxShadow: "0 24px 64px rgba(25,23,46,0.13), 0 4px 16px rgba(25,23,46,0.07)",
              overflow: "hidden", pointerEvents: "auto", userSelect: "none",
              display: "flex", flexDirection: "column", background: "var(--bg)",
            }}>
              {/* Header — mirrors profile page header */}
              <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "8px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", background: "var(--bg)", flexShrink: 0 }}>
                    <SquareAltArrowLeft size={12} weight="Linear" color="currentColor" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 8.5, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 1 }}>Overview</span>
                    <div style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 650, fontSize: 13, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>Ada Lovelace</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 10, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis" }}>AC Systems Research</span>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", flexShrink: 0 }}>· Jan 12, 2026</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 7px", borderRadius: 7, border: "1px solid var(--border-soft)", color: "var(--text-3)", fontFamily: "var(--font-sans, sans-serif)", fontSize: 9, fontWeight: 500 }}>
                    <ShareCircle size={10} weight="Linear" color="currentColor" /> Share
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 7px", borderRadius: 7, border: "1px solid var(--border-soft)", color: "var(--text-3)", fontFamily: "var(--font-sans, sans-serif)", fontSize: 9, fontWeight: 500 }}>
                    <Export size={10} weight="Linear" color="currentColor" /> Export
                  </div>
                </div>
              </div>

              {/* Body: icon sidebar + timeline content */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Icon-only sidebar — identical to persona chat card */}
                <div style={{ width: 52, background: "var(--bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
                  {[
                    { Icon: Widget, key: "overview" },
                    { Icon: UserId, key: "personality" },
                    { Icon: SortByTime, key: "timeline" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                        background: key === "overview" ? "var(--gold-dim)" : "transparent" }}>
                        <Icon size={16} weight="Linear" color={key === "overview" ? "var(--gold)" : "var(--text-3)"} />
                      </div>
                      {key === "overview" && <div style={{ position: "absolute", left: 0, width: 3, height: 34, background: "var(--gold)", borderRadius: "0 2px 2px 0" }} />}
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  {[
                    { Icon: Siren, key: "news" },
                    { Icon: Suitcase, key: "work" },
                    { Icon: Documents, key: "resources" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} weight="Linear" color="var(--text-3)" />
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  <div style={{ width: "100%", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChatLine size={16} weight="Linear" color="var(--text-3)" />
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={16} weight="Linear" color="var(--text-3)" />
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3, #2a2838)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserRounded size={15} weight="Linear" color="var(--text-2)" />
                    </div>
                  </div>
                </div>

                {/* Overview main content */}
                <div style={{ flex: 1, overflow: "hidden", padding: "18px 20px" }}>
                  <h2 style={{ fontSize: 18, color: "var(--text-1)", fontWeight: 600, fontFamily: "var(--font-sans, sans-serif)", lineHeight: 1.2, margin: "0 0 6px" }}>Profile summary</h2>
                  <p style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "var(--font-sans, sans-serif)", margin: "0 0 14px", lineHeight: 1.55 }}>A concise reading of background, identity, and contextual knowledge from core references.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 16, alignItems: "start" }}>
                    <div>
                      <div style={{ width: "100%", aspectRatio: "4 / 5", borderRadius: 12, border: "1px solid var(--border-soft)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontFamily: "var(--font-mono, monospace)", fontSize: 20, fontWeight: 600 }}>
                        AL
                      </div>
                      <div style={{ marginTop: 10, borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Wikidata</div>
                        <div style={{ fontSize: 11, fontFamily: "var(--font-sans, sans-serif)", color: "var(--text-1)" }}>Q7259</div>
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text-1)", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, margin: "0 0 8px" }}>Ada Lovelace</h3>
                      <p style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-sans, sans-serif)", lineHeight: 1.65, margin: "0 0 12px" }}>Mathematician and writer known for her notes on Charles Babbage&apos;s Analytical Engine and early vision of general-purpose computing.</p>
                      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 10 }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Briefing</div>
                        <p style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "var(--font-sans, sans-serif)", lineHeight: 1.6, margin: 0 }}>Core profile context includes verified biographical facts, foundational timeline events, and source-linked references for deeper analysis.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Persona Chat page mockup — behind, left, rotated ── */}
            <div
              className="preview-card-left"
              style={{
                position: "absolute", left: -50, top: 0, width: 800, height: 460,
                transform: "rotate(-7deg)", transformOrigin: "center bottom",
                background: "var(--bg)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                boxShadow: "0 16px 48px rgba(25,23,46,0.35)",
                overflow: "hidden",
                pointerEvents: "auto",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                zIndex: 1,
              }}
            >
            {/* ── Body: icon sidebar + chat ── */}
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

              {/* Icon-only sidebar — matches real dashboard sidebar styles */}
              <div style={{ width: 52, background: "var(--bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>

                {/* Group 1 — Profile */}
                {[
                  { Icon: Widget,        key: "overview" },
                  { Icon: UserId,        key: "personality" },
                  { Icon: SortByTime,    key: "timeline" },
                ].map(({ Icon, key }) => (
                  <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} weight="Linear" color="var(--text-3)" />
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />

                {/* Group 2 — Insights */}
                {[
                  { Icon: Siren,          key: "news" },
                  { Icon: Suitcase,       key: "work" },
                  { Icon: Documents,      key: "resources" },
                ].map(({ Icon, key }) => (
                  <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} weight="Linear" color="var(--text-3)" />
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />

                {/* Persona Chat — ACTIVE row */}
                <div style={{ position: "relative", width: "100%", padding: "1px 9px" }}>
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "var(--gold)", borderRadius: "0 2px 2px 0" }} />
                  <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gold-dim)" }}>
                    <ChatLine size={16} weight="Bold" color="var(--gold)" />
                  </div>
                </div>

                {/* Settings + user avatar pinned to bottom */}
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 9px" }}>
                  <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Settings size={16} weight="Linear" color="var(--text-3)" />
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3, #e8e6e0)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <UserRounded size={15} weight="Linear" color="var(--text-2)" />
                  </div>
                </div>
              </div>

              {/* ── Main persona chat area ── */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", minWidth: 0 }}>

                {/* Chat header — mirrors persona chat page header */}
                <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", background: "var(--bg)", flexShrink: 0 }}>
                    <SquareAltArrowLeft size={12} weight="Linear" color="currentColor" />
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>AL</div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, fontSize: 12, color: "var(--text-1)", display: "block", lineHeight: 1.2 }}>Ada Lovelace</span>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", display: "block", letterSpacing: "0.04em" }}>Persona</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-2)" }}>
                      <PenNewSquare size={10} weight="Linear" color="var(--text-3)" /> New Session
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-2)" }}>
                      <Restart size={10} weight="Linear" color="var(--text-3)" /> History
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>

                  {/* User message — right-aligned light bubble */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "var(--control-bg)", border: "1px solid var(--border-soft)", padding: "10px 14px", borderRadius: "10px 10px 2px 10px", maxWidth: "75%" }}>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 12, color: "var(--text-1)", lineHeight: 1.6, margin: "0 0 4px" }}>
                        Ada, in your own words, how did your work on the Analytical Engine shape your view of what machines could do beyond arithmetic?
                      </p>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", display: "block", textAlign: "right" }}>23:00</span>
                    </div>
                  </div>

                  {/* Persona response */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>AL</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, fontSize: 12, color: "var(--text-1)" }}>Ada Lovelace</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)" }}>23:00</span>
                      </div>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 8px" }}>
                        An excellent question. Allow me to address this with the precision it deserves.
                      </p>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 8px" }}>
                        I wrote that the Analytical Engine might act upon symbols beyond number. If we can encode relationships, a machine may follow rules that express music, language, or logic as readily as arithmetic.
                      </p>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 8px" }}>
                        <strong style={{ color: "var(--text-1)" }}>The key idea was generality.</strong> The same engine could follow many instruction patterns, opening a path toward what we now call programmable systems.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)" }}>Sources (2)</span>
                        <span style={{ fontSize: 9, color: "var(--text-3)" }}>▾</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div style={{ padding: "12px 20px", background: "var(--bg)", borderTop: "1px solid var(--border-soft)", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1.5px solid var(--gold)", borderRadius: 8, padding: "8px 8px 8px 14px", boxShadow: "0 0 0 3px var(--gold-dim)" }}>
                    <span style={{ flex: 1, fontSize: 11, fontFamily: "var(--font-sans, sans-serif)", color: "var(--text-3)" }}>Ask Ada Lovelace anything…</span>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--text-1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ArrowUp size={12} weight="Bold" color="var(--bg)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* ── Resources card — behind, right, rotated opposite ── */}
            <div className="preview-card-right" style={{
              position: "absolute", right: -50, top: 0, width: 800, height: 460,
              transform: "rotate(7deg)", transformOrigin: "center bottom",
              zIndex: 1, borderRadius: 12, border: "1px solid var(--border)",
              boxShadow: "0 16px 48px rgba(25,23,46,0.35)",
              overflow: "hidden", pointerEvents: "auto", userSelect: "none",
              display: "flex", flexDirection: "column", background: "var(--bg)",
            }}>
              {/* Header — mirrors profile page header */}
              <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "8px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", background: "var(--bg)", flexShrink: 0 }}>
                    <SquareAltArrowLeft size={12} weight="Linear" color="currentColor" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 8.5, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 1 }}>Resources</span>
                    <div style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 650, fontSize: 13, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>Ada Lovelace</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 10, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis" }}>AC Systems Research</span>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", flexShrink: 0 }}>· Jan 12, 2026</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 7px", borderRadius: 7, border: "1px solid var(--border-soft)", color: "var(--text-3)", fontFamily: "var(--font-sans, sans-serif)", fontSize: 9, fontWeight: 500 }}>
                    <ShareCircle size={10} weight="Linear" color="currentColor" /> Share
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 7px", borderRadius: 7, border: "1px solid var(--border-soft)", color: "var(--text-3)", fontFamily: "var(--font-sans, sans-serif)", fontSize: 9, fontWeight: 500 }}>
                    <Export size={10} weight="Linear" color="currentColor" /> Export
                  </div>
                </div>
              </div>

              {/* Body: icon sidebar + resources grid */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Icon-only sidebar */}
                <div style={{ width: 52, background: "var(--bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
                  {[
                    { Icon: Widget,       key: "overview" },
                    { Icon: UserId,       key: "personality" },
                    { Icon: SortByTime,   key: "timeline" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} weight="Linear" color="var(--text-3)" />
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  {[
                    { Icon: Siren,         key: "news" },
                    { Icon: Suitcase,      key: "work" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} weight="Linear" color="var(--text-3)" />
                      </div>
                    </div>
                  ))}
                  {/* Resources — ACTIVE */}
                  <div style={{ position: "relative", width: "100%", padding: "1px 9px" }}>
                    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "var(--gold)", borderRadius: "0 2px 2px 0" }} />
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gold-dim)" }}>
                      <Documents size={16} weight="Bold" color="var(--gold)" />
                    </div>
                  </div>
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  <div style={{ width: "100%", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChatLine size={16} weight="Linear" color="var(--text-3)" />
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={16} weight="Linear" color="var(--text-3)" />
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3, #2a2838)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserRounded size={15} weight="Linear" color="var(--text-2)" />
                    </div>
                  </div>
                </div>

                {/* Resources grid */}
                <div style={{ flex: 1, overflow: "hidden", padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border-soft)" }}>
                    <span style={{ fontSize: 9, color: "var(--gold)", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 3 }}>Resources</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 2 }}>Source index</div>
                    <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-sans, sans-serif)", lineHeight: 1.45 }}>Reference pages and media inputs used in this project.</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0 20px" }}>
                  {[
                    {
                      label: "REFERENCE", Icon: BookBookmark,
                      items: [
                        { title: "Ada Lovelace", author: "Wikipedia", depth: 3 },
                        { title: "Q7259", author: "Wikidata", depth: 3 },
                        { title: "Ada Lovelace", author: "Wikiquote", depth: 2 },
                        { title: "Analytical Engine Notes", author: "Reference Archive", depth: 2 },
                      ],
                    },
                    {
                      label: "MEDIA", Icon: DocumentText,
                      items: [
                        { title: "The Enchantress of Numbers", author: "YouTube", depth: 2 },
                        { title: "Computing Before Computers", author: "Video Source", depth: 1 },
                        { title: "Analytical Engine Lectures", author: "Transcript", depth: 1 },
                        { title: "Ada in Context", author: "Documentary", depth: 2 },
                      ],
                    },
                    {
                      label: "ARCHIVE", Icon: FileText,
                      items: [
                        { title: "A New System of Alternate Current Motors", author: "Open Archive", depth: 3 },
                        { title: "Experiments with Alternate Currents", author: "Primary Record", depth: 3 },
                        { title: "The Problem of Increasing Human Energy", author: "Publication", depth: 2 },
                        { title: "World System of Wireless Transmission", author: "Historical Journal", depth: 2 },
                      ],
                    },
                  ].map(({ label, Icon: ColIcon, items }) => (
                    <div key={label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(201,168,76,0.3)", paddingBottom: 8, marginBottom: 10 }}>
                        <ColIcon size={13} weight="Bold" color="var(--gold)" />
                        <span style={{ fontSize: 9, color: "var(--gold)", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                      </div>
                      {items.map((item) => (
                        <div key={`${item.title}-${item.author}`} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-1)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 10, color: "var(--text-2)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 5 }}>{item.author}</div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", gap: 3 }}>
                              {[1, 2, 3].map((d) => (
                                <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: d <= item.depth ? "var(--gold)" : "transparent", border: d <= item.depth ? "none" : "1px solid var(--border)" }} />
                              ))}
                            </div>
                            <ArrowRightUp size={11} weight="Linear" color="var(--text-3)" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* âââââââ 5. INTERACTION MODES â Bento Grid âââââââ */}
      <hr className="section-divider" />
      {/* === 5. FEATURES BENTO === */}
      <section
        id="features"
        className="landing-section section-tinted reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-14">
          <p className="hex-eyebrow">Features</p>
          <h2 className="section-title mx-auto">
            <span
              style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88em", letterSpacing: "-0.01em" }}
            >
              Everything about a person &mdash;
            </span>
            <span className="gradient-text">one platform</span>
          </h2>
        </div>

        <div className="bento-grid">

          {/* Persona Chat – col-span 2, full height column layout */}
          <div
            className="glass-card reveal reveal-d1"
            ref={addRevealRef}
            style={{ gridArea: "persona", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div style={{ flexShrink: 0, padding: "20px 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ChatLine size={18} weight="Bold" color="var(--gold)" />
                </div>
                <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>Persona Chat</span>
              </div>
              <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.65, margin: 0 }}>
                Hold a real conversation with any historical figure or public personality. Ask anything and get answers grounded in real sources, delivered in their voice.
              </p>
            </div>

            {/* Chat messages */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, background: "var(--control-bg)" }}>
              {/* User message */}
              <div style={{ alignSelf: "flex-end", marginLeft: "auto", maxWidth: "72%", background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: "16px 16px 4px 16px", padding: "8px 12px" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "var(--text-1)", lineHeight: 1.5, margin: 0 }}>What drove your obsession with AC power?</p>
              </div>
              {/* AI response */}
              <div style={{ alignSelf: "flex-start", marginRight: "auto", maxWidth: "72%", display: "flex", gap: 7, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>NT</div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border-soft)", borderRadius: "16px 16px 16px 4px", padding: "8px 12px" }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.55, margin: 0 }}>It was never obsession — it was recognition of the only rational path forward for civilisation...</p>
                </div>
              </div>
              {/* User message */}
              <div style={{ alignSelf: "flex-end", marginLeft: "auto", maxWidth: "72%", background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: "16px 16px 4px 16px", padding: "8px 12px" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "var(--text-1)", lineHeight: 1.5, margin: 0 }}>Did Edison ever acknowledge your work?</p>
              </div>
              {/* AI response */}
              <div style={{ alignSelf: "flex-start", marginRight: "auto", maxWidth: "72%", display: "flex", gap: 7, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>NT</div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border-soft)", borderRadius: "16px 16px 16px 4px", padding: "8px 12px" }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.55, margin: 0 }}>History speaks louder than any man&apos;s pride.</p>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div style={{ flexShrink: 0, flexGrow: 0, padding: "10px 14px 14px", borderTop: "1px solid var(--border-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "7px 8px 7px 14px" }}>
                <span style={{ flex: 1, fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--text-3)" }}>Ask a question...</span>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--text-1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowUp size={12} style={{ color: "#fff" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="glass-card p-6 reveal reveal-d2" ref={addRevealRef} style={{ gridArea: "overview", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Widget size={17} weight="Bold" color="#38bdf8" />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Overview</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.65, margin: 0 }}>
              A structured biography assembled from verified sources: birth, education, career arc, key achievements, and legacy.
            </p>
          </div>

          {/* Personality */}
          <div className="glass-card p-6 reveal reveal-d3" ref={addRevealRef} style={{ gridArea: "personality", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(167,139,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <UserId size={17} weight="Bold" color="#a78bfa" />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Personality</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.65, margin: 0 }}>
              AI-derived Big Five traits from writings, speeches, and documented behaviour patterns.
            </p>
          </div>

          {/* Timeline */}
          <div className="glass-card p-5 reveal reveal-d4" ref={addRevealRef} style={{ gridArea: "timeline", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(52,211,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SortByTime size={16} weight="Bold" color="#34d399" />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Timeline</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Chronological milestones in an interactive vertical timeline filterable by category.
            </p>
            <div style={{ position: "relative", paddingLeft: 16 }}>
              <div style={{ position: "absolute", left: 5, top: 0, bottom: 0, width: 1, background: "var(--border-soft)" }} />
              {["1856 — Birth", "1882 — AC Motor", "1891 — Tesla Coil"].map((e) => (
                <div key={e} style={{ position: "relative", marginBottom: 5 }}>
                  <div style={{ position: "absolute", left: -15, top: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)" }}>{e}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Retrieval Modes */}
          <div className="glass-card p-5 reveal reveal-d5" ref={addRevealRef} style={{ gridArea: "modes", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Database size={16} weight="Bold" color="var(--gold)" />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, fontWeight: 700, color: "var(--text-1)" }}>Retrieval Modes</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 11px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              In Persona Chat, choose web context, knowledge base grounding, or combine both.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "9px 10px", background: "var(--control-bg)", borderRadius: 8, border: "1px solid var(--border-soft)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(56,189,248,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Magnifier size={12} weight="Bold" color="#38bdf8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 650, color: "var(--text-1)", margin: 0 }}>Web Search</p>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>live</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 9.5, color: "var(--text-3)", lineHeight: 1.45, margin: 0 }}>Fresh context from current web sources.</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "9px 10px", background: "var(--control-bg)", borderRadius: 8, border: "1px solid var(--border-soft)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(52,211,153,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Database size={12} weight="Bold" color="#34d399" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 650, color: "var(--text-1)", margin: 0 }}>Knowledge Base</p>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>grounded</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 9.5, color: "var(--text-3)", lineHeight: 1.45, margin: 0 }}>Retrieval from indexed project intelligence.</p>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Hybrid: both modes enabled</p>
              </div>
            </div>
          </div>

          {/* News */}
          <div className="glass-card p-5 reveal reveal-d6" ref={addRevealRef} style={{ gridArea: "news", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(251,146,60,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Siren size={16} weight="Bold" color="#fb923c" />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>News</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Live feed of recent articles filtered for relevance.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { tag: "BBC", time: "2h ago", title: "Ada Lovelace's ideas continue to shape modern computing" },
                { tag: "Wired", time: "5h ago", title: "Why Ada Lovelace still matters in 2026" },
              ].map(({ tag, time, title }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 9px", background: "var(--control-bg)", borderRadius: 7 }}>
                  <Link size={12} weight="Bold" color="#fb923c" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "var(--text-1)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#FB923C" }}>{tag}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-3)" }}>{time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="glass-card p-5 reveal reveal-d7" ref={addRevealRef} style={{ gridArea: "resources", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(244,114,182,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Documents size={16} weight="Bold" color="#f472b6" />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Resources</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Curated books, papers, and media depth-rated so you know exactly where to start your deep dive.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { Icon: DocumentText, color: "#f472b6", title: "Ada's Algorithm", sub: "James Essinger", depth: 3 },
                { Icon: FileText, color: "#f472b6", title: "Notes on the Analytical Engine", sub: "Lovelace, A. (1843)", depth: 3 },
              ].map(({ Icon, color, title, sub, depth }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 9px", background: "var(--control-bg)", borderRadius: 7 }}>
                  <Icon size={12} weight="Bold" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "var(--text-1)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-3)", margin: 0 }}>{sub}</p>
                  </div>
                  <div style={{ display: "flex", gap: 3, flexShrink: 0, alignSelf: "center" }}>
                    {[1,2,3].map((d) => (
                      <div key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: d <= depth ? "var(--gold)" : "transparent", border: d <= depth ? "none" : "1px solid var(--border)" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════ 6. USE CASES ═══════ */}
      <hr className="section-divider" />
      <section
        id="use-cases"
        className="landing-section section-cool reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-14">
          <p className="hex-eyebrow">Use Cases</p>
          <h2 className="section-title mx-auto">
            <span
              style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88em", letterSpacing: "-0.01em" }}
            >
              Different teams,
            </span>
            <span className="gradient-text">one research engine</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {USE_CASES.map((useCase, index) => {
            const Icon = useCase.icon
            const testimonial = TESTIMONIALS[index]
            return (
              <article
                key={useCase.title}
                className={`glass-card p-6 reveal reveal-d${index + 1}`}
                ref={addRevealRef}
                style={{ minHeight: 270 }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "var(--gold-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon size={17} weight="Bold" color="var(--gold)" />
                </div>

                <h3 style={{ fontSize: 20, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text-1)", fontWeight: 700, marginBottom: 10 }}>
                  {useCase.title}
                </h3>

                <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
                  {useCase.summary}
                </p>

                <ul style={{ paddingLeft: 18, color: "var(--text-2)", fontSize: 12, lineHeight: 1.75, display: "grid", gap: 4, marginBottom: 14 }}>
                  {useCase.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>

                {testimonial ? (
                  <p style={{ marginTop: "auto", color: "var(--text-3)", fontSize: 11, lineHeight: 1.65 }}>
                    "{testimonial.quote}" — {testimonial.name}
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      </section>

      {/* ═══════ 8. FAQ ═══════ */}
      <hr className="section-divider" />
      <section
        id="faq"
        className="py-24 px-6 reveal section-warm"
        ref={addRevealRef}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <p className="hex-eyebrow">FAQ</p>
            <h2 className="section-title">
              <span
                style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88em", letterSpacing: "-0.01em" }}
              >
                Questions &amp;
              </span>
              <span className="gradient-text">answers</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className="glass-card overflow-hidden rounded-2xl">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-sans font-medium flex justify-between items-center gap-4"
                  style={{ color: "var(--text-1)" }}
                >
                  <span>{item.q}</span>
                  <span
                    className={`faq-chevron shrink-0 ${faqOpen === i ? "open" : ""}`}
                    style={{ color: "var(--text-3)", fontSize: 20, lineHeight: 1, fontWeight: 300 }}
                  >
                    {faqOpen === i ? "−" : "+"}
                  </span>
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
      <hr className="section-divider" />
      <section
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <div className="relative z-10" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p className="hex-eyebrow">Get Started</p>
          <h2
            className="section-title mb-5"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}
          >
            Start with a name.
            <br />
            <span className="gradient-text" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontStyle: "normal" }}>
              Discover a mind.
            </span>
          </h2>
          <p className="font-sans text-base mb-10 mx-auto max-w-md" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
            Join thousands of researchers, students, and curious minds exploring
            the greatest intellects in history.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="btn btn-primary flex items-center gap-2 px-8 py-3.5"
              style={{ fontSize: 15, borderRadius: 8 }}
              disabled={isAuthPending}
            >
              {authCtaLabel}
              <ArrowRight size={16} weight="Bold" />
            </button>
            <a
              href="/how-it-works"
              className="btn btn-secondary px-7 py-3.5"
              style={{ fontSize: 15, borderRadius: 8 }}
            >
              Read docs
            </a>
          </div>
          <p className="text-[10px] mt-6" style={{ color: "var(--text-3)", letterSpacing: "0.15em", fontFamily: "var(--font-data), monospace", textTransform: "uppercase" }}>
            Fact-grounded · Multi-agent · Retrieval-verified
          </p>
        </div>
      </section>

      {/* ═══════ 10. FOOTER ═══════ */}
      <footer
        className="px-6"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(110% 95% at 50% -8%, var(--ambient-accent) 0%, transparent 62%), linear-gradient(180deg, var(--surface-2) 0%, var(--bg) 100%)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(95% 120% at 50% 0%, var(--gold-glow) 0%, transparent 66%)",
            opacity: 0.9,
          }}
        />
        <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1, paddingTop: 66, paddingBottom: 24 }}>
          <div className="grid md:grid-cols-[1.45fr_1fr] gap-14 items-start" style={{ marginBottom: 54 }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-3)",
                  marginBottom: 14,
                }}
              >
                Experience lift-off
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 18,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <svg
                  viewBox="0 0 280 240"
                  aria-label="Mimic logo"
                  style={{
                    width: "clamp(74px, 10vw, 118px)",
                    height: "auto",
                    display: "block",
                    flexShrink: 0,
                  }}
                >
                  <path
                    d="M 20 180 L 20 60 A 40 40 0 0 1 100 60 L 100 120 A 40 40 0 0 0 180 120 L 180 60 A 40 40 0 0 1 260 60 L 260 180"
                    stroke="var(--text-1)"
                    strokeWidth="40"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>

                <h2
                  style={{
                    fontFamily: "var(--font-sans, sans-serif)",
                    fontWeight: 800,
                    letterSpacing: "-0.055em",
                    lineHeight: 0.9,
                    margin: 0,
                    color: "var(--text-1)",
                    fontSize: "clamp(4rem, 12vw, 10.8rem)",
                  }}
                >
                  MIMIC
                </h2>
              </div>

              <p
                className="font-sans"
                style={{
                  maxWidth: 540,
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "var(--text-2)",
                }}
              >
                Intelligence profiles grounded in research, shaped by multi-agent verification, and designed for deep exploration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 10,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: 14,
                  }}
                >
                  Product
                </h4>
                <div className="space-y-3 font-sans text-sm">
                  <a href="/how-it-works" className="footer-link">How It Works</a>
                  <a href="#features" className="footer-link">Features</a>
                  <a href="#profile-preview" className="footer-link">Personas</a>
                  <a href="#faq" className="footer-link">FAQ</a>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 10,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: 14,
                  }}
                >
                  Company
                </h4>
                <div className="space-y-3 font-sans text-sm">
                  <a href="#use-cases" className="footer-link">Use Cases</a>
                  <a href="#faq" className="footer-link">FAQ</a>
                  <a href="/how-it-works" className="footer-link">Docs</a>
                  <a href="/how-it-works#notes-and-limitations" className="footer-link">Method notes</a>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 16,
              display: "flex",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "var(--text-3)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              © {new Date().getFullYear()} Mimic AI
            </div>

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <a href="/how-it-works#notes-and-limitations" className="footer-link" style={{ fontSize: 12 }}>Privacy</a>
              <a href="/how-it-works#notes-and-limitations" className="footer-link" style={{ fontSize: 12 }}>Terms</a>
              <button onClick={onGetStarted} type="button" className="footer-link" style={{ fontSize: 12 }}>
                {isSignedIn ? "Dashboard" : "Google Login"}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
