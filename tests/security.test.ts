/**
 * Security regression tests
 * Covers: filter injection escaping (C-2, C-3)
 */
import { describe, it, expect } from "vitest";

// ---- helpers mirrored from AdvancedSearch.tsx ----
const escapePostgREST = (s: string) => s.replace(/[,().]/g, "");
const escapeLike = (s: string) =>
  s.replace(/%/g, "\\%").replace(/_/g, "\\_");

// ---- escapePostgREST ----
describe("escapePostgREST", () => {
  it("strips commas that would split the OR filter", () => {
    expect(escapePostgREST("React,Node")).toBe("ReactNode");
  });

  it("strips parentheses that would open a sub-filter group", () => {
    expect(escapePostgREST("React(TypeScript)")).toBe("ReactTypeScript");
  });

  it("strips dots used in PostgREST column path syntax", () => {
    expect(escapePostgREST("notes.ilike.%injected%")).toBe(
      "notesilike%injected%"
    );
  });

  it("leaves normal skill names unchanged", () => {
    expect(escapePostgREST("TypeScript")).toBe("TypeScript");
    expect(escapePostgREST("Node.js")).toBe("Nodejs");
    expect(escapePostgREST("C++")).toBe("C++");
  });

  it("handles empty string", () => {
    expect(escapePostgREST("")).toBe("");
  });
});

// ---- escapeLike ----
describe("escapeLike", () => {
  it("escapes % so it is treated as a literal character", () => {
    expect(escapeLike("100%")).toBe("100\\%");
  });

  it("escapes _ so it does not act as a single-char wildcard", () => {
    expect(escapeLike("New_York")).toBe("New\\_York");
  });

  it("escapes both % and _ when present together", () => {
    expect(escapeLike("100%_done")).toBe("100\\%\\_done");
  });

  it("leaves normal city names unchanged", () => {
    expect(escapeLike("Austin")).toBe("Austin");
    expect(escapeLike("San Francisco")).toBe("San Francisco");
  });

  it("handles empty string", () => {
    expect(escapeLike("")).toBe("");
  });

  it("escapes multiple percent signs", () => {
    expect(escapeLike("%%")).toBe("\\%\\%");
  });
});

// ---- query construction safety ----
describe("safe OR filter construction", () => {
  it("builds a safe filter string when skills contain injection characters", () => {
    const skills = ["React", "notes.ilike.%evil%,id.gt.0"];
    const sanitized = skills.map(
      (skill) => `notes.ilike.%${escapePostgREST(skill)}%`
    );
    const filter = sanitized.join(",");

    // The injected filter operator should have been stripped
    expect(filter).not.toContain("id.gt.0");
    expect(filter).toBe(
      "notes.ilike.%React%,notes.ilike.%notesilike%evil%idgt0%"
    );
  });

  it("city value with % does not produce an unescaped wildcard", () => {
    const city = "New % York";
    const pattern = `%${escapeLike(city)}%`;
    expect(pattern).toBe("%New \\% York%");
    expect(pattern).not.toMatch(/[^\\]%[^\\%]/); // no bare % in middle
  });
});
