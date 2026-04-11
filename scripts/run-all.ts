import {execSync} from "child_process"

const agents = [
    {name: "Code Review", script: "scripts/review.ts"},
    {name: "Mobile Check", script: "scripts/mobile-check.ts"},
]

async function main(){
    for (const agent of agents) {
          console.log(`\n${"=".repeat(50)}`)
          console.log(`Running: ${agent.name}`)
          console.log("=".repeat(50))
          try {
              const output = execSync(`npx tsx ${agent.script}`, { encoding: "utf-8" })
              console.log(output)
          } catch (err: any) {
              console.error(`${agent.name} failed:\n${err.stdout || err.message}`)     
          }
      }
}

main()