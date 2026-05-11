export interface Refinement {
  label: string;
  addition: string;
}

export interface SuggestRefinementsResult {
  refinements: Refinement[];
}

export function parseSuggestRefinementsResponse(
  raw: string
): SuggestRefinementsResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in AI response");
  }

  const parsed: unknown = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).refinements)
  ) {
    throw new Error("AI response did not match expected schema");
  }

  const result = parsed as Record<string, unknown>;
  const raw_refinements = result.refinements as unknown[];

  const refinements = raw_refinements.filter(
    (r): r is Refinement =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as Record<string, unknown>).label === "string" &&
      typeof (r as Record<string, unknown>).addition === "string"
  );

  return { refinements };
}

export interface SearchInsight {
  pattern: string;
  suggestion: string;
}

export interface SavedSearchInsightsResult {
  insights: SearchInsight[];
}

export function parseSavedSearchInsightsResponse(
  raw: string
): SavedSearchInsightsResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object found in AI response");

  const parsed: unknown = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).insights)
  ) {
    throw new Error("AI response did not match expected schema");
  }

  const result = parsed as Record<string, unknown>;
  const raw_insights = result.insights as unknown[];

  const insights = raw_insights.filter(
    (r): r is SearchInsight =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as Record<string, unknown>).pattern === "string" &&
      typeof (r as Record<string, unknown>).suggestion === "string"
  );

  return { insights };
}

export interface CandidateScoreResult {
  score: number;
  reasoning: string;
}

export function parseCandidateScoreResponse(raw: string): CandidateScoreResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in AI response");
  }

  const parsed: unknown = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).score !== "number" ||
    typeof (parsed as Record<string, unknown>).reasoning !== "string"
  ) {
    throw new Error("AI response did not match expected schema");
  }

  const result = parsed as Record<string, unknown>;
  const score = Math.min(10, Math.max(1, Math.round(result.score as number)));

  return {
    score,
    reasoning: result.reasoning as string,
  };
}

export interface NLToBooleanResult {
  booleanString: string;
  explanation: string;
  suggestedRefinements: string[];
}

export function parseNLToBooleanResponse(raw: string): NLToBooleanResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in AI response");
  }

  const parsed: unknown = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).booleanString !== "string" ||
    typeof (parsed as Record<string, unknown>).explanation !== "string" ||
    !Array.isArray((parsed as Record<string, unknown>).suggestedRefinements)
  ) {
    throw new Error("AI response did not match expected schema");
  }

  const result = parsed as Record<string, unknown>;
  const refinements = result.suggestedRefinements as unknown[];

  return {
    booleanString: result.booleanString as string,
    explanation: result.explanation as string,
    suggestedRefinements: refinements.filter(
      (r): r is string => typeof r === "string"
    ),
  };
}
