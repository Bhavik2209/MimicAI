"use client"

import { BookOpen, Play, FileText, ExternalLink } from "lucide-react"

const columns = [
  {
    label: "BOOKS",
    icon: BookOpen,
    items: [
      { title: "Tesla: Inventor of the Electrical Age", author: "W. Bernard Carlson", depth: 3 },
      { title: "Wizard: The Life and Times of Nikola Tesla", author: "Marc Seifer", depth: 3 },
      { title: "My Inventions: The Autobiography", author: "Nikola Tesla", depth: 2 },
      { title: "Empires of Light", author: "Jill Jonnes", depth: 2 },
      { title: "The Man Who Invented the Twentieth Century", author: "Robert Lomas", depth: 1 },
    ],
  },
  {
    label: "MEDIA",
    icon: Play,
    items: [
      { title: "Tesla: Master of Lightning", author: "PBS Documentary", depth: 2 },
      { title: "The Current War", author: "Alfonso Gomez-Rejon (dir.)", depth: 1 },
      { title: "Drunk History: Tesla", author: "Comedy Central", depth: 1 },
      { title: "The Tesla Files", author: "History Channel", depth: 2 },
    ],
  },
  {
    label: "PAPERS",
    icon: FileText,
    items: [
      { title: "A New System of Alternate Current Motors and Transformers", author: "Tesla, N. (1888)", depth: 3 },
      { title: "Experiments with Alternate Currents of High Potential", author: "Tesla, N. (1892)", depth: 3 },
      { title: "The Problem of Increasing Human Energy", author: "Tesla, N. (1900)", depth: 2 },
      { title: "World System of Wireless Transmission of Energy", author: "Tesla, N. (1927)", depth: 2 },
    ],
  },
]

function DepthDots({ depth }: { depth: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((d) => (
        <div
          key={d}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: d <= depth ? "var(--gold)" : "transparent",
            border: d <= depth ? "none" : "1px solid var(--border)",
          }}
        />
      ))}
    </div>
  )
}

export function ResourcesTab() {
  return (
    <div
      className="grid gap-8"
      style={{
        gridTemplateColumns: "repeat(3, 1fr)",
        maxWidth: 1100,
        padding: 40,
      }}
    >
      {columns.map((col) => {
        const Icon = col.icon
        return (
          <div key={col.label}>
            {/* Column Header */}
            <div
              className="flex items-center gap-2"
              style={{
                borderBottom: "1px solid rgba(201,168,76,0.3)",
                paddingBottom: 10,
                marginBottom: 16,
              }}
            >
              <Icon size={16} style={{ color: "var(--gold)" }} />
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {col.label}
              </span>
            </div>

            {/* Items */}
            <div>
              {col.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    className="font-sans"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--text-1)",
                      cursor: "pointer",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-1)")}
                  >
                    {item.title}
                  </div>
                  <div
                    className="font-sans"
                    style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}
                  >
                    {item.author}
                  </div>
                  <div
                    className="flex items-center justify-between"
                    style={{ marginTop: 8 }}
                  >
                    <DepthDots depth={item.depth} />
                    <span
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const svg = e.currentTarget.querySelector("svg")
                        if (svg) svg.style.color = "var(--gold)"
                      }}
                      onMouseLeave={(e) => {
                        const svg = e.currentTarget.querySelector("svg")
                        if (svg) svg.style.color = "var(--text-3)"
                      }}
                    >
                      <ExternalLink
                        size={14}
                        style={{
                          color: "var(--text-3)",
                          transition: "var(--transition)",
                        }}
                      />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
