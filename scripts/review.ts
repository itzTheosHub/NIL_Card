import Anthropic from "@anthropic-ai/sdk"
import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

async function getChangedFiles(): Promise<string[]> {
    const output = execSync("git diff --name-only HEAD").toString().trim()
    const staged = execSync("git diff --cached --name-only").toString().trim()
    const combined = [...new Set([...output.split("\n"), ...staged.split("\n")])]
    const isUI = (f: string) => f.match(/\.(tsx?|jsx?)$/) && f.trim() !== "" && !f.includes("/api/")
    const current = combined.filter(isUI)

    if (current.length > 0) return current

    // fallback: review files changed in the last commit
    console.log("No uncommitted changes — reviewing last commit instead.\n")
    const lastCommit = execSync("git diff HEAD~1 --name-only").toString().trim()
    return lastCommit.split("\n").filter(isUI)
}

  async function reviewFile(filePath: string): Promise<{ filePath: string, text: string, hasIssues: boolean, status: string }> {
      const content = fs.readFileSync(filePath, "utf-8")

      const response = await client.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 1024,
          system: `You are a code reviewer for a Next.js 16 + Supabase + TypeScript app called NIL Card.

                Review the file for these specific issues:
                    1. Null safety — nullable DB fields (number | null, string | null) passed to
                    functions expecting non-null
                    2. Broken JSX — unclosed tags, missing fragments, invalid nesting
                    3. TypeScript errors — type mismatches, missing types on props
                    4. React patterns — missing keys, stale closures in useEffect, wrong dependency      
                    arrays
                    5. Supabase patterns — unhandled errors, wrong table/column names based on context   

                Be concise. Only report real issues. If the file looks clean, say "✅ No issues      
                found."
                Format: one bullet per issue with file:line if possible.`,
          messages: [
              {
                  role: "user",
                  content: `Review this file:
  ${filePath}\n\n\`\`\`tsx\n${content}\n\`\`\``
              }
          ]
      })

      const text = response.content[0].type === "text" ? response.content[0].text : ""
      const hasIssues = !text.includes("✅ No issues found")
      const status = hasIssues ? "⚠️  Issues found" : "✅ Clean"
      return { filePath, text, hasIssues, status }
  }

  async function main() {
      const files = await getChangedFiles()

      if (files.length === 0) {
          console.log("No changed TypeScript/React files to review.")
          return
      }

      console.log(`Reviewing ${files.length} changed file(s)...\n`)

      const results = await Promise.all(files.map(reviewFile))

      // Summary header
      results.forEach(r => {
          console.log(`${r.status}  ${r.filePath}`)
      })

      console.log("")

      // Full output for files with issues only
      results.filter(r => r.hasIssues).forEach(r => {
          console.log(`\n## ${r.filePath}\n${r.text}`)
      })

      const issueCount = results.filter(r => r.hasIssues).length
      if (issueCount === 0) {
          console.log("All files passed review.")
      } else {
          console.log(`\n${issueCount} file(s) need attention.`)
      }
  }

  main().catch(console.error)