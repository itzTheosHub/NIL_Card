import * as fs from "fs"
import * as path from "path"

const BUILD_STEPS = [
    { step: "Add DB columns to profiles table (Supabase migration)", files: ["supabase/phyllo-migration.sql"] },
    { step: "Add env vars to .env.local and Vercel", files: [".env.local"] },
    { step: "Build /api/phyllo/create-user route", files: ["app/api/phyllo/create-user/route.ts"] },
    { step: "Build /api/phyllo/create-token route", files: ["app/api/phyllo/create-token/route.ts"] },
    { step: "Install Phyllo SDK, add connect buttons to ProfileForm", files: ["app/api/phyllo/create-token/route.ts"] },
    { step: "Build /api/phyllo/webhook route", files: ["app/api/phyllo/webhook/route.ts"] },
    { step: "Build /api/phyllo/disconnect route", files: ["app/api/phyllo/disconnect/route.ts"] },
    { step: "Wire up connected state UI (checkmark, refresh, disconnect)", files: ["app/api/phyllo/disconnect/route.ts"] },
    { step: "Test end-to-end on staging", files: [] },
]

console.log("\n📋 Phyllo Connect — Feature Build Status\n")
console.log("=".repeat(55))

BUILD_STEPS.forEach(({ step, files }, i) => {
    const stepNum = i + 1
    const planExists = fs.existsSync(`scripts/agents/output/step-${stepNum}-plan.md`)
    const implementedExists = fs.existsSync(`scripts/agents/output/step-${stepNum}-implemented.md`)
    const validationExists = fs.existsSync(`scripts/agents/output/step-${stepNum}-validation.md`)
    const allFilesExist = files.length === 0 || files.every(f => fs.existsSync(f))

    let status = "⬜ Not started"
    if (planExists && !implementedExists) status = "📝 Planned"
    if (implementedExists && !validationExists) status = "🔨 Implemented"
    if (validationExists) status = "✅ Validated"
    if (allFilesExist && files.length > 0) status = "✅ Done"

    console.log(`\n${stepNum}. ${step}`)
    console.log(`   ${status}`)
    if (files.length > 0) {
        files.forEach(f => {
            const exists = fs.existsSync(f)
            console.log(`   ${exists ? "✅" : "❌"} ${f}`)
        })
    }
})

console.log("\n" + "=".repeat(55))
console.log("\nCommands:")
console.log("  npm run spec-to-code <step>  — generate plan for a step")
console.log("  npm run implement <step>      — write files from plan")
console.log("  npm run validate <step>       — check against PRD")
console.log("")
