import { NextRequest } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import {
  SAVED_SEARCH_INSIGHTS_SYSTEM,
  buildSavedSearchInsightsUserPrompt,
} from "@/lib/ai/prompts";
import { parseSavedSearchInsightsResponse } from "@/lib/ai/parsers";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json() as { searches?: unknown };

  if (!Array.isArray(body.searches) || body.searches.length < 2) {
    return Response.json(
      { error: "At least 2 saved searches are required for pattern analysis" },
      { status: 400 }
    );
  }

  const searches = (body.searches as Array<Record<string, unknown>>).map((s) => ({
    title: typeof s.title === "string" ? s.title : "",
    source_key: typeof s.source_key === "string" ? s.source_key : "",
    params:
      typeof s.params === "object" && s.params !== null
        ? (s.params as Record<string, unknown>)
        : {},
  }));

  const client = getAnthropicClient();

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SAVED_SEARCH_INSIGHTS_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildSavedSearchInsightsUserPrompt(searches),
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const result = parseSavedSearchInsightsResponse(text);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
