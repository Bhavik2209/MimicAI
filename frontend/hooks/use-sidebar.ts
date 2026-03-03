"use client"

import { useState, useCallback } from "react"

export function useSidebar() {
  const [expanded, setExpanded] = useState(true)

  const toggle = useCallback(() => setExpanded((e) => !e), [])
  const collapse = useCallback(() => setExpanded(false), [])
  const expand = useCallback(() => setExpanded(true), [])

  return { expanded, toggle, collapse, expand }
}
