import { createHmac, timingSafeEqual } from "node:crypto"

export function signActivity(timestamp: string, body: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex")
}

export function verifyActivitySignature(
  timestamp: string,
  body: string,
  signature: string,
  secret: string
) {
  const expected = Buffer.from(signActivity(timestamp, body, secret), "hex")
  const received = Buffer.from(signature, "hex")
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  )
}

export function isFreshTimestamp(timestamp: string, now = Date.now()) {
  const parsed = Date.parse(timestamp)
  return Number.isFinite(parsed) && Math.abs(now - parsed) <= 5 * 60_000
}
