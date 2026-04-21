"use client"

import type React from "react"
import { ArrowRightUp, DocumentText, Link as LinkIcon } from "@/components/ui/solar-icons"
import type { ResearchRunResponse } from "@/lib/api"

interface WorkTabProps {
  researchData?: ResearchRunResponse | null
}

interface WorkLink {
  label: string
  url: string
}

interface WorkItem {
  id: string
  title: string
  year?: number
  type?: string
  citedBy?: number
  source?: string
  links: WorkLink[]
}

type JsonObject = Record<string, unknown>

interface OpenAlexResolution {
  data: unknown
  sourceLabel: string
}

interface OpenAlexProfileView {
  name?: string
  authorId?: string
  primaryInstitution?: string
  metrics: {
    hIndex?: number
    worksCount?: number
    citedByCount?: number
  }
  topWorks: Array<{
    title: string
    year?: number
    venue?: string
    citations?: number
  }>
  topTopics: Array<{
    name?: string
    field?: string
  }>
  topCoauthors: Array<{
    name: string
    openalexId?: string
    collaborationCount?: number
  }>
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function asObjectArray(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return []
  return value.filter(isObject)
}

function getNestedString(value: unknown, path: string[]): string | undefined {
  let current: unknown = value
  for (const part of path) {
    if (!isObject(current)) return undefined
    current = current[part]
  }
  return asString(current)
}

function pushLink(links: WorkLink[], seen: Set<string>, label: string, url?: string) {
  if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) return
  seen.add(url)
  links.push({ label, url })
}

function collectHttpLinks(value: unknown, seen: Set<string>, path = "", depth = 0): WorkLink[] {
  if (depth > 2) return []
  const found: WorkLink[] = []

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      found.push(...collectHttpLinks(entry, seen, `${path}[${index}]`, depth + 1))
    })
    return found
  }

  if (!isObject(value)) return found

  Object.entries(value).forEach(([key, entry]) => {
    if (typeof entry === "string" && /^https?:\/\//i.test(entry) && !seen.has(entry)) {
      seen.add(entry)
      found.push({ label: key.replaceAll("_", " "), url: entry })
      return
    }

    if (Array.isArray(entry) || isObject(entry)) {
      found.push(...collectHttpLinks(entry, seen, path ? `${path}.${key}` : key, depth + 1))
    }
  })

  return found
}

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value
  const text = value.trim()
  if (!text || (!text.startsWith("{") && !text.startsWith("["))) return value
  try {
    return JSON.parse(text)
  } catch {
    return value
  }
}

function resolveOpenAlex(researchData?: ResearchRunResponse | null): OpenAlexResolution {
  const candidates: Array<{ label: string; value: unknown }> = [
    { label: "acquisition.openalex", value: researchData?.acquisition?.openalex },
    { label: "analysis.personality.openalex", value: (researchData?.analysis?.personality as Record<string, unknown> | undefined)?.openalex },
    { label: "root.openalex", value: (researchData as Record<string, unknown> | undefined)?.openalex },
  ]

  const firstValid = candidates.find((candidate) => candidate.value !== null && candidate.value !== undefined)
  if (!firstValid) return { data: null, sourceLabel: "none" }
  return { data: tryParseJson(firstValid.value), sourceLabel: firstValid.label }
}

function toScalarDisplay(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value === null || value === undefined) return "-"
  return JSON.stringify(value)
}

