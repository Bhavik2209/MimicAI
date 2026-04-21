"use client"

import { useMemo, useState } from "react"
import type { ResearchRunResponse } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface RawTimelineEvent {
  start?: string
  end?: string
  type?: string
  event?: string
  label?: string
  category?: string
}

interface TimelineEvent {
  id: string
  start?: string
  end?: string
  yearKey: string
  type: string
  label: string
  category?: string
  description?: string
}

const INITIAL_VISIBLE_YEAR_GROUPS = 8

function toSortTimestamp(value?: string): number {
  if (!value) return Number.POSITIVE_INFINITY
  if (/^\d{4}$/.test(value)) return Date.parse(`${value}-01-01T00:00:00Z`)
  if (/^\d{4}-\d{2}$/.test(value)) return Date.parse(`${value}-01T00:00:00Z`)
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
}

function formatDate(value?: string): string {
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
  const startLabel = formatDate(start)
  const endLabel = formatDate(end)
  if (!start && !end) return "Unknown"
  if (!end || end === start) return startLabel
  if (!start) return endLabel
  return `${startLabel} - ${endLabel}`
}

function titleCase(value?: string) {
  if (!value) return "Timeline Event"
  return value
    .replaceAll(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface TimelineTabProps {
  researchData?: ResearchRunResponse | null
}

export function TimelineTab({ researchData }: Readonly<TimelineTabProps>) {
  const [visibleYearGroups, setVisibleYearGroups] = useState(INITIAL_VISIBLE_YEAR_GROUPS)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  const rawEvents = (researchData?.acquisition?.timeline?.timeline ?? []) as RawTimelineEvent[]
  const entityName = researchData?.basic_info?.name || researchData?.acquisition?.timeline?.description || "This entity"

  const events = useMemo(
    () =>
      rawEvents
        .map((item, index) => ({
          id: `${item.start || item.end || "na"}-${item.label || item.event || item.type || "event"}-${index}`,
          start: item.start || undefined,
          end: item.end || undefined,
          yearKey: (item.start || item.end || "Unknown").slice(0, 4),
          type: titleCase(item.type),
          label: item.label || item.event || item.type || "Timeline Event",
          category: item.category ? titleCase(item.category) : undefined,
          description: item.event && item.label && item.event !== item.label ? item.event : undefined,
        }))
        .filter((item) => item.start || item.end || item.label)
        .sort((a, b) => toSortTimestamp(a.start || a.end) - toSortTimestamp(b.start || b.end))
        .slice(0, 120),
    [rawEvents]
  )

  const groupedByYear = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>()
    events.forEach((item) => {
      const key = /^\d{4}$/.test(item.yearKey) ? item.yearKey : "Unknown"
      grouped.set(key, [...(grouped.get(key) || []), item])
    })
    return Array.from(grouped.entries()).sort(([left], [right]) => {
      if (left === "Unknown") return 1
      if (right === "Unknown") return -1
      return Number(left) - Number(right)
    })
  }, [events])

  const shownYearGroups = groupedByYear.slice(0, visibleYearGroups)
  const hasMoreYearGroups = groupedByYear.length > visibleYearGroups
  const selectedYearEvents = groupedByYear.find(([year]) => year === selectedYear)?.[1] || []
  const timelineDescription = researchData?.acquisition?.timeline?.description
  const earliestYear = groupedByYear[0]?.[0]
  const latestYear = groupedByYear[groupedByYear.length - 1]?.[0]

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[var(--gold)]" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>
            Timeline
          </span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, var(--gold-soft), transparent)", opacity: 0.3 }}></div>
        </div>

        <h2 className="font-sans" style={{ fontSize: 28, fontWeight: 650, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 14 }}>
          Chronology at a glance
        </h2>

        <p className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.82, maxWidth: 720 }}>
          {timelineDescription || `${entityName}'s major roles, appointments, education, and formal milestones arranged as a readable chronology.`}
        </p>

        {events.length ? (
          <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>
            {earliestYear ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>From {earliestYear}</span> : null}
            {latestYear ? <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>To {latestYear}</span> : null}
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{events.length} total milestones</span>
          </div>
        ) : null}
      </section>

      {events.length ? (
        <>
          <section className="mb-14">
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Years
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Browse by year
            </h3>

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {shownYearGroups.map(([year, items]) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className="text-left"
                  style={{
                    border: "1px solid var(--border-soft)",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.02)",
                    padding: 16,
                    cursor: "pointer",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-sans" style={{ fontSize: 18, color: "var(--text-1)", fontWeight: 600 }}>
                        {year}
                      </div>
                      <p className="font-sans" style={{ marginTop: 6, fontSize: 13, color: "var(--text-3)", lineHeight: 1.55 }}>
                        {items[0]?.label || items[0]?.type}
                      </p>
                    </div>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "5px 9px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {items.length}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {hasMoreYearGroups ? (
              <button
                type="button"
                className="font-mono"
                onClick={() => setVisibleYearGroups((count) => count + INITIAL_VISIBLE_YEAR_GROUPS)}
                style={{
                  marginTop: 12,
                  width: "fit-content",
                  background: "transparent",
                  border: "none",
                  color: "var(--teal)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Show more years
              </button>
            ) : null}
          </section>

          <section className="mb-10">
            <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Highlights
            </span>
            <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 18 }}>
              Selected milestones
            </h3>

            <div style={{ borderTop: "1px solid var(--border-soft)" }}>
              {events.slice(0, 8).map((item) => (
                <div key={item.id} className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(140px, 170px) 1fr" }}>
                  <div>
                    <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {formatDateRange(item.start, item.end)}
                    </p>
                    {item.category ? (
                      <p className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {item.category}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.65, fontWeight: 500 }}>
                      {item.label}
                    </p>
                    <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {item.type}
                    </p>
                    {item.description ? (
                      <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.72, marginTop: 10 }}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Dialog open={Boolean(selectedYear)} onOpenChange={(open) => !open && setSelectedYear(null)}>
            <DialogContent className="sm:max-w-3xl" style={{ background: "var(--surface-1)", borderColor: "var(--border-soft)", padding: 0, overflow: "hidden" }}>
              <DialogHeader style={{ padding: "24px 28px 18px", borderBottom: "1px solid var(--border-soft)" }}>
                <DialogTitle className="font-sans" style={{ color: "var(--text-1)", fontSize: 20, fontWeight: 600 }}>
                  {selectedYear || "Year"} chronology
                </DialogTitle>
                <DialogDescription className="font-sans" style={{ color: "var(--text-3)", lineHeight: 1.6 }}>
                  A closer look at the recorded milestones for this year.
                </DialogDescription>
              </DialogHeader>

              <div style={{ maxHeight: "68vh", overflowY: "auto", padding: "8px 28px 24px" }}>
                {selectedYearEvents.map((item) => (
                  <div key={item.id} className="grid gap-4" style={{ padding: "18px 0", borderBottom: "1px solid var(--border-soft)", gridTemplateColumns: "minmax(150px, 180px) 1fr" }}>
                    <div>
                      <p className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {formatDateRange(item.start, item.end)}
                      </p>
                      <p className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", marginTop: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {item.type}
                      </p>
                      {item.category ? (
                        <p className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {item.category}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <p className="font-sans" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.68, fontWeight: 500 }}>
                        {item.label}
                      </p>
                      <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, marginTop: 10 }}>
                        {item.description || "No additional narrative detail was returned for this milestone."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div style={{ border: "1px dashed var(--border-soft)", borderRadius: 22, padding: "44px 28px", background: "rgba(255,255,255,0.02)" }}>
          <p className="font-sans" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75, textAlign: "center" }}>
            No timeline events were returned for this entity.
          </p>
        </div>
      )}
    </div>
  )
}
