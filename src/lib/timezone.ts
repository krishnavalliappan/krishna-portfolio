const OFFSET_PATTERN = /GMT([+-])(\d{1,2})(?::(\d{2}))?/

/**
 * Derives a "UTC ±HH:MM" label for an IANA time zone at a given instant,
 * accounting for DST rather than hardcoding a fixed offset.
 */
export function getUtcOffsetLabel(
  timeZone = "America/Toronto",
  date: Date = new Date()
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date)

  const timeZoneName = parts.find((part) => part.type === "timeZoneName")
  const match = timeZoneName?.value.match(OFFSET_PATTERN)
  if (!match) return "UTC +00:00"

  const [, sign, hours, minutes = "00"] = match
  return `UTC ${sign}${hours.padStart(2, "0")}:${minutes}`
}

function getOffsetMinutes(timeZone: string, date: Date): number | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date)

  const timeZoneName = parts.find((part) => part.type === "timeZoneName")?.value
  if (timeZoneName === "GMT") return 0

  const match = timeZoneName?.match(OFFSET_PATTERN)
  if (!match) return null

  const [, sign, hours, minutes = "00"] = match
  const offset = Number(hours) * 60 + Number(minutes)
  return sign === "+" ? offset : -offset
}

export function getViewerOffsetDelta(
  viewerTimeZone: string,
  timeZone = "America/Toronto",
  date: Date = new Date()
): string | null {
  const viewerOffset = getOffsetMinutes(viewerTimeZone, date)
  const timeZoneOffset = getOffsetMinutes(timeZone, date)
  if (viewerOffset === null || timeZoneOffset === null) return null

  const delta = timeZoneOffset - viewerOffset
  if (delta === 0) return null

  const absoluteMinutes = Math.abs(delta)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60
  const duration = `${hours ? `${hours}h` : ""}${minutes ? `${hours ? " " : ""}${minutes}m` : ""}`
  return `${duration} ${delta > 0 ? "ahead of" : "behind"} you`
}
