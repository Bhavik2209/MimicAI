import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "How Mimic Works | MIMIC AI",
  description:
    "Step-by-step documentation for how Mimic discovers an entity, gathers evidence, validates sources, and builds a research-backed intelligence profile.",
}

type Topic = {
  id: string
  title: string
  summary: string
}

type Step = {
  number: number
  id: string
  title: string
  goal: string
  details: string[]
  output: string
}

const TOPICS: Topic[] = [
  {
    id: "overview",
    title: "Overview",
    summary: "What the system does end to end.",
  },
  {
    id: "step-1-entity-detection",
    title: "Step 1: Entity Detection",
    summary: "Find the right person from your prompt.",
  },
  {
    id: "step-2-identity-resolution",
    title: "Step 2: Identity Resolution",
    summary: "Disambiguate people with similar names.",
  },
  {
    id: "step-3-research-plan",
    title: "Step 3: Research Plan",
    summary: "Build a source and query strategy.",
  },
  {
    id: "step-4-multi-source-retrieval",
    title: "Step 4: Retrieval",
    summary: "Collect facts across reliable sources.",
  },
  {
    id: "step-5-source-validation",
    title: "Step 5: Validation",
    summary: "Cross-check and score factual confidence.",
  },
  {
    id: "step-6-timeline-and-profile",
    title: "Step 6: Profile Build",
    summary: "Generate timeline, traits, and structured profile.",
  },
  {
    id: "step-7-persona-chat",
    title: "Step 7: Persona and Chat",
    summary: "Enable grounded interaction with citations.",
  },
  {
    id: "notes-and-limitations",
    title: "Notes and Limitations",
    summary: "What to expect from the outputs.",
  },
]

const STEPS: Step[] = [
  {
    number: 1,
    id: "step-1-entity-detection",
    title: "Entity Detection",
    goal: "Turn a user query into a likely target person.",
    details: [
      "The system parses the name or prompt and extracts candidate identity signals like known aliases, fields, locations, and era.",
      "If the input is broad (for example only a first name), Mimic first expands candidates before moving deeper.",
      "Initial confidence is based on match strength between your prompt and known public identifiers.",
    ],
    output: "A ranked shortlist of candidate entities with preliminary confidence.",
  },
  {
    number: 2,
    id: "step-2-identity-resolution",
    title: "Identity Resolution",
    goal: "Resolve the exact person and avoid name collisions.",
    details: [
      "Candidates are compared against contextual attributes like profession, nationality, timeline, and notable works.",
      "Conflicting candidates are separated into explicit alternatives instead of merged into one profile.",
      "When confidence is low, the system keeps uncertainty visible so downstream steps stay conservative.",
    ],
    output: "A resolved canonical entity profile anchor used by the research pipeline.",
  },
  {
    number: 3,
    id: "step-3-research-plan",
    title: "Research Plan Generation",
    goal: "Create a retrieval strategy before collecting data.",
    details: [
      "Mimic builds topic clusters such as biography, timeline, achievements, controversies, and recent updates.",
      "Each cluster gets source preferences and query templates to improve recall while reducing noise.",
      "The plan sets an evidence quota so one source type cannot dominate the final synthesis.",
    ],
    output: "A structured plan that guides each specialized research agent.",
  },
  {
    number: 4,
    id: "step-4-multi-source-retrieval",
    title: "Multi-Source Retrieval",
    goal: "Collect verifiable evidence from diverse channels.",
    details: [
      "Specialized agents run in parallel on public knowledge sources, publication indexes, and current-news channels.",
      "Returned records are normalized into a shared schema with source metadata, timestamps, and provenance.",
      "Duplicates are merged while keeping all citation links available for audit.",
    ],
    output: "A normalized evidence graph with traceable citations.",
  },
  {
    number: 5,
    id: "step-5-source-validation",
    title: "Source Validation and Confidence Scoring",
    goal: "Decide which claims are reliable enough to keep.",
    details: [
      "Claims are cross-checked between independent sources and marked as corroborated, weak, or disputed.",
      "Confidence scoring includes recency, source reputation, agreement level, and contradiction handling.",
      "Low-confidence claims can still appear as disputed context, but they are clearly labeled.",
    ],
    output: "A quality-filtered fact set with explicit confidence labels.",
  },
  {
    number: 6,
    id: "step-6-timeline-and-profile",
    title: "Timeline and Profile Synthesis",
    goal: "Transform validated facts into a readable intelligence profile.",
    details: [
      "Chronological events are ordered and linked to supporting evidence.",
      "Profile sections summarize background, work, influence, debates, and references.",
      "The output is intentionally structured so downstream tabs can render the same data consistently.",
    ],
    output: "A multi-section profile with timeline, insights, and source-backed narrative.",
  },
  {
    number: 7,
    id: "step-7-persona-chat",
    title: "Persona Construction and Grounded Chat",
    goal: "Enable interactive exploration without losing factual grounding.",
    details: [
      "A conversational layer adapts tone and perspective from the profile while keeping response generation retrieval-grounded.",
      "Answers are conditioned by validated evidence so generated text stays aligned with known facts.",
      "When evidence is missing, the assistant should indicate uncertainty rather than invent details.",
    ],
    output: "A research assistant experience that stays tied to evidence and citations.",
  },
]