function parseOpenAlexProfileView(openalex: unknown): OpenAlexProfileView | null {
  if (!isObject(openalex)) return null

  const topWorksRaw = asObjectArray(openalex.top_works)
  const topTopicsRaw = asObjectArray(openalex.top_topics)
  const topCoauthorsRaw = asObjectArray(openalex.top_coauthors)
  const hasProfileShape = isObject(openalex.metrics) || topWorksRaw.length > 0 || topTopicsRaw.length > 0 || topCoauthorsRaw.length > 0
  if (!hasProfileShape) return null

  const metrics = isObject(openalex.metrics) ? openalex.metrics : {}
  return {
    name: asString(openalex.name),
    authorId: asString(openalex.openalex_author_id),
    primaryInstitution: asString(openalex.primary_institution),
    metrics: {
      hIndex: asNumber(metrics.h_index),
      worksCount: asNumber(metrics.works_count),
      citedByCount: asNumber(metrics.cited_by_count),
    },
    topWorks: topWorksRaw.map((item, index) => ({
      title: asString(item.title) || `Work ${index + 1}`,
      year: asNumber(item.year),
      venue: asString(item.venue),
      citations: asNumber(item.citations),
    })),
    topTopics: topTopicsRaw.map((item) => ({
      name: asString(item.name),
      field: asString(item.field),
    })),
    topCoauthors: topCoauthorsRaw.map((item, index) => ({
      name: asString(item.name) || `Coauthor ${index + 1}`,
      openalexId: asString(item.openalex_id),
      collaborationCount: asNumber(item.collaboration_count),
    })),
  }
}

