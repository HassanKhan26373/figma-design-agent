// src/agent.js
// The agent loop. Sends a user goal to Claude, lets Claude call Figma MCP tools,
// keeps looping until Claude says it's done.

import Anthropic from "@anthropic-ai/sdk";
import { SENIOR_DESIGNER_SYSTEM_PROMPT } from "./systemPrompt.js";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-7";
const MAX_TURNS = 20; // safety cap so the agent can't loop forever

/**
 * Build the MCP servers config for the API call.
 * Right now we wire up Figma's official MCP server.
 * Add more servers (GitHub, filesystem, etc.) here as you grow.
 */
function buildMcpServers() {
  const servers = [];

  if (process.env.FIGMA_MCP_AUTH_TOKEN) {
    servers.push({
      type: "url",
      url: "https://mcp.figma.com/mcp",
      name: "figma",
      authorization_token: process.env.FIGMA_MCP_AUTH_TOKEN,
    });
  } else {
    console.warn(
      "[warn] FIGMA_MCP_AUTH_TOKEN not set — agent will run without Figma tools.\n" +
        "       Set it in .env to give the agent design powers."
    );
  }

  return servers;
}

/**
 * Run the agent for a single user goal.
 * Loops: Claude thinks -> calls tool -> sees result -> thinks again -> ...
 */
export async function runAgent(userGoal, { onEvent } = {}) {
  const messages = [{ role: "user", content: userGoal }];
  const mcpServers = buildMcpServers();

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SENIOR_DESIGNER_SYSTEM_PROMPT,
      messages,
      mcp_servers: mcpServers,
      betas: ["mcp-client-2025-04-04"],
    });

    // Surface every block to the caller (CLI prints them, server could stream them)
    for (const block of response.content) {
      if (onEvent) onEvent(block);
    }

    // Add the assistant turn to history
    messages.push({ role: "assistant", content: response.content });

    // If the model stopped without calling more tools, we're done
    if (response.stop_reason !== "tool_use") {
      return { messages, finalResponse: response };
    }

    // If it called tools, the API has already executed them via MCP and the
    // results are part of `response.content`. We loop and ask Claude what's next.
    // (For non-MCP / local tools you'd inject your own tool_result blocks here.)
  }

  throw new Error(`Agent exceeded ${MAX_TURNS} turns without finishing.`);
}
