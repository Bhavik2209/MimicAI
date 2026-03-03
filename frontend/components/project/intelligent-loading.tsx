"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Database, Search, Network, FileText, Check } from "lucide-react"

const STAGES = [
  { id: 1, label: "Identifying verified sources", icon: ShieldCheck },
  { id: 2, label: "Extracting biographical data", icon: Database },
  { id: 3, label: "Analyzing behavioral patterns", icon: Search },
  { id: 4, label: "Mapping influence network", icon: Network },
  { id: 5, label: "Structuring insights", icon: FileText },
]

const SNIPPETS = [
  "Analyzing historical records and verified sources.",
  "Constructing influence relationships.",
  "Extracting speech and writing patterns.",
  "Cross-referencing secondary biographical insights.",
  "Synthesizing behavioral archetypes.",
]

interface IntelligentLoadingProps {
  onComplete: () => void
}

export function IntelligentLoading({ onComplete }: IntelligentLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [snippetIndex, setSnippetIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 20000
    const intervalTime = 100
    const increment = (intervalTime / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 800)
          return 100
        }
        return prev + increment
      })
    }, intervalTime)

    const stageTimer = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length ? prev + 1 : prev))
    }, duration / STAGES.length)

    const snippetTimer = setInterval(() => {
      setSnippetIndex((prev) => (prev + 1) % SNIPPETS.length)
    }, 4000)

    return () => {
      clearInterval(timer)
      clearInterval(stageTimer)
      clearInterval(snippetTimer)
    }
  }, [onComplete])

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden"
      style={{
        minHeight: "calc(100vh - var(--topbar-h))",
        height: "calc(100vh - var(--topbar-h))",
        padding: "48px 32px 32px",
      }}
    >
      {/* Central progress ring */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: 160, height: 160, marginBottom: 40 }}
      >
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 160 160"
          style={{ width: 160, height: 160 }}
        >
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke="var(--border-soft)"
            strokeWidth="4"
          />
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 72}`}
            strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.15s ease-out" }}
          />
        </svg>
        <div
          className="flex flex-col items-center"
          style={{ zIndex: 1 }}
        >
          <span
            className="font-sans font-semibold"
            style={{ fontSize: 28, color: "var(--text-1)" }}
          >
            {Math.round(progress)}%
          </span>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}
          >
            progress
          </span>
        </div>
      </div>

      <h1
        className="font-serif text-center shrink-0"
        style={{
          fontSize: 26,
          fontWeight: 600,
          fontStyle: "italic",
          color: "var(--text-1)",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        Building Intelligence Profile
      </h1>
      <p
        className="font-sans text-center shrink-0"
        style={{
          fontSize: 14,
          color: "var(--text-3)",
          marginBottom: 32,
        }}
      >
        Gathering structured data and constructing insights
      </p>

      {/* Stage pills — horizontal, compact */}
      <div
        className="flex flex-wrap justify-center gap-2 shrink-0"
        style={{ marginBottom: 28 }}
      >
        {STAGES.map((stage, index) => {
          const isActive = index === currentStage
          const isCompleted = index < currentStage
          const Icon = stage.icon

          return (
            <div
              key={stage.id}
              className="flex items-center gap-2 rounded-[100px] shrink-0"
              style={{
                padding: "6px 14px",
                background: isCompleted ? "var(--gold-dim)" : isActive ? "var(--gold-dim)" : "var(--control-bg)",
                border: `1px solid ${isCompleted ? "var(--gold)" : isActive ? "var(--gold)" : "var(--control-border)"}`,
                opacity: isActive || isCompleted ? 1 : 0.6,
                boxShadow: isActive ? "0 0 0 1px var(--gold-glow)" : undefined,
              }}
            >
              {isCompleted ? (
                <Check size={14} style={{ color: "var(--gold)" }} />
              ) : (
                <Icon size={14} style={{ color: isActive ? "var(--gold)" : "var(--text-3)" }} />
              )}
              <span
                className="font-sans"
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 500 : 400,
                  color: isCompleted ? "var(--text-1)" : isActive ? "var(--text-1)" : "var(--text-3)",
                }}
              >
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Snippet */}
      <p
        className="font-sans text-center shrink-0"
        style={{
          fontSize: 13,
          fontStyle: "italic",
          color: "var(--text-3)",
          marginBottom: 12,
          minHeight: 20,
        }}
      >
        {SNIPPETS[snippetIndex]}
      </p>

      <span
        className="font-mono shrink-0"
        style={{ fontSize: 10, color: "var(--text-3)", opacity: 0.8 }}
      >
        Approx. 20–30 seconds
      </span>
    </div>
  )
}
