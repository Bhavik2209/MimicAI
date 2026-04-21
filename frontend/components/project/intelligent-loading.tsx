"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "@/components/ui/solar-icons"
import { createProjectDeduped, runEntityResearch, type ProjectResponse, type ResearchRunResponse } from "@/lib/api"

const MIN_VISUAL_DELAY_MS = 5000
const STAGE_INTERVAL_MS = 14000

const STAGES = [
  "Resolving entity identity",
  "Collecting Wikipedia profile",
  "Gathering quotes and conversations",
  "Fetching timeline, news, socials, and work",
  "Building the knowledge index",
  "Generating personality analysis",
  "Preparing the dashboard dossier",
]

interface IntelligentLoadingProps {
  wikidataId: string
  projectName: string
  projectDescription?: string
  contextHint?: string
  onComplete: (result: { projectRecord: ProjectResponse; research: ResearchRunResponse }) => void
  onError: (message: string) => void
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function AnimatedMimicLine() {
  return (
    <div
      style={{
        position: "relative",
        width: "min(280px, 54vw)",
        height: "min(148px, 28vw)",
      }}
    >
      <svg
        viewBox="0 0 280 200"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        aria-label="Mimic AI loading logo"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <path
          d="M 20 180 L 20 60 A 40 40 0 0 1 100 60 L 100 120 A 40 40 0 0 0 180 120 L 180 60 A 40 40 0 0 1 260 60 L 260 180"
          stroke="color-mix(in srgb, var(--accent) 18%, transparent)"
          strokeWidth="40"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        viewBox="0 0 280 200"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <path
          d="M 20 180 L 20 60 A 40 40 0 0 1 100 60 L 100 120 A 40 40 0 0 0 180 120 L 180 60 A 40 40 0 0 1 260 60 L 260 180"
          stroke="var(--accent)"
          strokeWidth="40"
          strokeLinecap="butt"
          strokeLinejoin="round"
          pathLength="1000"
          strokeDasharray="220 780"
          style={{
            filter: "drop-shadow(0 0 16px color-mix(in srgb, var(--accent) 30%, transparent))",
            animation: "mimic-logo-flow 2.8s linear infinite",
          }}
        />
      </svg>
    </div>
  )
}

export function IntelligentLoading({
  wikidataId,
  projectName,
  projectDescription,
  contextHint,
  onComplete,
  onError,
}: Readonly<IntelligentLoadingProps>) {
  const [currentStage, setCurrentStage] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    let mounted = true
    let visualReady = false
    let resultReady = false
    let resultData: { projectRecord: ProjectResponse; research: ResearchRunResponse } | null = null

    const maybeComplete = () => {
      if (!mounted || !visualReady || !resultReady || !resultData) return
      setIsFinished(true)
      setCurrentStage(STAGES.length - 1)
      window.setTimeout(() => {
        if (mounted && resultData) onComplete(resultData)
      }, 380)
    }

    const clockTimer = window.setInterval(() => {
      setElapsedMs((prev) => prev + 1000)
    }, 1000)

    const stageTimer = window.setInterval(() => {
      setCurrentStage((prev) => {
        if (resultReady) return STAGES.length - 1
        return Math.min(prev + 1, STAGES.length - 1)
      })
    }, STAGE_INTERVAL_MS)

    const delayTimer = window.setTimeout(() => {
      visualReady = true
      maybeComplete()
    }, MIN_VISUAL_DELAY_MS)

    const runPipeline = async () => {
      try {
        const research = await runEntityResearch(wikidataId)

        const projectRecord = await createProjectDeduped({
          title: projectName,
          description: projectDescription || contextHint,
          entity_id: wikidataId,
        })

        resultData = { projectRecord, research }
        resultReady = true
        maybeComplete()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate research profile"
        if (mounted) onError(message)
      }
    }

    runPipeline()

    return () => {
      mounted = false
      window.clearInterval(clockTimer)
      window.clearInterval(stageTimer)
      window.clearTimeout(delayTimer)
    }
  }, [contextHint, onComplete, onError, projectDescription, projectName, wikidataId])

  return (
    <div
      className="flex items-center justify-center px-6 py-8"
      style={{ minHeight: "calc(100vh - var(--topbar-h))" }}
    >
      <div
        className="w-full max-w-[760px] overflow-y-auto rounded-[32px] border px-6 py-8 sm:px-10 sm:py-9"
        style={{
          maxHeight: "calc(100vh - var(--topbar-h) - 32px)",
          borderColor: "var(--border-soft)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 94%, transparent) 0%, color-mix(in srgb, var(--surface-1) 98%, transparent) 100%)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.18)",
        }}
      >
        <style>{`
          @keyframes mimic-logo-flow {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -1000; }
          }

          @keyframes loading-step-enter {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="mx-auto flex max-w-[520px] flex-col items-center text-center">
          <AnimatedMimicLine />

          <div
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-3)" }}
          >
            Research in progress
          </div>

          <h1
            className="mt-4 font-sans text-[24px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[30px]"
            style={{ color: "var(--text-1)" }}
          >
            <span>Building the research profile for</span>
            <span
              className="block"
              style={{ color: "var(--accent)" }}
            >
              {projectName}
            </span>
          </h1>

          <p
            className="mt-4 max-w-[40rem] font-sans text-[14px] leading-7 sm:text-[15px]"
            style={{ color: "var(--text-2)" }}
          >
            We are collecting and structuring verified public material into a reusable dossier for the dashboard and persona chat.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div
              className="rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--text-3)",
                background: "color-mix(in srgb, var(--surface-2) 82%, transparent)",
              }}
            >
              elapsed {formatElapsed(elapsedMs)}
            </div>
            <div
              className="rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--text-3)",
                background: "color-mix(in srgb, var(--surface-2) 82%, transparent)",
              }}
            >
              typically 90 to 120 sec
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 max-w-[540px]">
          <div
            key={`${currentStage}-${isFinished ? "done" : "active"}`}
            className="flex items-start gap-4 rounded-[18px] border px-4 py-4"
            style={{
              animation: "loading-step-enter 220ms ease-out",
              borderColor: "var(--border-accent)",
              background: "var(--gold-dim)",
            }}
          >
            <div
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
              style={{
                borderColor: "var(--border-accent)",
                background: "var(--gold-dim)",
              }}
            >
              {isFinished ? (
                <CheckCircle size={14} weight="Broken" color="var(--accent)" />
              ) : (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "999px",
                    background: "var(--accent)",
                    opacity: 0.9,
                  }}
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-[1px] text-left">
              <div
                className="font-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ color: "var(--text-3)" }}
              >
                {isFinished ? "Completed" : `Step ${currentStage + 1} of ${STAGES.length}`}
              </div>
              <div
                className="mt-2 font-sans text-[15px] font-medium leading-6"
                style={{ color: "var(--text-1)" }}
              >
                {STAGES[currentStage]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
