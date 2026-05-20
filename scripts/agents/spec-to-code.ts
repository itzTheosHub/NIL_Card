import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

// Always injected as baseline context for every PRD
const DEFAULT_CONTEXT_FILES = [
    "components/Header.tsx",
    "app/globals.css",
]

// Extract file paths mentioned in text (backtick-quoted or plain paths)
function extractFilePaths(text: string): string[] {
    const paths = new Set<string>()
    const backtickRegex = /`([\w\-/.]+\.(tsx?|ts|css|sql))`/g
    const plainRegex = /\b((?:components|app|hooks|lib|homepage-redesign)\/[\w\-/.]+\.(tsx?|ts|css))\b/g
    let m
    while ((m = backtickRegex.exec(text)) !== null) paths.add(m[1])
    while ((m = plainRegex.exec(text)) !== null) paths.add(m[1])
    return Array.from(paths)
}

function getPrdSlug(prdPath: string): string {
    return path.basename(prdPath, ".md").replace(/^PRD-/, "")
}

async function main() {
    const prdPath = process.argv[2]
    const stepNumber = process.argv[3] ? parseInt(process.argv[3]) : 1

    if (!prdPath || !prdPath.endsWith(".md")) {
        console.log("Usage: npm run spec-to-code <prd-path> <step-number>")
        console.log("Example: npm run spec-to-code docs/PRD-buyer-landing-v2.md 1")
        process.exit(1)
    }

    if (!fs.existsSync(prdPath)) {
        console.error(`PRD not found: ${prdPath}`)
        process.exit(1)
    }

    if (isNaN(stepNumber) || stepNumber < 1) {
        console.error(`Invalid step number: ${process.argv[3]}`)
        process.exit(1)
    }

    const slug = getPrdSlug(prdPath)
    const prd = fs.readFileSync(prdPath, "utf-8")

    // Inject default context files + any files referenced in the PRD itself
    const prdReferencedFiles = extractFilePaths(prd)
    const allContextPaths = [...new Set([...DEFAULT_CONTEXT_FILES, ...prdReferencedFiles])]

    const contextFiles = allContextPaths
        .filter(f => fs.existsSync(f))
        .map(f => {
            console.log(`📄 Injecting context file: ${f}`)
            return `### ${f}\n\`\`\`\n${fs.readFileSync(f, "utf-8")}\n\`\`\``
        })
        .join("\n\n")

    console.log(`\nGenerating implementation plan for ${slug} — Step ${stepNumber}\n`)

    const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 8096,
        system: `You are a senior engineer implementing a feature for NIL Card — a Next.js 16 + Supabase + TypeScript app.

You are given a PRD and existing code files for context. Your job is to:
1. Read the PRD and identify all logical build steps
2. Generate a detailed implementation plan for the requested step number

Rules:
- Match the exact code style, patterns, and conventions in the existing files
- Use Next.js App Router patterns (NextRequest/NextResponse)
- Use the existing Supabase client pattern from @/lib/supabase
- Use TypeScript throughout
- Use lucide-react for icons
- Use the gradient from-violet-600 to-blue-500 consistently
- No shadcn/ui imports — plain Tailwind + lucide-react only
- Be specific about file paths
- Output complete, ready-to-use code — not pseudocode`,
        messages: [
            {
                role: "user",
                content: `Here is the PRD:\n\n${prd}\n\n---\n\nHere are existing code files for style/pattern reference:\n\n${contextFiles}\n\n---\n\nFirst, list all the build steps you identify from the PRD (numbered list).\n\nThen generate the complete implementation plan for **Step ${stepNumber}**.\n\nFor each file that needs to be created or modified show:\n1. The full file path\n2. The complete file content\n3. Any notes on decisions made`,
            },
        ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    const outputDir = "scripts/agents/output"
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

    const outputFile = path.join(outputDir, `${slug}-step-${stepNumber}-plan.md`)
    fs.writeFileSync(outputFile, `# ${slug} — Step ${stepNumber}\n\n${text}`)

    console.log(text)
    console.log(`\n---\nPlan saved to ${outputFile}`)
    console.log(`\nNext: npm run implement ${prdPath} ${stepNumber}`)
}

main().catch(console.error)
