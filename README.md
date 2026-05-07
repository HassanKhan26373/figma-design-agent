# Figma Design Agent

An AI design agent that controls Figma like a senior product designer.
Built with Claude (Anthropic) + Figma's official MCP server.

## What it does

You give it a brief: *"design a crypto wallet landing page, dark fintech style"*
It thinks like a senior designer, plans the design system, then actually creates frames, components, and layers in your Figma file via MCP.

## Architecture

```
You (CLI)
   ↓
Agent loop (src/agent.js)
   ↓
Claude API (the brain — uses senior-designer system prompt)
   ↓
Figma MCP server (https://mcp.figma.com/mcp)
   ↓
Your live Figma file
```

## Setup

### 1. Install
```bash
git clone <your-repo-url>
cd figma-design-agent
npm install
```

You need **Node.js 20+**.

### 2. Configure secrets
```bash
cp .env.example .env
```

Then edit `.env` and fill in:

- **`ANTHROPIC_API_KEY`** — get one at https://console.anthropic.com/settings/keys
- **`FIGMA_MCP_AUTH_TOKEN`** — auth token for Figma's MCP server. The fastest way to get one: connect Figma in Claude Desktop, then inspect the OAuth token it stores. For production, run a proper OAuth flow against Figma.
- **`FIGMA_FILE_KEY`** *(optional)* — pin the agent to a specific Figma file. Copy from a Figma URL: `figma.com/design/<THIS_PART>/...`

### 3. Run
```bash
# Smoke test (no Figma needed):
npm start

# Real design task:
npm run agent -- "design a 3-screen onboarding for a meditation app, calm pastel palette"
```

## How it works

**`src/systemPrompt.js`** — the senior-designer brain. This is the most important file. 70% of agent quality lives here. Edit it constantly as you find failure modes.

**`src/agent.js`** — the loop. Sends Claude the goal, lets Claude call Figma MCP tools, feeds results back, repeats until done. Capped at 20 turns for safety.

**`src/cli.js`** — terminal interface. Pretty-prints what the agent is doing.

## Roadmap (matches the 10-step plan)

- [x] Steps 1–3: agent environment + Claude wired up
- [x] Step 4: Figma connection (via official MCP, no plugin needed)
- [x] Step 6: senior-designer system prompt
- [x] Step 7: MCP tool bridge (handled by Anthropic SDK)
- [ ] Step 5: split into multi-agent (designer / engineer / QA)
- [ ] Step 8: persistent design system memory (JSON file or DB)
- [ ] Step 9: workflow engine for complex multi-step briefs
- [ ] Step 10: eval harness ("did it actually create the frames?")

## Common issues

**"FIGMA_MCP_AUTH_TOKEN not set"** — the agent will run but can't touch Figma. Add the token to `.env`.

**"Agent exceeded 20 turns"** — bump `MAX_TURNS` in `src/agent.js`, or sharpen the system prompt so it doesn't dither.

**Generic-looking output** — your system prompt is too soft. Add specific, opinionated rules (look at how the included one names exact spacing values and fonts).

## License

MIT
