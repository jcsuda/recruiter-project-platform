import { NextRequest } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import {
  SCORE_CANDIDATE_SYSTEM,
  buildScoreCandidateUserPrompt,
} from "@/lib/ai/prompts";
import { parseCandidateScoreResponse } from "@/lib/ai/parsers";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json() as {
    candidateName?: unknown;
    notes?: unknown;
    source?: unknown;
    requisitionTitle?: unknown;
    requisitionDescription?: unknown;
  };

  const candidateName = typeof body.candidateName === "string" ? body.candidateName.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const source = typeof body.source === "string" ? body.source.trim() : "";
  const requisitionTitle = typeof body.requisitionTitle === "string" ? body.requisitionTitle.trim() : undefined;
  const requisitionDescription = typeof body.requisitionDescription === "string" ? body.requisitionDescription.trim() : undefined;

  if (!candidateName) {
    return Response.json({ error: "candidateName is required" }, { status: 400 });
  }

  if (!notes && !requisitionTitle) {
    return Response.json(
      { error: "Provide at least notes or a requisition to score against" },
      { status: 400 }
    );
  }

  const client = getAnthropicClient();

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SCORE_CANDIDATE_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildScoreCandidateUserPrompt(
            candidateName,
            notes,
            source,
            requisitionTitle,
            requisitionDescription
          ),
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const result = parseCandidateScoreResponse(text);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI scoring failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