function extractWorks(openalex: unknown): WorkItem[] {
  if (!openalex) return []

  let rawWorks: unknown[] = []
  if (isObject(openalex)) {
    if (Array.isArray(openalex.results)) rawWorks = openalex.results
    else if (Array.isArray(openalex.works)) rawWorks = openalex.works
    else if (Array.isArray(openalex.data)) rawWorks = openalex.data
    else rawWorks = [openalex]
  } else if (Array.isArray(openalex)) {
    rawWorks = openalex
  }

  return rawWorks
    .filter(isObject)
    .map((entry, index) => {
      const id = asString(entry.id) || asString(entry.work_id) || `work-${index}`
      const title = asString(entry.display_name) || asString(entry.title) || asString(entry.work_title) || `Work ${index + 1}`
      const year = asNumber(entry.publication_year) || asNumber(entry.year)
      const type = asString(entry.type) || asString(entry.type_crossref)
      const citedBy = asNumber(entry.cited_by_count) || asNumber(entry.citations)
      const source = getNestedString(entry, ["primary_location", "source", "display_name"]) || getNestedString(entry, ["host_venue", "display_name"]) || getNestedString(entry, ["journal", "display_name"])

      const links: WorkLink[] = []
      const seen = new Set<string>()
      const openalexId = asString(entry.id)
      if (openalexId && /^https?:\/\//i.test(openalexId)) pushLink(links, seen, "OpenAlex", openalexId)

      const doi = asString(entry.doi)
      if (doi) {
        const doiUrl = doi.startsWith("http") ? doi : `https://doi.org/${doi.replace(/^doi:/i, "")}`
        pushLink(links, seen, "DOI", doiUrl)
      }

      pushLink(links, seen, "Landing page", getNestedString(entry, ["primary_location", "landing_page_url"]))
      pushLink(links, seen, "PDF", getNestedString(entry, ["primary_location", "pdf_url"]))
      pushLink(links, seen, "Open access", getNestedString(entry, ["open_access", "oa_url"]))
      links.push(...collectHttpLinks(entry, seen).slice(0, 4))

      return { id, title, year, type, citedBy, source, links: links.slice(0, 6) }
    })
    .filter((work) => Boolean(work.title))
}

function metricCard(label: string, value: string | number | undefined) {
  return (
    <div style={{ border: "1px solid var(--border-soft)", borderRadius: 18, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div className="font-sans" style={{ marginTop: 8, fontSize: 24, lineHeight: 1.1, color: "var(--text-1)", fontWeight: 650 }}>
        {value ?? "-"}
      </div>
    </div>
  )
}

function renderLinkButton(link: WorkLink, id: string) {
  return (
    <a
      key={`${id}-${link.url}`}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2"
      style={{
        textDecoration: "none",
        border: "1px solid var(--border-soft)",
        borderRadius: 999,
        padding: "7px 11px",
        color: "var(--text-1)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {link.label.toLowerCase().includes("pdf") ? <DocumentText size={14} /> : <LinkIcon size={14} />}
      <span className="font-sans" style={{ fontSize: 13 }}>
        {link.label}
      </span>
      <ArrowRightUp size={12} style={{ color: "var(--text-3)" }} />
    </a>
  )
}

function renderAuthorSection(profile: OpenAlexProfileView): React.ReactNode {
  if (!(profile.name || profile.authorId || profile.primaryInstitution)) return null

  return (
    <section style={{ border: "1px solid var(--border-soft)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Author profile
      </span>
      {profile.name ? <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 8 }}>{profile.name}</h3> : null}
      {profile.primaryInstitution ? <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginTop: 8 }}>{profile.primaryInstitution}</p> : null}
      {profile.authorId ? <div style={{ marginTop: 14 }}>{renderLinkButton({ label: "OpenAlex author", url: profile.authorId }, "author")}</div> : null}
    </section>
  )
}

function renderTopWorksSection(profile: OpenAlexProfileView): React.ReactNode {
  if (!profile.topWorks.length) return null

  return (
    <section>
      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Publications
      </span>
      <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
        Top works
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {profile.topWorks.map((work, index) => (
          <article key={`${work.title}-${index}`} style={{ border: "1px solid var(--border-soft)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,0.02)" }}>
            <h4 className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 600, lineHeight: 1.55 }}>{work.title}</h4>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
              {typeof work.year === "number" ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.year}</span> : null}
              {typeof work.citations === "number" ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.citations} citations</span> : null}
              {work.venue ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.venue}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function renderTopTopicsSection(profile: OpenAlexProfileView): React.ReactNode {
  const topicValues = profile.topTopics.map((topic) => topic.name || topic.field).filter((value): value is string => Boolean(value))
  const uniqueTopics = Array.from(new Set(topicValues))
  if (!uniqueTopics.length) return null

  return (
    <section style={{ border: "1px solid var(--border-soft)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Topics
      </span>
      <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 8, marginBottom: 14 }}>
        Research themes
      </h3>
      <div className="flex flex-wrap gap-2">
        {uniqueTopics.map((topic) => (
          <span key={topic} className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "6px 10px", background: "transparent" }}>
            {topic}
          </span>
        ))}
      </div>
    </section>
  )
}

function renderTopCoauthorsSection(profile: OpenAlexProfileView): React.ReactNode {
  if (!profile.topCoauthors.length) return null

  return (
    <section style={{ border: "1px solid var(--border-soft)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Network
      </span>
      <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 8, marginBottom: 14 }}>
        Top coauthors
      </h3>
      <div className="flex flex-col gap-3">
        {profile.topCoauthors.map((coauthor) => (
          <div key={`${coauthor.name}-${coauthor.openalexId || "na"}`} className="flex items-center justify-between gap-3" style={{ paddingTop: 2 }}>
            <div>
              <p className="font-sans" style={{ fontSize: 14, color: "var(--text-1)" }}>{coauthor.name}</p>
              {typeof coauthor.collaborationCount === "number" ? <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{coauthor.collaborationCount} collaborations</p> : null}
            </div>
            {coauthor.openalexId ? renderLinkButton({ label: "Profile", url: coauthor.openalexId }, coauthor.name) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function renderWorkCards(works: WorkItem[]): React.ReactNode {
  if (!works.length) return null

  return (
    <section>
      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Results
      </span>
      <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
        Indexed works
      </h3>

      <div className="flex flex-col gap-4">
        {works.map((work) => (
          <article key={work.id} style={{ border: "1px solid var(--border-soft)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,0.02)" }}>
            <h3 className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", fontWeight: 600, lineHeight: 1.55 }}>{work.title}</h3>

            <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
              {typeof work.year === "number" ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.year}</span> : null}
              {work.type ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.type}</span> : null}
              {typeof work.citedBy === "number" ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.citedBy} citations</span> : null}
              {work.source ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px" }}>{work.source}</span> : null}
            </div>

            {work.links.length ? (
              <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
                {work.links.map((link) => renderLinkButton(link, work.id))}
              </div>
            ) : (
              <p className="font-sans" style={{ marginTop: 14, fontSize: 14, color: "var(--text-3)", lineHeight: 1.7 }}>
                No external links available for this work.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function renderOpenAlexFields(openalexPairs: Array<[string, unknown]>): React.ReactNode {
  if (!openalexPairs.length) return null

  return (
    <section style={{ border: "1px solid var(--border-soft)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Raw fields
      </span>
      <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 8, marginBottom: 16 }}>
        OpenAlex fields
      </h3>
      <div className="flex flex-col gap-4">
        {openalexPairs.map(([key, value]) => (
          <div key={key}>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{key}</div>
            <div className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", wordBreak: "break-word", lineHeight: 1.7 }}>{toScalarDisplay(value)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function renderWorkEmptyState(): React.ReactNode {
  return (
    <div style={{ border: "1px dashed var(--border-soft)", borderRadius: 22, padding: "44px 28px", background: "rgba(255,255,255,0.02)" }}>
      <p className="font-sans" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75, textAlign: "center" }}>
        No OpenAlex work data was returned for this entity. When data is available, this page will list publication metadata, citations, collaborators, and source links.
      </p>
    </div>
  )
}

function renderWorkContent(profileOpenalex: OpenAlexProfileView | null, works: WorkItem[], openalexPairs: Array<[string, unknown]>): React.ReactNode {
  if (profileOpenalex) {
    return (
      <div className="flex flex-col gap-14">
        {renderAuthorSection(profileOpenalex)}
        {renderTopWorksSection(profileOpenalex)}
        {renderTopTopicsSection(profileOpenalex)}
        {renderTopCoauthorsSection(profileOpenalex)}
      </div>
    )
  }

  return renderWorkCards(works) || renderOpenAlexFields(openalexPairs) || renderWorkEmptyState()
}

export function WorkTab({ researchData }: Readonly<WorkTabProps>) {
  const resolvedOpenalex = resolveOpenAlex(researchData)
  const openalex = resolvedOpenalex.data
  const profileOpenalex = parseOpenAlexProfileView(openalex)
  const works = extractWorks(openalex)
  const openalexPairs = isObject(openalex) ? Object.entries(openalex).slice(0, 20) : []

  const totalWorks = profileOpenalex?.metrics.worksCount ?? works.length
  const worksWithCitations = works.filter((item) => typeof item.citedBy === "number")
  const inferredCitations = worksWithCitations.reduce((sum, item) => sum + (item.citedBy || 0), 0)
  const totalCitations = profileOpenalex?.metrics.citedByCount ?? inferredCitations
  const hIndex = profileOpenalex?.metrics.hIndex

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[var(--gold)]" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>
            Work
          </span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, var(--gold-soft), transparent)", opacity: 0.3 }}></div>
        </div>

        <h2 className="font-sans" style={{ fontSize: 28, fontWeight: 650, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 14 }}>
          Research footprint
        </h2>

        <p className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.82, maxWidth: 720 }}>
          Structured publication and author data resolved from OpenAlex, including indexed works, citations, topical signals, and collaborator context.
        </p>

        <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Source {resolvedOpenalex.sourceLabel}
          </span>
          {profileOpenalex?.name ? (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {profileOpenalex.name}
            </span>
          ) : null}
        </div>
      </section>

      <section className="mb-14">
        <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Metrics
        </span>
        <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
          Snapshot
        </h3>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {metricCard("Total works", totalWorks)}
          {metricCard("Total citations", totalCitations)}
          {typeof hIndex === "number" ? metricCard("H-index", hIndex) : null}
        </div>
      </section>

      {renderWorkContent(profileOpenalex, works, openalexPairs)}
    </div>
  )
}
