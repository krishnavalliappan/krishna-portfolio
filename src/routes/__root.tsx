import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { inject } from "@vercel/analytics"
import { useEffect } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { site } from "@/content/site"

import ibmPlexSansLatinWoff2 from "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url"
import ibmPlexSansCss from "@fontsource-variable/ibm-plex-sans/wght.css?url"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: site.title },
      { name: "description", content: site.description },
      { name: "theme-color", content: "#0b130e" },
      { property: "og:title", content: site.title },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.krishnakumar.dev/og.svg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "preload",
        href: ibmPlexSansLatinWoff2,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: ibmPlexSansCss },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "canonical", href: site.website },
    ],
  }),
  notFoundComponent: () => (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow mb-4">ERR_ROUTE_NOT_FOUND</p>
        <h1 className="font-mono text-7xl font-semibold">404</h1>
        <a className="mt-8 inline-block border-b font-mono text-sm" href="/">
          cd /home
        </a>
      </div>
    </main>
  ),
  shellComponent: RootDocument,
})

const themeScript = `try{document.documentElement.classList.toggle('dark',localStorage.theme!=='light')}catch(e){document.documentElement.classList.add('dark')}`

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="visually-hidden">
          Skip to content
        </a>
        <TooltipProvider>{children}</TooltipProvider>
        <VercelAnalytics />
        <Scripts />
      </body>
    </html>
  )
}

function VercelAnalytics() {
  useEffect(() => inject(), [])
  return null
}
