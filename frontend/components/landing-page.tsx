"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import {
  ArrowRight,
  Search,
  BookOpen,
  Zap,
  Check,
  Clock3,
  AlertTriangle,
  Newspaper,
  MessagesSquare,
  FolderOpen,
  Circle,
  LoaderCircle,
  ArrowUp,
  History,
  SquarePen,
  Brain,
  GitBranch,
  BarChart2,
  Settings,
  User,
  Play,
  FileText,
  ExternalLink,
} from "lucide-react"

/* ─── Data ─── */

const TYPEWRITER_NAMES = ["Nikola Tesla", "Marie Curie", "Alan Turing"]

interface LandingPageProps {
  onGetStarted: () => void
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
      icon: BookOpen,
      status: "done",
      description: "Extracting core biography and factual records",
      duration: "3.2s",
    },
    {
      step: 2,
      name: "Timeline Agent",
      icon: Clock3,
      status: "done",
      description: "Sequencing milestones into a verified chronology",
      duration: "2.7s",
    },
  ],
  [
    {
      step: 3,
      name: "Controversies Finder",
      icon: AlertTriangle,
      status: "active",
      description: "Cross-checking contested claims across sources",
      activeText: "Analyzing 23 sources...",
    },
    {
      step: 4,
      name: "News Agent",
      icon: Newspaper,
      status: "pending",
      description: "Scanning recent publications and headlines",
    },
  ],
  [
    {
      step: 5,
      name: "Social Media Agent",
      icon: MessagesSquare,
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



/* ─── Main Component ─── */

export function LandingPage({ onGetStarted }: Readonly<LandingPageProps>) {
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

  return (
    <div className="overflow-x-hidden" style={{ background: "transparent" }}>

      {/* ═══════ 1. HERO ═══════ */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 0, overflow: "hidden" }}
      >
        <div className="relative z-10 max-w-3xl">
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
              className="display-serif"
              style={{ display: "block", fontWeight: 500, fontSize: "0.9em", letterSpacing: "-0.015em", marginBottom: "0.08em" }}
            >
              Every mind,
            </span>
            <span className="gradient-text">mapped</span>
            <span style={{ WebkitTextFillColor: "var(--text-1)" }}> and accessible.</span>
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
            >
              Get started for free
              <ArrowRight size={16} />
            </button>
            <a
              href="#how-it-works"
              className="btn btn-secondary px-7 py-3.5"
              style={{ fontSize: 15, borderRadius: 8 }}
            >
              See how it works
            </a>
          </div>

          {/* Agent Pipeline Visualization — peeks below the fold */}
        </div>
        <div
          className="hero-enter hero-enter-d4 agent-pipeline-card mx-auto w-full hero-pipeline-peek"
          style={{
            maxWidth: 860,
            background: "#ffffff",
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
                        let StatusIcon = Circle
                        if (agent.status === "done") StatusIcon = Check
                        if (agent.status === "active") StatusIcon = LoaderCircle
                        return (
                          <Fragment key={agent.name}>
                            <article className="snake-card" aria-label={`${agent.name} ${agent.status}`}>
                              <div className="snake-card-top">
                                <div className="snake-card-left">
                                  <span className="snake-step">{String(agent.step).padStart(2, "0")}</span>
                                  <span className="snake-icon" aria-hidden="true">
                                    <Icon size={14} />
                                  </span>
                                  <span className="snake-name">{agent.name}</span>
                                </div>
                                <div className="snake-card-status-wrap">
                                  <span className={`snake-status snake-status-${agent.status}`} aria-hidden="true">
                                    <StatusIcon size={9} />
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
              className="display-serif"
              style={{ display: "block", fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.01em" }}
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
                  <Search size={15} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  <span className="font-mono text-sm" style={{ color: "var(--text-2)" }}>
                    <span key={typewriterName} className="name-fade" aria-live="polite">{typewriterName}</span>
                    <span className="inline-block ml-0.5 animate-pulse" style={{ color: "var(--teal)", animationDuration: "0.8s" }} aria-hidden>|</span>
                  </span>
                </div>
              </div>
              {/* text */}
              <h3 className="hiw-title">Input a Name</h3>
              <p className="hiw-body">Type any historical or contemporary figure. The system spins up a multi-agent research pipeline.</p>
              <button onClick={onGetStarted} className="card-learn-more hiw-cta">Explore →</button>
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
                        <Icon size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
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
              <button onClick={onGetStarted} className="card-learn-more hiw-cta">Explore →</button>
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
                    >NT</div>
                    <div>
                      <div className="font-sans text-sm font-semibold" style={{ color: "var(--text-1)" }}>Nikola Tesla</div>
                      <div className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>1856–1943 · Score: 94</div>
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
              <button onClick={onGetStarted} className="card-learn-more hiw-cta">Explore →</button>
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
                className="display-serif"
                style={{ display: "block", fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.01em" }}
              >
                A profile unlike
              </span>
              <span className="gradient-text">any other</span>
            </h2>
          </div>
          {/* ── Cards stage ── */}
          <div style={{ position: "relative", height: 480 }}>

            {/* ── Timeline card — behind, left, rotated ── */}
            <div className="preview-card-left" style={{
              position: "absolute", left: -50, top: 0, width: 800, height: 460,
              transform: "rotate(-7deg)", transformOrigin: "center bottom",
              zIndex: 1, borderRadius: 12, border: "1px solid var(--border)",
              boxShadow: "0 16px 48px rgba(25,23,46,0.35)",
              overflow: "hidden", pointerEvents: "auto", userSelect: "none",
              display: "flex", flexDirection: "column", background: "var(--bg)",
            }}>
              {/* Header — entity name + tabs */}
              <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "0 18px", height: 46, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>NT</div>
                <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>Nikola Tesla</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em" }}>Entity</span>
                {/* Tab row */}
                <div style={{ marginLeft: 12, display: "flex", gap: 2 }}>
                  {["Overview", "Timeline", "Insights", "Persona"].map((tab) => (
                    <div key={tab} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: "var(--font-sans, sans-serif)", fontWeight: 500,
                      color: tab === "Timeline" ? "var(--gold)" : "var(--text-3)",
                      background: tab === "Timeline" ? "var(--gold-dim)" : "transparent",
                      border: "1px solid transparent",
                    }}>{tab}</div>
                  ))}
                </div>
              </div>

              {/* Body: icon sidebar + timeline content */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Icon-only sidebar — identical to persona chat card */}
                <div style={{ width: 52, background: "var(--bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
                  {[
                    { Icon: BookOpen, key: "overview" },
                    { Icon: Brain, key: "personality" },
                    { Icon: GitBranch, key: "timeline" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                        background: key === "timeline" ? "var(--gold-dim)" : "transparent" }}>
                        <Icon size={16} style={{ color: key === "timeline" ? "var(--gold)" : "var(--text-3)" }} />
                      </div>
                      {key === "timeline" && <div style={{ position: "absolute", left: 0, width: 3, height: 34, background: "var(--gold)", borderRadius: "0 2px 2px 0" }} />}
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  {[
                    { Icon: AlertTriangle, key: "controversies" },
                    { Icon: Newspaper, key: "news" },
                    { Icon: BarChart2, key: "resources" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} style={{ color: "var(--text-3)" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  <div style={{ width: "100%", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessagesSquare size={16} style={{ color: "var(--text-3)" }} />
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={16} style={{ color: "var(--text-3)" }} />
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3, #2a2838)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={15} style={{ color: "var(--text-2)" }} />
                    </div>
                  </div>
                </div>

                {/* Timeline main content */}
                <div style={{ flex: 1, overflow: "hidden", padding: "18px 20px" }}>
                  <h2 style={{ fontSize: 18, color: "var(--ivory, #f5f0e8)", fontWeight: 500, fontStyle: "italic", fontFamily: "var(--font-serif, serif)", lineHeight: 1.2, margin: "0 0 4px" }}>Chronology &amp; Milestones</h2>
                  <p style={{ fontSize: 10.5, color: "var(--text-2)", fontFamily: "var(--font-sans, sans-serif)", margin: "0 0 16px", lineHeight: 1.5 }}>The defining moments spanning the lifetime of the entity.</p>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.08)" }} />
                    {[
                      { year: "1856", title: "Birth in Smiljan", cat: "event" },
                      { year: "1882", title: "Conception of AC Motor", cat: "invention" },
                      { year: "1884", title: "Arrival in America", cat: "career" },
                      { year: "1891", title: "The Tesla Coil", cat: "invention" },
                    ].map((item) => (
                      <div key={item.year} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Zap size={14} style={{ color: item.cat === "invention" ? "var(--teal, #4ecdc4)" : "var(--gold)" }} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--gold)", fontFamily: "var(--font-mono, monospace)" }}>{item.year}</span>
                            <span style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)", fontFamily: "var(--font-mono, monospace)" }}>{item.cat}</span>
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ivory, #f5f0e8)", fontFamily: "var(--font-sans, sans-serif)" }}>{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Persona Chat page mockup ── */}
            <div
              className="preview-card-center"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 20,
                width: 800,
                height: 460,
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid var(--border)",
                boxShadow: "0 24px 64px rgba(25,23,46,0.13), 0 4px 16px rgba(25,23,46,0.07)",
                overflow: "hidden",
                pointerEvents: "auto",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                zIndex: 2,
              }}
            >
            {/* ── Body: icon sidebar + chat ── */}
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

              {/* Icon-only sidebar — matches real dashboard sidebar styles */}
              <div style={{ width: 52, background: "var(--bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>

                {/* Group 1 — Profile */}
                {[
                  { Icon: BookOpen,      key: "overview" },
                  { Icon: Brain,         key: "personality" },
                  { Icon: GitBranch,     key: "timeline" },
                ].map(({ Icon, key }) => (
                  <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: "var(--text-3)" }} />
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />

                {/* Group 2 — Insights */}
                {[
                  { Icon: AlertTriangle, key: "controversies" },
                  { Icon: Newspaper,    key: "news" },
                  { Icon: BarChart2,    key: "resources" },
                ].map(({ Icon, key }) => (
                  <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: "var(--text-3)" }} />
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />

                {/* Persona Chat — ACTIVE row */}
                <div style={{ position: "relative", width: "100%", padding: "1px 9px" }}>
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "var(--gold)", borderRadius: "0 2px 2px 0" }} />
                  <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gold-dim)" }}>
                    <MessagesSquare size={16} style={{ color: "var(--gold)" }} />
                  </div>
                </div>

                {/* Settings + user avatar pinned to bottom */}
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 9px" }}>
                  <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Settings size={16} style={{ color: "var(--text-3)" }} />
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3, #e8e6e0)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={15} style={{ color: "var(--text-2)" }} />
                  </div>
                </div>
              </div>

              {/* ── Main persona chat area ── */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ffffff", minWidth: 0 }}>

                {/* Chat header */}
                <div style={{ background: "#ffffff", borderBottom: "1px solid var(--border)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>NT</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>Nikola Tesla</span>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--gold)", background: "var(--gold-dim)", padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em" }}>Persona</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "#ffffff", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-2)" }}>
                      <SquarePen size={10} style={{ color: "var(--text-3)" }} /> New Session
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "#ffffff", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-2)" }}>
                      <History size={10} style={{ color: "var(--text-3)" }} /> History
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>

                  {/* User message — right-aligned light bubble */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#f0efed", border: "1px solid var(--border-soft)", padding: "10px 14px", borderRadius: "10px 10px 2px 10px", maxWidth: "75%" }}>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 12, color: "var(--text-1)", lineHeight: 1.6, margin: "0 0 4px" }}>
                        Mr. Tesla, how did you first conceive the rotating magnetic field and the polyphase alternating current system, and why did you believe it was superior to Edison&apos;s direct current?
                      </p>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", display: "block", textAlign: "right" }}>23:00</span>
                    </div>
                  </div>

                  {/* Tesla response */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>NT</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, fontSize: 12, color: "var(--text-1)" }}>Nikola Tesla</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)" }}>23:00</span>
                      </div>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 8px" }}>
                        An excellent question. Allow me to address this with the precision it deserves.
                      </p>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 8px" }}>
                        My work was always guided by one principle: that the forces of nature, properly understood and harnessed, could liberate humanity from drudgery. When I conceived the rotating magnetic field in 1882, walking through the City Park of Budapest, it came to me complete.
                      </p>
                      <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 8px" }}>
                        <strong style={{ color: "var(--text-1)" }}>The polyphase alternating current system</strong> was not merely an improvement upon Edison&apos;s direct current. It was a fundamentally different conception of how electrical energy should flow through civilization.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)" }}>Sources (2)</span>
                        <span style={{ fontSize: 9, color: "var(--text-3)" }}>▾</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div style={{ padding: "12px 20px", background: "#ffffff", borderTop: "1px solid #ebebeb", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffffff", border: "1.5px solid var(--gold)", borderRadius: 8, padding: "8px 8px 8px 14px", boxShadow: "0 0 0 3px var(--gold-dim)" }}>
                    <span style={{ flex: 1, fontSize: 11, fontFamily: "var(--font-sans, sans-serif)", color: "var(--text-3)" }}>Ask a question grounded in historical record...</span>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--text-1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ArrowUp size={12} style={{ color: "#fff" }} />
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
              {/* Header */}
              <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "0 18px", height: 46, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>NT</div>
                <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>Nikola Tesla</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "var(--text-3)", background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em" }}>Entity</span>
                <div style={{ marginLeft: 12, display: "flex", gap: 2 }}>
                  {["Overview", "Timeline", "Insights", "Resources", "Persona"].map((tab) => (
                    <div key={tab} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: "var(--font-sans, sans-serif)", fontWeight: 500,
                      color: tab === "Resources" ? "var(--gold)" : "var(--text-3)",
                      background: tab === "Resources" ? "var(--gold-dim)" : "transparent",
                      border: "1px solid transparent",
                    }}>{tab}</div>
                  ))}
                </div>
              </div>

              {/* Body: icon sidebar + resources grid */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Icon-only sidebar */}
                <div style={{ width: 52, background: "var(--bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
                  {[
                    { Icon: BookOpen, key: "overview" },
                    { Icon: Brain, key: "personality" },
                    { Icon: GitBranch, key: "timeline" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} style={{ color: "var(--text-3)" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  {[
                    { Icon: AlertTriangle, key: "controversies" },
                    { Icon: Newspaper, key: "news" },
                  ].map(({ Icon, key }) => (
                    <div key={key} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "1px 9px" }}>
                      <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} style={{ color: "var(--text-3)" }} />
                      </div>
                    </div>
                  ))}
                  {/* Resources — ACTIVE */}
                  <div style={{ position: "relative", width: "100%", padding: "1px 9px" }}>
                    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "var(--gold)", borderRadius: "0 2px 2px 0" }} />
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gold-dim)" }}>
                      <BarChart2 size={16} style={{ color: "var(--gold)" }} />
                    </div>
                  </div>
                  <div style={{ height: 1, background: "var(--border-soft)", margin: "8px 10px" }} />
                  <div style={{ width: "100%", padding: "1px 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessagesSquare size={16} style={{ color: "var(--text-3)" }} />
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 9px" }}>
                    <div style={{ width: "100%", height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={16} style={{ color: "var(--text-3)" }} />
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3, #2a2838)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={15} style={{ color: "var(--text-2)" }} />
                    </div>
                  </div>
                </div>

                {/* Resources grid */}
                <div style={{ flex: 1, overflow: "hidden", padding: "18px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0 20px" }}>
                  {[
                    {
                      label: "BOOKS", Icon: BookOpen,
                      items: [
                        { title: "Tesla: Inventor of the Electrical Age", author: "W. Bernard Carlson", depth: 3 },
                        { title: "Wizard: The Life and Times of Nikola Tesla", author: "Marc Seifer", depth: 3 },
                        { title: "My Inventions: The Autobiography", author: "Nikola Tesla", depth: 2 },
                        { title: "Empires of Light", author: "Jill Jonnes", depth: 2 },
                      ],
                    },
                    {
                      label: "MEDIA", Icon: Play,
                      items: [
                        { title: "Tesla: Master of Lightning", author: "PBS Documentary", depth: 2 },
                        { title: "The Current War", author: "Alfonso Gomez-Rejon", depth: 1 },
                        { title: "Drunk History: Tesla", author: "Comedy Central", depth: 1 },
                        { title: "The Tesla Files", author: "History Channel", depth: 2 },
                      ],
                    },
                    {
                      label: "PAPERS", Icon: FileText,
                      items: [
                        { title: "A New System of Alternate Current Motors", author: "Tesla, N. (1888)", depth: 3 },
                        { title: "Experiments with Alternate Currents", author: "Tesla, N. (1892)", depth: 3 },
                        { title: "The Problem of Increasing Human Energy", author: "Tesla, N. (1900)", depth: 2 },
                        { title: "World System of Wireless Transmission", author: "Tesla, N. (1927)", depth: 2 },
                      ],
                    },
                  ].map(({ label, Icon: ColIcon, items }) => (
                    <div key={label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(201,168,76,0.3)", paddingBottom: 8, marginBottom: 10 }}>
                        <ColIcon size={13} style={{ color: "var(--gold)" }} />
                        <span style={{ fontSize: 9, color: "var(--gold)", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                      </div>
                      {items.map((item) => (
                        <div key={item.title} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-1)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 10, color: "var(--text-2)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 5 }}>{item.author}</div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", gap: 3 }}>
                              {[1, 2, 3].map((d) => (
                                <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: d <= item.depth ? "var(--gold)" : "transparent", border: d <= item.depth ? "none" : "1px solid var(--border)" }} />
                              ))}
                            </div>
                            <ExternalLink size={11} style={{ color: "var(--text-3)" }} />
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
      </section>

      {/* âââââââ 5. INTERACTION MODES â Bento Grid âââââââ */}
      <hr className="section-divider" />
      {/* === 5. FEATURES BENTO === */}
      <section
        className="landing-section section-tinted reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-14">
          <p className="hex-eyebrow">Features</p>
          <h2 className="section-title mx-auto">
            <span
              className="display-serif"
              style={{ display: "block", fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.01em" }}
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
                  <MessagesSquare size={18} style={{ color: "var(--gold)" }} />
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
                <BookOpen size={17} style={{ color: "#38BDF8" }} />
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
                <Brain size={17} style={{ color: "#A78BFA" }} />
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
                <GitBranch size={16} style={{ color: "#34D399" }} />
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

          {/* Controversies */}
          <div className="glass-card p-5 reveal reveal-d5" ref={addRevealRef} style={{ gridArea: "controversies", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={16} style={{ color: "#F87171" }} />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Controversies</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Balanced coverage of disputes and contested claims. Myth vs verified fact with source references.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(248,113,113,0.08)", fontFamily: "var(--font-mono)", fontSize: 9, color: "#F87171", textAlign: "center" }}>CLAIM</div>
              <div style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(52,211,153,0.08)", fontFamily: "var(--font-mono)", fontSize: 9, color: "#34D399", textAlign: "center" }}>VERDICT</div>
            </div>
          </div>

          {/* News */}
          <div className="glass-card p-5 reveal reveal-d6" ref={addRevealRef} style={{ gridArea: "news", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(251,146,60,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Newspaper size={16} style={{ color: "#FB923C" }} />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>News</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Live feed of recent articles filtered for relevance.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { tag: "BBC", time: "2h ago", title: "Tesla's AC legacy powers the modern grid" },
                { tag: "Wired", time: "5h ago", title: "Why Nikola Tesla's ideas still matter in 2026" },
              ].map(({ tag, time, title }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 9px", background: "var(--control-bg)", borderRadius: 7 }}>
                  <Newspaper size={12} style={{ color: "#FB923C", flexShrink: 0, marginTop: 2 }} />
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
                <BarChart2 size={16} style={{ color: "#F472B6" }} />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Resources</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Curated books, papers, and media depth-rated so you know exactly where to start your deep dive.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { Icon: BookOpen, title: "Tesla: Inventor of the Electrical Age", sub: "W. Bernard Carlson", depth: 3 },
                { Icon: FileText, title: "A New System of Alternate Current Motors", sub: "Tesla, N. (1888)", depth: 3 },
              ].map(({ Icon, title, sub, depth }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 9px", background: "var(--control-bg)", borderRadius: 7 }}>
                  <Icon size={12} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
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

      {/* ═══════ 6. TESTIMONIALS — commented out ═══════
      <hr className="section-divider" />
      <section
        id="use-cases"
        className="py-24 px-6 reveal section-ink"
        ref={addRevealRef}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <p className="hex-eyebrow">Testimonials</p>
            <h2 className="section-title">
              <span
                className="display-serif"
                style={{ display: "block", fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.01em" }}
              >
                What researchers are
              </span>
              <span className="gradient-text">saying</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`testimonial-card reveal reveal-d${i + 1}`}
                ref={addRevealRef}
              >
                <span className="testimonial-quote-mark">&ldquo;</span>
                <p className="testimonial-text">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-sans text-sm font-bold shrink-0"
                    style={{
                      background: "var(--text-1)",
                      color: "#fff",
                    }}
                  >
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-sans text-sm font-semibold" style={{ color: "var(--text-1)" }}>{t.name}</div>
                    <div className="font-mono text-[11px]" style={{ color: "var(--text-3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      ═══════ end TESTIMONIALS ═══════ */}

      {/* ═══════ 7. PRICING — commented out ═══════
      <hr className="section-divider" />
      <section
        id="pricing"
        className="landing-section reveal"
        ref={addRevealRef}
      >
        <div className="text-center mb-14">
          <p className="hex-eyebrow">Pricing</p>
          <h2 className="section-title">
            <span
              className="display-serif"
              style={{ display: "block", fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.01em" }}
            >
              Simple, transparent
            </span>
            <span className="gradient-text">pricing</span>
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
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
      ═══════ end PRICING ═══════ */}

      {/* ═══════ 8. FAQ ═══════ */}
      <hr className="section-divider" />
      <section
        className="py-24 px-6 reveal section-warm"
        ref={addRevealRef}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <p className="hex-eyebrow">FAQ</p>
            <h2 className="section-title">
              <span
                className="display-serif"
                style={{ display: "block", fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.01em" }}
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
            <span className="display-serif gradient-text" style={{ fontWeight: 500 }}>
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
            >
              Get started for free
              <ArrowRight size={16} />
            </button>
            <a
              href="#how-it-works"
              className="btn btn-secondary px-7 py-3.5"
              style={{ fontSize: 15, borderRadius: 8 }}
            >
              See how it works
            </a>
          </div>
          <p className="text-[10px] mt-6" style={{ color: "var(--text-3)", letterSpacing: "0.15em", fontFamily: "var(--font-data), monospace", textTransform: "uppercase" }}>
            Fact-grounded · Multi-agent · Retrieval-verified
          </p>
        </div>
      </section>

      {/* ═══════ 10. FOOTER ═══════ */}
      <footer
        className="py-16 px-6"
        style={{
          background: "#19172E",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-lg font-semibold" style={{ color: "#EEECEA" }}>
                Mimic
              </span>
              <span className="text-lg font-semibold" style={{ color: "#A78BFA" }}>
                AI
              </span>
            </div>
            <p className="font-sans text-sm" style={{ color: "rgba(238,236,234,0.50)" }}>
              Intelligence profiles grounded in research.
            </p>
          </div>
          <div>
            <h4 className="footer-eyebrow mb-4">Product</h4>
            <div className="space-y-2.5 font-sans text-sm">
              <a href="#how-it-works" className="footer-link">How It Works</a>
              <a href="#profile-preview" className="footer-link">Personas</a>
              <a href="#pricing" className="footer-link">Pricing</a>
            </div>
          </div>
          <div>
            <h4 className="footer-eyebrow mb-4">Resources</h4>
            <div className="space-y-2.5 font-sans text-sm">
              <button type="button" className="footer-link">Documentation</button>
              <button type="button" className="footer-link">API</button>
              <button type="button" className="footer-link">Blog</button>
            </div>
          </div>
          <div>
            <h4 className="footer-eyebrow mb-4">Connect</h4>
            <div className="space-y-2.5 font-sans text-sm">
              <button type="button" className="footer-link">Twitter</button>
              <button type="button" className="footer-link">LinkedIn</button>
              <button type="button" className="footer-link">GitHub</button>
            </div>
          </div>
        </div>
        <div
          className="max-w-5xl mx-auto mt-12 pt-8 text-xs"
          style={{ color: "rgba(238,236,234,0.35)", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-data), monospace" }}
        >
          © {new Date().getFullYear()} Mimic AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
