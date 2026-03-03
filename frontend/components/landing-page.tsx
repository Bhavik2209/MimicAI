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
} from "lucide-react"

const TYPEWRITER_NAMES = ["Nikola Tesla", "Marie Curie", "Alan Turing"]

interface LandingPageProps {
  onGetStarted: () => void
}

const AGENT_NODES = [
  { id: "bio", label: "Biography" },
  { id: "timeline", label: "Timeline" },
  { id: "ideology", label: "Ideology" },
  { id: "influence", label: "Influence" },
  { id: "legacy", label: "Legacy" },
]

const TRUST_PILLS = [
  "Web Research",
  "Source Validation",
  "Belief Analysis",
  "Myth Busting",
  "Timeline Engine",
  "Influence Mapping",
]

const AGENTS = [
  { name: "Biography Agent", icon: BookOpen },
  { name: "Timeline Engine", icon: Database },
  { name: "Belief Analyzer", icon: Brain },
  { name: "Influence Mapper", icon: Network },
  { name: "Myth Buster", icon: ShieldCheck },
  { name: "Legacy Scorer", icon: FileText },
]

const INTERACTION_CARDS = [
  { title: "Debate Mode", desc: "Two personas face off on contested topics", icon: Users },
  { title: "Decision Advisor", desc: "Persona gives advice with doc-style output", icon: MessageSquare },
  { title: "Influence Map", desc: "Node graph of relationships and impact", icon: Network },
  { title: "Myth Busting", desc: "Fact vs myth comparison table", icon: ShieldCheck },
  { title: "Legacy Scoring", desc: "Radar chart and score display", icon: Zap },
]

const TESTIMONIALS = [
  {
    role: "Researcher",
    quote: "Mimic transformed how I explore historical figures. The sourcing is impeccable.",
  },
  {
    role: "Student",
    quote: "Finally, a tool that lets me actually converse with the minds I'm studying.",
  },
  {
    role: "Journalist",
    quote: "The myth-busting and controversy tabs alone are worth the subscription.",
  },
]

