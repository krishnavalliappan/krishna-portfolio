import { expect, test } from "@playwright/test"

test("home page exposes the primary portfolio content", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Krishnakumar\s*Valliappan/
  )
  await expect(
    page.getByRole("link", { name: "Resume", exact: true })
  ).toBeVisible()
})

test("x-ray preference persists without blocking the page", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Enable layout x-ray" }).click()
  await expect(page.locator("body")).toHaveClass(/xray/)
  await page.reload()
  await expect(page.locator("body")).toHaveClass(/xray/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})

test("resume representations share the public profile", async ({
  page,
  request,
}) => {
  await page.goto("/resume")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Krishnakumar Valliappan"
  )

  const text = await request.get("/resume.txt")
  expect(await text.text()).toContain("KRISHNAKUMAR VALLIAPPAN")

  const json = await request.get("/resume.json")
  expect((await json.json()).profile.name).toBe("Krishnakumar Valliappan")

  const pdf = await request.get("/resume.pdf")
  expect(pdf.headers()["content-type"]).toBe("application/pdf")
})
