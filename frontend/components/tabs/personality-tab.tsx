"use client"

const bigFiveTraits = [
  { label: "OPENNESS", score: 96 },
  { label: "CONSCIENTIOUSNESS", score: 82 },
  { label: "EXTRAVERSION", score: 38 },
  { label: "AGREEABLENESS", score: 42 },
  { label: "NEUROTICISM", score: 71 },
]

const communicationTraits = [
  { label: "DIRECTNESS", score: 85 },
  { label: "FORMALITY", score: 72 },
  { label: "METAPHOR USAGE", score: 91 },
]

const quotes = [
  {
    text: "The present is theirs; the future, for which I really worked, is mine.",
    attribution: "Interview, c. 1930s",
    context: "On critics",
  },
  {
    text: "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.",
    attribution: "Attributed, c. 1900s",
    context: "Philosophy",
  },
  {
    text: "I do not think there is any thrill that can go through the human heart like that felt by the inventor.",
    attribution: "Letter to a friend, 1896",
    context: "On invention",
  },
]

const rhetoricalTechniques = [
  { name: "Visionary framing", depth: 3, desc: "Positions ideas as inevitable futures, not speculative proposals." },
  { name: "Empirical anchoring", depth: 2, desc: "Grounds abstract concepts in observable physical phenomena." },
  { name: "Contrastive reasoning", depth: 2, desc: "Builds arguments through systematic comparison of opposing approaches." },
]

function TraitBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <span
          className="font-sans"
          style={{ fontSize: 13, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          {label}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 13, color: "var(--text-1)" }}
        >
          {score}
        </span>
      </div>
      <div style={{ height: 3, background: "var(--border)", marginTop: 8 }}>
        <div
          style={{
            height: 3,
            background: "var(--teal)",
            width: `${score}%`,
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  )
}

function DepthDots({ depth }: { depth: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((d) => (
        <div
          key={d}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: d <= depth ? "var(--gold)" : "transparent",
            border: d <= depth ? "none" : "1px solid var(--border)",
          }}
        />
      ))}
    </div>
  )
}

export function PersonalityTab() {
  return (
    <div
      className="grid gap-12"
      style={{
        gridTemplateColumns: "1fr 0.8fr",
        padding: 40,
      }}
    >
      {/* Left Column */}
      <div className="flex flex-col gap-12">
        {/* Big Five */}
        <section>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            PSYCHOLOGICAL PROFILE
          </span>
          <h2
            className="font-sans"
            style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4 }}
          >
            Big Five Trait Analysis
          </h2>
          <div className="flex flex-col gap-5 mt-4">
            {bigFiveTraits.map((t) => (
              <TraitBar key={t.label} label={t.label} score={t.score} />
            ))}
          </div>
        </section>

        {/* Decision Making */}
        <section>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            COGNITION
          </span>
          <h2
            className="font-sans"
            style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4 }}
          >
            Decision Making Style
          </h2>
          <div style={{ marginTop: 16 }}>
            <h3
              className="font-serif"
              style={{
                fontSize: 22,
                fontWeight: 500,
                fontStyle: "italic",
                color: "var(--ivory)",
              }}
            >
              Visionary-Systematic
            </h3>
            <p
              className="font-sans"
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginTop: 8 }}
            >
              Tesla operated through a distinctive combination of intuitive visualization
              and rigorous systematic experimentation. He would conceive complete inventions
              mentally, running them through imaginary tests before committing to physical
              prototypes — a process he described as his &ldquo;mental workshop.&rdquo;
            </p>
          </div>
        </section>

        {/* Communication Profile */}
        <section>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            COMMUNICATION
          </span>
          <h2
            className="font-sans"
            style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4 }}
          >
            Communication Profile
          </h2>
          <div className="flex flex-col gap-5 mt-4">
            {communicationTraits.map((t) => (
              <TraitBar key={t.label} label={t.label} score={t.score} />
            ))}
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-12">
        {/* Notable Quotes */}
        <section>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            QUOTATIONS
          </span>
          <h2
            className="font-sans"
            style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4 }}
          >
            Notable Quotes
          </h2>
          <div className="flex flex-col gap-4 mt-4">
            {quotes.map((q, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "3px solid var(--gold)",
                  paddingLeft: 20,
                  marginBottom: 24,
                }}
              >
                <blockquote
                  className="font-serif"
                  style={{
                    fontSize: 17,
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "var(--text-1)",
                    lineHeight: 1.65,
                  }}
                >
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                    {q.attribution}
                  </span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      border: "1px solid var(--border)",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    {q.context}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rhetorical Analysis */}
        <section>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            RHETORIC
          </span>
          <h2
            className="font-sans"
            style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4 }}
          >
            Rhetorical Analysis
          </h2>
          <div className="flex flex-col gap-5 mt-4">
            {rhetoricalTechniques.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between">
                  <span
                    className="font-sans"
                    style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}
                  >
                    {t.name}
                  </span>
                  <DepthDots depth={t.depth} />
                </div>
                <p
                  className="font-sans"
                  style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}
                >
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
