"use client"

import { useEffect } from "react"

export function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = globalThis.localStorage.getItem("mimic.theme")
    const resolvedTheme = savedTheme === "dark" ? "dark" : "light"
    globalThis.document.documentElement.dataset.theme = resolvedTheme
  }, [])

  return null
}
