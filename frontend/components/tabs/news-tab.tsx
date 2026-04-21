"use client"

import { ArrowRightUp } from "@/components/ui/solar-icons"
import type { ResearchRunResponse } from "@/lib/api"

interface NewsTabProps {
  researchData?: ResearchRunResponse | null
}

function formatSource(value?: string): string {
  if (!value) return "Unknown Source"
  return value.replaceAll("_", " ")
}

function formatPublishedAt(value?: string): string {
  if (!value) return "Unknown Date"
  const parsed = Date.parse(value.replace(" ", "T"))
  if (Number.isNaN(parsed)) return value

  return new Date(parsed).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function NewsTab({ researchData }: Readonly<NewsTabProps>) {
  const newsItems = researchData?.acquisition?.news || []
  const featuredItem = newsItems[0]
  const remainingItems = newsItems.slice(1)

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[var(--gold)]" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>
            News
          </span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, var(--gold-soft), transparent)", opacity: 0.3 }}></div>
        </div>

        <h2 className="font-sans" style={{ fontSize: 28, fontWeight: 650, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 14 }}>
          Recent coverage
        </h2>

        <p className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.82, maxWidth: 720 }}>
          A live reading list of recent articles associated with this figure, arranged for quick scanning and source inspection.
        </p>

        <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {newsItems.length} articles
          </span>
          {featuredItem?.published_at ? (
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Latest {formatPublishedAt(featuredItem.published_at)}
            </span>
          ) : null}
        </div>
      </section>

      {newsItems.length ? (
        <div className="flex flex-col gap-14">
          {featuredItem ? (
            <section style={{ border: "1px solid var(--border-soft)", borderRadius: 22, padding: 22, background: "rgba(255,255,255,0.02)" }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Featured
              </span>
              <a
                href={featuredItem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none", marginTop: 10 }}
              >
                <h3 className="font-sans" style={{ fontSize: 21, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.45 }}>
                  {featuredItem.title || "Untitled article"}
                </h3>
              </a>
              <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 14 }}>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {formatSource(featuredItem.source)}
                </span>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {formatPublishedAt(featuredItem.published_at)}
                </span>
              </div>
              {featuredItem.url ? (
                <a
                  href={featuredItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                  style={{
                    marginTop: 16,
                    textDecoration: "none",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 999,
                    padding: "8px 12px",
                    color: "var(--text-1)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <span className="font-sans" style={{ fontSize: 13 }}>Open article</span>
                  <ArrowRightUp size={12} style={{ color: "var(--text-3)" }} />
                </a>
              ) : null}
            </section>
          ) : null}

          <section>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Archive
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Article index
            </h3>

            <div className="flex flex-col gap-4">
              {(remainingItems.length ? remainingItems : featuredItem ? [featuredItem] : []).map((item, i) => (
                <a
                  key={`${item.url || item.title || "news"}-${i}`}
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 500, lineHeight: 1.6 }}>
                        {item.title || "Untitled article"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 10 }}>
                        <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {formatSource(item.source)}
                        </span>
                        <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {formatPublishedAt(item.published_at)}
                        </span>
                      </div>
                    </div>
                    <ArrowRightUp size={14} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div style={{ border: "1px dashed var(--border-soft)", borderRadius: 22, padding: "44px 28px", background: "rgba(255,255,255,0.02)" }}>
          <p className="font-sans" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75, textAlign: "center" }}>
            No news items were returned for this entity.
          </p>
        </div>
      )}
    </div>
  )
}
