import { describe, it, expect } from "vitest";
import {
  generateBooleanQuery,
  parseArrayInput,
  validateParams,
  getSearchEngineOptions,
} from "@/lib/builder";

describe("parseArrayInput", () => {
  it("splits comma-separated values and trims whitespace", () => {
    expect(parseArrayInput("React, TypeScript, Node.js")).toEqual([
      "React",
      "TypeScript",
      "Node.js",
    ]);
  });

  it("filters out empty strings", () => {
    expect(parseArrayInput("React, , TypeScript, ")).toEqual([
      "React",
      "TypeScript",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(parseArrayInput("")).toEqual([]);
  });
});

describe("generateBooleanQuery", () => {
  it("generates a basic LinkedIn query with role", () => {
    const result = generateBooleanQuery(
      "linkedin",
      { role: "Software Engineer" },
      "google"
    );
    expect(result.raw).toContain("site:linkedin.com/in");
    expect(result.raw).toContain('"Software Engineer"');
    expect(result.url).toContain("google.com/search");
  });

  it("includes AND group for include keywords", () => {
    const result = generateBooleanQuery(
      "linkedin",
      { role: "Engineer", include: ["React", "TypeScript"] },
      "google"
    );
    expect(result.raw).toContain("(React AND TypeScript)");
  });

  it("includes NOT group for exclude keywords", () => {
    const result = generateBooleanQuery(
      "linkedin",
      { role: "Engineer", exclude: ["recruiter", "HR"] },
      "google"
    );
    expect(result.raw).toContain("-recruiter");
    expect(result.raw).toContain("-HR");
  });

  it("adds location to query", () => {
    const result = generateBooleanQuery(
      "linkedin",
      { role: "Engineer", location: "Austin" },
      "google"
    );
    expect(result.raw).toContain("Austin");
  });

  it("generates Bing URL for bing engine", () => {
    const result = generateBooleanQuery(
      "linkedin",
      { role: "Engineer" },
      "bing"
    );
    expect(result.url).toContain("bing.com/search");
  });

  it("generates Twitter URL for twitter engine", () => {
    const result = generateBooleanQuery(
      "twitter",
      { role: "Developer" },
      "twitter"
    );
    expect(result.url).toContain("twitter.com/search");
  });

  it("uses correct site for GitHub", () => {
    const result = generateBooleanQuery(
      "github",
      { role: "Developer" },
      "google"
    );
    expect(result.raw).toContain("site:github.com");
  });

  it("handles LinkedIn-specific fields", () => {
    const result = generateBooleanQuery(
      "linkedin",
      {
        role: "Engineer",
        employer: "Google",
        education: "masters",
        openToWork: "opentowork",
      },
      "google"
    );
    expect(result.raw).toContain("Google");
    expect(result.raw).toContain("Master");
    expect(result.raw).toContain("#OpenToWork");
  });

  it("throws for unknown source", () => {
    expect(() =>
      generateBooleanQuery("unknown" as never, { role: "x" }, "google")
    ).toThrow("Unknown source");
  });

  it("returns encoded and url fields", () => {
    const result = generateBooleanQuery(
      "linkedin",
      { role: "Engineer" },
      "google"
    );
    expect(result.encoded).toBeTruthy();
    expect(result.url).toBeTruthy();
    expect(result.raw).toBeTruthy();
  });
});

describe("validateParams", () => {
  it("returns error when role and include are both empty", () => {
    const errors = validateParams({ role: "", include: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns no errors when role is provided", () => {
    const errors = validateParams({ role: "Engineer" });
    expect(errors).toEqual([]);
  });

  it("returns no errors when include keywords are provided", () => {
    const errors = validateParams({ include: ["React"] });
    expect(errors).toEqual([]);
  });
});

describe("getSearchEngineOptions", () => {
  it("returns twitter option for twitter source", () => {
    const options = getSearchEngineOptions("twitter");
    expect(options).toContain("twitter");
  });

  it("returns only google and bing for non-twitter sources", () => {
    const options = getSearchEngineOptions("linkedin");
    expect(options).toEqual(["google", "bing"]);
  });
});
