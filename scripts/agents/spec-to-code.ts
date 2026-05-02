import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

const PRD_PATH = "docs/PRD-phyllo-connect.md"

const CONTEXT_FILES = [
    "app/api/contact/route.ts",
    "app/api/resolve-url/route.ts",
    "components/ProfileForm.tsx",
    "app/profile/create/page.tsx",
]

const BUILD_STEPS = [
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

async function main() {
    const stepArg = process.argv[2]
    const stepIndex = stepArg ? parseInt(stepArg) - 1 : 0

    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= BUILD_STEPS.length) {
        console.log("Usage: npm run spec-to-code <step-number>")
        console.log("\nAvailable steps:")
        BUILD_STEPS.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))
        return
    }

    const step = BUILD_STEPS[stepIndex]
    console.log(`\nGenerating implementation plan for Step ${stepIndex + 1}: ${step}\n`)

    const prd = fs.readFileSync(PRD_PATH, "utf-8")

    const contextFiles = CONTEXT_FILES
        .filter(f => fs.existsSync(f))
        .map(f => `### ${f}\n\`\`\`tsx\n${fs.readFileSync(f, "utf-8")}\n\`\`\``)
        .join("\n\n")

    const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: `You are a senior engineer implementing a feature for NIL Card — a Next.js 16 + Supabase + TypeScript app.

You are given a PRD and existing code files for context. Your job is to generate production-ready code for one specific build step.

Rules:
- Match the exact code style, patterns, and conventions in the existing files
- Use Next.js App Router API route patterns (NextRequest/NextResponse)
- Use the existing Supabase client pattern from @/lib/supabase
- Use TypeScript throughout
- Be specific about file paths
- Output complete, ready-to-use code — not pseudocode
- Explain any decisions that are not obvious`,
        messages: [
            {
                role: "user",
                content: `Here is the PRD:\n\n${prd}\n\n---\n\nHere are the existing code files for reference:\n\n${contextFiles}\n\n---\n\nGenerate the complete implementation for this step:\n\n**Step ${stepIndex + 1}: ${step}**\n\nFor each file that needs to be created or modified, show:\n1. The full file path\n2. The complete file content\n3. Any Supabase SQL if needed\n4. Any npm install commands needed`
            }
        ]
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    const outputDir = "scripts/agents/output"
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

    const outputFile = path.join(outputDir, `step-${stepIndex + 1}-plan.md`)
    fs.writeFileSync(outputFile, `# Step ${stepIndex + 1}: ${step}\n\n${text}`)

    console.log(text)
    console.log(`\n---\nPlan saved to ${outputFile}`)
}

main().catch(console.error)
