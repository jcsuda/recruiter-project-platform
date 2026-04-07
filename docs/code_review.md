# Code Review: recruiter-project-platform

**Initial review date:** 2026-04-06  
**Remediation completed:** 2026-04-06  
**Reviewer:** Claude Code (automated comprehensive review)  
**Scope:** All source files under `app/`, `components/`, `lib/`, `supabase/`, `tests/`

---

## Remediation Status

All Critical, High, Medium, and Low issues have been addressed. Tests: **31/31 passing**.

> **Action still required from the developer:**  
> Rotate the Supabase anon key in the Supabase dashboard (Project Settings → API → Reset anon key).  
> The key in `.env.local` is live; it cannot be rotated programmatically.

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3 | Resolved (C-1 requires manual key rotation) |
| High     | 8 | Resolved |
| Medium   | 13 | Resolved |
| Low      | 18 | Resolved |

**Changes that still need your manual action:**
1. **Rotate Supabase anon key** — cannot be done in code. See C-1.

---

## Critical Severity

### C-1 — Hardcoded Supabase Credentials Present in Repository

**File:** `.env.local`  
**Lines:** 5–6

The `.env.local` file contains a live Supabase project URL (`https://mtolynjqibcfdpwyhooc.supabase.co`) and a real JWT anon key valid until 2035. Anyone with this key can make authenticated requests against the Supabase instance.

Although `.env.local` is in `.gitignore`, the file is present in the working directory. If it was ever committed in a prior iteration (check with `git log --all --full-history -- .env.local`), the credentials are permanently exposed in git history.

**Recommended fix:**
- Immediately rotate the Supabase anon key in the Supabase dashboard.
- Verify the file was never committed: `git log --all -- .env.local`
- If found in history, treat the key as compromised regardless of rotation.
- Use environment variable injection from your CI/CD platform instead of committing `.env` files.

---

### C-2 — Filter Injection via Unsanitized Skill Input

**File:** `components/dashboard/AdvancedSearch.tsx`  
**Lines:** 53–55

User-provided skill strings are concatenated directly into a PostgREST `.or()` filter:

```ts
filters.skills.map((skill) => `notes.ilike.%${skill}%`).join(",")
```

If a user enters a skill value containing PostgREST syntax characters (commas, parentheses, operators), the query logic can be altered — effectively a filter injection.

**Recommended fix:**
- Strip or escape `,`, `(`, `)`, `.` from skill values before building the filter string.
- Better: move complex filtered queries to a Next.js API route or Supabase RPC function where inputs can be parameterized server-side.

---

### C-3 — LIKE Pattern Injection via Unsanitized Location Input

**File:** `components/dashboard/AdvancedSearch.tsx`  
**Line:** 65

```ts
query = query.ilike("notes", `%${filters.location.city}%`)
```

The city value is interpolated directly into the LIKE pattern without escaping. PostgreSQL LIKE special characters (`%`, `_`) in user input will alter matching behavior (e.g., a city value of `%` matches everything).

**Recommended fix:**
- Escape `%` and `_` in the city value before passing it to `.ilike()`.
- Example: `city.replace(/%/g, '\\%').replace(/_/g, '\\_')`

---

## High Severity

### H-1 — "AI Matching" Generates Random Numbers, Not AI Results

**File:** `components/dashboard/AICandidateMatching.tsx`  
**Lines:** 109–114

The `runAIMatching` function generates match scores using `Math.random()` and persists them to the database as real AI analysis results. The UI presents these scores with labels like "Excellent" and "Very Good," which misleads users into thinking they are receiving genuine intelligent analysis.

**Recommended fix:**
- Implement actual scoring logic (even rule-based keyword matching is more honest than random numbers).
- Or: display a prominent "Demo Data" indicator and disable the database write.
- Do not persist randomly-generated data as if it were real.

---

### H-2 — N+1 Write Pattern in AI Matching

**File:** `components/dashboard/AICandidateMatching.tsx`  
**Lines:** 107–149

For every candidate × every open requisition, a separate `upsert` call is made to Supabase inside a nested loop. With 20 candidates and 5 requisitions, this is 100 sequential HTTP requests — extremely slow and likely to hit Supabase rate limits.

