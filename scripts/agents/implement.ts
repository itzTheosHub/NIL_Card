import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

const LEGACY_BUILD_STEPS = [
    "Add DB columns to profiles table (Supabase migration)",
    "Add env vars to .env.local and Vercel",
    "Build /api/phyllo/create-user route",
    "Build /api/phyllo/create-token route",
    "Install Phyllo SDK, add connect buttons to ProfileForm",
    "Build /api/phyllo/webhook route",
    "Build /api/phyllo/disconnect route",
    "Wire up connected state UI (checkmark, refresh, disconnect)",
    "Build GET /api/phyllo/stats route",
    "Add polling loop in usePhylloConnect onAccountConnected",
    "Fix create-user route for new users with no profile",
    "Thread phylloUserId through form submit on create page",
    "Test end-to-end on staging",
]

function getPrdSlug(prdPath: string): string {
    return path.basename(prdPath, ".md").replace(/^PRD-/, "")
}

// Extract all file paths mentioned in a string (backtick-quoted or plain paths)
function extractFilePaths(text: string): Set<string> {
    const paths = new Set<string>()
    // Backtick-quoted paths: `path/to/file.tsx`
    const backtickRegex = /`([\w\-/.]+\.(tsx?|ts|css|sql))`/g
    let m
    while ((m = backtickRegex.exec(text)) !== null) paths.add(m[1])
    // Unquoted paths that look like file paths: components/Foo.tsx, app/bar/page.tsx
    const plainRegex = /\b((?:components|app|hooks|lib|scripts|styles|docs)\/[\w\-/.]+\.(tsx?|ts|css))\b/g
    while ((m = plainRegex.exec(text)) !== null) paths.add(m[1])
    return paths
}

// Build context string for a set of file paths, separating new vs. existing
function buildFileContext(paths: Set<string>): {
    existingContext: string
    newFilePaths: string[]
    existingFilePaths: string[]
} {
    const existingFilePaths: string[] = []
    const newFilePaths: string[] = []
    let existingContext = ""

    for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8")
            existingContext += `\n### EXISTING FILE — ${filePath}\n\`\`\`\n${content}\n\`\`\`\n`
            existingFilePaths.push(filePath)
            console.log(`📄 Injecting existing file: ${filePath}`)
        } else {
            newFilePaths.push(filePath)
            console.log(`🆕 New file (create from scratch): ${filePath}`)
        }
    }

    return { existingContext, newFilePaths, existingFilePaths }
}

async function runImplement(
    slug: string,
    stepNumber: number,
    plan: string,
    prdContent: string,
    label: string
) {
    // Extract file paths from BOTH the plan and the PRD
    const allPaths = new Set([
        ...extractFilePaths(plan),
        ...extractFilePaths(prdContent),
    ])

    const { existingContext, newFilePaths, existingFilePaths } = buildFileContext(allPaths)

    const fileClassification = [
        existingFilePaths.length > 0
            ? `FILES THAT ALREADY EXIST ON DISK (preserve ALL existing content — only add/modify what the plan describes):\n${existingFilePaths.map(f => `  - ${f}`).join("\n")}`
            : "",
        newFilePaths.length > 0
            ? `FILES THAT DO NOT EXIST YET (create from scratch):\n${newFilePaths.map(f => `  - ${f}`).join("\n")}`
            : "",
    ].filter(Boolean).join("\n\n")

    const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 16000,
        system: `You are a senior engineer implementing a feature for NIL Card — a Next.js 16 + Supabase + TypeScript app.

You are given an implementation plan and existing file contents. Output every file that needs to be written using this exact format:

FILE: <full relative file path>
\`\`\`
<complete file content>
\`\`\`

Critical rules:
- For EXISTING files: output the COMPLETE file with ALL original content preserved. Never truncate, never omit existing sections. Only add or change what the plan specifically describes.
- For NEW files: output the complete file content from scratch.
- Do not include SQL, npm commands, or explanations inside file blocks — put those in a NOTES section at the end.
- Use the exact class names, shadow values, and patterns from any reference code provided.
- No shadcn/ui imports — use plain Tailwind + lucide-react only.`,
        messages: [
            {
                role: "user",
                content: `Implementation plan for ${label}:\n\n${plan}\n\n---\n\n${fileClassification}\n\n${existingContext}\n\nOutput every file that needs to be written.`,
            },
        ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    const fileRegex = /FILE: (.+?)\n```(?:\w+)?\n([\s\S]+?)```/g
    let match
    let filesWritten = 0

    while ((match = fileRegex.exec(text)) !== null) {
        const filePath = match[1].trim()
        const content = match[2]
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filePath, content)
        console.log(`✅ Written: ${filePath}`)
        filesWritten++
    }

    if (filesWritten === 0) {
        console.log("No files extracted. Full output:")
        console.log(text)
    }

    const outputFile = `scripts/agents/output/${slug}-step-${stepNumber}-implemented.md`
    fs.writeFileSync(outputFile, text)
    console.log(`\n${filesWritten} file(s) written.`)
    console.log(`Full output saved to ${outputFile}`)

    return filesWritten
}

async function main() {
    const firstArg = process.argv[2]
    const secondArg = process.argv[3]

    // New mode: first arg is a PRD file path
    if (firstArg && firstArg.endsWith(".md")) {
        const prdPath = firstArg
        const stepNumber = secondArg ? parseInt(secondArg) : 1
        const slug = getPrdSlug(prdPath)

        const planFile = `scripts/agents/output/${slug}-step-${stepNumber}-plan.md`
        if (!fs.existsSync(planFile)) {
            console.error(`No plan found at ${planFile}. Run npm run spec-to-code ${prdPath} ${stepNumber} first.`)
            process.exit(1)
        }

        const plan = fs.readFileSync(planFile, "utf-8")
        const prdContent = fs.existsSync(prdPath) ? fs.readFileSync(prdPath, "utf-8") : ""

        console.log(`\nImplementing ${slug} — Step ${stepNumber}\n`)

        await runImplement(slug, stepNumber, plan, prdContent, `${slug} Step ${stepNumber}`)

        console.log(`\nNext: npm run validate ${prdPath} ${stepNumber}`)
        return
    }

    // Legacy mode: step number only (Phyllo PRD)
    const stepIndex = firstArg ? parseInt(firstArg) - 1 : 0

    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= LEGACY_BUILD_STEPS.length) {
        console.log("Usage:")
        console.log("  npm run implement <prd-path> <step-number>   — new PRD")
        console.log("  npm run implement <step-number>               — Phyllo PRD (legacy)")
        console.log("\nLegacy steps:")
        LEGACY_BUILD_STEPS.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))
        return
    }

    const step = LEGACY_BUILD_STEPS[stepIndex]
    const planFile = `scripts/agents/output/step-${stepIndex + 1}-plan.md`

    if (!fs.existsSync(planFile)) {
        console.error(`No plan found for step ${stepIndex + 1}. Run npm run spec-to-code ${stepIndex + 1} first.`)
        process.exit(1)
    }

    const plan = fs.readFileSync(planFile, "utf-8")
    console.log(`\nImplementing Step ${stepIndex + 1}: ${step}\n`)

    await runImplement("phyllo", stepIndex + 1, plan, "", `Step ${stepIndex + 1}: ${step}`)

    console.log(`\nNext: npm run validate ${stepIndex + 1}`)
}

main().catch(console.error)
