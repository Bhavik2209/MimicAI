import type { QuotesAnalysis, ResearchRunResponse } from "@/lib/api"
import { jsPDF } from "jspdf"

interface ExportProfile {
  name: string
  category: string
  era: string
  subtitle: string
  imageUrl?: string
}

interface ExportProjectContext {
  name: string
  createdDate: string
  targetName: string
}

interface ExportProjectReportInput {
  profile: ExportProfile
  projectContext?: ExportProjectContext | null
  researchData?: ResearchRunResponse | null
}

interface ExportLinkItem {
  title: string
  url?: string
  meta?: string
}

interface ExportTimelineEvent {
  start?: string
  end?: string
  type?: string
  event?: string
  label?: string
  category?: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function formatDate(value?: string): string {
  if (!value) return "Unknown"
  const parsed = Date.parse(value.replace(" ", "T"))
  if (Number.isNaN(parsed)) return value
  return new Date(parsed).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatSimpleDate(value?: string): string {
  if (!value) return "Unknown"
  if (/^\d{4}$/.test(value)) return value
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-")
    const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", { month: "short" })
    return `${monthName} ${year}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-")
    const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", { month: "short" })
    return `${day} ${monthName} ${year}`
  }
  return value
}

function formatDateRange(start?: string, end?: string): string {
  const startLabel = formatSimpleDate(start)
  const endLabel = formatSimpleDate(end)
  if (!start && !end) return "Unknown"
  if (!end || end === start) return startLabel
  if (!start) return endLabel
  return `${startLabel} - ${endLabel}`
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function renderMetaRow(label: string, value?: string | null) {
  if (!value) return ""
  return `
    <div class="meta-row">
      <div class="meta-label">${escapeHtml(label)}</div>
      <div class="meta-value">${escapeHtml(value)}</div>
    </div>
  `
}

function renderBulletList(items?: Array<string | null | undefined>) {
  const values = (items || []).filter((item): item is string => Boolean(item && item.trim()))
  if (!values.length) return '<p class="muted">No data available.</p>'
  return `<ul class="bullet-list">${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
}

function renderTagList(items?: Array<string | null | undefined>) {
  const values = (items || []).filter((item): item is string => Boolean(item && item.trim()))
  if (!values.length) return ""
  return `<div class="tag-list">${values.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>`
}

function renderParagraphs(items?: Array<string | null | undefined>) {
  const values = (items || []).filter((item): item is string => Boolean(item && item.trim()))
  if (!values.length) return '<p class="muted">No narrative available.</p>'
  return values.map((item) => `<p>${escapeHtml(item)}</p>`).join("")
}

function renderLinks(items: ExportLinkItem[]) {
  if (!items.length) return '<p class="muted">No linked sources available.</p>'
  return `
    <div class="link-grid">
      ${items
        .map(
          (item) => `
            <div class="link-card">
              <div class="link-title">${escapeHtml(item.title)}</div>
              ${item.meta ? `<div class="link-meta">${escapeHtml(item.meta)}</div>` : ""}
              ${item.url ? `<div class="link-url">${escapeHtml(item.url)}</div>` : ""}
            </div>
          `
        )
        .join("")}
    </div>
  `
}

function resolvePersonalityAnalysis(researchData?: ResearchRunResponse | null): QuotesAnalysis | undefined {
  return (researchData?.analysis?.personality || researchData?.acquisition?.quotes?.analysis) as QuotesAnalysis | undefined
}

function extractOpenAlexView(researchData?: ResearchRunResponse | null) {
  const openalexCandidate = researchData?.acquisition?.openalex
  const openalex = typeof openalexCandidate === "string" ? tryParseJson(openalexCandidate) : openalexCandidate
  const root = asObject(openalex)
  if (!root) return null

  const metrics = asObject(root.metrics) || {}
  const topWorks = Array.isArray(root.top_works) ? root.top_works : Array.isArray(root.results) ? root.results : []
  const topTopics = Array.isArray(root.top_topics) ? root.top_topics : []
  const topCoauthors = Array.isArray(root.top_coauthors) ? root.top_coauthors : []

  return {
    name: asString(root.name),
    authorId: asString(root.openalex_author_id),
    primaryInstitution: asString(root.primary_institution),
    metrics: {
      worksCount: asNumber(metrics.works_count) ?? topWorks.length,
      citedByCount: asNumber(metrics.cited_by_count),
      hIndex: asNumber(metrics.h_index),
    },
    topWorks: topWorks
      .map((item) => {
        const entry = asObject(item)
        if (!entry) return null
        return {
          title: asString(entry.title) || asString(entry.display_name) || "Untitled work",
          year: asNumber(entry.year) || asNumber(entry.publication_year),
          venue:
            asString(entry.venue) ||
            asString(asObject(asObject(entry.primary_location)?.source)?.display_name) ||
            asString(asObject(entry.host_venue)?.display_name),
          citations: asNumber(entry.citations) || asNumber(entry.cited_by_count),
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 12),
    topTopics: topTopics
      .map((item) => {
        const entry = asObject(item)
        if (!entry) return null
        return asString(entry.name) || asString(entry.field) || null
      })
      .filter((item): item is string => Boolean(item))
      .slice(0, 16),
    topCoauthors: topCoauthors
      .map((item) => {
        const entry = asObject(item)
        if (!entry) return null
        return {
          name: asString(entry.name) || "Unknown coauthor",
          count: asNumber(entry.collaboration_count),
          id: asString(entry.openalex_id),
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 12),
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function buildExportHtml({ profile, projectContext, researchData }: ExportProjectReportInput): string {
  const basic = researchData?.basic_info
  const wiki = researchData?.acquisition?.wiki
  const personality = resolvePersonalityAnalysis(researchData)
  const timelineEvents = ((researchData?.acquisition?.timeline?.timeline || []) as ExportTimelineEvent[]).slice(0, 40)
  const newsItems = (researchData?.acquisition?.news || []).slice(0, 20)
  const resources = researchData?.acquisition?.resources || []
  const conversationVideos = researchData?.acquisition?.conversation?.videos || []
  const openalex = extractOpenAlexView(researchData)

  const referenceLinks: ExportLinkItem[] = [
    wiki?.wikipedia_title
      ? {
          title: wiki.wikipedia_title,
          meta: "Wikipedia",
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.wikipedia_title.replaceAll(" ", "_"))}`,
        }
      : null,
    basic?.wikidata_id
      ? {
          title: basic.wikidata_id,
          meta: "Wikidata",
          url: `https://www.wikidata.org/wiki/${basic.wikidata_id}`,
        }
      : null,
    researchData?.acquisition?.quotes?.entity_id
      ? {
          title: researchData.acquisition.quotes.entity_id,
          meta: "Wikiquote",
          url: `https://en.wikiquote.org/wiki/${researchData.acquisition.quotes.entity_id}`,
        }
      : null,
    ...resources.slice(0, 12).map((item, index) => ({
      title: item.title || `Resource ${index + 1}`,
      meta: item.source_type || "Resource",
      url: item.url,
    })),
    ...conversationVideos.slice(0, 8).map((item, index) => ({
      title: item.title || `Conversation video ${index + 1}`,
      meta: "Conversation",
      url: item.url,
    })),
  ].filter(Boolean) as ExportLinkItem[]

  const personalityProfile = personality?.personality_profile
  const worldview = personality?.worldview
  const rhetoric = personality?.rhetorical_dna

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(profile.name)} Research Dossier</title>
        <style>
          :root {
            color-scheme: light;
            --page-bg: #ffffff;
            --surface: #fffaf2;
            --surface-strong: #f8efdf;
            --border: #d7c7ab;
            --text: #201b15;
            --muted: #615648;
            --accent: #8a5f2e;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #ffffff;
            color: var(--text);
            font-family: Georgia, "Times New Roman", serif;
          }
          .page {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 40px 32px 64px;
            background: #ffffff;
          }
          .cover {
            display: grid;
            grid-template-columns: ${profile.imageUrl ? "160px minmax(0, 1fr)" : "1fr"};
            gap: 28px;
            padding: 28px;
            background: linear-gradient(180deg, #fffaf4 0%, #f8efdf 100%);
            border: 1px solid var(--border);
            border-radius: 24px;
          }
          .cover img {
            width: 160px;
            height: 200px;
            object-fit: cover;
            border-radius: 18px;
            border: 1px solid var(--border);
            background: #efe5d5;
          }
          .eyebrow {
            font-family: "Courier New", monospace;
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--accent);
            margin-bottom: 10px;
          }
          h1 {
            margin: 0;
            font-size: 40px;
            line-height: 1.05;
            letter-spacing: -0.03em;
          }
          .subtitle {
            margin: 12px 0 0;
            color: var(--muted);
            font-size: 16px;
            line-height: 1.7;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 20px;
            margin-top: 18px;
            padding-top: 18px;
            border-top: 1px solid var(--border);
          }
          .meta-row {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 12px;
          }
          .meta-label {
            font-family: "Courier New", monospace;
            font-size: 10px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
          }
          .meta-value {
            font-size: 13px;
            line-height: 1.6;
          }
          .section {
            margin-top: 28px;
            padding: 24px 28px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 22px;
            break-inside: avoid;
          }
          .section-title {
            margin: 0 0 6px;
            font-size: 24px;
            line-height: 1.2;
          }
          .section-kicker {
            margin: 0 0 16px;
            font-family: "Courier New", monospace;
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--accent);
          }
          p {
            margin: 0 0 12px;
            font-size: 14px;
            line-height: 1.75;
          }
          .muted {
            color: var(--muted);
          }
          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
          .stat-card, .sub-card, .timeline-item, .news-item, .cluster-card, .link-card {
            border: 1px solid var(--border);
            border-radius: 16px;
            background: #fffdfa;
            padding: 16px;
          }
          .stat-value {
            font-size: 28px;
            line-height: 1.1;
            margin-top: 6px;
          }
          .sub-title, .link-title {
            font-size: 15px;
            line-height: 1.5;
            font-weight: 700;
          }
          .sub-meta, .link-meta, .news-meta {
            margin-top: 8px;
            font-family: "Courier New", monospace;
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--muted);
          }
          .timeline-list, .news-list {
            display: grid;
            gap: 12px;
          }
          .timeline-date {
            font-family: "Courier New", monospace;
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 8px;
          }
          .bullet-list {
            margin: 0;
            padding-left: 18px;
          }
          .bullet-list li {
            margin: 0 0 8px;
            font-size: 14px;
            line-height: 1.7;
          }
          .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .tag {
            display: inline-block;
            padding: 6px 10px;
            border: 1px solid var(--border);
            border-radius: 999px;
            font-family: "Courier New", monospace;
            font-size: 10px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--muted);
            background: #fffdfa;
          }
          .link-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .link-url {
            margin-top: 10px;
            color: var(--accent);
            font-size: 12px;
            line-height: 1.5;
            word-break: break-word;
          }
          .section-divider {
            height: 1px;
            background: var(--border);
            margin: 18px 0;
          }
          @media print {
            body { background: white; }
            .page { max-width: none; padding: 20px 18px 32px; }
            .section, .cover, .stat-card, .sub-card, .timeline-item, .news-item, .cluster-card, .link-card {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="cover">
            ${
              profile.imageUrl
                ? `<img src="${escapeHtml(profile.imageUrl)}" alt="${escapeHtml(profile.name)} portrait" />`
                : ""
            }
            <div>
              <div class="eyebrow">Research dossier</div>
              <h1>${escapeHtml(profile.name)}</h1>
              <p class="subtitle">${escapeHtml(profile.subtitle || basic?.description || "Detailed research export generated from the current project response.")}</p>
              <div class="meta-grid">
                ${renderMetaRow("Project", projectContext?.name || "Research export")}
                ${renderMetaRow("Target", projectContext?.targetName || basic?.name || profile.name)}
                ${renderMetaRow("Generated", formatDate(new Date().toISOString()))}
                ${renderMetaRow("Created", projectContext?.createdDate ? formatDate(projectContext.createdDate) : undefined)}
                ${renderMetaRow("Category", profile.category || undefined)}
                ${renderMetaRow("Wikidata", basic?.wikidata_id || undefined)}
              </div>
            </div>
          </section>

          <section class="section">
            <div class="section-kicker">Overview</div>
            <h2 class="section-title">Entity briefing</h2>
            ${renderParagraphs([
              basic?.description,
              wiki?.intro_summary,
            ])}
            ${
              Array.isArray(wiki?.sections) && wiki.sections.length
                ? `
                  <div class="section-divider"></div>
                  <div class="grid-2">
                    ${wiki.sections
                      .slice(0, 8)
                      .map(
                        (section) => `
                          <div class="sub-card">
                            <div class="sub-title">${escapeHtml(section.section || "Section")}</div>
                            <p class="muted">${escapeHtml(section.text || "No content available.")}</p>
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
          </section>

          <section class="section">
            <div class="section-kicker">Personality</div>
            <h2 class="section-title">Voice and interpretive synthesis</h2>
            ${renderParagraphs([personality?.executive_summary])}
            <div class="section-divider"></div>
            <div class="grid-2">
              <div class="sub-card">
                <div class="sub-title">Self concept</div>
                <p>${escapeHtml(personalityProfile?.self_concept || "No self-concept analysis available.")}</p>
              </div>
              <div class="sub-card">
                <div class="sub-title">Cognitive style</div>
                <p>${escapeHtml(personalityProfile?.cognitive_style || "No cognitive-style analysis available.")}</p>
              </div>
              <div class="sub-card">
                <div class="sub-title">Emotional register</div>
                <p>${escapeHtml(personalityProfile?.emotional_register || "No emotional register analysis available.")}</p>
              </div>
              <div class="sub-card">
                <div class="sub-title">Rhetorical energy</div>
                <p>${escapeHtml(rhetoric?.sentence_energy || "No rhetorical DNA summary available.")}</p>
              </div>
            </div>
            <div class="section-divider"></div>
            <div class="grid-2">
              <div>
                <div class="sub-title">Core traits</div>
                ${renderBulletList(personalityProfile?.core_character_traits?.map((item) => `${item.trait}: ${item.evidence}`))}
              </div>
              <div>
                <div class="sub-title">Worldview themes</div>
                ${renderBulletList([...(worldview?.core_beliefs || []), ...(worldview?.recurring_themes || [])])}
              </div>
            </div>
            ${
              personality?.quote_clusters?.length
                ? `
                  <div class="section-divider"></div>
                  <div class="sub-title" style="margin-bottom:12px;">Quote clusters</div>
                  <div class="timeline-list">
                    ${personality.quote_clusters
                      .slice(0, 8)
                      .map(
                        (cluster) => `
                          <div class="cluster-card">
                            <div class="sub-title">${escapeHtml(cluster.label)}</div>
                            <p>${escapeHtml(cluster.summary)}</p>
                            <p class="muted">${escapeHtml(cluster.personality_insight || "")}</p>
                            ${renderBulletList(cluster.representative_quotes)}
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
          </section>

          <section class="section">
            <div class="section-kicker">Timeline</div>
            <h2 class="section-title">Chronology and milestones</h2>
            ${
              timelineEvents.length
                ? `
                  <div class="timeline-list">
                    ${timelineEvents
                      .map(
                        (item) => `
                          <div class="timeline-item">
                            <div class="timeline-date">${escapeHtml(formatDateRange(item.start, item.end))}</div>
                            <div class="sub-title">${escapeHtml(item.label || item.event || item.type || "Timeline event")}</div>
                            <p>${escapeHtml(item.event || item.label || "No additional timeline detail available.")}</p>
                            ${
                              item.type || item.category
                                ? `<div class="news-meta">${escapeHtml([item.type, item.category].filter(Boolean).join(" • "))}</div>`
                                : ""
                            }
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                `
                : '<p class="muted">No timeline items were returned for this project.</p>'
            }
          </section>

          <section class="section">
            <div class="section-kicker">Work</div>
            <h2 class="section-title">Research footprint and publications</h2>
            ${
              openalex
                ? `
                  <div class="grid-2">
                    <div class="stat-card">
                      <div class="meta-label">Total works</div>
                      <div class="stat-value">${escapeHtml(String(openalex.metrics.worksCount ?? "-"))}</div>
                    </div>
                    <div class="stat-card">
                      <div class="meta-label">Total citations</div>
                      <div class="stat-value">${escapeHtml(String(openalex.metrics.citedByCount ?? "-"))}</div>
                    </div>
                    <div class="stat-card">
                      <div class="meta-label">H-index</div>
                      <div class="stat-value">${escapeHtml(String(openalex.metrics.hIndex ?? "-"))}</div>
                    </div>
                    <div class="stat-card">
                      <div class="meta-label">Primary institution</div>
                      <div class="stat-value" style="font-size:18px;">${escapeHtml(openalex.primaryInstitution || "Unavailable")}</div>
                    </div>
                  </div>
                  <div class="section-divider"></div>
                  <div class="grid-2">
                    <div>
                      <div class="sub-title">Top works</div>
                      <div class="timeline-list">
                        ${openalex.topWorks.length
                          ? openalex.topWorks
                              .map(
                                (work) => `
                                  <div class="sub-card">
                                    <div class="sub-title">${escapeHtml(work.title)}</div>
                                    <div class="sub-meta">${escapeHtml(
                                      [work.year ? String(work.year) : null, work.venue, typeof work.citations === "number" ? `${work.citations} citations` : null]
                                        .filter(Boolean)
                                        .join(" • ") || "Publication"
                                    )}</div>
                                  </div>
                                `
                              )
                              .join("")
                          : '<p class="muted">No indexed works available.</p>'}
                      </div>
                    </div>
                    <div>
                      <div class="sub-title">Topics and collaborators</div>
                      ${renderTagList(openalex.topTopics)}
                      <div style="height:12px"></div>
                      ${renderBulletList(
                        openalex.topCoauthors.map((item) =>
                          item.count ? `${item.name} (${item.count} collaborations)` : item.name
                        )
                      )}
                    </div>
                  </div>
                `
                : '<p class="muted">No OpenAlex work profile was returned for this project.</p>'
            }
          </section>

          <section class="section">
            <div class="section-kicker">News</div>
            <h2 class="section-title">Recent coverage</h2>
            ${
              newsItems.length
                ? `
                  <div class="news-list">
                    ${newsItems
                      .map(
                        (item) => `
                          <div class="news-item">
                            <div class="sub-title">${escapeHtml(item.title || "Untitled article")}</div>
                            <div class="news-meta">${escapeHtml(
                              [item.source || "Unknown source", item.published_at ? formatDate(item.published_at) : null].filter(Boolean).join(" • ")
                            )}</div>
                            ${item.url ? `<div class="link-url">${escapeHtml(item.url)}</div>` : ""}
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                `
                : '<p class="muted">No news items were returned for this project.</p>'
            }
          </section>

          <section class="section">
            <div class="section-kicker">Resources</div>
            <h2 class="section-title">Source index</h2>
            ${renderLinks(referenceLinks)}
          </section>
        </main>
      </body>
    </html>
  `
}

function buildExportFilename(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${slug || "research"}-dossier.pdf`
}

export async function exportProjectReportPdf(input: ExportProjectReportInput) {
  if (!globalThis.window) return
  const { default: html2canvas } = await import("html2canvas")

  const html = buildExportHtml(input)
  const parser = new DOMParser()
  const documentMarkup = parser.parseFromString(html, "text/html")
  documentMarkup.querySelectorAll("script").forEach((node) => node.remove())

  const mountNode = globalThis.document.createElement("div")
  mountNode.dataset.exportReport = "true"
  mountNode.style.position = "fixed"
  mountNode.style.left = "-1200px"
  mountNode.style.top = "0"
  mountNode.style.width = "960px"
  mountNode.style.pointerEvents = "none"
  mountNode.style.zIndex = "2147483647"
  mountNode.style.background = "#ffffff"
  mountNode.innerHTML = `${documentMarkup.head.innerHTML}${documentMarkup.body.innerHTML}`
  globalThis.document.body.appendChild(mountNode)

  const imageElements = Array.from(mountNode.querySelectorAll("img")) as HTMLImageElement[]
  await Promise.all(
    imageElements.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }

          img.addEventListener("load", () => resolve(), { once: true })
          img.addEventListener("error", () => resolve(), { once: true })
        })
    )
  )

  await (globalThis.document.fonts?.ready ?? Promise.resolve())

  await new Promise<void>((resolve) => {
    globalThis.requestAnimationFrame(() => resolve())
  })

  try {
    const fullCanvas = await html2canvas(mountNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 960,
    })

    const pdf = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
      compress: true,
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const pxPerPt = fullCanvas.width / pageWidth
    const sourcePageHeight = Math.floor(pageHeight * pxPerPt)

    const pageCanvas = globalThis.document.createElement("canvas")
    const pageContext = pageCanvas.getContext("2d")
    if (!pageContext) {
      throw new Error("Failed to initialize canvas context for PDF export")
    }

    let pageIndex = 0
    for (let sourceY = 0; sourceY < fullCanvas.height; sourceY += sourcePageHeight) {
      const sliceHeight = Math.min(sourcePageHeight, fullCanvas.height - sourceY)

      pageCanvas.width = fullCanvas.width
      pageCanvas.height = sliceHeight
      pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
      pageContext.drawImage(
        fullCanvas,
        0,
        sourceY,
        fullCanvas.width,
        sliceHeight,
        0,
        0,
        fullCanvas.width,
        sliceHeight
      )

      const imageData = pageCanvas.toDataURL("image/jpeg", 0.95)
      const renderHeight = (sliceHeight / fullCanvas.width) * pageWidth

      if (pageIndex > 0) {
        pdf.addPage()
      }

      pdf.addImage(imageData, "JPEG", 0, 0, pageWidth, renderHeight, undefined, "FAST")
      pageIndex += 1
    }

    pdf.save(buildExportFilename(input.profile.name))
  } catch (error) {
    console.error("Failed to generate PDF export", error)
    throw error
  } finally {
    mountNode.remove()
  }
}