**Recommended fix:**
- Collect all records into an array first, then call `.upsert(arrayOfRecords)` in a single request.
- Or: use a Supabase RPC function to handle the batch operation server-side.

---

### H-3 — Missing `user_id` Authorization Filter on Candidate Updates

**File:** `components/dashboard/EditCandidateModal.tsx`  
**Lines:** 56–68

The update query uses `.eq("id", candidate.id)` but never asserts `.eq("user_id", userId)`. This relies entirely on Row-Level Security (RLS) policies being correctly configured. If RLS is ever disabled or misconfigured, any authenticated user could modify any candidate record.

**Recommended fix:**
- Add `.eq("user_id", userId)` to the update query for defense in depth.
- Verify the Supabase RLS policy for `candidates` requires `auth.uid() = user_id`.

---

### H-4 — Missing `user_id` Authorization Filter on Requisition Updates

**File:** `components/dashboard/EditRequisitionModal.tsx`  
**Lines:** 65–72

Same issue as H-3 — the update query does not assert ownership via `user_id`.

**Recommended fix:** Same as H-3, applied to the `requisitions` table update.

---

### H-5 — Dashboard Fetches ALL Records Without Explicit User Scoping

**File:** `app/(dashboard)/dashboard/page.tsx`  
**Lines:** 31–39

```ts
supabase.from("requisitions").select("*")
supabase.from("candidates").select("*")
```

Neither query filters by `user_id`. The application relies entirely on Supabase RLS to restrict results. If RLS is ever misconfigured, all users' data would be exposed to every authenticated session.

**Recommended fix:**
- Explicitly add `.eq("user_id", userId)` to every client-side query.
- This is defense in depth: it does not replace RLS but ensures the query is correct even if RLS is temporarily disabled for maintenance or debugging.

---

### H-6 — Candidates Page Fetches All Candidates Without User Scoping

**File:** `app/(dashboard)/candidates/page.tsx`  
**Lines:** 15–21

Same issue as H-5.

**Recommended fix:** Same as H-5.

---

### H-7 — Raw Error Messages Rendered to Users

**File:** `app/(dashboard)/error.tsx`  
**Line:** 17

`{error.message}` is rendered directly in the UI. While React escapes JSX interpolation, error messages from Supabase or other services may contain internal details (table names, column names, query fragments) that expose the application's internal structure to users.

**Recommended fix:**
- Map known error types to user-friendly messages.
- Log the raw error server-side for debugging.
- Never render raw API/database error strings to end users.

---

### H-8 — Team Invite Functionality Is Broken and Deceptive

**File:** `components/dashboard/TeamManagement.tsx`  
**Lines:** 115–139

The `handleInviteMember` function shows a success toast ("Invitation sent to {email}") but never creates a record or sends an email. Additionally, the duplicate-check query compares a UUID column (`user_id`) against an email string (line 122), so it will never detect duplicates:

```ts
.eq("user_id", inviteForm.email)  // always false — comparing UUID to email
```

**Recommended fix:**
- Implement actual invitation logic (Supabase Auth invitations, email service, etc.) or remove the feature.
- Fix the duplicate check to query the correct column (likely an `email` field).

---

## Medium Severity

### M-1 — Supabase Client Re-created on Every Render

**Files:** `app/(dashboard)/dashboard/page.tsx` line 19, `app/(dashboard)/candidates/page.tsx` line 9, and multiple component files

`createClient()` is called inside the component body without memoization. This creates a new client instance on every render, invalidating `useCallback` dependencies and triggering unnecessary re-fetches.

**Recommended fix:**
- Use `useMemo(() => createClient(), [])` as already done in `AICandidateMatching.tsx` and `EmailComposer.tsx`.
- Or: create a shared singleton in a context provider.

---

### M-2 — Infinite Re-render Risk from Unstable `supabase` in useCallback

**Files:** `app/(dashboard)/dashboard/page.tsx` line 48, `app/(dashboard)/candidates/page.tsx` line 28

`loadDashboardData` depends on `supabase` in its `useCallback` dependency array. Because `supabase` is re-created on every render (M-1), the callback is also re-created every render, which triggers the `useEffect` on every render — an infinite fetch loop.

**Recommended fix:**
- Fix M-1 first (memoize the client).
- Or: store the client in a `useRef` and exclude it from dependency arrays.

---

### M-3 — Duplicate SQL Schema Files