const FAQ_ITEMS = [
  { q: "How does Mimic prevent hallucinations?", a: "Every claim is retrieval-grounded. Our agents cite primary sources and we surface them inline." },
  { q: "Where does the data come from?", a: "Verified historical records, academic publications, and documented primary sources." },
  { q: "How accurate are the personas?", a: "Personas are built from speech patterns and beliefs extracted from documented writings and accounts." },
  { q: "Is my research private?", a: "Yes. Your projects and conversations are private and never used for training." },
]

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [typewriterName, setTypewriterName] = useState(TYPEWRITER_NAMES[0])
  const [nameInput, setNameInput] = useState("")
  const revealRefs = useRef<HTMLElement[]>([])

  // Typewriter effect for Step 1
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setTypewriterName(TYPEWRITER_NAMES[i])
      i = (i + 1) % TYPEWRITER_NAMES.length
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  return (
    <div className="overflow-x-hidden" style={{ background: "#0A0A0A" }}>
      {/* 1. Hero */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{
          minHeight: "100vh",
          paddingTop: 120,
          paddingBottom: 80,
        }}
      >
        {/* Background blobs */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 20%, rgba(90,123,158,0.15) 0%, transparent 50%),
              radial-gradient(ellipse 50% 40% at 80% 80%, rgba(56,189,248,0.08) 0%, transparent 50%),
              #0A0A0A
            `,
          }}
        />
        {/* Dot grid behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(163,191,250,0.25) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
            opacity: 0.12,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-4xl">
          <span
            className="inline-block font-mono text-xs uppercase tracking-[0.15em] mb-8 px-4 py-1.5"
            style={{
              color: "#A3BFFA",
              border: "1px solid rgba(163,191,250,0.3)",
              borderRadius: 999,
            }}
          >
            ★ Retrieval-Grounded Intelligence
          </span>
          <h1
            className="font-serif mb-8"
            style={{
              fontSize: "clamp(3.5rem, 7vw, 5.5rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#F5F7FA",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            <em>"Every mind,</em>
            <br />
            <em>mapped and made</em>
            <br />
            <em>accessible."</em>
          </h1>
          <p
            className="font-sans text-lg max-w-2xl mx-auto mb-12"
            style={{ color: "#94A3B8", lineHeight: 1.7 }}
          >
            Enter a name. Our multi-agent system researches, synthesizes, and builds a verified
            intelligence profile — then lets you converse with the persona.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onGetStarted} className="btn btn-primary flex items-center gap-2 px-8 py-3.5">
              Explore a Persona
              <ArrowRight size={18} />
            </button>
            <a href="#how-it-works" className="btn btn-secondary">
              See How It Works
            </a>
          </div>

          {/* Agent Pipeline — Live visualization */}
          <div
            className="glass-card mt-20 mx-auto p-6 relative"
            style={{ maxWidth: 680, borderTop: "1px solid rgba(56,189,248,0.3)" }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.12em] mb-4"
              style={{ color: "#38BDF8" }}
            >
              // AGENT PIPELINE — ACTIVE
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {AGENTS.map((agent, i) => {
                const Icon = agent.icon
                const isComplete = i % 3 === 0
                return (
                  <div
                    key={agent.name}
                    className="flex flex-col gap-1.5 px-4 py-3 rounded-[10px]"
                    style={{
                      background: "rgba(56,189,248,0.06)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      animation: "nodeGlow 2s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: "#38BDF8" }} />
                      <span className="font-mono text-[11px]" style={{ color: "#94A3B8" }}>
                        {agent.name}
                      </span>
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: isComplete ? "#A3BFFA" : "#38BDF8" }}
                      >
                        {isComplete ? "✓ Complete" : "● Running..."}
                      </span>
                    </div>
                    <div
                      className="h-0.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.08)", width: 80 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: isComplete ? "100%" : "60%",
                          background: isComplete ? "#A3BFFA" : "#38BDF8",
                          animation: isComplete ? "none" : "fillBar 3s ease-in-out infinite alternate",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar — Marquee */}
      <section
        className="py-6 px-6 overflow-hidden"
        style={{ background: "#121212", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-6">
          <span
            className="font-mono text-xs uppercase tracking-[0.12em] shrink-0"
            style={{ color: "#64748B" }}
          >
            Powered by parallel intelligence agents
          </span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="flex w-max"
              style={{
                animation: "marquee 30s linear infinite",
              }}
            >
              {[...TRUST_PILLS, ...TRUST_PILLS].map((pill, i) => (
                <div
                  key={`${pill}-${i}`}
                  className="flex items-center gap-2 px-4 py-2 shrink-0 ml-3 first:ml-0"
                  style={{
                    borderLeft: "2px solid #38BDF8",
                    boxShadow: "0 0 6px rgba(56,189,248,0.4)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#38BDF8",
                      boxShadow: "0 0 6px #38BDF8",
                    }}
                  />
                  <span className="font-sans text-sm" style={{ color: "#94A3B8" }}>
                    {pill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section
        id="how-it-works"
        ref={addRevealRef}
        className="py-24 px-6 relative reveal"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: `
            radial-gradient(ellipse 40% 30% at 10% 20%, rgba(90,123,158,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 30% 40% at 90% 80%, rgba(56,189,248,0.07) 0%, transparent 50%)
          `,
        }}
      >
        <h2
          className="font-serif text-center mb-20 section-title"
          style={{
            fontWeight: 400,
            fontStyle: "italic",
            color: "#F5F7FA",
          }}
        >
          <em>Intelligence in Three Acts</em>
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Step 1 — Typewriter search input */}
          <div className="glass-card p-8 reveal reveal-d1" ref={addRevealRef}>
            <span className="font-mono text-sm mono-label" style={{ color: "#A3BFFA" }}>
              Step 1
            </span>
            <h3 className="font-serif text-xl italic mt-2 mb-4" style={{ color: "#F5F7FA" }}>
              Input
            </h3>
            <p className="font-sans card-body-text mb-6" style={{ color: "#94A3B8" }}>
              User types a name. The system initiates a multi-agent research pipeline.
            </p>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-[10px]"
              style={{
                background: "rgba(12,14,22,0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Search size={16} style={{ color: "#64748B" }} />
              <span className="font-mono text-sm" style={{ color: "#94A3B8" }}>
                {typewriterName}
                <span
                  className="inline-block ml-0.5 animate-pulse"
                  style={{ color: "#38BDF8", animationDuration: "0.8s" }}
                  aria-hidden
                >
                  |
                </span>
              </span>
            </div>
          </div>

          {/* Step 2 — Agent rows with progress bars */}
          <div className="glass-card p-8 reveal reveal-d2" ref={addRevealRef}>
            <span className="font-mono text-sm mono-label" style={{ color: "#A3BFFA" }}>
              Step 2
            </span>
            <h3 className="font-serif text-xl italic mt-2 mb-4" style={{ color: "#F5F7FA" }}>
              Agents Activate
            </h3>
            <p className="font-sans card-body-text mb-6" style={{ color: "#94A3B8" }}>
              Six specialized agents work in parallel to research and synthesize.
            </p>
            <div className="space-y-3">
              {AGENTS.slice(0, 5).map((agent, i) => {
                const Icon = agent.icon
                const speeds = [2.5, 3, 2, 3.5, 2.8]
                return (
                  <div
                    key={agent.name}
                    className="rounded-[10px] px-3 py-2"
                    style={{ background: "rgba(56,189,248,0.06)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon size={12} style={{ color: "#38BDF8" }} />
                        <span className="font-mono text-[10px]" style={{ color: "#94A3B8" }}>
                          {agent.name}
                        </span>
                      </div>
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: i % 2 === 0 ? "#38BDF8" : "#A3BFFA" }}
                      >
                        {i % 2 === 0 ? "● Running..." : "✓ Complete"}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-0.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full bg-[#38BDF8]"
                        style={{
                          animation: i % 2 === 0 ? `fillBar ${speeds[i]}s ease-in-out infinite alternate` : "none",
                          width: i % 2 === 0 ? undefined : "100%",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step 3 — Profile mockup + chat bubble */}
          <div className="glass-card p-8 reveal reveal-d3" ref={addRevealRef}>
            <span className="font-mono text-sm mono-label" style={{ color: "#A3BFFA" }}>
              Step 3
            </span>
            <h3 className="font-serif text-xl italic mt-2 mb-4" style={{ color: "#F5F7FA" }}>
              Profile + Chat
            </h3>
            <p className="font-sans card-body-text mb-6" style={{ color: "#94A3B8" }}>
              Structured profile with tabs. Converse with the persona in real time.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm italic shrink-0"
                  style={{
                    background: "#1E293B",
                    color: "#A3BFFA",
                    boxShadow: "0 0 12px rgba(163,191,250,0.2)",
                  }}
                >
                  NT
                </div>
                <div>
                  <div className="font-serif text-base italic" style={{ color: "#F5F7FA" }}>
                    Nikola Tesla
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: "#64748B" }}>
                    1856–1943 · Score: 94
                  </div>
                </div>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  background: "rgba(163,191,250,0.04)",
                  borderLeft: "3px solid rgba(163,191,250,0.5)",
                }}
              >
                <p className="font-mono text-[10px] mb-1" style={{ color: "#64748B" }}>
                  PERSONA RESPONSE
                </p>
                <p
                  className="font-serif text-base italic"
                  style={{ color: "#94A3B8", lineHeight: 1.5, fontSize: 18 }}
                >
                  "My work was always guided by one principle..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Profile Preview */}
      <section
        id="profile-preview"
        className="py-24 px-6 relative reveal"
        ref={addRevealRef}
        style={{
          background: `
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(163,191,250,0.08) 0%, transparent 70%),
            #0D1117
          `,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            className="font-serif text-center mb-16 section-title"
            style={{
              fontWeight: 400,
              fontStyle: "italic",
              color: "#F5F7FA",
            }}
          >
            <em>A Profile Unlike Any Other</em>
          </h2>
          <div
            className="glass-card p-8 relative"
            style={{
              boxShadow: "0 0 80px rgba(163,191,250,0.06), 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="flex items-center gap-4 mb-6 p-4 -m-4 mb-6 rounded-t-xl"
              style={{
                background: "linear-gradient(135deg, rgba(163,191,250,0.05) 0%, transparent 50%)",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-lg italic shrink-0"
                style={{
                  background: "#1E293B",
                  color: "#A3BFFA",
                  boxShadow: "0 0 24px rgba(163,191,250,0.15)",
                  outline: "3px solid rgba(163,191,250,0.12)",
                  outlineOffset: 3,
                }}
              >
                NT
              </div>
              <div>
                <h3 className="font-serif text-xl italic" style={{ color: "#F5F7FA" }}>
                  Nikola Tesla
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                    1856–1943
                  </span>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{
                      color: "#A3BFFA",
                      background: "rgba(163,191,250,0.1)",
                      animation: "pulse-score 2.5s ease-in-out infinite",
                    }}
                  >
                    Intelligence Score: 94
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {["Biography", "Timeline", "Beliefs", "Controversies", "Influence Map", "Legacy Score"].map(
                (tab, i) => (
                  <span
                    key={tab}
                    className="font-mono text-xs px-3 py-1.5 rounded-[100px] transition-all duration-200"
                    style={{
                      background: i === 1 ? "rgba(163,191,250,0.12)" : "transparent",
                      color: i === 1 ? "#A3BFFA" : "#64748B",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {tab}
                  </span>
                )
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-sans card-body-text mb-2" style={{ color: "#94A3B8" }}>
                  Timeline preview
                </p>
                <div className="space-y-2">
                  {["1884 — Arrives in America", "1887 — Tesla Electric Co.", "1891 — Tesla Coil"].map(
                    (entry) => (
                      <div
                        key={entry}
                        className="font-mono text-xs py-2 px-3 rounded-[10px] transition-all duration-200 hover:border-l-2 hover:border-l-[#38BDF8] hover:pl-2"
                        style={{
                          background: "#1A1A1A",
                          color: "#94A3B8",
                          borderLeft: "2px solid transparent",
                        }}
                      >
                        {entry}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div
                className="p-4 rounded-[18px]"
                style={{
                  background: "rgba(163,191,250,0.04)",
                  borderLeft: "3px solid rgba(163,191,250,0.5)",
                }}
              >
                <p className="font-mono text-[10px] mb-2 mono-label" style={{ color: "#64748B" }}>
                  PERSONA RESPONSE
                </p>
                <p
                  className="font-serif italic"
                  style={{ color: "#94A3B8", lineHeight: 1.65, fontSize: "clamp(18px, 2vw, 22px)" }}
                >
                  "My work was always guided by one principle: that the forces of nature, properly
                  understood..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Interaction Modes — Asymmetric Bento Grid */}
      <section
        className="py-24 px-6 relative reveal"
        ref={addRevealRef}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: `
            radial-gradient(ellipse 30% 30% at 90% 10%, rgba(123,111,255,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 25% 25% at 10% 90%, rgba(56,189,248,0.07) 0%, transparent 50%)
          `,
        }}
      >
        <h2
          className="font-serif text-center mb-16 section-title"
          style={{
            fontWeight: 400,
            fontStyle: "italic",
            color: "#F5F7FA",
          }}
        >
          <em>Beyond Research — Live Interaction</em>
        </h2>
        <div className="bento-grid">
          {/* Debate Mode — WIDE */}
          <div
            className="glass-card p-6"
            style={{ gridArea: "debate", borderTop: "1.5px solid rgba(56,189,248,0.4)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={22} style={{ color: "#A3BFFA" }} />
              <h3 className="font-serif text-lg italic" style={{ color: "#F5F7FA" }}>
                Debate Mode
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "#94A3B8" }}>
              Two personas face off on contested topics
            </p>
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center font-mono text-xs" style={{ color: "#38BDF8" }}>A</div>
              <span className="font-mono text-sm" style={{ color: "#64748B" }}>VS</span>
              <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center font-mono text-xs" style={{ color: "#A3BFFA" }}>B</div>
            </div>
            <span className="font-mono text-[10px] mono-label" style={{ color: "#64748B" }}>
              // ACTIVE MODE
            </span>
          </div>

          {/* Influence Map — TALL */}
          <div
            className="glass-card p-6"
            style={{ gridArea: "influence", borderTop: "1.5px solid rgba(123,111,255,0.4)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Network size={22} style={{ color: "#A3BFFA" }} />
              <h3 className="font-serif text-lg italic" style={{ color: "#F5F7FA" }}>
                Influence Map
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "#94A3B8" }}>
              Node graph of relationships and impact
            </p>
            <div className="flex justify-center py-6">
              <svg width="80" height="60" viewBox="0 0 80 60" className="opacity-80">
                {[[40,10],[20,40],[60,40],[15,25],[65,25]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r={4} fill={i===0 ? "#A3BFFA" : "#64748B"} style={{ filter: i===0 ? "drop-shadow(0 0 4px #A3BFFA)" : undefined }} />
                ))}
                <line x1="40" y1="10" x2="20" y2="40" stroke="#64748B" strokeWidth="1" opacity="0.5" />
                <line x1="40" y1="10" x2="60" y2="40" stroke="#64748B" strokeWidth="1" opacity="0.5" />
                <line x1="40" y1="10" x2="15" y2="25" stroke="#64748B" strokeWidth="1" opacity="0.5" />
                <line x1="40" y1="10" x2="65" y2="25" stroke="#64748B" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>
            <span className="font-mono text-[10px] mono-label" style={{ color: "#64748B" }}>
              // ACTIVE MODE
            </span>
          </div>

          {/* Decision Advisor */}
          <div
            className="glass-card p-6"
            style={{ gridArea: "decision", borderTop: "1.5px solid rgba(163,191,250,0.4)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={22} style={{ color: "#A3BFFA" }} />
              <h3 className="font-serif text-lg italic" style={{ color: "#F5F7FA" }}>
                Decision Advisor
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "#94A3B8" }}>
              Persona gives advice with doc-style output
            </p>
            <div className="space-y-2 py-2">
              {[1,2,3].map((i) => (
                <div key={i} className="h-2 rounded-sm bg-[#1E293B]" style={{ width: `${60 + i * 15}%` }} />
              ))}
            </div>
            <span className="font-mono text-[10px] mono-label" style={{ color: "#64748B" }}>
              // BETA
            </span>
          </div>

          {/* Myth Busting */}
          <div
            className="glass-card p-6"
            style={{ gridArea: "myth", borderTop: "1.5px solid rgba(56,189,248,0.3)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={22} style={{ color: "#A3BFFA" }} />
              <h3 className="font-serif text-lg italic" style={{ color: "#F5F7FA" }}>
                Myth Busting
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "#94A3B8" }}>
              Fact vs myth comparison table
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>MYTH</div>
              <div className="p-2 rounded" style={{ background: "rgba(56,189,248,0.1)", color: "#38BDF8" }}>FACT</div>
              <div className="p-2 rounded" style={{ background: "rgba(248,113,113,0.08)", color: "#94A3B8" }}>Claim A</div>
              <div className="p-2 rounded" style={{ background: "rgba(56,189,248,0.08)", color: "#94A3B8" }}>Verified</div>
            </div>
            <span className="font-mono text-[10px] mono-label" style={{ color: "#64748B" }}>
              // ACTIVE MODE
            </span>
          </div>

          {/* Legacy Scoring */}
          <div
            className="glass-card p-6"
            style={{ gridArea: "legacy", borderTop: "1.5px solid rgba(163,191,250,0.3)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={22} style={{ color: "#A3BFFA" }} />
              <h3 className="font-serif text-lg italic" style={{ color: "#F5F7FA" }}>
                Legacy Scoring
              </h3>
            </div>
            <p className="font-sans card-body-text mb-4" style={{ color: "#94A3B8" }}>
              Radar chart and score display
            </p>
            <div className="flex flex-col items-center py-2">
              <div className="font-mono text-2xl" style={{ color: "#A3BFFA" }}>94</div>
              <div className="font-mono text-[10px]" style={{ color: "#64748B" }}>/ 100</div>
              <div className="w-16 h-1 mt-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full bg-[#A3BFFA]" style={{ width: "94%" }} />
              </div>
            </div>
            <span className="font-mono text-[10px] mono-label" style={{ color: "#64748B" }}>
              // ACTIVE MODE
            </span>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section
        id="use-cases"
        className="py-24 px-6 reveal"
        ref={addRevealRef}
        style={{ background: "#0D1117" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            className="font-serif text-center mb-16 section-title"
            style={{
              fontWeight: 400,
              fontStyle: "italic",
              color: "#F5F7FA",
            }}
          >
            <em>What researchers are saying</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.role}
                className="glass-card p-8 relative"
                style={{
                  borderTop: "1px solid rgba(163,191,250,0.15)",
                }}
              >
                <span
                  className="absolute top-4 right-6 font-serif italic"
                  style={{ fontSize: 80, opacity: 0.08, color: "#A3BFFA" }}
                >
                  "
                </span>
                <div className="flex gap-1 mb-3" style={{ fontSize: 12, color: "rgba(163,191,250,0.6)" }}>
                  {"★".repeat(5)}
                </div>
                <p
                  className="font-serif text-lg italic mb-6 relative z-10"
                  style={{ color: "#F5F7FA", lineHeight: 1.65 }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-medium"
                    style={{
                      background: "linear-gradient(135deg, #A3BFFA 0%, #5A7B9E 100%)",
                      color: "#0A0A0A",
                    }}
                  >
                    {t.role.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                    — {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Pricing */}
      <section
        id="pricing"
        className="py-24 px-6 reveal"
        ref={addRevealRef}
        style={{ maxWidth: 1000, margin: "0 auto" }}
      >
        <h2
          className="font-serif text-center mb-16 section-title"
          style={{
            fontWeight: 400,
            fontStyle: "italic",
            color: "#F5F7FA",
          }}
        >
          <em>Plans</em>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Free Explorer", desc: "3 profiles, basic chat" },
            { name: "Research Pro", desc: "Unlimited profiles, all modes", featured: true },
            { name: "Institution", desc: "Team seats, API access" },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 ${plan.featured ? "scale-[1.02]" : ""}`}
              style={{
                borderColor: plan.featured ? "rgba(163,191,250,0.4)" : undefined,
              }}
            >
              <h3 className="font-serif text-xl italic mb-2" style={{ color: "#F5F7FA" }}>
                {plan.name}
              </h3>
              <p className="font-sans card-body-text" style={{ color: "#94A3B8" }}>
                {plan.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-24 px-6 reveal" ref={addRevealRef} style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2
          className="font-serif text-center mb-16 section-title"
          style={{
            fontWeight: 400,
            fontStyle: "italic",
            color: "#F5F7FA",
          }}
        >
          <em>FAQ</em>
        </h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="glass-card overflow-hidden rounded-[18px]"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left px-6 py-4 font-sans font-medium flex justify-between items-center"
                style={{ color: "#F5F7FA" }}
              >
                {item.q}
                <span style={{ transform: faqOpen === i ? "rotate(180deg)" : "none" }}>▼</span>
              </button>
              {faqOpen === i && (
                <div
                  className="px-6 pb-4 font-sans text-sm"
                  style={{ color: "#94A3B8", lineHeight: 1.6 }}
                >
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. CTA Footer Banner */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(90,123,158,0.12), transparent 60%), #0D1117",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2
            className="font-serif mb-8"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#F5F7FA",
            }}
          >
            <em>Start with a name. Discover a mind.</em>
          </h2>
          <div
            className="flex flex-col sm:flex-row gap-3 max-w-[420px] mx-auto mb-4"
            style={{
              background: "rgba(12,14,22,0.55)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 4,
            }}
          >
            <input
              type="text"
              placeholder="Enter a name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 px-4 py-3 font-sans text-sm rounded-[10px] bg-transparent placeholder:text-[#64748B]"
              style={{
                border: "none",
                color: "#F5F7FA",
                outline: "none",
              }}
            />
            <button onClick={onGetStarted} className="btn btn-primary flex items-center justify-center gap-2 px-6 py-3">
              Begin Research
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="font-mono text-[10px] mono-label" style={{ color: "#64748B" }}>
            // fact-grounded · multi-agent · retrieval-verified
          </p>
        </div>
      </section>

      {/* 10. Footer */}
      <footer
        className="py-16 px-6"
        style={{
          background: "#0A0A0A",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12"
        >
          <div>
            <span className="font-serif text-lg italic" style={{ color: "#F5F7FA" }}>
              Mimic AI
            </span>
            <p className="font-sans text-sm mt-2" style={{ color: "#64748B" }}>
              Intelligence profiles grounded in research.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider mb-4" style={{ color: "#94A3B8" }}>
              Product
            </h4>
            <div className="space-y-2 font-sans text-sm" style={{ color: "#64748B" }}>
              <a href="#how-it-works">How It Works</a>
              <br />
              <a href="#profile-preview">Personas</a>
              <br />
              <a href="#pricing">Pricing</a>
            </div>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider mb-4" style={{ color: "#94A3B8" }}>
              Resources
            </h4>
            <div className="space-y-2 font-sans text-sm" style={{ color: "#64748B" }}>
              Documentation
              <br />
              API
              <br />
              Blog
            </div>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider mb-4" style={{ color: "#94A3B8" }}>
              Connect
            </h4>
            <div className="space-y-2 font-sans text-sm" style={{ color: "#64748B" }}>
              Twitter
              <br />
              LinkedIn
              <br />
              GitHub
            </div>
          </div>
        </div>
        <div
          className="max-w-5xl mx-auto mt-12 pt-8 font-mono text-xs"
          style={{ color: "#64748B", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          © {new Date().getFullYear()} Mimic AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
