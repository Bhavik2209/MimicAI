"use client"

import { useMemo, useState } from "react"
import { Letter, Suitcase, Camera, Global, PlayCircle, UsersGroupTwoRounded } from "@/components/ui/solar-icons"

import type { ResearchRunResponse } from "@/lib/api"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const PREVIEW_PARAGRAPH_COUNT = 2

function splitIntoSentences(text: string): string[] {
  return text
    .replaceAll(/\s+/g, " ")
    .trim()
    .match(/(?:[^.!?]+[.!?]+[\]"')]*|[^.!?]+$)/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || []
}

function chunkSentences(sentences: string[], chunkSize = 3): string[] {
  const chunks: string[] = []
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize).join(" "))
  }
  return chunks
}

function normalizeParagraphs(text?: string): string[] {
  if (!text) return []

  const sentences = splitIntoSentences(text)
  if (!sentences.length) return [text]

  return chunkSentences(sentences, 3)
}

function toSectionId(sectionName: string, index: number): string {
  const slug = sectionName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "")
  return slug ? `${slug}-${index}` : `section-${index}`
}

function ensureUrl(value: string): string {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `https://${value}`
}

interface OverviewTabProps {
  researchData?: ResearchRunResponse | null
}

function formatLabelValue(label: string, value?: string | null) {
  if (!value) return null

  return (
    <div
      className="grid gap-4"
      style={{
        padding: "16px 0",
        borderBottom: "1px solid var(--border-soft)",
        gridTemplateColumns: "minmax(120px, 160px) 1fr",
      }}
    >
      <p
        className="font-mono"
        style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {label}
      </p>
      <p className="font-sans" style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>
        {value}
      </p>
    </div>
  )
}