**Files:** `supabase/communication-schema.sql`, `supabase/quick-communication-setup.sql`

Both files create an identical `communications` table with identical columns and RLS policies. Running both files will produce errors from duplicate table/policy creation.

**Recommended fix:** Remove `supabase/quick-communication-setup.sql`.

---

### M-4 — Sample Data SQL References Non-existent Column

**File:** `supabase/sample-data.sql`  
**Line:** 42

The INSERT statement references a `position_applied` column that does not exist in the `candidates` table definition in `supabase/dashboard-schema.sql`. This SQL will fail at runtime.

**Recommended fix:** Remove `position_applied` from the INSERT, or add the column to the schema definition.

---

### M-5 — `ON CONFLICT` Used Without a UNIQUE Constraint

**File:** `supabase/sample-data.sql`  
**Line:** 13

Uses `ON CONFLICT (name) DO NOTHING` for `pipeline_stages`, but the schema defines no UNIQUE constraint on the `name` column. This will error at runtime.

**Recommended fix:** Add `UNIQUE(name)` to the `pipeline_stages` table definition, or change the INSERT strategy.

---

### M-6 — Missing UNIQUE Constraint for Analytics Trigger `ON CONFLICT`

**File:** `supabase/analytics-schema.sql`  
**Lines:** 133–144

The trigger function uses `ON CONFLICT (user_id, source_name) DO UPDATE` but `source_analytics` has no `UNIQUE(user_id, source_name)` constraint defined.

**Recommended fix:** Add `UNIQUE(user_id, source_name)` to the `source_analytics` table definition.

---

### M-7 — `pipeline_stages` Sample Data References Non-existent `description` Column

**File:** `supabase/sample-data.sql`  
**Line:** 3

The sample data INSERT includes a `description` column, but `dashboard-schema.sql` only defines `id`, `name`, `order_index`, and `created_at` for `pipeline_stages`.

**Recommended fix:** Either add the `description` column to the schema or remove it from the sample data INSERT.

---

### M-8 — Silent Error Swallowing in Multiple Components

**Files:**
- `app/(dashboard)/dashboard/page.tsx` line 45
- `app/(dashboard)/candidates/page.tsx` line 25
- `components/dashboard/CommunicationHistory.tsx` line 83
- `components/dashboard/CandidateAssignment.tsx` line 123

Multiple `catch` blocks silently discard errors. Users receive no feedback when data fails to load; the page simply appears empty.

**Recommended fix:**
- Display error states in the UI when fetching fails (an error banner or empty-state message).
- Log errors to a monitoring service (e.g., Sentry) even when not surfacing them to users.

---

### M-9 — Duplicate Form JSX Between Add/Edit Requisition Modals

**Files:** `components/dashboard/AddRequisitionModal.tsx`, `components/dashboard/EditRequisitionModal.tsx`

Approximately 90% of the JSX for form fields is duplicated between these two components. The only meaningful differences are the submit handler and modal title.

**Recommended fix:** Extract a shared `RequisitionForm` component and compose it in both modals.

---

### M-10 — Email Composer Does Not Send Emails

**File:** `components/dashboard/EmailComposer.tsx`  
**Lines:** 162–211

The component writes a record to the `communications` table with `status: "sent"` and shows a success toast, but no email is ever delivered through any email service.

**Recommended fix:**
- Integrate an actual email API (e.g., SendGrid, Resend, Postmark) via a Next.js API route.
- Or: rename the feature to "Communication Log" to accurately reflect that it records intent, not delivery.

---

### M-11 — Default Email Templates Re-seeded on Every Modal Open

**File:** `components/dashboard/EmailComposer.tsx`  
**Lines:** 39–118

`loadTemplates` checks if templates exist, and inserts defaults if the result is empty. This runs every time the modal opens. A transient query error could produce a false empty result, triggering duplicate default template inserts.

**Recommended fix:**
- Seed default templates in a database migration (run once), not in application code.
- If application-level seeding is necessary, use `ON CONFLICT DO NOTHING` with a stable unique key.

---

### M-12 — `update` Helper Uses Untyped `string` Key

**Files:** `components/dashboard/AddRequisitionModal.tsx` line 39, `components/dashboard/EditRequisitionModal.tsx` line 56

