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

    console.log("No uncommitted changes — checking last commit instead.\n")
    const lastCommit = execSync("git diff HEAD~1 --name-only").toString().trim()
    return lastCommit.split("\n").filter(isUI)
}

async function checkMobile(filePath: string): Promise<string> {
    const content = fs.readFileSync(filePath, "utf-8")

    const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system: `You are a mobile responsiveness reviewer for a Next.js + Tailwind CSS app.

                    Check for these issues:
                    1. Fixed widths (w-[Npx], w-96, etc.) without responsive overrides that will overflow on mobile
                    2. Layout elements missing sm:/md: breakpoints (flex rows that should stack, grids that need fewer columns)
                    3. Text too large on mobile (text-4xl+ without responsive scaling)
                    4. Buttons or tap targets smaller than 44px (too small to tap on touch screens)
                    5. Hardcoded padding/margin that clips content on small screens
                    6. Horizontal overflow risks (long strings, wide tables, no overflow-x-hidden)

                    Only flag real issues — ignore things already using responsive classes correctly.
                    If the file looks clean, say "✅ No mobile issues found."
                    Format: one bullet per issue with the Tailwind class and line number if possible.`,
        messages: [
            {
                role: "user",
                content: `Check this file for mobile responsiveness issues: ${filePath}\n\n\`\`\`tsx\n${content}\n\`\`\``
            }
        ]
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    return `\n## ${filePath}\n${text}`
}

async function main() {
    const files = await getChangedFiles()

    if (files.length === 0) {
        console.log("No TypeScript/React files to check.")
        return
    }

    console.log(`Checking mobile responsiveness of ${files.length} file(s)...\n`)

    const results = await Promise.all(files.map(checkMobile))
    results.forEach(r => console.log(r))
}

main().catch(console.error)
