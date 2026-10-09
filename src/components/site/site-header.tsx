"use client"

import { Menu } from "lucide-react"
import { useEffect, useState } from "react"

import { ThemeToggle } from "@/components/site/theme-toggle"
import { XrayToggle } from "@/components/site/xray-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { site } from "@/content/site"
import { cn } from "@/lib/utils"

const links = [
  ["Work", "#work"],
  ["Activity", "#activity"],
  ["Projects", "#projects"],
  ["Writing", "#writing"],
  ["Resume", "/resume"],
] as const

// Bare "#id" only resolves on the home page; "/#id" works from any route.
function toHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href
}

function useActiveSection() {
  const [activeHref, setActiveHref] = useState<string | null>(null)

  useEffect(() => {
    const sections = links
      .filter(([, href]) => href.startsWith("#"))
      .map(([, href]) => document.getElementById(href.slice(1)))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) setActiveHref(`#${visible[0].target.id}`)
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return activeHref
}

export function SiteHeader() {
  const activeHref = useActiveSection()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-stretch">
        <a
          href="/"
          className="logo-cursor flex items-center px-5 font-mono text-base font-semibold tracking-tight sm:px-8"
        >
          <span className="text-primary">~/</span>
          {site.shortName}
        </a>
        <nav
          aria-label="Primary navigation"
          className="ml-auto hidden items-stretch lg:flex"
        >
          {links.map(([label, href], index) => {
            const isActive = href === activeHref
            return (
              <a
                key={href}
                href={toHref(href)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group flex items-center px-5 font-mono text-base transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "mr-2 text-xs transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  0{index + 1}
                </span>
                {label}
              </a>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center lg:ml-0">
          <XrayToggle />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-full lg:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full rounded-none bg-background p-0 sm:max-w-sm">
              <SheetTitle className="border-b p-6 font-mono text-sm">
                {site.shortName}
              </SheetTitle>
              <nav aria-label="Mobile navigation" className="grid">
                {links.map(([label, href], index) => {
                  const isActive = href === activeHref
                  return (
                    <a
                      key={href}
                      href={toHref(href)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex min-h-11 items-center border-b p-6 font-mono text-lg transition-colors",
                        isActive ? "text-foreground" : undefined
                      )}
                    >
                      <span
                        className={cn(
                          "mr-4 text-xs",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        0{index + 1}
                      </span>
                      {label}
                    </a>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