```ts
const update = (field: string, value: string) => setFormData(...)
```

The `field` parameter accepts any string, so typos in field names are not caught by TypeScript.

**Recommended fix:**

```ts
const update = (field: keyof typeof formData, value: string) => setFormData(...)
```

---

### M-13 — `toast` Reference Instability Causing Potential Infinite Re-fetches

**File:** `components/SavedSearches.tsx`  
**Line:** 55

`toast` is included in the `useCallback` dependency array for `loadSearches`. If the `ToastProvider` context recreates `{ toast: addToast }` on each render (a new object reference even with a stable `addToast`), the callback and its `useEffect` trigger will re-run on every render.

**Recommended fix:** Memoize the context value in `ToastProvider`: `useMemo(() => ({ toast: addToast }), [addToast])`.

---

## Low Severity

### L-1 — Dead File: `lib/supabase.ts`

**File:** `lib/supabase.ts`

This file exports a `supabase` client and `Database` type but is never imported anywhere. All components use `lib/supabase-browser.ts`, `lib/supabase-server.ts`, or `lib/supabase-middleware.ts`.

**Recommended fix:** Delete `lib/supabase.ts`.

---

### L-2 — Numerous Unused Type Definitions

**Files:**
- `lib/ai-types.ts`: `MobileOptimization`, `IntegrationStatus`, `CandidateCustomValue`, `AIInsight`, `IntegrationConfig`, `SearchAnalytics`, `CustomFieldFormData`, `AIRecommendation`
- `lib/analytics-types.ts`: `ChartData`, `TimeSeriesData`, `AnalyticsFilters`, `PerformanceMetric`, `RequisitionAnalytics`
- `lib/communication-types.ts`: `InterviewFormData`, `EmailTemplateFormData`
- `lib/team-types.ts`: `TeamNoteFormData`, `ApprovalFormData`, `TeamDashboard`, `ActivityFeedItem`, `TeamNotification`, `ApprovalWorkflow`, `TeamNote`, `UserPermissions`

These types are exported but never imported by any component, representing unimplemented planned features.

**Recommended fix:** Remove unused types, or move them to a `types/planned.ts` file clearly labeled as planned/unimplemented.

---

### L-3 — `buildOrGroup` Exported but Never Used Externally

**File:** `lib/builder.ts`  
**Line:** 41

`buildOrGroup` is exported but never imported by any other file. It should either be made private (remove `export`) or documented as a public API.

---

### L-4 — Inconsistent Error Handling Patterns

**Files:** Various components

Error handling is inconsistent across the codebase:
- Some components use `toast()` (preferred)
- Some use `alert()` (`AICandidateMatching.tsx` lines 92, 157)
- Some use local `setError` state
- Some silently swallow errors

**Recommended fix:** Standardize on `toast()` for all user-facing errors. Replace all `alert()` calls.

---

### L-5 — No Pagination on Any List Query

**Files:** `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/candidates/page.tsx`, `components/dashboard/AnalyticsDashboard.tsx`, `components/dashboard/CommunicationHistory.tsx`

All data queries use `select("*")` with no `.range()` or `.limit()`. As the database grows, these queries will become increasingly slow and transfer unnecessarily large payloads.

**Recommended fix:** Implement pagination with `.range(from, to)` and add corresponding UI pagination controls.

---

### L-6 — Missing Loading and Error States on Several Pages

**Files:** `app/(dashboard)/analytics/page.tsx`, `app/(dashboard)/team/page.tsx`, `app/(dashboard)/advanced/page.tsx`

These pages render nothing if `getUser()` fails or is slow. There is no loading indicator or error state.

**Recommended fix:** Add a loading skeleton and an error boundary or fallback UI for each page.

---

### L-7 — Misleading Stack Overflow Search UX Copy

**File:** `components/SearchBuilder.tsx`  
**Line:** 125 area

When Stack Overflow is selected as a source, the placeholder text says "Search for questions, tags, or topics," but the generated query uses `site:stackoverflow.com/users`, which searches user profiles — not questions or topics. The UX copy does not match the behavior.

**Recommended fix:** Either fix the query to search Stack Overflow content, or update the placeholder to "Search Stack Overflow user profiles."

---

### L-8 — `FollowUpReminder` Component Is Defined but Never Used

