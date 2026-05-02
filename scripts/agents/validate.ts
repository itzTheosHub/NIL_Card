import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

const PRD_PATH = "docs/PRD-phyllo-connect.md"

const STEP_FILES: Record<number, string[]> = {
    1: ["supabase/phyllo-migration.sql"],
    2: [".env.local"],
    3: ["app/api/phyllo/create-user/route.ts"],
    4: ["app/api/phyllo/create-token/route.ts"],
    5: ["components/ProfileForm.tsx"],
    6: ["app/api/phyllo/webhook/route.ts"],
    7: ["app/api/phyllo/disconnect/route.ts"],
    8: ["components/ProfileForm.tsx"],
    9: ["app/api/phyllo/stats/route.ts", "lib/phyllo-stats.ts"],
    10: ["hooks/usePhylloConnect.ts"],
    11: ["app/api/phyllo/create-user/route.ts"],
    12: ["hooks/usePhylloConnect.ts", "components/PhylloConnectSection.tsx", "components/ProfileForm.tsx"],
}

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
        console.log("Usage: npm run validate <step-number>")
        console.log("\nAvailable steps:")
        BUILD_STEPS.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))
        return
    }

    const step = BUILD_STEPS[stepIndex]
    const relevantFiles = STEP_FILES[stepIndex + 1] || []

    console.log(`\nValidating Step ${stepIndex + 1}: ${step}\n`)

    const prd = fs.readFileSync(PRD_PATH, "utf-8")

    const implementedFiles = relevantFiles
        .filter(f => fs.existsSync(f))
        .map(f => `### ${f}\n\`\`\`\n${fs.readFileSync(f, "utf-8")}\n\`\`\``)
        .join("\n\n")

    const missingFiles = relevantFiles.filter(f => !fs.existsSync(f))

    if (missingFiles.length > 0) {
        console.log("⚠️  Missing files:")
        missingFiles.forEach(f => console.log(`   - ${f}`))
        console.log("")
    }

    if (!implementedFiles) {
        console.log("No implemented files found to validate.")
        return
    }

    const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        system: `You are a QA engineer validating that an implementation matches a PRD.

For each PRD requirement relevant to the step being validated:
- ✅ PASS — requirement is fully met
- ⚠️  PARTIAL — requirement is partially met, describe what's missing
- ❌ FAIL — requirement is not met, describe what's wrong

At the end, give an overall verdict: READY TO MERGE or NEEDS WORK.
Be specific — reference line numbers or code snippets where relevant.`,
        messages: [
            {
                role: "user",
                content: `PRD:\n\n${prd}\n\n---\n\nImplemented files for Step ${stepIndex + 1} (${step}):\n\n${implementedFiles}\n\n---\n\nValidate that the implementation matches the PRD requirements for this step.`
            }
        ]
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    console.log(text)

    const outputFile = `scripts/agents/output/step-${stepIndex + 1}-validation.md`
    fs.writeFileSync(outputFile, `# Validation: Step ${stepIndex + 1} — ${step}\n\n${text}`)
    console.log(`\n---\nValidation saved to ${outputFile}`)
}

main().catch(console.error)
