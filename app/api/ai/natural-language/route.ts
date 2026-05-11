import { NextRequest } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import {
  NL_TO_BOOLEAN_SYSTEM,
  buildNLToBooleanUserPrompt,
} from "@/lib/ai/prompts";
import { parseNLToBooleanResponse } from "@/lib/ai/parsers";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json() as { description?: unknown; platform?: unknown };
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const platform = typeof body.platform === "string" ? body.platform.trim() : "linkedin";

  if (!description) {
    return Response.json({ error: "description is required" }, { status: 400 });
  }

  const client = getAnthropicClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let accumulated = "";
      let success = false;

      try {
        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: NL_TO_BOOLEAN_SYSTEM,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: buildNLToBooleanUserPrompt(description, platform),
            },
          ],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            accumulated += chunk.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ chunk: chunk.delta.text })}\n\n`
              )
            );
          }
        }

        const result = parseNLToBooleanResponse(accumulated);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, result })}\n\n`
          )
        );
        success = true;
      } catch (err) {
        if (!success) {
          const message =
            err instanceof Error ? err.message : "AI generation failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: message })}\n\n`
            )
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
