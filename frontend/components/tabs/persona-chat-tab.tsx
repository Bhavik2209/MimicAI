"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, ChevronDown, ChevronUp, History, SquarePen } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const TYPEWRITER_MS_PER_CHAR = 18

interface ChatMessage {
  id: string
  type: "user" | "persona"
  text: string
  timestamp: string
  sources?: string[]
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    type: "persona",
    text: "I am prepared to discuss my work in electrical engineering, wireless energy transmission, and the principles that guided my research. My laboratory notebooks are open to you. What subject do you wish to examine?",
    timestamp: "14:32",
    sources: ["Tesla, N. 'My Inventions' (1919)", "Carlson, W.B. 'Tesla: Inventor of the Electrical Age'"],
  },
]

const sessions = [
  { id: "1", topic: "Alternating current and the polyphase system", date: "Feb 27, 2026", active: true },
  { id: "2", topic: "Wardenclyffe Tower and wireless energy", date: "Feb 25, 2026", active: false },
  { id: "3", topic: "Relationship with Edison and Westinghouse", date: "Feb 22, 2026", active: false },
]

const personaResponses: Record<string, { text: string; sources: string[] }> = {
  default: {
    text: "An excellent question. Allow me to address this with the precision it deserves.\n\nMy work was always guided by one principle: that the forces of nature, properly understood and harnessed, could liberate humanity from drudgery. When I conceived the rotating magnetic field in 1882, walking through the City Park of Budapest, it came to me complete — the motor, the generator, the entire system of alternating current power transmission. I did not build toward it incrementally. I saw it whole.\n\n**The polyphase alternating current system** was not merely an improvement upon Edison's direct current. It was a fundamentally different conception of how electrical energy should flow through civilization. Direct current is a river. Alternating current is the tide — rhythmic, transformable, capable of traversing vast distances without significant loss.\n\nThis distinction was not immediately obvious to my contemporaries. Edison, a brilliant man in many respects, could not see past the paradigm he had built. This is the great tragedy of invested genius: it becomes anchored to its own success.",
    sources: ["Tesla, N. 'My Inventions' (1919)", "Seifer, M. 'Wizard: The Life and Times of Nikola Tesla'"],
  },
}

interface PersonaChatProps {
  onBack?: () => void
}

