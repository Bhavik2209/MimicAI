"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import { CheckCircle, Refresh, SquareAltArrowLeft } from "@/components/ui/solar-icons"
import { CloseSquare, Copy, History, PenNewSquare, Plain2, Reply2 } from "@solar-icons/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { readUserSettings } from "@/lib/user-settings"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend").replace(/\/$/, "")
const COMPOSER_BASE_HEIGHT = 124
const COMPOSER_MAX_HEIGHT = 210

interface ChatMessageCitations {
  source?: string
  provider?: string
  query?: string
  knowledge_base?: Record<string, unknown>
  web_search?: Record<string, unknown>
  results?: Array<{ title?: string; url?: string; excerpt?: string }>
}
interface ChatMessage { id: string; role: "user" | "assistant"; content: string; created_at: string; quoted_content?: string; clientKey?: string; citations?: ChatMessageCitations | null }
interface ChatSession { id: string; entity_id: string; title: string | null; created_at: string; updated_at: string }
interface QuoteAttachment { content: string; messageId: string }
interface PersonaChatProps {
  entityWikidataId: string
  entityName: string
  entityInitials?: string
  entityImageUrl?: string
  projectId: string
  defaultWebSearch?: boolean
  defaultKnowledgeBase?: boolean
  onBack?: () => void
}

function ComposerPlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function WebSearchIcon({ size = 14 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.8 11h6.4M11 7.8c.9.87 1.45 2 1.55 3.2-.1 1.2-.65 2.33-1.55 3.2-.9-.87-1.45-2-1.55-3.2.1-1.2.65-2.33 1.55-3.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function KnowledgeBaseIcon({ size = 14 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6.2" rx="6.5" ry="2.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 6.2V12c0 1.55 2.91 2.8 6.5 2.8s6.5-1.25 6.5-2.8V6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.5 12v5.8c0 1.55 2.91 2.8 6.5 2.8s6.5-1.25 6.5-2.8V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ActionBtn({ label, active, danger, onClick }: Readonly<{ label: string; active?: boolean; danger?: boolean; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }>) {
  return <button onClick={onClick} className="font-mono" style={{ fontSize: 11, color: danger ? "#ef4444" : active ? "var(--text-1)" : "var(--text-3)", background: danger ? "rgba(239,68,68,0.12)" : active ? "rgba(255,255,255,0.06)" : "transparent", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "7px 12px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</button>
}

function normalizeStoredMessage(message: ChatMessage): ChatMessage {
  if (message.role !== "user") return message

  const match = message.content.match(/^Quoted context:\n([\s\S]*?)\n\nUser message:\n([\s\S]*)$/)
  if (!match) return message

  return {
    ...message,
    quoted_content: match[1].trim(),
    content: match[2].trim(),
  }
}

export function PersonaChatTab({ entityWikidataId, entityName, entityInitials, entityImageUrl, projectId, defaultWebSearch, defaultKnowledgeBase, onBack }: PersonaChatProps) {
  const initials = entityInitials ?? entityName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [quotedMessageId, setQuotedMessageId] = useState<string | null>(null)
  const [isTranscriptCopied, setIsTranscriptCopied] = useState(false)
  const [quoteAttachment, setQuoteAttachment] = useState<QuoteAttachment | null>(null)
  const [isComposerMenuOpen, setIsComposerMenuOpen] = useState(false)
  const [isSlashTriggeredMenu, setIsSlashTriggeredMenu] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesViewportRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const composerMenuRef = useRef<HTMLDivElement>(null)
  const typedIdsRef = useRef<Set<string>>(new Set())
  const copiedTimeoutRef = useRef<number | null>(null)
  const quotedTimeoutRef = useRef<number | null>(null)
  const transcriptTimeoutRef = useRef<number | null>(null)
  const previousMessageCountRef = useRef(0)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const viewport = messagesViewportRef.current
    if (!viewport) return

    viewport.scrollTop = viewport.scrollHeight
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" })
  }, [])

  useEffect(() => {
    const settings = readUserSettings()
    setUseWebSearch(defaultWebSearch ?? settings.defaultWebSearch)
    setUseKnowledgeBase(defaultKnowledgeBase ?? settings.defaultKnowledgeBase)
  }, [defaultKnowledgeBase, defaultWebSearch])

  useEffect(() => {
    const messageCount = messages.length
    const hasNewMessage = messageCount > previousMessageCountRef.current
    previousMessageCountRef.current = messageCount

    if (hasNewMessage) {
      window.requestAnimationFrame(() => scrollToBottom("smooth"))
      return
    }

    if (isSending) {
      window.requestAnimationFrame(() => scrollToBottom("auto"))
    }
  }, [isSending, messages, scrollToBottom])

  useEffect(() => {
    if (!textareaRef.current) return
    if (!input) {
      textareaRef.current.style.height = `${COMPOSER_BASE_HEIGHT}px`
    }
  }, [input])
  useEffect(() => () => {
    if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current)
    if (quotedTimeoutRef.current) window.clearTimeout(quotedTimeoutRef.current)
    if (transcriptTimeoutRef.current) window.clearTimeout(transcriptTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!isComposerMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!composerMenuRef.current?.contains(event.target as Node)) {
        setIsComposerMenuOpen(false)
      }
    }

    window.addEventListener("mousedown", handlePointerDown)
    return () => window.removeEventListener("mousedown", handlePointerDown)
  }, [isComposerMenuOpen])

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/chat/${entityWikidataId}/sessions`)
      if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`)
      const data: ChatSession[] = await res.json()
      setSessions(data)
      if (data.length > 0 && activeSessionId === null) setActiveSessionId(data[0].id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sessions")
    } finally { setIsLoadingSessions(false) }
  }, [entityWikidataId, activeSessionId])

  const fetchMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMessages(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`)
      if (!res.ok) throw new Error(`Failed to load messages (${res.status})`)
      const data: ChatMessage[] = (await res.json()).map(normalizeStoredMessage)
      data.forEach((m) => { if (m.role === "assistant") typedIdsRef.current.add(m.id) })
      setMessages(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load messages")
    } finally { setIsLoadingMessages(false) }
  }, [])

  const createNewSession = async () => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/chat/${entityWikidataId}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: projectId }) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? `Failed to create session (${res.status})`)
      }
      const session: ChatSession = await res.json()
      setSessions((prev) => [session, ...prev]); setActiveSessionId(session.id); setMessages([]); typedIdsRef.current = new Set(); setIsHistoryOpen(false); setQuoteAttachment(null)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to create session") }
  }

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    if (!activeSessionId) { await createNewSession(); return }
    const content = input.trim()
    const pendingQuote = quoteAttachment
    const finalContent = pendingQuote ? `Quoted context:\n${pendingQuote.content}\n\nUser message:\n${content}` : content
    setInput(""); setIsSending(true); setError(null); setQuoteAttachment(null)
    const tempUserId = `temp-user-${Date.now()}`, tempAssistantId = `temp-assistant-${Date.now()}`
    const userClientKey = `user-${tempUserId}`
    const assistantClientKey = `assistant-${tempAssistantId}`
    typedIdsRef.current.add(tempUserId); typedIdsRef.current.add(tempAssistantId)
    setMessages((prev) => [
      ...prev,
      { id: tempUserId, role: "user", content, created_at: new Date().toISOString(), quoted_content: pendingQuote?.content, clientKey: userClientKey },
      { id: tempAssistantId, role: "assistant", content: "", created_at: new Date().toISOString(), clientKey: assistantClientKey },
    ])
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${activeSessionId}/messages/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: finalContent, use_web_search: useWebSearch, use_knowledge_base: useKnowledgeBase }) })
      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.detail ?? `Request failed (${res.status})`)
      }
      const reader = res.body.getReader(), decoder = new TextDecoder()
      let sseBuffer = ""
      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        sseBuffer += decoder.decode(value, { stream: true })
        const events = sseBuffer.split("\n\n")
        sseBuffer = events.pop() ?? ""
        for (const event of events) {
          if (!event.startsWith("data: ")) continue
          let data: Record<string, unknown>
          try { data = JSON.parse(event.slice(6)) } catch { continue }
          if (data.token) {
            setMessages((prev) => prev.map((m) => m.id === tempAssistantId ? { ...m, content: m.content + (data.token as string) } : m))
          } else if (data.done) {
            const { user_message, assistant_message } = data as { user_message: ChatMessage; assistant_message: ChatMessage }
            typedIdsRef.current.add(user_message.id); typedIdsRef.current.add(assistant_message.id)
            setMessages((prev) =>
              prev
                .map((m) => {
                  if (m.id === tempUserId) {
                    return { ...user_message, content, quoted_content: pendingQuote?.content, clientKey: userClientKey }
                  }
                  if (m.id === tempAssistantId) {
                    return { ...assistant_message, clientKey: assistantClientKey }
                  }
                  return m
                })
            )
            setSessions((prev) => prev.map((s) => s.id === activeSessionId ? { ...s, title: s.title ?? content.slice(0, 60), updated_at: new Date().toISOString() } : s))
            break outer
          } else if (data.error) throw new Error(data.error as string)
        }
      }
    } catch (e: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserId && m.id !== tempAssistantId))
      setError(e instanceof Error ? e.message : "Failed to send message")
    } finally { setIsSending(false) }
  }

  const switchSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) return
    setRenamingSessionId(null); setDeletingSessionId(null); setQuoteAttachment(null); setActiveSessionId(sessionId); await fetchMessages(sessionId)
  }

  const handleRenameCommit = async (sessionId: string, newTitle: string) => {
    setRenamingSessionId(null)
    const trimmed = newTitle.trim()
    if (!trimmed) return
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: trimmed } : s))
    try { await fetch(`${API_BASE}/chat/sessions/${sessionId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: trimmed }) }) } catch {}
  }

  const handleDeleteClick = async (sessionId: string) => {
    if (deletingSessionId !== sessionId) { setDeletingSessionId(sessionId); setRenamingSessionId(null); return }
    setDeletingSessionId(null)
    const remaining = sessions.filter((s) => s.id !== sessionId)
    setSessions(remaining)
    if (activeSessionId === sessionId) {
      if (remaining.length > 0) { setActiveSessionId(remaining[0].id); await fetchMessages(remaining[0].id) } else { setActiveSessionId(null); setMessages([]) }
    }
    try { await fetch(`${API_BASE}/chat/sessions/${sessionId}`, { method: "DELETE" }) } catch {}
  }

  useEffect(() => { fetchSessions() }, [fetchSessions])
  useEffect(() => { if (activeSessionId) fetchMessages(activeSessionId) }, [activeSessionId, fetchMessages])

  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    window.requestAnimationFrame(() => {
      textarea.style.height = "0px"
      const nextHeight = Math.min(Math.max(textarea.scrollHeight, COMPOSER_BASE_HEIGHT), COMPOSER_MAX_HEIGHT)
      textarea.style.height = `${nextHeight}px`
    })
  }

  const consumeSlashTrigger = () => {
    if (!isSlashTriggeredMenu) return
    setInput((prev) => prev.replace(/(?:^|\s)\/$/, " ").trimEnd())
    setIsSlashTriggeredMenu(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value
    // Slash command opens the same tools menu as the plus button.
    if (/(?:^|\s)\/$/.test(nextValue)) {
      setIsComposerMenuOpen(true)
      setIsSlashTriggeredMenu(true)
      setInput(nextValue)
      resizeTextarea(e.currentTarget)
      return
    }

    // If the slash-trigger token changed (extra char, space, or backspace), close menu.
    if (isSlashTriggeredMenu) {
      setIsComposerMenuOpen(false)
      setIsSlashTriggeredMenu(false)
    }

    setInput(nextValue)
    resizeTextarea(e.currentTarget)
  }
  const formatTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) } catch { return "" } }
  const copyText = async (value: string, type: "message" | "transcript", targetId?: string) => {
    try {
      await navigator.clipboard.writeText(value)
      if (type === "message" && targetId) {
        setCopiedMessageId(targetId)
        if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current)
        copiedTimeoutRef.current = window.setTimeout(() => setCopiedMessageId(null), 1400)
      }
      if (type === "transcript") {
        setIsTranscriptCopied(true)
        if (transcriptTimeoutRef.current) window.clearTimeout(transcriptTimeoutRef.current)
        transcriptTimeoutRef.current = window.setTimeout(() => setIsTranscriptCopied(false), 1600)
      }
    } catch {
      setError("Unable to copy to clipboard")
    }
  }
  const handleCopyTranscript = async () => {
    const transcript = messages
      .map((msg) => `${msg.role === "assistant" ? entityName : "You"}: ${msg.content}`)
      .join("\n\n")
    if (!transcript.trim()) return
    await copyText(transcript, "transcript")
  }
  const handleQuoteIntoComposer = (content: string, messageId: string) => {
    setQuoteAttachment({ content, messageId })
    setQuotedMessageId(messageId)
    if (quotedTimeoutRef.current) window.clearTimeout(quotedTimeoutRef.current)
    quotedTimeoutRef.current = window.setTimeout(() => setQuotedMessageId(null), 1400)
    textareaRef.current?.focus()
  }

  const renderMessageText = (text: string) => <div className="font-sans" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8 }}><ReactMarkdown components={{ p: ({ node, ...props }) => <p className="mt-[12px] first:mt-0" {...props} />, strong: ({ node, ...props }) => <strong style={{ fontWeight: 600, color: "var(--text-1)" }} {...props} />, em: ({ node, ...props }) => <em style={{ fontStyle: "italic", color: "var(--text-1)" }} {...props} /> }}>{text}</ReactMarkdown></div>

  return (
    <div className="flex dashboard-page" style={{ width: "100%", height: "calc(100vh - var(--topbar-h))", overflow: "hidden" }}>
      <div className="flex-1 flex flex-col min-w-0" style={{ margin: "0 auto", maxWidth: "1320px", width: "100%" }}>
        <div className="flex items-center justify-between shrink-0" style={{ minHeight: 64, padding: "0 40px 0 16px", borderBottom: "1px solid var(--border-soft)" }}>
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                title="Return to Project"
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--bg)",
                  border: "1px solid var(--border-soft)",
                  color: "var(--text-3)",
                  cursor: "pointer",
                }}
              >
                <SquareAltArrowLeft size={16} weight="Linear" color="currentColor" />
              </button>
            ) : null}
            {entityImageUrl ? <img src={entityImageUrl} alt={entityName} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-soft)" }} /> : <div className="flex items-center justify-center rounded-full font-serif" style={{ width: 34, height: 34, background: "var(--surface-2)", color: "var(--text-2)", fontSize: 13, fontStyle: "italic", border: "1px solid var(--border-soft)" }}>{initials}</div>}
            <div className="flex items-center gap-2">
              <span className="font-sans" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>{entityName}</span>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", border: "1px solid var(--border-soft)", padding: "4px 9px", borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase" }}>Persona</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={createNewSession} className="font-sans flex items-center gap-2 rounded-lg px-3 py-2 transition-all" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}><PenNewSquare size={14} /><span className="hidden sm:inline">New Session</span></button>
            <button onClick={handleCopyTranscript} className="font-sans flex items-center gap-2 rounded-lg px-3 py-2 transition-all" style={{ fontSize: 13, fontWeight: 500, color: isTranscriptCopied ? "var(--text-1)" : "var(--text-2)", background: isTranscriptCopied ? "rgba(255,255,255,0.05)" : "transparent", border: "1px solid var(--border)", cursor: messages.length ? "pointer" : "default", opacity: messages.length ? 1 : 0.6 }} disabled={!messages.length}>{isTranscriptCopied ? <CheckCircle size={14} color="currentColor" /> : <Copy size={14} color="currentColor" />}<span className="hidden sm:inline">{isTranscriptCopied ? "Copied" : "Copy Chat"}</span></button>
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogTrigger asChild>
                <button className="font-sans flex items-center gap-2 rounded-lg px-3 py-2 transition-all ml-2" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", background: "var(--control-bg)", border: "1px solid var(--border)", cursor: "pointer" }}><History size={14} /><span className="hidden sm:inline">History</span></button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[720px]" style={{ background: "var(--surface-1)", borderColor: "var(--border-soft)", padding: 0, overflow: "hidden" }}>
                <DialogHeader style={{ padding: "26px 28px 18px", borderBottom: "1px solid var(--border-soft)", background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))" }}>
                  <DialogTitle className="font-sans" style={{ fontSize: 20, color: "var(--text-1)", fontWeight: 600 }}>Session history</DialogTitle>
                  <DialogDescription className="font-sans" style={{ color: "var(--text-3)", lineHeight: 1.6 }}>Reopen, rename, or remove past conversations with {entityName}.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[68vh] overflow-y-auto" style={{ padding: "20px 22px 24px" }}>
                  {isLoadingSessions ? <p className="font-mono text-center" style={{ fontSize: 12, color: "var(--text-3)", padding: 28 }}>Loading…</p> : sessions.length === 0 ? <div className="flex flex-col items-center justify-center" style={{ minHeight: 220, gap: 10, border: "1px dashed var(--border-soft)", borderRadius: 18 }}><p className="font-sans" style={{ fontSize: 15, color: "var(--text-2)", fontWeight: 500 }}>No sessions yet</p><p className="font-mono text-center" style={{ fontSize: 12, color: "var(--text-3)" }}>Send a message to start your first conversation.</p></div> : <div className="flex flex-col gap-3">{sessions.map((session) => {
                    const isActive = activeSessionId === session.id
                    const date = new Date(session.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    const isRenaming = renamingSessionId === session.id
                    const isConfirmingDelete = deletingSessionId === session.id
                    return <div key={session.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: isActive ? "rgba(255,255,255,0.12)" : "var(--border-soft)", background: isActive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)" }}>
                      <button onClick={() => { if (!isRenaming) { switchSession(session.id); setIsHistoryOpen(false) } }} className="w-full text-left" style={{ padding: "16px 18px", cursor: "pointer", background: "transparent", border: "none" }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-sans" style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: "var(--text-1)" }}>{isRenaming ? "Rename session" : session.title ?? "Untitled session"}</span>
                              {isActive ? <span className="font-mono" style={{ fontSize: 10, color: "var(--text-2)", border: "1px solid var(--border-soft)", borderRadius: 999, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active</span> : null}
                            </div>
                            {isRenaming ? <input autoFocus defaultValue={session.title ?? ""} onKeyDown={(e) => { if (e.key === "Enter") handleRenameCommit(session.id, e.currentTarget.value); if (e.key === "Escape") setRenamingSessionId(null) }} onBlur={(e) => handleRenameCommit(session.id, e.currentTarget.value)} onClick={(e) => e.stopPropagation()} className="font-sans w-full rounded-xl px-3 py-2" style={{ fontSize: 13, color: "var(--text-1)", background: "var(--surface-1)", border: "1px solid var(--border-soft)", outline: "none", marginTop: 6 }} /> : <div className="font-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>Updated {date}</div>}
                          </div>
                          {!isRenaming ? <div className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>Open</div> : null}
                        </div>
                      </button>
                      <div className="flex items-center justify-end gap-2" style={{ padding: "12px 18px 16px", borderTop: "1px solid var(--border-soft)" }}>
                        <ActionBtn label="Rename" active={isRenaming} onClick={(e) => { e.stopPropagation(); setRenamingSessionId(isRenaming ? null : session.id); setDeletingSessionId(null) }} />
                        <ActionBtn label={isConfirmingDelete ? "Confirm delete" : "Delete"} danger={isConfirmingDelete} onClick={(e) => { e.stopPropagation(); handleDeleteClick(session.id) }} />
                      </div>
                    </div>
                  })}</div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error ? <div className="font-sans flex items-center justify-between mb-2 px-4 py-2 rounded-xl" style={{ fontSize: 12, background: "rgba(220,60,60,0.08)", border: "1px solid rgba(220,60,60,0.2)", color: "#e06060", margin: "16px 40px 0" }}><span>{error}</span><button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>×</button></div> : null}

        <div ref={messagesViewportRef} className="flex-1 overflow-y-auto" style={{ padding: "28px 40px 16px" }}>
          <div className="mx-auto w-full" style={{ maxWidth: 920 }}>
            <div className="flex flex-col" style={{ gap: 34 }}>
              {!isLoadingMessages && messages.length === 0 && activeSessionId ? <div className="flex flex-col items-center justify-center" style={{ gap: 14, color: "var(--text-3)", paddingTop: "10vh", minHeight: "46vh" }}>{entityImageUrl ? <img src={entityImageUrl} alt={entityName} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-soft)" }} /> : <div className="flex items-center justify-center rounded-full font-serif" style={{ width: 60, height: 60, background: "var(--surface-2)", color: "var(--text-2)", fontSize: 22, fontStyle: "italic", border: "1px solid var(--border-soft)" }}>{initials}</div>}<p className="font-sans" style={{ fontSize: 16, fontWeight: 500, color: "var(--text-2)" }}>Start a conversation with {entityName}</p><p className="font-mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Ask questions, test ideas, challenge assumptions</p></div> : null}
              {!activeSessionId && !isLoadingSessions ? <div className="flex flex-col items-center justify-center" style={{ gap: 12, color: "var(--text-3)", paddingTop: "10vh", minHeight: "46vh" }}><p className="font-sans" style={{ fontSize: 15, fontWeight: 500, color: "var(--text-2)" }}>No sessions yet</p><button onClick={createNewSession} className="font-sans px-4 py-2 rounded-xl" style={{ fontSize: 13, background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold)", cursor: "pointer" }}>Start a new session</button></div> : null}
              {isLoadingMessages ? <div style={{ padding: "32px 0", textAlign: "center" }}><span className="font-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>Loading conversation…</span></div> : null}
              {!isLoadingMessages && messages.map((msg) => {
                if (msg.role === "user") return <div key={msg.clientKey || msg.id} className="flex flex-col items-end" style={{ animation: "msg-enter 200ms ease-out" }}><div className="max-w-[78%]" style={{ border: "1px solid var(--border-soft)", borderRadius: 18, padding: "14px 18px", background: "var(--glass-card-bg)" }}>{msg.quoted_content ? <div style={{ marginBottom: 12, border: "1px solid var(--border-soft)", borderRadius: 14, background: "var(--glass-card-bg)", padding: "10px 12px" }}><div className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Quoted reply</div><p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: 0, textAlign: "left", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{msg.quoted_content}</p></div> : null}<div className="font-sans text-right" style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.78 }}>{msg.content}</div></div><div className="flex items-center gap-2 mt-2"><span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{formatTime(msg.created_at)}</span><button type="button" onClick={() => copyText(msg.content, "message", msg.id)} aria-label={copiedMessageId === msg.id ? "Copied" : "Copy message"} title={copiedMessageId === msg.id ? "Copied" : "Copy"} style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: copiedMessageId === msg.id ? "var(--text-1)" : "var(--text-3)", border: "1px solid var(--border-soft)", borderRadius: 999, background: copiedMessageId === msg.id ? "var(--glass-card-bg)" : "transparent", cursor: "pointer" }}>{copiedMessageId === msg.id ? <CheckCircle size={14} color="currentColor" /> : <Copy size={13} color="currentColor" />}</button></div></div>
                const isStreaming = isSending && msg.id === messages.filter((item) => item.role === "assistant").slice(-1)[0]?.id
                return <div key={msg.clientKey || msg.id} className="flex gap-4 w-full" style={{ animation: "msg-enter 200ms ease-out" }}>{entityImageUrl ? <img src={entityImageUrl} alt={entityName} className="shrink-0" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", marginTop: 2, border: "1px solid var(--border-soft)" }} /> : <div className="flex items-center justify-center rounded-full font-serif shrink-0" style={{ width: 28, height: 28, background: "var(--surface-2)", color: "var(--text-2)", fontSize: 11, fontStyle: "italic", marginTop: 2, border: "1px solid var(--border-soft)" }}>{initials}</div>}<div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-2"><span className="font-sans" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{entityName}</span><span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{formatTime(msg.created_at)}</span>{msg.citations?.source === "web_search" || msg.citations?.source === "hybrid" || !!msg.citations?.web_search ? <span className="inline-flex items-center gap-1 font-mono" style={{ fontSize: 10, color: "#7dd3fc", border: "1px solid rgba(125,211,252,0.22)", borderRadius: 999, padding: "3px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}><WebSearchIcon size={10} />Web</span> : null}{msg.citations?.source === "hybrid" || (msg.citations?.source !== "web_search" && !msg.citations?.web_search && !!msg.citations?.results?.length) || !!msg.citations?.knowledge_base ? <span className="inline-flex items-center gap-1 font-mono" style={{ fontSize: 10, color: "#a7f3d0", border: "1px solid rgba(167,243,208,0.24)", borderRadius: 999, padding: "3px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}><KnowledgeBaseIcon size={10} />KB</span> : null}{isStreaming ? <span className="inline-block w-2 h-3 align-middle" style={{ background: "var(--text-3)", animation: "typewriter 0.9s ease-in-out infinite" }} /> : null}</div>{isSending && msg.content === "" ? <div className="flex items-center gap-1.5" style={{ paddingTop: 4 }}>{[0, 1, 2].map((i) => <span key={i} style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--text-3)", opacity: 0.5, animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}</div> : <div style={{ maxWidth: 760, paddingRight: 8 }}>{renderMessageText(msg.content)}</div>}{!isStreaming && msg.content ? <div className="flex items-center gap-2 mt-3"><button type="button" onClick={() => copyText(msg.content, "message", msg.id)} aria-label={copiedMessageId === msg.id ? "Copied" : "Copy reply"} title={copiedMessageId === msg.id ? "Copied" : "Copy"} style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: copiedMessageId === msg.id ? "var(--text-1)" : "var(--text-3)", border: "1px solid var(--border-soft)", borderRadius: 999, background: copiedMessageId === msg.id ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer" }}>{copiedMessageId === msg.id ? <CheckCircle size={14} color="currentColor" /> : <Copy size={13} color="currentColor" />}</button><button type="button" onClick={() => handleQuoteIntoComposer(msg.content, msg.id)} aria-label={quotedMessageId === msg.id ? "Quoted" : "Quote reply"} title={quotedMessageId === msg.id ? "Quoted" : "Quote"} style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: quotedMessageId === msg.id ? "var(--text-1)" : "var(--text-3)", border: "1px solid var(--border-soft)", borderRadius: 999, background: quotedMessageId === msg.id ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer" }}>{quotedMessageId === msg.id ? <CheckCircle size={14} color="currentColor" /> : <Reply2 size={13} color="currentColor" />}</button></div> : null}</div></div>
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="shrink-0" style={{ padding: "12px 40px 28px" }}>
          <div className="mx-auto w-full" style={{ maxWidth: 860 }}>
            {quoteAttachment ? <div style={{ marginBottom: 10, border: "1px solid var(--border-soft)", borderRadius: 16, background: "var(--glass-card-bg)", padding: "12px 14px" }}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="font-mono" style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Quoted reply</div><p className="font-sans" style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{quoteAttachment.content}</p></div><button type="button" onClick={() => setQuoteAttachment(null)} aria-label="Remove quote" title="Remove quote" style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", border: "1px solid var(--border-soft)", borderRadius: 999, background: "transparent", cursor: "pointer", flexShrink: 0 }}><CloseSquare size={14} color="currentColor" /></button></div></div> : null}
            <div
              className="relative"
              style={{
                minHeight: COMPOSER_BASE_HEIGHT,
                borderRadius: 24,
                background: "var(--glass-card-bg)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div ref={composerMenuRef} style={{ position: "absolute", left: 18, bottom: 16, display: "flex", alignItems: "center", gap: 10, zIndex: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSlashTriggeredMenu(false)
                    setIsComposerMenuOpen((open) => !open)
                  }}
                  disabled={isSending}
                  aria-label="Open chat tools"
                  style={{
                    width: 34,
                    height: 34,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: isComposerMenuOpen ? "rgba(255,255,255,0.08)" : "transparent",
                    color: "var(--text-2)",
                    cursor: isSending ? "default" : "pointer",
                  }}
                >
                  <ComposerPlusIcon />
                </button>
                {useWebSearch ? (
                  <span
                    className="group inline-flex items-center gap-2"
                    style={{
                      height: 34,
                      padding: "0 12px",
                      borderRadius: 999,
                      color: "var(--text-1)",
                      background: "rgba(56,189,248,0.18)",
                      border: "1px solid rgba(14,165,233,0.45)",
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setUseWebSearch(false)}
                      aria-label="Disable web search"
                      title="Disable web search"
                      className="relative inline-flex items-center justify-center"
                      style={{
                        width: 16,
                        height: 16,
                        border: "none",
                        background: "transparent",
                        color: "#0ea5e9",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <span className="transition-opacity group-hover:opacity-0">
                        <WebSearchIcon size={14} />
                      </span>
                      <span
                        className="absolute opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ lineHeight: 1, fontSize: 12, fontWeight: 700 }}
                      >
                        ×
                      </span>
                    </button>
                    <span className="font-sans">Web search</span>
                  </span>
                ) : null}
                {useKnowledgeBase ? (
                  <span
                    className="group inline-flex items-center gap-2"
                    style={{
                      height: 34,
                      padding: "0 12px",
                      borderRadius: 999,
                      color: "var(--text-1)",
                      background: "rgba(16,185,129,0.18)",
                      border: "1px solid rgba(5,150,105,0.45)",
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setUseKnowledgeBase(false)}
                      aria-label="Disable knowledge base"
                      title="Disable knowledge base"
                      className="relative inline-flex items-center justify-center"
                      style={{
                        width: 16,
                        height: 16,
                        border: "none",
                        background: "transparent",
                        color: "#059669",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <span className="transition-opacity group-hover:opacity-0">
                        <KnowledgeBaseIcon size={14} />
                      </span>
                      <span
                        className="absolute opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ lineHeight: 1, fontSize: 12, fontWeight: 700 }}
                      >
                        ×
                      </span>
                    </button>
                    <span className="font-sans">Knowledge base</span>
                  </span>
                ) : null}
                {isComposerMenuOpen ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      // Slash trigger should keep the input text visible; push menu above composer.
                      bottom: isSlashTriggeredMenu ? 112 : 46,
                      minWidth: 170,
                      borderRadius: 12,
                      border: "1px solid var(--border-soft)",
                      background: "var(--surface-1)",
                      boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
                      padding: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        consumeSlashTrigger()
                        setUseWebSearch((value) => !value)
                        setIsComposerMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-between gap-3"
                      style={{
                        border: "none",
                        background: "transparent",
                        borderRadius: 10,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: "var(--text-1)",
                        borderColor: useWebSearch ? "rgba(125,211,252,0.30)" : "transparent",
                        borderStyle: "solid",
                        borderWidth: 1,
                        transition: "background 160ms ease, border-color 160ms ease",
                      }}
                    >
                      <span className="flex items-center gap-3" style={{ whiteSpace: "nowrap" }}>
                        <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: 999, color: "#7dd3fc", background: "transparent", border: "1px solid var(--border-soft)" }}>
                          <WebSearchIcon size={11} />
                        </span>
                        <span className="font-sans" style={{ display: "block", fontSize: 13, fontWeight: 600, textAlign: "left" }}>Web search</span>
                      </span>
                    </button>
                    <div style={{ margin: "4px 6px", borderTop: "1px solid var(--border-soft)", opacity: 0.8 }} />
                    <button
                      type="button"
                      onClick={() => {
                        consumeSlashTrigger()
                        setUseKnowledgeBase((value) => !value)
                        setIsComposerMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-between gap-3"
                      style={{
                        border: "none",
                        background: "transparent",
                        borderRadius: 10,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: "var(--text-1)",
                        borderColor: useKnowledgeBase ? "rgba(167,243,208,0.30)" : "transparent",
                        borderStyle: "solid",
                        borderWidth: 1,
                        transition: "background 160ms ease, border-color 160ms ease",
                      }}
                    >
                      <span className="flex items-center gap-3" style={{ whiteSpace: "nowrap" }}>
                        <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: 999, color: "#a7f3d0", background: "transparent", border: "1px solid var(--border-soft)" }}>
                          <KnowledgeBaseIcon size={11} />
                        </span>
                        <span className="font-sans" style={{ display: "block", fontSize: 13, fontWeight: 600, textAlign: "left" }}>Knowledge base</span>
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${entityName} anything…`}
                disabled={isSending}
                rows={1}
                className="w-full font-sans resize-none"
                style={{
                  height: COMPOSER_BASE_HEIGHT,
                  minHeight: COMPOSER_BASE_HEIGHT,
                  maxHeight: COMPOSER_MAX_HEIGHT,
                  overflowY: "auto",
                  background: "transparent",
                  border: "none",
                  borderRadius: 24,
                  padding: "18px 74px 56px 22px",
                  fontSize: 15,
                  color: "var(--text-1)",
                  lineHeight: 1.55,
                  outline: "none",
                  opacity: isSending ? 0.6 : 1,
                  transition: "height 140ms ease",
                }}
              />
              <div style={{ position: "absolute", right: 18, bottom: 16 }}>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="flex items-center justify-center rounded-full transition-all border-none"
                  style={{
                    width: 42,
                    height: 42,
                    background: input.trim() && !isSending ? "var(--surface-1)" : "var(--surface-2)",
                    color: input.trim() && !isSending ? "var(--text-1)" : "var(--text-3)",
                    cursor: input.trim() && !isSending ? "pointer" : "default",
                  }}
                  aria-label="Send message"
                >
                  {isSending ? <Refresh size={14} style={{ animation: "spin 1s linear infinite", opacity: 0.6 }} /> : <Plain2 size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
