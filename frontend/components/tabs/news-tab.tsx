"use client"

import { useState } from "react"

const filters = ["All", "Historical", "Contemporary", "Academic"]

const newsItems = [
  {
    source: "THE NEW YORK TIMES",
    date: "NOV 2023",
    headline: "How Nikola Tesla's Vision of Wireless Power Is Finally Becoming Reality",
    preview: "A new generation of engineers is revisiting Tesla's century-old ideas about wireless energy transmission, finding that his theoretical frameworks were remarkably prescient.",
    category: "Contemporary",
  },
  {
    source: "NATURE PHYSICS",
    date: "AUG 2023",
    headline: "Reassessing Tesla's Colorado Springs Experiments Through Modern Electromagnetic Theory",
    preview: "A peer-reviewed analysis of Tesla's 1899 laboratory notes reveals that several dismissed observations were consistent with later-discovered ionospheric phenomena.",
    category: "Academic",
  },
  {
    source: "SMITHSONIAN MAGAZINE",
    date: "JUL 2023",
    headline: "The Untold Story of Tesla's Final Years at the New Yorker Hotel",
    preview: "Newly discovered hotel records and correspondence reveal the daily routines and intellectual preoccupations of Tesla's isolated final decade.",
    category: "Historical",
  },
  {
    source: "IEEE SPECTRUM",
    date: "MAR 2023",
    headline: "Tesla vs. Edison: New Evidence in the Alternating Current Debate",
    preview: "Archival documents from the Westinghouse Electric Corporation shed new light on the commercial negotiations that determined the outcome of the War of Currents.",
    category: "Academic",
  },
  {
    source: "THE GUARDIAN",
    date: "JAN 2023",
    headline: "Serbia Opens Major New Tesla Museum Wing After Decade of Planning",
    preview: "The Nikola Tesla Museum in Belgrade unveiled a comprehensive new exhibition featuring previously undisplayed personal artifacts and original manuscripts.",
    category: "Contemporary",
  },
]

export function NewsTab() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = activeFilter === "All"
    ? newsItems
    : newsItems.filter((n) => n.category === activeFilter)

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}>
      {/* Filter Bar */}
      <div className="flex gap-2" style={{ marginBottom: 28 }}>
        {filters.map((f) => {
          const isActive = activeFilter === f
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="font-sans"
              style={{
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--text-1)" : "var(--text-2)",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                padding: "6px 12px",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-1)"
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-2)"
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* News Items */}
      <div>
        {filtered.map((item, i) => (
          <article
            key={i}
            className="py-6"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.09em",
              }}
            >
              {item.source} · {item.date}
            </span>
            <h3
              className="font-sans"
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--text-1)",
                marginTop: 6,
                cursor: "pointer",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            >
              {item.headline}
            </h3>
            <p
              className="font-sans"
              style={{
                fontSize: 14,
                color: "var(--text-2)",
                lineHeight: 1.6,
                marginTop: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.preview}
            </p>
            <span
              className="font-sans inline-block"
              style={{
                fontSize: 13,
                color: "var(--teal)",
                marginTop: 10,
                cursor: "pointer",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {"Read source →"}
            </span>
          </article>
        ))}
      </div>
    </div>
  )
}
