"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(
    () => setDark(document.documentElement.classList.contains("dark")),
    []
  )

  function toggleTheme() {
    const next = !dark
    document.documentElement.classList.toggle("dark", next)
    localStorage.theme = next ? "dark" : "light"
    setDark(next)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Use ${dark ? "light" : "dark"} theme`}
          onClick={toggleTheme}
          className="rounded-full"
        >
          {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dark ? "Light theme" : "Dark theme"}</TooltipContent>
    </Tooltip>
  )
}
