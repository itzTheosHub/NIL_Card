import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
import { execSync } from "child_process"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const client = new Anthropic()

const HARDCODED_CONTEXT_FILES = [
    "app/layout.tsx",
    "components/Header.tsx",
]

async function main() {
    const bugDescription = process.argv[2]
    const targetFile = process.argv[3]

    if (!bugDescription || !targetFile) {
        console.log("Usage: npm run playwright \"<bug description>\" <target-file>")
        console.log("Example: npm run playwright \"back button on login doesn't work\" app/login/page.tsx")
        process.exit(1)
    }

    if (!fs.existsSync(targetFile)) {
        console.error(`Target file not found: ${targetFile}`)
        process.exit(1)
    }

    const slug = bugDescription.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const testFile = `e2e/${slug}.spec.ts`
    const outputFile = `scripts/agents/output/playwright-${slug}.md`

    console.log(`\nBug: ${bugDescription}`)
    console.log(`Target: ${targetFile}`)
    console.log(`Test will be written to: ${testFile}\n`)

    // Build context from target file + hardcoded files
    const allFiles = [targetFile, ...HARDCODED_CONTEXT_FILES]
    const fileContext = allFiles
        .filter(f => fs.existsSync(f))
        .map(f => `### ${f}\n\`\`\`\n${fs.readFileSync(f, "utf-8")}\n\`\`\``)
        .join("\n\n")

    // Claude call 1 — generate the test
    console.log("Generating Playwright test...")
    const testResponse = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: `You are a Playwright test writer for NIL Card — a Next.js 16 + Supabase + TypeScript app running at http://localhost:3000.

Write a Playwright test that catches the described bug. The test should FAIL when the bug is present and PASS when it is fixed.

Output the test in this exact format:

FILE: e2e/<filename>.spec.ts
\`\`\`
<complete test code>
\`\`\`

Use @playwright/test imports. Keep the test focused — one or two scenarios that directly reproduce the bug.`,
        messages: [
            {
                role: "user",
                content: `Bug: ${bugDescription}\n\nRelevant source files:\n\n${fileContext}\n\nWrite a Playwright test that reproduces this bug.`
            }
        ]
    })

    const testResponseText = testResponse.content[0].type === "text" ? testResponse.content[0].text : ""

    // Extract test code from FILE: block
    const fileMatch = testResponseText.match(/FILE: .+?\n```(?:\w+)?\n([\s\S]+?)```/)
    if (!fileMatch) {
        console.error("Could not extract test code from response. Full output:")
        console.log(testResponseText)
        process.exit(1)
    }

    const testCode = fileMatch[1]

    // Write test file
    if (!fs.existsSync("e2e")) fs.mkdirSync("e2e")
    fs.writeFileSync(testFile, testCode)
    console.log(`✅ Test written to ${testFile}`)

    // Run the test — expect it to fail (bug is still present)
    console.log("\nRunning test (expecting failure — bug not yet fixed)...\n")
    let testOutput = ""
    try {
        testOutput = execSync(`npx playwright test ${testFile} --reporter=line`, {
            encoding: "utf-8",
            stdio: "pipe",
        })
        console.log(testOutput)
        console.log("⚠️  Test passed — bug may already be fixed, or test isn't catching it correctly.")
    } catch (err: any) {
        testOutput = (err.stdout || "") + (err.stderr || "")
        console.log(testOutput)
        console.log("✅ Test failed as expected — bug confirmed. Asking Claude for fix...\n")
    }

    // Claude call 2 — analyze failure and suggest fix
    const fixResponse = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: `You are a senior engineer debugging a Next.js app.

You will be given a bug description, the Playwright test that caught it, the test output, and the relevant source files.

Identify the root cause and describe the fix clearly. Point to specific file paths and line numbers. Do not rewrite entire files — describe only what needs to change.`,
        messages: [
            {
                role: "user",
                content: `Bug: ${bugDescription}\n\nTest output:\n\`\`\`\n${testOutput}\n\`\`\`\n\nSource files:\n\n${fileContext}\n\nWhat is the root cause and how should it be fixed?`
            }
        ]
    })

    const fixText = fixResponse.content[0].type === "text" ? fixResponse.content[0].text : ""

    console.log("=== Fix Suggestion ===\n")
    console.log(fixText)

    // Save full output
    const fullOutput = `# Playwright Agent — ${bugDescription}\n\n## Generated Test\n\n\`\`\`ts\n${testCode}\`\`\`\n\n## Test Output\n\n\`\`\`\n${testOutput}\`\`\`\n\n## Fix Suggestion\n\n${fixText}`
    fs.writeFileSync(outputFile, fullOutput)
    console.log(`\n---\nFull output saved to ${outputFile}`)
    console.log(`\nNext: apply the fix, then run: npx playwright test ${testFile}`)
}

main().catch(console.error)
