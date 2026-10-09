import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { z } from "zod"

import { tokenUsageProfileSchema } from "./openai-profile.schema"
import type { TokenUsageProfile } from "./openai-profile.schema"

const execFileAsync = promisify(execFile)
const rpcEnvelopeSchema = z.object({ output: tokenUsageProfileSchema })
const rpcErrorSchema = z.object({
  type: z.string().optional(),
  message: z.string().optional(),
})

type CommandResult = { stdout: string }
type CommandRunner = (
  executable: string,
  args: readonly string[]
) => Promise<CommandResult>

export async function fetchActiveOpenCodeProfile(
  executable = process.env.OPENCODE_BIN ?? "opencode",
  run: CommandRunner = runCommand
): Promise<TokenUsageProfile> {
  try {
    const { stdout } = await run(executable, [
      "api",
      "post",
      "/api/rpc/local.openai-usage/activity",
      "--data",
      '{"input":{}}',
    ])
    return parseOpenCodeActivityOutput(stdout)
  } catch (error) {
    throw new Error(`OpenCode activity RPC failed: ${commandFailure(error)}`)
  }
}

export function parseOpenCodeActivityOutput(output: string): TokenUsageProfile {
  let input: unknown
  try {
    input = JSON.parse(output)
  } catch {
    throw new Error("OpenCode returned invalid JSON")
  }

  const result = rpcEnvelopeSchema.safeParse(input)
  if (!result.success) throw new Error("OpenCode returned malformed activity")
  return result.data.output
}

export function commandFailure(error: unknown) {
  if (!(error instanceof Error)) return "unknown command failure"

  const commandError = error as Error & {
    code?: string | number
    stderr?: string
    stdout?: string
  }
  const details: string[] = []
  if (commandError.stdout) {
    try {
      const parsed = rpcErrorSchema.safeParse(JSON.parse(commandError.stdout))
      if (parsed.success) {
        if (parsed.data.type) details.push(parsed.data.type)
        if (parsed.data.message) details.push(parsed.data.message)
      }
    } catch {
      // Command stdout may contain non-JSON diagnostics. Never echo it because
      // an integration command could accidentally include credential data.
    }
  }
  if (commandError.stderr?.trim()) details.push(commandError.stderr.trim())
  if (!details.length && commandError.code !== undefined)
    details.push(`exit code ${commandError.code}`)
  if (!details.length) details.push(commandError.message)
  return redactSecrets(details.join(": ")).slice(0, 500)
}

async function runCommand(executable: string, args: readonly string[]) {
  const { stdout } = await execFileAsync(executable, [...args], {
    timeout: 30_000,
    killSignal: "SIGTERM",
    maxBuffer: 1_000_000,
  })
  return { stdout }
}

function redactSecrets(input: string) {
  return input
    .replace(/Bearer\s+[^\s"']+/gi, "Bearer [redacted]")
    .replace(
      /(["']?(?:access|refresh|accessToken|refreshToken|access_token|refresh_token)["']?\s*[:=]\s*["'])[^"']+(["'])/gi,
      "$1[redacted]$2"
    )
}
