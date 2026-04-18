import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

const BUILD_STEPS = [
    "Add DB columns to profiles table (Supabase migration)",
    "Add env vars to .env.local and Vercel",
    "Build /api/phyllo/create-user route",
    "Build /api/phyllo/create-token route",
    "Install Phyllo SDK, add connect buttons to ProfileForm",
    "Build /api/phyllo/webhook route",
    "Build /api/phyllo/disconnect route",
    "Wire up connected state UI (checkmark, refresh, disconnect)",
    "Test end-to-end on staging",
]

async function main() {
    const stepArg = process.argv[2]
    const stepIndex = stepArg ? parseInt(stepArg) - 1 : 0

    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= BUILD_STEPS.length) {
        console.log("Usage: npm run implement <step-number>")
        console.log("\nAvailable steps:")
        BUILD_STEPS.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))
        return
    }

    const step = BUILD_STEPS[stepIndex]
    const planFile = `scripts/agents/output/step-${stepIndex + 1}-plan.md`

    if (!fs.existsSync(planFile)) {
        console.error(`No plan found for step ${stepIndex + 1}. Run npm run spec-to-code ${stepIndex + 1} first.`)
        process.exit(1)
    }

    const plan = fs.readFileSync(planFile, "utf-8")
    console.log(`\nImplementing Step ${stepIndex + 1}: ${step}\n`)

    // Find any existing files referenced in the plan and inject their content
    const filePathRegex = /`([\w\-/.]+\.(tsx?))`/g
    const mentionedPaths = new Set<string>()
    let pathMatch
    while ((pathMatch = filePathRegex.exec(plan)) !== null) {
        mentionedPaths.add(pathMatch[1])
    }

    let existingFilesContext = ""
    for (const filePath of mentionedPaths) {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8")
            existingFilesContext += `\nExisting file — ${filePath}:\n\`\`\`\n${content}\n\`\`\`\n`
            console.log(`📄 Injecting existing file: ${filePath}`)
        }
    }

    const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 16000,
        system: `You are a senior engineer implementing a feature for NIL Card — a Next.js 16 + Supabase + TypeScript app.

You are given an implementation plan. Extract every file that needs to be created or modified and output them in this exact format:

FILE: <full relative file path>
\`\`\`
<complete file content>
\`\`\`

Only output files that need to be written to disk. Do not include SQL, npm commands, or explanations in the file blocks — put those in a NOTES section at the end.

If an existing file is provided, make ONLY the changes described in the plan. Preserve all existing code, imports, and structure — do not rewrite from scratch.`,
        messages: [
            {
                role: "user",
                content: `Here is the implementation plan for Step ${stepIndex + 1}: ${step}\n\n${plan}\n\n${existingFilesContext}\n\nExtract and output all files that need to be written.`
            }
        ]
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // Parse FILE: blocks and write them
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
        console.log("No files were extracted. Check the plan output manually:")
        console.log(text)
    }

    // Save full output for reference
    const outputFile = `scripts/agents/output/step-${stepIndex + 1}-implemented.md`
    fs.writeFileSync(outputFile, text)
    console.log(`\n${filesWritten} file(s) written.`)
    console.log(`Full output saved to ${outputFile}`)
    console.log(`\nNext: run npm run validate ${stepIndex + 1} to check against the PRD.`)
}

main().catch(console.error)
