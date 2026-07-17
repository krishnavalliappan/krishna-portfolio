"use client"

import { ScanLine } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function XrayToggle() {
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("portfolio:xray") === "on"
    document.body.classList.toggle("xray", saved)
    setActive(saved)
    setMounted(true)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${active ? "Disable" : "Enable"} layout x-ray`}
          aria-pressed={active}
          disabled={!mounted}
          onClick={() => {
            document.body.classList.toggle("xray", !active)
            localStorage.setItem("portfolio:xray", !active ? "on" : "off")
            setActive(!active)
          }}
          className="rounded-full"
        >
          <ScanLine aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Layout x-ray</TooltipContent>
    </Tooltip>
  )
}