export function OverviewTab({ researchData }: Readonly<OverviewTabProps>) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const basic = researchData?.basic_info
  const wiki = researchData?.acquisition?.wiki
  const sections = wiki?.sections || []
  const socials = researchData?.acquisition?.socials
  const introParagraphs = useMemo(() => normalizeParagraphs(wiki?.intro_summary), [wiki?.intro_summary])
  const sectionItems = useMemo(
    () =>
      sections.slice(0, 8).map((section, index) => {
        const title = section.section || "Section"
        const id = toSectionId(title, index)
        const paragraphs = normalizeParagraphs(section.text)

        return {
          id,
          title,
          paragraphs,
        }
      }),
    [sections]
  )

  const socialIcons = useMemo(() => {
    const source: Array<{
      label: string
      icon: typeof Global
      links: string[]
    }> = [
      {
        label: "Website",
        icon: Global,
        links: (socials?.website || []).map((value) => ensureUrl(value)).filter(Boolean),
      },
      {
        label: "Twitter",
        icon: Letter,
        links: (socials?.twitter || [])
          .map((value) => value.url || (value.handle ? `https://twitter.com/${value.handle.replace(/^@/, "")}` : ""))
          .filter(Boolean),
      },
      {
        label: "Instagram",
        icon: Camera,
        links: (socials?.instagram || [])
          .map((value) => value.url || (value.handle ? `https://instagram.com/${value.handle.replace(/^@/, "")}` : ""))
          .filter(Boolean),
      },
      {
        label: "Facebook",
        icon: UsersGroupTwoRounded,
        links: (socials?.facebook || [])
          .map((value) => value.url || (value.handle ? `https://facebook.com/${value.handle.replace(/^@/, "")}` : ""))
          .filter(Boolean),
      },
      {
        label: "LinkedIn",
        icon: Suitcase,
        links: (socials?.linkedin || [])
          .map((value) => value.url || (value.handle ? `https://linkedin.com/in/${value.handle.replace(/^@/, "")}` : ""))
          .filter(Boolean),
      },
      {
        label: "YouTube",
        icon: PlayCircle,
        links: (socials?.youtube || [])
          .map((value) => value.url || (value.handle ? `https://youtube.com/@${value.handle.replace(/^@/, "")}` : ""))
          .filter(Boolean),
      },
    ]

    return source.flatMap((group) => group.links.slice(0, 1).map((url) => ({
      id: `${group.label}-${url}`,
      label: group.label,
      url,
      icon: group.icon,
    })))
  }, [socials])

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="font-mono text-[var(--gold)]"
            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}
          >
            Overview
          </span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, var(--gold-soft), transparent)", opacity: 0.3 }}></div>
        </div>

        <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]" style={{ alignItems: "start" }}>
          <div>
            {basic?.image_url ? (
              <img
                src={basic.image_url}
                alt={basic.name || "Entity"}
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  objectFit: "cover",
                  borderRadius: 18,
                  border: "1px solid var(--border-soft)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  borderRadius: 18,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-soft)",
                }}
              />
            )}

            <div style={{ marginTop: 18, borderTop: "1px solid var(--border-soft)" }}>
              {formatLabelValue("Wikidata", basic?.wikidata_id || "N/A")}
              {formatLabelValue("Source", wiki?.wikipedia_title || basic?.name || null)}
            </div>
          </div>

          <div>
            <h1 className="font-sans" style={{ fontSize: 32, fontWeight: 650, color: "var(--text-1)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              {basic?.name || "Unknown Entity"}
            </h1>

            <p className="font-sans" style={{ marginTop: 10, fontSize: 16, color: "var(--text-2)", lineHeight: 1.75, maxWidth: 620 }}>
              {basic?.description || "No description available."}
            </p>

            {introParagraphs.length ? (
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border-soft)" }}>
                <p
                  className="font-mono"
                  style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}
                >
                  Briefing
                </p>
                <div className="flex flex-col gap-4">
                  {introParagraphs.slice(0, PREVIEW_PARAGRAPH_COUNT).map((paragraph) => (
                    <p
                      key={`intro-${paragraph.slice(0, 24)}-${paragraph.length}`}
                      className="font-sans"
                      style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.82 }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            {socialIcons.length ? (
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border-soft)" }}>
                <p
                  className="font-mono"
                  style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}
                >
                  Links
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialIcons.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        className="font-mono"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          borderRadius: 999,
                          border: "1px solid var(--border-soft)",
                          color: "var(--text-2)",
                          background: "transparent",
                          textDecoration: "none",
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        <Icon size={14} color="var(--gold)" />
                        {item.label}
                      </a>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Knowledge Base
        </span>
        <h2
          className="font-sans"
          style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 10 }}
        >
          Wikipedia sections
        </h2>
        <p className="font-sans" style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 20 }}>
          A structured reading of the core background material for this person.
        </p>

        {sectionItems.length ? (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={sectionItems.slice(0, 1).map((section) => section.id)}
          >
            {sectionItems.map((section) => {
              const isExpanded = expandedSections[section.id] || false
              const visibleParagraphs = isExpanded
                ? section.paragraphs
                : section.paragraphs.slice(0, PREVIEW_PARAGRAPH_COUNT)
              const hasMore = section.paragraphs.length > PREVIEW_PARAGRAPH_COUNT

              return (
                <AccordionItem key={section.id} value={section.id} className="border-[var(--border-soft)]">
                  <AccordionTrigger className="font-sans text-[15px] text-[var(--gold)] hover:no-underline">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3" style={{ paddingRight: 12 }}>
                      {visibleParagraphs.length ? (
                        visibleParagraphs.map((paragraph) => (
                          <p
                            key={`${section.id}-p-${paragraph.slice(0, 24)}-${paragraph.length}`}
                            className="font-sans"
                            style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.78 }}
                          >
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="font-sans" style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7 }}>
                          No content available.
                        </p>
                      )}

                      {hasMore ? (
                        <button
                          type="button"
                          className="font-mono"
                          onClick={() =>
                            setExpandedSections((prev) => ({
                              ...prev,
                              [section.id]: !isExpanded,
                            }))
                          }
                          style={{
                            marginTop: 2,
                            width: "fit-content",
                            fontSize: 11,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "var(--teal)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          {isExpanded ? "Show less" : `Read more (${section.paragraphs.length - PREVIEW_PARAGRAPH_COUNT} more)`}
                        </button>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : (
          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 18 }}>
            <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.75 }}>
              No wiki sections available yet.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
