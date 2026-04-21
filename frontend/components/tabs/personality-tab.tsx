"use client"

import type { ResearchRunResponse, QuotesAnalysis } from "@/lib/api"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { UserSpeakRounded } from "@/components/ui/solar-icons"

interface PersonalityTabProps {
  researchData?: ResearchRunResponse | null
}

function renderInlineList(items?: string[]) {
  if (!items?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--text-2)",
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid var(--border-soft)",
            background: "transparent",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function renderBulletList(items?: string[]) {
  if (!items?.length) return null

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span style={{ color: "var(--gold)", lineHeight: 1.7 }}>{"▪"}</span>
          <span className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function PersonalityTab({ researchData }: Readonly<PersonalityTabProps>) {
  const analysis = (researchData?.analysis?.personality || researchData?.acquisition?.quotes?.analysis) as QuotesAnalysis | undefined
  const profile = analysis?.personality_profile
  const worldview = analysis?.worldview
  const rhetoricalDna = analysis?.rhetorical_dna

  const synthesisSources = [
    researchData?.acquisition?.wiki ? "Wikipedia" : null,
    researchData?.acquisition?.quotes?.quotes?.length ? "Quotes" : null,
    researchData?.acquisition?.resources?.length ? "Sources" : null,
  ].filter(Boolean) as string[]

  if (!analysis?.executive_summary || analysis.executive_summary.includes("Analysis unavailable")) {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "80px 40px", textAlign: "center" }}>
        <div style={{ border: "1px dashed var(--border-soft)", borderRadius: 24, padding: "60px 40px", background: "var(--surface-1)" }}>
          <div className="flex justify-center mb-6">
            <UserSpeakRounded size={48} color="var(--text-3)" />
          </div>
          <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
            Archetype Synthesis Pending
          </h3>
          <p className="font-sans" style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
            Comprehensive personality profiling requires sufficient textual data from Wikipedia, Quotes, or Transcripts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[var(--gold)]" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>
            Personality
          </span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, var(--gold-soft), transparent)", opacity: 0.3 }}></div>
        </div>

        <h2 className="font-sans" style={{ fontSize: 28, fontWeight: 650, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 14 }}>
          How the voice comes through
        </h2>

        <p className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.85, maxWidth: 720 }}>
          {analysis.executive_summary}
        </p>

        <div
          className="flex flex-wrap items-center gap-3"
          style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}
        >
          {synthesisSources.length ? (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {synthesisSources.join(" • ")}
            </span>
          ) : null}
          {analysis.quote_clusters?.length ? (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {analysis.quote_clusters.length} thematic clusters
            </span>
          ) : null}
          {analysis.analyst_caveats?.length ? (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              caveated synthesis
            </span>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-14">
        {(profile?.self_concept || profile?.cognitive_style || profile?.emotional_register) ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Profile
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Core reading
            </h3>

            <div style={{ borderTop: "1px solid var(--border-soft)" }}>
              {profile?.self_concept ? (
                <div className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 180px) 1fr" }}>
                  <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Self concept
                  </p>
                  <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.8 }}>
                    {profile.self_concept}
                  </p>
                </div>
              ) : null}

              {profile?.cognitive_style ? (
                <div className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 180px) 1fr" }}>
                  <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Cognitive style
                  </p>
                  <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.8 }}>
                    {profile.cognitive_style}
                  </p>
                </div>
              ) : null}

              {profile?.emotional_register ? (
                <div className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 180px) 1fr" }}>
                  <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Emotional register
                  </p>
                  <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.8 }}>
                    {profile.emotional_register}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {profile?.core_character_traits?.length ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Traits
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Character signals in the material
            </h3>

            <div style={{ borderTop: "1px solid var(--border-soft)" }}>
              {profile.core_character_traits.map((trait, idx) => (
                <div
                  key={`${trait.trait}-${idx}`}
                  className="grid gap-4"
                  style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 180px) 1fr" }}
                >
                  <p className="font-mono" style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {trait.trait}
                  </p>
                  <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                    {trait.evidence}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {(worldview?.core_beliefs?.length || worldview?.recurring_themes?.length || worldview?.internal_tensions) ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Worldview
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Ideas that keep repeating
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Core beliefs
                </p>
                {renderBulletList(worldview?.core_beliefs)}
              </div>

              <div>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Recurring themes
                </p>
                {renderInlineList(worldview?.recurring_themes)}
              </div>
            </div>

            {worldview?.internal_tensions ? (
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Internal tensions
                </p>
                <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                  {worldview.internal_tensions}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {(rhetoricalDna?.sentence_energy || rhetoricalDna?.signature_moves?.length || rhetoricalDna?.favourite_abstractions?.length) ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Rhetoric
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              How the language is structured
            </h3>

            {rhetoricalDna?.sentence_energy ? (
              <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.8, marginBottom: 20 }}>
                {rhetoricalDna.sentence_energy}
              </p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Signature moves
                </p>
                {renderBulletList(rhetoricalDna?.signature_moves)}
              </div>

              <div>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Favourite abstractions
                </p>
                {renderInlineList(rhetoricalDna?.favourite_abstractions)}
              </div>
            </div>
          </section>
        ) : null}

        {analysis.quote_clusters?.length ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Clusters
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Thematic synthesis
            </h3>

            <Accordion type="multiple" className="w-full">
              {analysis.quote_clusters.map((cluster, idx) => (
                <AccordionItem key={`${cluster.label}-${idx}`} value={`cluster-${idx}`} className="border-[var(--border-soft)]">
                  <AccordionTrigger className="font-sans text-[15px] text-[var(--gold)] hover:no-underline">
                    {cluster.label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4" style={{ paddingRight: 12 }}>
                      <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                        {cluster.summary}
                      </p>

                      {cluster.personality_insight ? (
                        <p className="font-sans" style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.75 }}>
                          <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 10 }}>
                            Insight
                          </span>
                          {cluster.personality_insight}
                        </p>
                      ) : null}

                      {cluster.representative_quotes?.length ? (
                        <div>
                          <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                            Representative quotes
                          </p>
                          <div className="flex flex-col gap-3">
                            {cluster.representative_quotes.map((quote) => (
                              <p key={quote} className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                                “{quote}”
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        {(analysis.influence_and_legacy || analysis.analyst_caveats?.length) ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Notes
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Scope and interpretation
            </h3>

            {analysis.influence_and_legacy ? (
              <div style={{ marginBottom: analysis.analyst_caveats?.length ? 22 : 0 }}>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Influence and legacy
                </p>
                <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                  {analysis.influence_and_legacy}
                </p>
              </div>
            ) : null}

            {analysis.analyst_caveats?.length ? (
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Analyst caveats
                </p>
                {renderBulletList(analysis.analyst_caveats)}
              </div>
            ) : null}
          </section>
        ) : null}

        {!profile && (analysis.voice_and_tone || analysis.worldview_and_values || analysis.communication_patterns?.length) ? (
          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Legacy format
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Archived synthesis fields
            </h3>

            <div style={{ borderTop: "1px solid var(--border-soft)" }}>
              {analysis.voice_and_tone ? (
                <div className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 180px) 1fr" }}>
                  <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Voice and tone
                  </p>
                  <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                    {analysis.voice_and_tone}
                  </p>
                </div>
              ) : null}

              {analysis.worldview_and_values ? (
                <div className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 180px) 1fr" }}>
                  <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Worldview
                  </p>
                  <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                    {analysis.worldview_and_values}
                  </p>
                </div>
              ) : null}
            </div>

            {analysis.communication_patterns?.length ? (
              <div style={{ marginTop: 18 }}>
                <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Communication patterns
                </p>
                {renderBulletList(analysis.communication_patterns)}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  )
}
