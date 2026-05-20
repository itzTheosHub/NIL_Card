import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

function getPrdSlug(prdPath: string): string {
    return path.basename(prdPath, ".md").replace(/^PRD-/, "")
}

// Extract file paths mentioned in text (backtick-quoted or plain paths)
function extractFilePaths(text: string): string[] {
    const paths = new Set<string>()
    const backtickRegex = /`([\w\-/.]+\.(tsx?|ts|css|sql))`/g
    const plainRegex = /\b((?:components|app|hooks|lib)\/[\w\-/.]+\.(tsx?|ts|css))\b/g
    let m
    while ((m = backtickRegex.exec(text)) !== null) paths.add(m[1])
    while ((m = plainRegex.exec(text)) !== null) paths.add(m[1])
    return Array.from(paths)
}

async function main() {
    const prdPath = process.argv[2]
    const stepNumber = process.argv[3] ? parseInt(process.argv[3]) : 1

    if (!prdPath || !prdPath.endsWith(".md")) {
        console.log("Usage: npm run validate <prd-path> <step-number>")
        console.log("Example: npm run validate docs/PRD-buyer-landing-v2.md 1")
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
    const planFile = `scripts/agents/output/${slug}-step-${stepNumber}-plan.md`

    if (!fs.existsSync(planFile)) {
        console.error(`No plan found at ${planFile}. Run npm run spec-to-code ${prdPath} ${stepNumber} first.`)
        process.exit(1)
    }

    const prd = fs.readFileSync(prdPath, "utf-8")
    const plan = fs.readFileSync(planFile, "utf-8")

    // Find all files mentioned in the plan and PRD, read those that exist on disk
    const allPaths = [...new Set([...extractFilePaths(plan), ...extractFilePaths(prd)])]

    const missingFiles = allPaths.filter(f => !fs.existsSync(f))
    if (missingFiles.length > 0) {
        console.log("⚠️  Files mentioned but not found on disk:")
        missingFiles.forEach(f => console.log(`   - ${f}`))
        console.log("")
    }

    const implementedFiles = allPaths
        .filter(f => fs.existsSync(f))
        .map(f => `### ${f}\n\`\`\`\n${fs.readFileSync(f, "utf-8")}\n\`\`\``)
        .join("\n\n")

    if (!implementedFiles) {
        console.log("No implemented files found on disk to validate.")
        process.exit(1)
    }

    console.log(`\nValidating ${slug} — Step ${stepNumber}\n`)

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
                content: `PRD:\n\n${prd}\n\n---\n\nImplementation plan for Step ${stepNumber}:\n\n${plan}\n\n---\n\nImplemented files found on disk:\n\n${implementedFiles}\n\n---\n\nValidate that the implementation matches the PRD requirements for this step.`,
            },
        ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    console.log(text)

    const outputFile = `scripts/agents/output/${slug}-step-${stepNumber}-validation.md`
    fs.writeFileSync(outputFile, `# Validation: ${slug} Step ${stepNumber}\n\n${text}`)
    console.log(`\n---\nValidation saved to ${outputFile}`)
}

main().catch(console.error)
