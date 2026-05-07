// src/index.js
// Default entry — runs a demo if executed directly, exports the agent if imported.

import "dotenv/config";
import { runAgent } from "./agent.js";

export { runAgent };

// If this file is run directly (not imported), do a quick smoke test.
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running smoke test — say hi to the agent...\n");
  await runAgent("Say hi and tell me in one sentence what you can do.", {
    onEvent: (b) => {
      if (b.type === "text") process.stdout.write(b.text);
    },
  });
  console.log("\n");
}
