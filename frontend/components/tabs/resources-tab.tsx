"use client"

import { BookBookmark, DocumentText, ArrowRightUp } from "@/components/ui/solar-icons"
import type { ResearchRunResponse } from "@/lib/api"

interface ResourceItem {
  title: string
  source: string
  url?: string
}

interface ResourceSection {
  label: string
  title: string
  description: string
  icon: typeof BookBookmark
  items: ResourceItem[]
}

interface ResourcesTabProps {
  researchData?: ResearchRunResponse | null
}

function renderResourceLink(item: ResourceItem, key: string) {
  if (!item.url) {
    return (
      <div key={key} style={{ border: "1px solid var(--border-soft)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,0.02)" }}>
        <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 500, lineHeight: 1.6 }}>
          {item.title}
        </p>
        <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {item.source}
        </p>
      </div>
    )
  }

  return (
    <a
      key={key}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid var(--border-soft)",
        borderRadius: 18,
        padding: 18,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 500, lineHeight: 1.6 }}>
            {item.title}
          </p>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {item.source}
          </p>
        </div>
        <ArrowRightUp size={14} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
      </div>
    </a>
  )
}

export function ResourcesTab({ researchData }: Readonly<ResourcesTabProps>) {
  const wikipediaTitle = researchData?.acquisition?.wiki?.wikipedia_title
  const wikiEntityId = researchData?.acquisition?.wiki?.entity_id || researchData?.basic_info?.wikidata_id
  const wikiquoteId = researchData?.acquisition?.quotes?.entity_id

  const wikipediaUrl = wikipediaTitle
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle.replaceAll(" ", "_"))}`
    : undefined
  const wikidataUrl = wikiEntityId ? `https://www.wikidata.org/wiki/${wikiEntityId}` : undefined
  const wikiquoteUrl = wikiquoteId ? `https://en.wikiquote.org/wiki/${wikiquoteId}` : undefined

  const youtubeResources: ResourceItem[] = (researchData?.acquisition?.resources || [])
    .filter((item) => item?.source_type === "youtube")
    .map((item, idx) => ({
      title: item.title || `YouTube video ${idx + 1}`,
      source: "YouTube",
      url: item.url,
    }))

  const conversationVideos: ResourceItem[] = (researchData?.acquisition?.conversation?.videos || [])
    .filter((video) => video?.url)
    .map((video, idx) => ({
      title: video.title || `Transcript video ${idx + 1}`,
      source: "Conversation",
      url: video.url,
    }))

  const sections: ResourceSection[] = [
    {
      label: "Reference",
      title: "Foundational records",
      description: "Core profile and identity sources used across the rest of the experience.",
      icon: BookBookmark,
      items: [
        { title: wikipediaTitle || "Wikipedia title unavailable", source: "Wikipedia", url: wikipediaUrl },
        { title: wikiEntityId || "Wikidata id unavailable", source: "Wikidata", url: wikidataUrl },
        { title: wikiquoteId || "Wikiquote id unavailable", source: "Wikiquote", url: wikiquoteUrl },
      ],
    },
    {
      label: "Media",
      title: "Video and transcript sources",
      description: "Long-form sources that can support tone, speech patterns, and contextual analysis.",
      icon: DocumentText,
      items: [...youtubeResources, ...conversationVideos].length
        ? [...youtubeResources, ...conversationVideos]
        : [{ title: "No video or transcript sources available", source: "Media" }],
    },
  ]

  const totalLinks = sections.reduce((count, section) => count + section.items.filter((item) => item.url).length, 0)

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[var(--gold)]" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>
            Resources
          </span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, var(--gold-soft), transparent)", opacity: 0.3 }}></div>
        </div>

        <h2 className="font-sans" style={{ fontSize: 28, fontWeight: 650, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 14 }}>
          Source index
        </h2>

        <p className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.82, maxWidth: 720 }}>
          Direct links to the reference pages and media inputs used to build the research profile, so you can inspect the underlying material yourself.
        </p>

        <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {totalLinks} live links
          </span>
          {researchData?.basic_info?.wikidata_id ? (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {researchData.basic_info.wikidata_id}
            </span>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-14">
        {sections.map((section) => {
          const Icon = section.icon

          return (
            <section key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} color="var(--text-3)" />
                <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {section.label}
                </span>
              </div>

              <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>
                {section.title}
              </h3>
              <p className="font-sans" style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 18 }}>
                {section.description}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item, index) => renderResourceLink(item, `${section.title}-${index}`))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