function TopicIndex() {
  return (
    <aside
      style={{
        position: "sticky",
        top: 110,
        alignSelf: "start",
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "color-mix(in srgb, var(--surface-2) 92%, transparent)",
        backdropFilter: "blur(8px)",
        padding: 16,
      }}
      aria-label="How it works topic index"
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-3)",
          marginBottom: 12,
        }}
      >
        Index
      </p>
      <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
        {TOPICS.map((topic) => (
          <li key={topic.id}>
            <a
              href={`#${topic.id}`}
              style={{
                display: "block",
                textDecoration: "none",
                borderRadius: 8,
                border: "1px solid var(--border-soft)",
                padding: "8px 10px",
                background: "var(--control-bg)",
              }}
            >
              <span style={{ display: "block", color: "var(--text-1)", fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                {topic.title}
              </span>
              <span style={{ display: "block", color: "var(--text-3)", fontSize: 12, marginTop: 2, lineHeight: 1.45 }}>
                {topic.summary}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: "100vh", background: "transparent", color: "var(--text-1)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: "1px solid var(--border-soft)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface-1) 95%, transparent), color-mix(in srgb, var(--surface-1) 88%, transparent))",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "var(--text-1)",
            }}
          >
            <Logo style={{ height: 20, width: "auto", color: "var(--gold)" }} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>
              Mimic
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "var(--text-2)",
                fontSize: 14,
                fontWeight: 500,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-soft)",
              }}
            >
              Back to landing
            </Link>
            <Link
              href="/projects"
              style={{
                textDecoration: "none",
                color: "var(--btn-primary-fg)",
                background: "var(--btn-primary-bg)",
                fontSize: 14,
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid color-mix(in srgb, var(--btn-primary-bg) 80%, black)",
              }}
            >
              Open app
            </Link>
          </div>
        </div>
      </header>

      <section
        id="overview"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-data)",
            color: "var(--gold)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 12,
          }}
        >
          Documentation
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
            lineHeight: 1.03,
            letterSpacing: "-0.03em",
            fontWeight: 800,
            maxWidth: 900,
          }}
        >
          How Mimic finds an entity and builds research-backed intelligence
        </h1>
        <p
          style={{
            marginTop: 16,
            color: "var(--text-2)",
            maxWidth: 860,
            fontSize: 17,
            lineHeight: 1.75,
          }}
        >
          This page explains the full pipeline in simple language. You can read it before login, share it with your team,
          and use it as a reference for what each step is doing behind the scenes.
        </p>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "grid",
          gridTemplateColumns: "minmax(220px, 290px) minmax(0, 1fr)",
          gap: 24,
        }}
      >
        <div className="hidden md:block">
          <TopicIndex />
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "color-mix(in srgb, var(--surface-2) 94%, transparent)",
              padding: 18,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Quick pipeline map</h2>
            <ol style={{ marginTop: 12, display: "grid", gap: 8, paddingLeft: 18, color: "var(--text-2)" }}>
              {STEPS.map((step) => (
                <li key={step.id}>
                  <a href={`#${step.id}`} style={{ color: "var(--accent-link)", textDecoration: "none", fontWeight: 600 }}>
                    {step.title}
                  </a>
                  <span style={{ color: "var(--text-2)", marginLeft: 8 }}>{step.goal}</span>
                </li>
              ))}
            </ol>
          </section>

          {STEPS.map((step) => (
            <section
              id={step.id}
              key={step.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: "color-mix(in srgb, var(--surface-2) 95%, transparent)",
                padding: 22,
                scrollMarginTop: 100,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 36,
                    height: 24,
                    padding: "0 10px",
                    borderRadius: 999,
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    background: "var(--gold-dim)",
                    border: "1px solid color-mix(in srgb, var(--gold) 35%, transparent)",
                  }}
                >
                  Step {step.number}
                </span>
                <h3 style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 700 }}>{step.title}</h3>
              </div>

              <p style={{ color: "var(--text-1)", fontSize: 16, lineHeight: 1.75 }}>
                <strong style={{ color: "var(--text-1)" }}>Goal:</strong> {step.goal}
              </p>

              <ul style={{ marginTop: 14, display: "grid", gap: 8, paddingLeft: 18, color: "var(--text-2)", lineHeight: 1.7 }}>
                {step.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>

              <div
                style={{
                  marginTop: 14,
                  border: "1px solid var(--border-soft)",
                  borderRadius: 8,
                  background: "var(--control-bg)",
                  padding: "12px 14px",
                }}
              >
                <p style={{ color: "var(--text-1)", fontSize: 14, lineHeight: 1.6 }}>
                  <strong>Output:</strong> {step.output}
                </p>
              </div>
            </section>
          ))}

          <section
            id="notes-and-limitations"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "color-mix(in srgb, var(--surface-2) 95%, transparent)",
              padding: 22,
              scrollMarginTop: 100,
            }}
          >
            <h2 style={{ fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 700 }}>Notes and limitations</h2>
            <ul style={{ marginTop: 14, display: "grid", gap: 8, paddingLeft: 18, color: "var(--text-2)", lineHeight: 1.75 }}>
              <li>Coverage depends on public data availability and source quality for that entity.</li>
              <li>Recent events can have incomplete consensus; disputed claims are best read with citations.</li>
              <li>Persona chat is designed to be grounded, but users should still review sources for critical decisions.</li>
              <li>This page is public and available without authentication.</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  )
}
