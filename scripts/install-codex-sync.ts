import { execFileSync } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, resolve } from "node:path"

const secret = process.env.CODEX_SYNC_SECRET

const home = homedir()
const project = resolve(".")
const config =
  process.env.CODEX_SYNC_CONFIG ?? resolve("scripts/codex-sync.config.json")
const pnpm = execFileSync("which", ["pnpm"], { encoding: "utf8" }).trim()
const opencode = execFileSync("which", ["opencode"], {
  encoding: "utf8",
}).trim()
const launchAgents = resolve(home, "Library/LaunchAgents")
const logs = resolve(home, ".codex/logs")
const target = resolve(launchAgents, "com.krishnakumar.codex-sync.plist")

await mkdir(launchAgents, { recursive: true })
await mkdir(logs, { recursive: true })
if (secret) {
  execFileSync(
    "security",
    [
      "add-generic-password",
      "-U",
      "-a",
      "codex-sync",
      "-s",
      "portfolio-sync-secret",
      "-w",
      secret,
    ],
    { stdio: "ignore" }
  )
} else {
  try {
    execFileSync(
      "security",
      [
        "find-generic-password",
        "-a",
        "codex-sync",
        "-s",
        "portfolio-sync-secret",
      ],
      { stdio: "ignore" }
    )
  } catch {
    throw new Error(
      "CODEX_SYNC_SECRET is required when no signing secret exists in Keychain"
    )
  }
}
await writeFile(target, plist({ project, config, pnpm, opencode, logs }), {
  mode: 0o600,
})
console.log(
  `${secret ? "Stored the signing secret in Keychain and wrote" : "Reused the signing secret in Keychain and wrote"} ${target}\nRun: launchctl load ${target}`
)

function plist(
  values: Record<"project" | "config" | "pnpm" | "opencode" | "logs", string>
) {
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.krishnakumar.codex-sync</string>
  <key>ProgramArguments</key><array><string>${escape(values.pnpm)}</string><string>--dir</string><string>${escape(values.project)}</string><string>codex:sync</string></array>
  <key>EnvironmentVariables</key><dict>
    <key>CODEX_SYNC_CONFIG</key><string>${escape(values.config)}</string>
    <key>OPENCODE_BIN</key><string>${escape(values.opencode)}</string>
    <key>PATH</key><string>${escape(`${resolve(home, ".local/bin")}:${dirname(values.opencode)}:${dirname(values.pnpm)}:/usr/local/bin:/usr/bin:/bin`)}</string>
  </dict>
  <key>StartInterval</key><integer>3600</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>${escape(resolve(values.logs, "portfolio-sync.log"))}</string>
  <key>StandardErrorPath</key><string>${escape(resolve(values.logs, "portfolio-sync-error.log"))}</string>
</dict></plist>\n`
}
