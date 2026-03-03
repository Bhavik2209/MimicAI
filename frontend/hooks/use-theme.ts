"use client"

import { useState, useEffect, useCallback } from "react"

export function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("light")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mimic.theme") : null
    if (stored === "dark") {
      setThemeState("dark")
      document.documentElement.setAttribute("data-theme", "dark")
    } else if (stored === "light") {
      setThemeState("light")
      document.documentElement.setAttribute("data-theme", "light")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
    }
  }, [])

  const setTheme = useCallback((t: "dark" | "light") => {
    setThemeState(t)
    document.documentElement.setAttribute("data-theme", t)
    if (typeof window !== "undefined") localStorage.setItem("mimic.theme", t)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme }
}
