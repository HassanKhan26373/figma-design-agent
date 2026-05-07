// src/cli.js
// Run the agent from the command line.
// Usage:
//   npm run agent -- "design a crypto wallet landing page, dark fintech style"

import "dotenv/config";
import { runAgent } from "./agent.js";

const goal = process.argv.slice(2).join(" ").trim();

if (!goal) {
  console.error(
    'Usage: npm run agent -- "your design brief here"\n\n' +
      "Examples:\n" +
      '  npm run agent -- "design a landing page for a crypto wallet, dark theme"\n' +
      '  npm run agent -- "create a 3-screen onboarding flow for a fitness app"\n' +
      '  npm run agent -- "make a pricing page with 3 tiers, premium SaaS feel"\n'
  );
  process.exit(1);
}

console.log(`\n🎨 Goal: ${goal}\n${"─".repeat(60)}\n`);

function prettyPrint(block) {
  if (block.type === "text") {
    process.stdout.write(block.text + "\n");
  } else if (block.type === "tool_use" || block.type === "mcp_tool_use") {
    console.log(`\n🔧 [tool] ${block.name}`);
    console.log(`   input: ${JSON.stringify(block.input).slice(0, 200)}`);
  } else if (block.type === "tool_result" || block.type === "mcp_tool_result") {
    const text = Array.isArray(block.content)
      ? block.content.map((c) => c.text || "").join(" ").slice(0, 200)
      : String(block.content).slice(0, 200);
    console.log(`   ✓ result: ${text}`);
  }
}

try {
  await runAgent(goal, { onEvent: prettyPrint });
  console.log(`\n${"─".repeat(60)}\n✅ Agent finished.\n`);
} catch (err) {
  console.error("\n❌ Agent error:", err.message);
  process.exit(1);
}