export function PersonaChatTab({ onBack }: PersonaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [activeSession, setActiveSession] = useState("1")
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})
  const [typewriterLen, setTypewriterLen] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Typewriter: when a new persona message appears, animate its length from 0 to full
  const lastPersonaId = messages.filter((m) => m.type === "persona").slice(-1)[0]?.id
  const typedIdsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (!lastPersonaId) return
    if (typedIdsRef.current.has(lastPersonaId)) return
    const msg = messages.find((m) => m.id === lastPersonaId)
    if (!msg || msg.type !== "persona") return
    const fullLen = msg.text.length
    let n = 0
    const id = setInterval(() => {
      n += 1
      setTypewriterLen((prev) => ({ ...prev, [lastPersonaId]: Math.min(n, fullLen) }))
      if (n >= fullLen) {
        typedIdsRef.current.add(lastPersonaId)
        clearInterval(id)
      }
    }, TYPEWRITER_MS_PER_CHAR)
    return () => clearInterval(id)
  }, [lastPersonaId, messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    if (textareaRef.current) {
      textareaRef.current.style.height = "44px"
    }

    setTimeout(() => {
      const resp = personaResponses.default
      const personaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "persona",
        text: resp.text,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        sources: resp.sources,
      }
      setMessages((prev) => [...prev, personaMsg])
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = "44px"
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px"
  }

  const renderMessageText = (text: string, compact = false) => {
    const fontSize = compact ? 13 : 15
    const marginTop = compact ? 8 : 14
    return text.split("\n\n").map((para, i) => {
      const processed = para.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;color:var(--text-1)">$1</strong>')
      return (
        <p
          key={i}
          className="font-sans"
          style={{
            fontSize,
            color: "var(--text-2)",
            lineHeight: 1.6,
            marginTop: i > 0 ? marginTop : 0,
          }}
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      )
    })
  }

  return (
    <div
      className="flex dashboard-page"
      style={{
        width: "100%",
        height: "calc(100vh - var(--topbar-h))",
        overflow: "hidden",
      }}
    >
      {/* Conversation Area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ margin: "0 auto", maxWidth: "1200px" }}>
        {/* Persona Header — persona name/avatar + New Session + History */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            minHeight: 52,
            padding: "0 24px",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full font-serif"
              style={{
                width: 32,
                height: 32,
                background: "var(--gold-dim)",
                color: "var(--gold)",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              NT
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-sans"
                style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}
              >
                Nikola Tesla
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "var(--text-3)",
                  border: "1px solid var(--border-soft)",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                Persona
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="font-sans flex items-center gap-2 rounded-lg px-3 py-2 transition-all"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-2)",
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--control-bg)"
                e.currentTarget.style.color = "var(--text-1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "var(--text-2)"
              }}
              title="New Session"
            >
              <SquarePen size={14} />
              <span className="hidden sm:inline">New Session</span>
            </button>

            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="font-sans flex items-center gap-2 rounded-lg px-3 py-2 transition-all ml-2"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-2)",
                    background: "var(--control-bg)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-3)"
                    e.currentTarget.style.color = "var(--text-1)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--control-bg)"
                    e.currentTarget.style.color = "var(--text-2)"
                  }}
                  title="History"
                >
                  <History size={14} />
                  <span className="hidden sm:inline">History</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Session History</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 mt-4 max-h-[60vh] overflow-y-auto">
                  {sessions.map((session) => {
                    const isActive = activeSession === session.id
                    return (
                      <button
                        key={session.id}
                        onClick={() => setActiveSession(session.id)}
                        className="w-full text-left rounded-lg transition-all border"
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          background: isActive ? "var(--gold-dim)" : "var(--control-bg)",
                          borderColor: isActive ? "var(--gold)" : "var(--border)",
                          transition: "var(--transition)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = "var(--surface-3)"
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = "var(--control-bg)"
                        }}
                      >
                        <div
                          className="font-sans"
                          style={{
                            fontSize: 14,
                            fontWeight: isActive ? 500 : 400,
                            color: isActive ? "var(--text-1)" : "var(--text-2)",
                            lineHeight: 1.4,
                          }}
                        >
                          {session.topic}
                        </div>
                        <div
                          className="font-mono mt-2"
                          style={{ fontSize: 11, color: "var(--text-3)" }}
                        >
                          {session.date}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ padding: "24px 24px 20px", gap: 28 }}
        >
          {messages.map((msg) => {
            if (msg.type === "user") {
              return (
                <div
                  key={msg.id}
                  className="flex flex-col items-end"
                  style={{
                    opacity: 1,
                    animation: "msg-enter 200ms ease-out",
                    padding: "12px 0",
                  }}
                >
                  <div
                    className="font-sans text-right max-w-[85%]"
                    style={{
                      fontSize: 14,
                      color: "var(--text-1)",
                      lineHeight: 1.6,
                      border: "1px solid var(--border-soft)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      background: "var(--surface-1)",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    className="font-mono mt-1.5"
                    style={{ fontSize: 10, color: "var(--text-3)" }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              )
            }

            const visibleLen = typewriterLen[msg.id] ?? 0
            const isTyping = visibleLen < msg.text.length
            const displayText = msg.text.slice(0, visibleLen)

            return (
              <div
                key={msg.id}
                className="flex gap-3 w-full"
                style={{
                  opacity: 1,
                  animation: "msg-enter 200ms ease-out",
                  padding: "12px 0",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full font-serif shrink-0"
                  style={{
                    width: 24,
                    height: 24,
                    background: "var(--gold-dim)",
                    color: "var(--gold)",
                    fontSize: 11,
                    fontStyle: "italic",
                  }}
                >
                  NT
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-sans"
                      style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}
                    >
                      Nikola Tesla
                    </span>
                    <span
                      className="font-mono"
                      style={{ fontSize: 10, color: "var(--text-3)" }}
                    >
                      {msg.timestamp}
                    </span>
                    {isTyping && (
                      <span
                        className="inline-block w-2 h-3 align-middle"
                        style={{
                          background: "var(--gold)",
                          animation: "typewriter 0.6s ease-in-out infinite",
                        }}
                      />
                    )}
                  </div>
                  <div>{renderMessageText(displayText, true)}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          setExpandedSources((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                        }
                        className="font-sans flex items-center gap-1 text-left"
                        style={{
                          fontSize: 10,
                          fontWeight: 400,
                          color: "var(--text-3)",
                          opacity: 0.8,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "color var(--transition), opacity var(--transition)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--gold)"
                          e.currentTarget.style.opacity = "1"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-3)"
                          e.currentTarget.style.opacity = "0.8"
                        }}
                      >
                        <span className="font-mono">Sources ({msg.sources.length})</span>
                        {expandedSources[msg.id] ? (
                          <ChevronUp size={10} />
                        ) : (
                          <ChevronDown size={10} />
                        )}
                      </button>
                      {expandedSources[msg.id] && (
                        <div className="flex flex-col gap-1 mt-1.5">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="font-mono"
                              style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.5 }}
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area — floating, no top border/background */}
        <div
          className="shrink-0"
          style={{
            padding: "16px 24px 24px",
          }}
        >
          <div className="relative max-w-3xl mx-auto flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question grounded in historical record..."
              className="w-full font-sans resize-none"
              style={{
                minHeight: 44,
                maxHeight: 140,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "10px 48px 10px 16px",
                fontSize: 13,
                color: "var(--text-1)",
                lineHeight: 1.5,
                outline: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                transition: "border-color var(--transition), box-shadow var(--transition)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)"
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-glow)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)"
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute flex items-center justify-center rounded-[12px] transition-all right-2 top-1/2 -translate-y-1/2 w-9 h-9 border-none"
              style={{
                background: input.trim() ? "var(--btn-primary-bg)" : "var(--control-bg)",
                color: input.trim() ? "var(--btn-primary-fg)" : "var(--text-3)",
                cursor: input.trim() ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.currentTarget.style.background = "var(--btn-primary-bg)"
                  e.currentTarget.style.filter = "brightness(1.08)"
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.05)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = input.trim() ? "var(--btn-primary-bg)" : "var(--control-bg)"
                e.currentTarget.style.transform = "translateY(-50%)"
              }}
              aria-label="Send message"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
