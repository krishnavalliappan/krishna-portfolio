"use client"

import { Eraser } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

const storageKey = () =>
  `portfolio-scratchpad:${new Date().toISOString().slice(0, 10)}`

export function DrawingPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [warning, setWarning] = useState("")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * ratio
    canvas.height = 220 * ratio
    const context = canvas.getContext("2d")
    if (!context) return
    context.scale(ratio, ratio)
    context.lineWidth = 2
    context.lineCap = "square"
    context.strokeStyle = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--primary")

    try {
      const saved = localStorage.getItem(storageKey())
      if (saved) {
        const image = new Image()
        image.onload = () =>
          context.drawImage(image, 0, 0, canvas.clientWidth, 220)
        image.src = saved
      }
    } catch {
      setWarning("Local storage is unavailable; this drawing will not persist.")
    }
  }, [])

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = event.currentTarget.getContext("2d")
    if (!context) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x, y } = point(event)
    context.beginPath()
    context.moveTo(x, y)
    drawing.current = true
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const context = event.currentTarget.getContext("2d")
    if (!context) return
    const { x, y } = point(event)
    context.lineTo(x, y)
    context.stroke()
  }

  function stop() {
    drawing.current = false
    try {
      if (canvasRef.current)
        localStorage.setItem(storageKey(), canvasRef.current.toDataURL())
    } catch {
      setWarning("Local storage is unavailable; this drawing will not persist.")
    }
  }

  function clear() {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    try {
      localStorage.removeItem(storageKey())
    } catch {
      setWarning("Local storage could not be cleared.")
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-medium">scratchpad.local</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Draw here. Saved only in this browser for today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          className="rounded-none font-mono text-xs"
        >
          <Eraser className="size-3" /> Clear
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[220px] w-full touch-none border bg-background/50"
        aria-label="Local drawing scratchpad"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
      {warning && (
        <p role="status" className="mt-2 text-xs text-destructive">
          {warning}
        </p>
      )}
    </div>
  )
}
