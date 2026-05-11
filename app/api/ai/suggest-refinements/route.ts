import { NextRequest } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import {
  SUGGEST_REFINEMENTS_SYSTEM,
  buildSuggestRefinementsUserPrompt,
} from "@/lib/ai/prompts";
import { parseSuggestRefinementsResponse } from "@/lib/ai/parsers";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json() as { query?: unknown; platform?: unknown };
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const platform = typeof body.platform === "string" ? body.platform.trim() : "linkedin";

  if (!query) {
    return Response.json({ error: "query is required" }, { status: 400 });
  }

  const client = getAnthropicClient();

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SUGGEST_REFINEMENTS_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildSuggestRefinementsUserPrompt(query, platform),
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const result = parseSuggestRefinementsResponse(text);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
