"use client"

import { Zap, Globe, Lightbulb } from "lucide-react"

const timeline = [
  { year: "1856", title: "Born in Smiljan", desc: "Born in the Austrian Empire (modern-day Croatia) to a Serbian family.", featured: false },
  { year: "1884", title: "Arrives in America", desc: "Immigrated to the United States with little more than a letter of recommendation to Thomas Edison.", featured: true },
  { year: "1887", title: "Tesla Electric Company", desc: "Founded his own company, developing his alternating current induction motor and transformer patents.", featured: false },
  { year: "1891", title: "Tesla Coil Invented", desc: "Invented the Tesla coil, a resonant transformer circuit used to produce high-voltage, low-current electricity.", featured: true },
  { year: "1893", title: "World's Columbian Exposition", desc: "Demonstrated AC power at the Chicago World's Fair, proving its superiority over DC.", featured: false },
  { year: "1899", title: "Colorado Springs Experiments", desc: "Conducted high-voltage experiments, claimed to have received extraterrestrial radio signals.", featured: true },
  { year: "1943", title: "Death in New York", desc: "Died alone in Room 3327 of the New Yorker Hotel at age 86.", featured: false },
]

const achievements = [
  { icon: Zap, title: "Alternating Current", desc: "Developed the polyphase AC system that powers the modern world." },
  { icon: Globe, title: "Wireless Communication", desc: "Pioneered wireless energy transmission and radio technology." },
  { icon: Lightbulb, title: "Tesla Coil", desc: "Invented the resonant transformer circuit still used in radio technology." },
]

const impacts = [
  { label: "Electrical Engineering", pct: 95 },
  { label: "Wireless Technology", pct: 88 },
  { label: "Energy Systems", pct: 82 },
  { label: "Theoretical Physics", pct: 65 },
  { label: "Popular Culture", pct: 72 },
]

export function OverviewTab() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 40 }}>
      {/* Executive Summary */}
      <section className="mb-16">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          OVERVIEW
        </span>
        <h2
          className="font-sans"
          style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 16 }}
        >
          Executive Summary
        </h2>
        <div style={{ marginTop: 16 }}>
          <p
            className="font-serif"
            style={{ fontSize: 17, fontWeight: 500, fontStyle: "italic", color: "var(--text-1)", lineHeight: 1.65 }}
          >
            Nikola Tesla was a Serbian-American inventor, electrical engineer, and futurist
            whose contributions to the design of the modern alternating current electricity
            supply system have earned him a place among history&apos;s most consequential
            scientists.
          </p>
          <p
            className="font-sans mt-4"
            style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75 }}
          >
            Working at the intersection of electrical engineering and theoretical physics,
            Tesla held over 300 patents and is credited with the invention of the induction motor,
            the Tesla coil, and foundational work in wireless communication. His rivalry with
            Thomas Edison, known as the &quot;War of Currents,&quot; defined an era of
            technological innovation and corporate competition.
          </p>
          <p
            className="font-sans mt-4"
            style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75 }}
          >
            Despite his extraordinary contributions, Tesla spent his final years in poverty,
            living alone in a New York hotel room. His legacy has experienced a dramatic
            posthumous revival, making him one of the most recognized figures in the
            history of science and technology.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-16">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          CHRONOLOGY
        </span>
        <h2
          className="font-sans"
          style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 16 }}
        >
          Key Timeline
        </h2>
        <div style={{ marginTop: 16 }}>
          {timeline.map((item, i) => (
            <div
              key={item.year}
              className="flex"
              style={{
                padding: "16px 0",
                borderBottom: i < timeline.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              {/* Year */}
              <div
                className="font-mono shrink-0"
                style={{ width: 80, fontSize: 13, color: "var(--text-3)" }}
              >
                {item.year}
              </div>
              {/* Connector */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 24, position: "relative" }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: item.featured ? "var(--gold)" : "rgba(255,255,255,0.15)",
                    marginTop: 6,
                    zIndex: 1,
                  }}
                />
                {i < timeline.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      background: "var(--border-soft)",
                      position: "absolute",
                      top: 16,
                      bottom: -20,
                    }}
                  />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 ml-3">
                <div
                  className="font-sans"
                  style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)" }}
                >
                  {item.title}
                </div>
                <div
                  className="font-sans"
                  style={{ fontSize: 14, color: "var(--text-2)", marginTop: 2, lineHeight: 1.6 }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-16">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          CONTRIBUTIONS
        </span>
        <h2
          className="font-sans"
          style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 16 }}
        >
          Key Achievements
        </h2>
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 16 }}
        >
          {achievements.map((a) => {
            const Icon = a.icon
            return (
              <div key={a.title}>
                <Icon size={20} style={{ color: "var(--gold)" }} />
                <div
                  className="font-sans"
                  style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)", marginTop: 10 }}
                >
                  {a.title}
                </div>
                <div
                  className="font-sans"
                  style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginTop: 4 }}
                >
                  {a.desc}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Areas of Impact */}
      <section className="mb-16">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          ANALYSIS
        </span>
        <h2
          className="font-sans"
          style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 16 }}
        >
          Areas of Impact
        </h2>
        <div style={{ marginTop: 16 }} className="flex flex-col gap-5">
          {impacts.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-2">
                <span
                  className="font-sans"
                  style={{ fontSize: 13, color: "var(--text-2)" }}
                >
                  {item.label}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: 12, color: "var(--text-3)" }}
                >
                  {item.pct}%
                </span>
              </div>
              <div style={{ height: 2, background: "var(--border)", width: "100%" }}>
                <div
                  style={{
                    height: 2,
                    background: "var(--teal)",
                    width: `${item.pct}%`,
                    transition: "width 600ms ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Legacy Quote */}
      <section className="mb-16">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          LEGACY
        </span>
        <h2
          className="font-sans"
          style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 4, marginBottom: 16 }}
        >
          Enduring Impact
        </h2>
        <div
          style={{
            marginTop: 16,
            borderLeft: "3px solid var(--gold)",
            paddingLeft: 24,
          }}
        >
          <blockquote
            className="font-serif"
            style={{
              fontSize: 20,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--text-1)",
              lineHeight: 1.65,
            }}
          >
            &ldquo;The present is theirs; the future, for which I really worked, is mine.&rdquo;
          </blockquote>
          <div
            className="font-sans"
            style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12 }}
          >
            Nikola Tesla, c. 1930s
          </div>
        </div>
      </section>
    </div>
  )
}
