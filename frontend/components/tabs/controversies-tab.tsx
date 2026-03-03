"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const controversies = [
  {
    title: "War of Currents — Edison Rivalry",
    severity: "high" as const,
    years: "1886–1893",
    summary:
      "The bitter technological and commercial battle between Tesla's alternating current (AC) system and Edison's direct current (DC) system involved public propaganda campaigns, including the electrocution of animals to discredit AC power. Edison's camp used fear tactics, while Tesla and Westinghouse pursued engineering superiority.",
    facts: [
      "Edison publicly electrocuted animals using AC to demonstrate its 'dangers'",
      "The first electric chair used AC current, lobbied for by Edison supporters",
      "Tesla's AC system ultimately won, powering the 1893 World's Fair",
    ],
    sources: ["Seifer, M. 'Wizard: The Life and Times of Nikola Tesla'", "Jonnes, J. 'Empires of Light'"],
  },
  {
    title: "Extraterrestrial Communication Claims",
    severity: "medium" as const,
    years: "1899–1901",
    summary:
      "During his Colorado Springs experiments, Tesla claimed to have received signals from intelligent extraterrestrial life. The scientific community was deeply skeptical, and the claims damaged his credibility among peers who otherwise respected his engineering achievements.",
    facts: [
      "Tesla reported receiving repetitive signals he attributed to Mars in 1899",
      "Modern analysis suggests the signals were likely from Jupiter's magnetosphere",
      "The claims contributed to his growing reputation for eccentricity",
    ],
    sources: ["Carlson, W.B. 'Tesla: Inventor of the Electrical Age'"],
  },
  {
    title: "Death Ray / Teleforce Weapon",
    severity: "medium" as const,
    years: "1934–1943",
    summary:
      "Tesla publicly announced a particle beam weapon he called 'Teleforce,' which the press sensationalized as a 'death ray.' He offered the technology to multiple governments. After his death, the FBI seized his papers, fueling decades of conspiracy theories about suppressed weapons technology.",
    facts: [
      "Tesla described a directed-energy weapon using charged particles",
      "The FBI confiscated his papers immediately after his death in 1943",
      "Documents were eventually declassified and found to contain theoretical notes, not working plans",
    ],
    sources: ["FBI FOIA archive, 'Nikola Tesla Papers'", "Seifer, M. 'Wizard'"],
  },
  {
    title: "Eugenics Statements",
    severity: "high" as const,
    years: "1935–1937",
    summary:
      "In his later years, Tesla made statements supporting eugenics, including the forced sterilization of 'unfit' individuals. These views, common among intellectuals of his era, remain deeply troubling and inconsistent with his otherwise humanistic vision of technology serving all people.",
    facts: [
      "Tesla published eugenic views in a 1935 Liberty magazine article",
      "He advocated for a 'new eugenics' guided by scientific principles",
      "These views were widespread among early 20th-century intellectuals but are now universally condemned",
    ],
    sources: ["Liberty Magazine, 1935", "Carlson, W.B. 'Tesla: Inventor of the Electrical Age'"],
  },
]

const severityColor = {
  high: "var(--red)",
  medium: "var(--gold)",
  low: "var(--text-3)",
}

export function ControversiesTab() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
        {controversies.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={item.title}
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
                <ChevronDown
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
                      {item.facts.map((fact, fi) => (
                        <li
                          key={fi}
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
                      {item.sources.map((src, si) => (
                        <span
                          key={si}
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
