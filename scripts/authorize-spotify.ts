import { mkdir, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { resolve } from "node:path"
import { z } from "zod"

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const code = process.env.SPOTIFY_AUTH_CODE
const redirectUri =
  process.env.SPOTIFY_REDIRECT_URI ?? "http://127.0.0.1:8888/callback"

if (!clientId || !clientSecret)
  throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required")

if (!code) {
  const url = new URL("https://accounts.spotify.com/authorize")
  url.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-read-currently-playing user-read-recently-played",
  }).toString()
  console.log(
    `Open this URL, authorize, then copy the code query parameter from the callback URL:\n\n${url}\n\nRun again with SPOTIFY_AUTH_CODE set.`
  )
} else {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!response.ok)
    throw new Error(
      `Spotify token exchange failed with HTTP ${response.status}`
    )
  const token = z
    .object({ refresh_token: z.string().min(1) })
    .parse(await response.json())
  const directory = resolve(homedir(), ".config/krishna-portfolio")
  const target = resolve(directory, "spotify-refresh-token")
  await mkdir(directory, { recursive: true })
  await writeFile(target, token.refresh_token, { mode: 0o600 })
  console.log(`Spotify refresh token written to ${target} with mode 0600.`)
}