**File:** `components/dashboard/FollowUpReminder.tsx`

This component is defined but never imported or rendered anywhere. The `candidateName` prop is declared but omitted from destructuring (line 21), indicating incomplete implementation.

**Recommended fix:** Integrate into the candidate pipeline flow or remove it.

---

### L-9 — `CandidateAssignment` Component Is Defined but Never Used

**File:** `components/dashboard/CandidateAssignment.tsx`

Same situation as L-8 — defined but never rendered anywhere in the application.

**Recommended fix:** Integrate it or remove it.

---

### L-10 — Modal Dialogs Missing Focus Trap (Accessibility)

**Files:** All modal components (`AuthModal.tsx`, `AddRequisitionModal.tsx`, `EditRequisitionModal.tsx`, `EditCandidateModal.tsx`, `EmailComposer.tsx`, `FollowUpReminder.tsx`, inline modal in `CandidatePipeline.tsx`)

Modals have `role="dialog"` and `aria-modal="true"` but do not trap keyboard focus. Users can Tab past the modal into background content.

**Recommended fix:** Implement focus trapping using `@radix-ui/react-dialog`, `focus-trap-react`, or a custom implementation that moves focus back to the first focusable element when Tab is pressed from the last.

---

### L-11 — Unhandled Promise in `handleLoadTemplate`

**File:** `components/dashboard/AdvancedSearch.tsx`  
**Lines:** 123–130

The Supabase update for template usage count is called without `await` and the returned promise is not handled. Silent failures will go unnoticed.

**Recommended fix:** Either `await` the call with proper error handling, or use `void supabase.from(...)...` with a comment explaining why the error is intentionally ignored.

---

### L-12 — Hydration Mismatch Risk in Copyright Year

**File:** `components/LandingPage.tsx`  
**Line:** 93

`{new Date().getFullYear()}` in a client component is generally fine, but crossing midnight between server and client render on New Year's Eve could cause a React hydration mismatch warning.

**Recommended fix:** Compute the year server-side and pass it as a prop, or accept the negligible risk.

---

### L-13 — No Test Coverage Beyond `lib/builder.ts`

**File:** `tests/builder.test.ts`

Only the Boolean search builder utility has test coverage. There are zero tests for:
- Any React component
- Any Supabase interaction
- Any authentication flow
- Any form submission
- Any dashboard feature

**Recommended fix:**
- Add component tests for critical flows: authentication, candidate CRUD, pipeline stage updates, requisition management.
- Add integration tests for Supabase queries using a test database or mock client.
- Consider adding end-to-end tests with Playwright for the most critical user journeys.

---

## Architecture Issues

### A-1 — No API Routes: All Database Access from the Client

The entire application performs Supabase queries directly from client components. There are no Next.js API routes or Server Actions for mutations. Consequences:
- Business logic validation happens only client-side and can be bypassed.
- Complex operations cannot be wrapped in transactions.
- Server-side secrets (service role key) cannot be used for elevated operations.
- All database table names and column names are visible in client-side network traffic.

**Recommended fix:** Create Next.js API routes (or Server Actions) for all mutation operations. Keep client-side queries for real-time reads, but validate and execute writes through server-side routes.

---

### A-2 — No Shared State or Data Caching Layer

Each page independently fetches its own data. There is no shared state between pages; navigating away and back triggers full refetches with no caching.

**Recommended fix:** Adopt TanStack Query (React Query) or SWR for data fetching with caching, deduplication, and background refetching. This would also simplify loading/error state management.

---

### A-3 — Tight Coupling Between Components and Database Schema

Components reference Supabase table names and column names directly. There is no data access or repository layer. Any database schema change requires updating every component that queries the affected table.

**Recommended fix:** Introduce a `services/` or `repositories/` directory that encapsulates all database queries behind typed functions. Components call service functions; only services know about table names and columns.

---

## Dependency Notes

### D-1 — No Automated Vulnerability Auditing

The project uses React 19.1 and Next.js 15.5 (recent), but no automated vulnerability scanning is in place.

**Recommended fix:**
- Run `npm audit` and address any findings.
- Add `npm audit --audit-level=high` to the CI pipeline to fail builds with high/critical CVEs.
- Consider `npm audit --fix` for automatable patches.

---

*Review generated by Claude Code on 2026-04-06.*
