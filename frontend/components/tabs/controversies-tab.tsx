"use client"

import { useState } from "react"
import { AltArrowDown } from "@/components/ui/solar-icons"
import type { ResearchRunResponse } from "@/lib/api"

const controversies: Array<{
  title: string
  severity: "high" | "medium" | "low"
  years: string
  summary: string
  facts: string[]
  sources: string[]
}> = []

const severityColor = {
  high: "var(--red)",
  medium: "var(--gold)",
  low: "var(--text-3)",
}

interface ControversiesTabProps {
  researchData?: ResearchRunResponse | null
}

export function ControversiesTab({ researchData }: Readonly<ControversiesTabProps>) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const apiItems = ((researchData?.analysis?.display?.controversy_section?.items ?? []) as any[])
  const apiControversies = apiItems.map((item: any) => {
    const evidence = (item?.evidence ?? []) as Array<{ snippet?: string; score?: number; source_url?: string }>
    const maxScore = evidence.length
      ? Math.max(...evidence.map((e) => Number(e.score || 0)))
      : 0
    let severity: "high" | "medium" | "low" = "low"
    if (maxScore >= 0.75) severity = "high"
    else if (maxScore >= 0.45) severity = "medium"

    return {
      title: String(item?.question || "Controversy"),
      severity,
      years: "Research",
      summary: String(evidence[0]?.snippet || "No summary available."),
      facts: evidence.slice(0, 3).map((e) => String(e.snippet || "")).filter(Boolean),
      sources: Array.from(new Set(evidence.map((e) => e.source_url).filter(Boolean))) as string[],
    }
  })

  const displayedControversies = apiControversies.length ? apiControversies : controversies

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 40 }}>
      {/* Disclaimer */}
      <div className="mb-10 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p
          className="font-sans"
          style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-3)" }}
        >
          Content is presented neutrally from verified historical and academic sources.
        </p>
      </div>

      {/* Accordion List */}
      <div>
        {displayedControversies.length === 0 ? (
          <div
            className="font-sans"
            style={{
              fontSize: 14,
              color: "var(--text-3)",
              padding: "16px 20px",
              border: "1px solid var(--border-soft)",
              borderRadius: 10,
            }}
          >
            No controversies available yet for this profile.
          </div>
        ) : null}
        {displayedControversies.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={`${item.title}-${i}`}
              className="mb-2 overflow-hidden"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Trigger */}
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex items-center w-full"
                style={{
                  height: 56,
                  padding: "0 20px",
                  gap: 12,
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  transition: "var(--transition)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Severity dot */}
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: severityColor[item.severity],
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-sans flex-1 text-left"
                  style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)" }}
                >
                  {item.title}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}
                >
                  {item.years}
                </span>
                 <AltArrowDown
                  size={16}
                  style={{
                    color: "var(--text-3)",
                    transition: "transform 200ms ease-in-out",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Expanded content */}
              <div
                style={{
                  maxHeight: isOpen ? 2000 : 0,
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 220ms ease-in-out, opacity 160ms ease",
                }}
              >
                <div className="px-6 py-5">
                  <p
                    className="font-sans"
                    style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75 }}
                  >
                    {item.summary}
                  </p>

                  <div style={{ marginTop: 16 }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      KEY FACTS
                    </span>
                    <ul className="mt-2 flex flex-col gap-2">
                      {item.facts.map((fact) => (
                        <li
                          key={fact}
                          className="flex gap-2 font-sans"
                          style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}
                        >
                          <span style={{ color: "var(--gold)", flexShrink: 0 }}>
                            {"▪"}
                          </span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      marginTop: 16,
                      paddingTop: 12,
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      SOURCES
                    </span>
                    <div className="flex flex-col gap-1 mt-2">
                      {item.sources.map((src) => (
                        <span
                          key={src}
                          className="font-mono"
                          style={{ fontSize: 12, color: "var(--teal)" }}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
