import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const url = process.env.RESUME_URL ?? "http://localhost:3000/resume"
const browser = await chromium.launch()

try {
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "load" })
  await page.evaluate(() => document.fonts.ready)
  await mkdir("public", { recursive: true })
  await page.pdf({
    path: "public/resume.pdf",
    format: "Letter",
    printBackground: true,
    margin: {
      top: "0.45in",
      right: "0.45in",
      bottom: "0.45in",
      left: "0.45in",
    },
  })
  console.log(`Generated public/resume.pdf from ${url}`)
} finally {
  await browser.close()
}
