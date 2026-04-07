# HIRELab — Comprehensive Code Review

**Date:** April 1, 2026
**Reviewer:** AI Code Review
**Stack:** Next.js 15 / React 19 / TypeScript / Supabase / Tailwind CSS (installed but unused)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture & Project Structure](#2-architecture--project-structure)
3. [Critical Issues](#3-critical-issues)
4. [Code Quality Issues](#4-code-quality-issues)
5. [TypeScript & Type Safety](#5-typescript--type-safety)
6. [Next.js Best Practices](#6-nextjs-best-practices)
7. [Security Concerns](#7-security-concerns)
8. [Performance Issues](#8-performance-issues)
9. [UI/UX Issues](#9-uiux-issues)
10. [Database & SQL](#10-database--sql)
11. [Testing](#11-testing)
12. [Build & Configuration](#12-build--configuration)
13. [Recommendations for Improvement](#13-recommendations-for-improvement)

---

## 1. Executive Summary

HIRELab is a recruiting platform with Boolean search generation, candidate pipeline management, team collaboration, and analytics. The codebase is functional but has significant architectural and quality issues that will impede maintainability, scalability, and developer experience as the project grows.

**Key Findings:**

- Every page is a client component (`'use client'`) — no Server Components are used at all
- Tailwind CSS is installed but completely unused — all styling is done via inline JavaScript style objects
- `globals.css` is never imported, so its rules don't apply
- Navigation is copy-pasted across 6+ pages with no shared component
- Authentication logic is duplicated in every route
- `next.config.ts` suppresses all ESLint and TypeScript errors during build
- Multiple `any` types throughout the codebase
- Mock/hardcoded data in production components (`CandidatePipeline.tsx`)
- 14 markdown documentation files in the project root creating clutter
- 16 SQL migration files with no migration tool, naming inconsistency, and schema drift
- Zero test coverage
- No error boundaries or loading states via Suspense
- No middleware for auth — each page manually checks and redirects

---

## 2. Architecture & Project Structure

### 2.1 No Server Components

Every single page and component uses `'use client'`. This defeats one of Next.js 15's primary advantages — React Server Components (RSC). Data fetching that could happen server-side (auth checks, Supabase queries) is all done client-side via `useEffect`, leading to:

- Unnecessary loading spinners on every page
- Waterfalled network requests (auth check → data fetch)
- Larger client bundles

**Remedial Action:** Convert data-fetching pages to Server Components. Use `cookies()` from `next/headers` with Supabase's `createServerClient` for server-side auth. Reserve `'use client'` for interactive components only.

### 2.2 Duplicated Navigation

The same navigation bar (6 buttons with identical styling and hover handlers) is copy-pasted across `dashboard/page.tsx`, `candidates/page.tsx`, `analytics/page.tsx`, `team/page.tsx`, `search/page.tsx`, and `advanced/page.tsx`. Each copy is ~50 lines.

**Remedial Action:** Extract a shared `<Navigation />` component (or better, a layout group `app/(dashboard)/layout.tsx`) that wraps all authenticated pages.

### 2.3 Duplicated Auth Logic

Every authenticated page has an identical `checkAuth` function:

```typescript
const checkAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }
    setUser(user);
  } catch (error) {
    console.error('Auth error:', error);
    router.push('/');
  } finally {
    setLoading(false);
  }
};
```

This is repeated in 6 files.

**Remedial Action:** Use Next.js middleware (`middleware.ts`) for route protection, or create a shared auth hook/wrapper. Better yet, use server-side auth in layouts.

### 2.4 Flat Component Structure

All 15 dashboard components live in `components/dashboard/` with no sub-grouping. As the app grows, this will become unwieldy.

**Remedial Action:** Organize by feature: `components/pipeline/`, `components/analytics/`, `components/team/`, `components/communication/`, etc. Or co-locate components with their routes.

### 2.5 Root Markdown Clutter

14 markdown files sit in the project root:
- `ADVANCED-ANALYTICS-FEATURE.md`
- `ADVANCED-FEATURES-IMPLEMENTATION.md`
- `CANDIDATE-EDIT-FEATURE.md`
- `COMMUNICATION-HUB-FEATURE.md`
- `DASHBOARD-SETUP.md`
- `FINAL-SUMMARY.md`
- `FUNNEL-COLORS.md`
- `LINKEDIN-OPENTOWORK.md`
- `PRD.md`
- `PROJECT-SUMMARY.md`
- `RESTRUCTURE-COMPLETE.md`
- `SETUP.md`
- `TEAM-COLLABORATION-FEATURE.md`
- `README.md`

**Remedial Action:** Move feature docs into a `docs/` directory. Remove implementation log files (`FINAL-SUMMARY.md`, `RESTRUCTURE-COMPLETE.md`, etc.) — these belong in commit messages/PR descriptions, not the repo.

---

## 3. Critical Issues

### 3.1 `globals.css` Is Never Imported

`app/layout.tsx` does not import `./globals.css`:

```typescript
// layout.tsx — no CSS import
import type { Metadata } from "next";

export const metadata: Metadata = { ... };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, ... }}>
        {children}
      </body>
    </html>
  );
}
```

The CSS reset and base styles in `globals.css` are dead code. Instead, inline styles on `<body>` are used.

**Remedial Action:** Add `import './globals.css';` to `layout.tsx`. Remove the duplicate inline styles from the `<body>` tag.

### 3.2 Tailwind CSS Installed But Completely Unused

`tailwindcss`, `postcss`, and `autoprefixer` are in `devDependencies`, but:
- There is no `tailwind.config.ts` or `tailwind.config.js`
- There is no `postcss.config.mjs` or `postcss.config.js`
- No Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) exist in any CSS file
- Zero Tailwind classes are used anywhere in the codebase

Instead, every component uses verbose inline JavaScript style objects (e.g., `{ padding: '0.5rem 1rem', fontSize: '0.875rem', ... }`).

**Remedial Action:** Either fully configure and adopt Tailwind CSS (strongly recommended — it's the intended styling approach per the tech stack) or remove it from dependencies to avoid confusion.

### 3.3 Build Errors Are Suppressed

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
```

This masks all TypeScript and linting errors, allowing broken code to ship to production.

**Remedial Action:** Remove these flags. Fix any build errors they were hiding. Enforce CI checks.

### 3.4 Mock Data in Production Components

`CandidatePipeline.tsx` (lines 332-347) uses `Math.random()` to generate fake engagement, technical assessment, and cultural fit data on every render:

```typescript
const mockEngagement = {
  lastContact: candidate.updated_at,
  responded: Math.random() > 0.3,
};
const mockTechnical = {
  codingScore: Math.floor(Math.random() * 40) + 60,
  ...
};
```

This data flickers on re-renders and misleads users. The candidate detail modal also shows hardcoded strings like `"Applied for: Software Engineer"` and `"Coding Score: 85/100"`.

**Remedial Action:** Remove all mock data. Show only real data from the database. Use placeholder/empty states for missing data. Add the necessary database columns if the data model needs to support these fields.

---

## 4. Code Quality Issues

### 4.1 Massive Inline Style Objects

Every component defines 50-200+ lines of JavaScript style objects. For example, `CandidatePipeline.tsx` has 205 lines of styles before any logic. This:
- Bloats component files
- Makes styles hard to search, reuse, and maintain
- Prevents pseudo-classes (`:hover`, `:focus`, `:active`) — leading to `onMouseOver`/`onMouseOut` workarounds
- Prevents media queries for responsive design
- Prevents CSS animations and transitions properly

**Remedial Action:** Migrate to Tailwind CSS or CSS Modules. This is the single biggest code quality improvement available.

### 4.2 Inline Hover Handlers Everywhere

Because inline styles can't express `:hover`, every button has:

```tsx
onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
```

This pattern appears 50+ times across the codebase.

**Remedial Action:** Replace with Tailwind's `hover:` utilities or CSS classes.

### 4.3 Duplicate Style Definitions

The same style objects (`navButton`, `activeNavButton`, `loading`, `pageTitle`, `subtitle`, etc.) are redefined identically in every page file.

**Remedial Action:** Centralize shared styles. With Tailwind, this is automatic via utility classes. Alternatively, create shared style constants.

### 4.4 Inconsistent Indentation

`dashboard/page.tsx` has mixed indentation — some JSX is indented 12 spaces while sibling elements use 8:

```tsx
        {/* Navigation */}
            <div style={styles.navigation}>  // 12 spaces
              <button ...>                    // 14 spaces
```

There are also variables (`rejectedCount`, `withdrawnCount`, `handleEditRequisition`) declared at a wrong indentation level, appearing to be inside a block but actually at the component's top scope.

**Remedial Action:** Run Prettier across the project with a consistent config.

### 4.5 `console.log` Debugging Statements

`TeamManagement.tsx` has multiple debug logs left in production code:

```typescript
console.log('Loading team data for user:', userId);
console.log('Team data:', teamData);
console.log('Team error:', teamError);
console.log('Members data:', membersData);
console.log('Members error:', membersError);
```

The `advanced/page.tsx` also logs search results: `console.log('Search results:', results);`

**Remedial Action:** Remove all debug `console.log` statements. Use a proper logging utility if runtime logging is needed.

### 4.6 `alert()` and `confirm()` for User Feedback

Multiple components use `alert()` and `confirm()` for user interaction:
- `alert('Search saved successfully!')`
- `alert('Please sign in to save searches')`
- `confirm('Are you sure you want to delete this search?')`

**Remedial Action:** Replace with proper toast notifications and confirmation modals for a professional UX.

### 4.7 `prompt()` for Input

`SearchBuilder.tsx` uses `prompt('Enter a name for this search:')` to get a search name.

**Remedial Action:** Replace with a proper modal or inline input field.

---

## 5. TypeScript & Type Safety

### 5.1 Widespread `any` Usage

- `Header.tsx`: `const [user, setUser] = useState<any>(null);`
- `SearchBuilder.tsx`: `const [user, setUser] = useState<any>(null);`
- `SavedSearches.tsx`: `const [user, setUser] = useState<any>(null);`
- `TeamManagement.tsx`: `onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })`
- `AnalyticsDashboard.tsx`: `calculateFunnelData(candidates: any[], stages: any[])`
- Multiple `catch (error: any)` blocks

**Remedial Action:** Define proper types for the Supabase `User` object. Import `User` from `@supabase/supabase-js`. Type all function parameters properly. Use `unknown` instead of `any` for catch blocks and narrow with type guards.

### 5.2 Unused Type Imports

`AnalyticsDashboard.tsx` imports `ChartData` and `FunnelData` from `@/lib/analytics-types` but the `FunnelData` from analytics-types conflicts with the `FunnelData` from `@/lib/dashboard-types`. The imported `ChartData` type is never used.

**Remedial Action:** Remove unused imports. Resolve the conflicting `FunnelData` type name.

### 5.3 Database Types Not Generated from Schema

The `Database` type in `lib/supabase.ts` is manually maintained and only covers 3 tables (`sources`, `saved_searches`, `synonyms`). The actual schema has 10+ tables. It's also not used when calling `createClient`.

**Remedial Action:** Use `supabase gen types typescript` to auto-generate types from the database schema. Pass the generated type to `createClient<Database>()`.

### 5.4 Type Definitions with Unused Fields

Several type files (`ai-types.ts`, `team-types.ts`, `analytics-types.ts`, `communication-types.ts`) define extensive interfaces that are never used in the application:
- `AIInsight`, `IntegrationConfig`, `SearchAnalytics`, `AIRecommendation`, `MobileOptimization` — none referenced
- `Interview`, `EmailTemplate` — defined but not used by any component

**Remedial Action:** Remove unused type definitions, or mark them as planned future work in a separate file.

---

## 6. Next.js Best Practices

### 6.1 No Middleware

There is no `middleware.ts` file. Auth checks happen client-side in every page, causing:
- Flash of unauthenticated content
- Duplicate code
- Slower perceived navigation

**Remedial Action:** Add `middleware.ts` using `@supabase/ssr` to handle auth redirection at the edge.

### 6.2 No Loading/Error States

No `loading.tsx`, `error.tsx`, or `not-found.tsx` files exist in any route. Next.js provides these as first-class conventions.

**Remedial Action:** Add `loading.tsx` for Suspense boundaries and `error.tsx` for error boundaries in the `app/(dashboard)/` layout group.

### 6.3 No Layout Groups

All authenticated pages share the same nav, header, and auth check, but each is a standalone page. There's no shared layout.

**Remedial Action:** Create `app/(dashboard)/layout.tsx` that wraps `/dashboard`, `/candidates`, `/analytics`, `/team`, `/search`, and `/advanced` with shared navigation and auth.

### 6.4 No Metadata on Sub-Pages

Only `layout.tsx` sets metadata. Individual pages don't export `metadata` or `generateMetadata()`, so all pages show the same title: "HIRELab".

**Remedial Action:** Add page-specific metadata exports (e.g., `title: "Candidates | HIRELab"`).

### 6.5 Supabase Client Not Using SSR Package

The app uses `@supabase/supabase-js` directly with a single client instance (`lib/supabase.ts`). For Next.js apps, `@supabase/ssr` is recommended to properly handle cookies and server-side rendering.

**Remedial Action:** Install `@supabase/ssr` and create separate browser/server clients following the official Supabase + Next.js guide.

---

## 7. Security Concerns

### 7.1 Supabase Credentials in `.env.local` Committed to Repo

The `.env.local` file appears to be tracked by git (it shows in the project structure). While the anon key is intended to be public, `.env.local` should be in `.gitignore`.

**Remedial Action:** Verify `.env.local` is in `.gitignore`. If it was previously committed, rotate the Supabase anon key.

### 7.2 No Row-Level Security Validation in Client Code

Supabase queries don't filter by `user_id` in several places:
- `dashboard/page.tsx` loads ALL requisitions and candidates (`select('*')` with no `.eq('user_id', ...)`)
- `SavedSearches.tsx` loads all saved searches without a user filter

This relies entirely on Supabase RLS policies. If RLS is misconfigured, data leaks between users.

**Remedial Action:** Always include `user_id` filters in client queries as defense-in-depth. Audit all Supabase RLS policies.

### 7.3 No CSRF Protection on Forms

Forms submit directly via Supabase client calls with no CSRF token validation.

**Remedial Action:** For the current architecture (SPA-style with Supabase), this is partially mitigated by the auth token. However, if you add any server actions or API routes, ensure CSRF protection is in place.

### 7.4 No Input Sanitization

The Boolean search builder concatenates user input into search strings without sanitization beyond basic quoting. While this is used for generating search URLs (not SQL), XSS via crafted search terms stored in `saved_searches` is possible.

**Remedial Action:** Sanitize all user inputs before storing. Ensure the `sanitizeToken` function in `builder.ts` is robust against injection.

---

## 8. Performance Issues

### 8.1 No Data Caching or Deduplication

Every page navigation triggers fresh Supabase queries. There's no SWR, React Query, or any caching layer.

**Remedial Action:** Adopt `@tanstack/react-query` or SWR for client-side data fetching with caching, deduplication, and background revalidation.

### 8.2 Waterfalled Requests

`dashboard/page.tsx` loads requisitions, candidates, and stages sequentially via separate `await` calls:

```typescript
const { data: reqData } = await supabase.from('requisitions').select('*')...
setRequisitions(reqData || []);
const { data: candData } = await supabase.from('candidates').select('*');
setCandidates(candData || []);
const { data: stageData } = await supabase.from('pipeline_stages').select('*')...
```

**Remedial Action:** Use `Promise.all()` to parallelize independent queries:

```typescript
const [reqRes, candRes, stageRes] = await Promise.all([
  supabase.from('requisitions').select('*').order('created_at', { ascending: false }),
  supabase.from('candidates').select('*'),
  supabase.from('pipeline_stages').select('*').order('order_index'),
]);
```

### 8.3 Full Table Scans

Multiple queries fetch all rows with no pagination:
- `select('*')` on candidates with no limit
- `select('*')` on requisitions with no limit

**Remedial Action:** Add pagination (`.range(0, 50)`) and implement infinite scroll or pagination UI.

### 8.4 Re-renders from Random Data

`CandidatePipeline.tsx` generates `Math.random()` values during render, causing different data on every re-render and preventing React's memoization from working.

**Remedial Action:** Remove mock data entirely (see §3.4).

### 8.5 No Image Optimization

The `/public` directory contains SVG files but `next/image` is never used. If any raster images are added in the future, they won't benefit from Next.js image optimization.

**Remedial Action:** Use `next/image` for any image assets.

---

## 9. UI/UX Issues

### 9.1 No Responsive Design

The entire app uses fixed pixel values and `minmax()` grids. There are zero media queries or responsive breakpoints. The navigation bar will overflow on mobile screens.

**Remedial Action:** Implement responsive design. Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) or add media queries.

### 9.2 No Keyboard Navigation

- Modal close buttons lack `aria-label`
- Tab navigation through modals is not trapped
- No focus management when modals open/close
- Buttons with `onMouseOver`/`onMouseOut` have no keyboard equivalent (`:focus-visible`)

**Remedial Action:** Add focus trapping to modals. Use `aria-*` attributes. Ensure all interactive elements are keyboard-accessible. Consider using Radix UI primitives for accessible modal/dialog behavior.

### 9.3 No Dark Mode Support

The app has a hardcoded light theme with no dark mode option.

**Remedial Action:** Implement dark mode using Tailwind's `dark:` variant or CSS custom properties.

### 9.4 Navigation Has No Mobile Menu

The 6-button horizontal nav doesn't collapse or wrap on small screens.

**Remedial Action:** Add a responsive sidebar or hamburger menu for mobile.

### 9.5 Auth Flow Inconsistency

- Sign Up (home page) uses magic link OTP
- Sign In (`/signin`) uses email + password
- These are fundamentally different auth flows and would confuse users

**Remedial Action:** Unify the auth approach. Either use magic link everywhere or password everywhere. Provide a consistent experience.

### 9.6 No Empty State Illustrations

Empty states show plain text like "No candidates found" with no visual hierarchy or calls to action.

**Remedial Action:** Add meaningful empty states with illustrations and action buttons (e.g., "Add your first candidate").

### 9.7 No Confirmation After Destructive Actions

The only confirmation is `window.confirm()`. There's no undo capability for deletion.

**Remedial Action:** Add proper confirmation dialogs and consider soft-delete patterns.

---

## 10. Database & SQL

### 10.1 No Migration System

16 SQL files in `supabase/` with no ordering or migration tool:
- `schema.sql`, `dashboard-schema.sql`, `ai-features-schema.sql`, `analytics-schema.sql`
- `communication-schema.sql`, `team-collaboration-schema.sql`
- `add-hire-date.sql`, `fix-team-policies.sql`
- `debug-team-setup.sql`, `debug-user.sql`, `test-user-setup.sql`
- `working-user-setup.sql`, `final-user-setup.sql`, `fixed-user-setup.sql`
- `quick-communication-setup.sql`, `sample-data.sql`

There's no way to know what order to run these, which have been applied, or which are safe for production.

**Remedial Action:** Adopt Supabase migrations (`supabase migration new`) for versioned, ordered schema changes. Remove debug/test SQL files from the repo.

### 10.2 Debug and Test SQL in Production Repo

Files like `debug-user.sql`, `debug-team-setup.sql`, `test-user-setup.sql`, `working-user-setup.sql`, and `fixed-user-setup.sql` are development artifacts that shouldn't be in the repo.

**Remedial Action:** Remove these files. Keep only the canonical schema and migration files.

### 10.3 Schema Drift

`sample-data.sql` references columns and table structures that don't match `dashboard-schema.sql`. For example, references to `pipeline_stages.description` or `position_applied` columns that don't exist in the schema files.

**Remedial Action:** Audit and reconcile SQL files against the actual production database schema. Generate a single source-of-truth migration.

### 10.4 Manual `Database` Type

The type definition in `lib/supabase.ts` only covers 3 of 10+ tables and is not used.

**Remedial Action:** Auto-generate types using `supabase gen types typescript --project-id <id>`.

---

## 11. Testing

### 11.1 Zero Test Coverage

There are no test files, no testing libraries in `package.json`, and no test scripts.

**Remedial Action:**
1. Add testing dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
2. Write unit tests for `lib/builder.ts` (pure logic — easy to test)
3. Write component tests for key interactive components
4. Add `"test": "vitest"` to package scripts
5. Aim for critical-path coverage first (auth flow, search generation, CRUD operations)

---

## 12. Build & Configuration

### 12.1 ESLint + TypeScript Errors Suppressed

As noted in §3.3, both are ignored during builds.

### 12.2 Target ES2017

`tsconfig.json` targets ES2017. Modern browsers support ES2022+, and Next.js handles transpilation.

**Remedial Action:** Update target to `ES2022` for better performance and smaller output.

### 12.3 Duplicate ESLint Config

Both `.eslintrc.json` and `eslint.config.mjs` exist. Next.js 15 uses flat config (`eslint.config.mjs`), so the legacy file is likely ignored but creates confusion.

**Remedial Action:** Remove `.eslintrc.json`.

### 12.4 Missing Tailwind/PostCSS Config Files

`tailwindcss`, `postcss`, and `autoprefixer` are in `devDependencies` but their config files don't exist.

**Remedial Action:** Either generate configs (`npx tailwindcss init -p`) and adopt Tailwind, or remove the unused dependencies.

### 12.5 No CI/CD Configuration

No GitHub Actions, Vercel config, or any CI pipeline definition.

**Remedial Action:** Add a CI pipeline that runs linting, type checking, and tests on PRs.

---

## 13. Recommendations for Improvement

### High Priority (Do First)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 1 | **Configure and adopt Tailwind CSS** — Remove all inline style objects, add `tailwind.config.ts` and `postcss.config.mjs`, add Tailwind directives to `globals.css`, import `globals.css` in `layout.tsx`. This single change fixes responsive design, hover states, dark mode, and code bloat. | Very High | High |
| 2 | **Extract shared layout for authenticated pages** — Create `app/(dashboard)/layout.tsx` with shared navigation and auth. Eliminate copy-pasted nav across 6 pages. | High | Medium |
| 3 | **Add Next.js middleware for auth** — Create `middleware.ts` to protect routes at the edge instead of client-side `useEffect` checks. | High | Medium |
| 4 | **Remove mock/hardcoded data** — Clean up `CandidatePipeline.tsx` randomized data and hardcoded strings in the detail modal. | High | Low |
| 5 | **Re-enable ESLint and TypeScript checking in builds** — Remove `ignoreDuringBuilds` and `ignoreBuildErrors` from `next.config.ts`. Fix any revealed errors. | High | Medium |
| 6 | **Fix `globals.css` import** — Add `import './globals.css'` to `layout.tsx`. | High | Trivial |

### Medium Priority

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 7 | **Eliminate `any` types** — Replace all `any` with proper types. Import `User` from Supabase. Use `unknown` for catch blocks. | Medium | Medium |
| 8 | **Parallelize Supabase queries** — Use `Promise.all()` for independent data fetches. | Medium | Low |
| 9 | **Add data caching** — Integrate `@tanstack/react-query` or SWR for client data fetching. | Medium | Medium |
| 10 | **Convert key pages to Server Components** — Especially landing page, signin, and data-heavy dashboard pages. | Medium | High |
| 11 | **Add pagination** — Implement pagination or infinite scroll for candidates and requisitions lists. | Medium | Medium |
| 12 | **Adopt Supabase SSR package** — Install `@supabase/ssr` and create proper browser/server client separation. | Medium | Medium |
| 13 | **Add page-specific metadata** — Export `metadata` from each page for proper tab titles and SEO. | Medium | Low |
| 14 | **Replace `alert()`/`confirm()`/`prompt()`** — Use proper toast notifications and modal dialogs. | Medium | Medium |
| 15 | **Clean up SQL files** — Remove debug scripts, adopt Supabase migrations. | Medium | Medium |

### Lower Priority (Nice to Have)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 16 | **Add testing** — Set up Vitest + React Testing Library. Write tests for `builder.ts` and auth flows. | Medium | High |
| 17 | **Add CI pipeline** — GitHub Actions for lint, type-check, and test. | Medium | Medium |
| 18 | **Add keyboard accessibility** — Focus trapping in modals, `aria-*` attributes, `:focus-visible` styles. | Medium | Medium |
| 19 | **Add dark mode** — Implement via Tailwind's `dark:` variant. | Low | Medium |
| 20 | **Add loading/error boundaries** — Create `loading.tsx` and `error.tsx` in route groups. | Low | Low |
| 21 | **Organize root markdown files** — Move to `docs/` and remove implementation logs. | Low | Trivial |
| 22 | **Unify auth flow** — Decide on magic link vs. password auth and make it consistent. | Medium | Medium |
| 23 | **Auto-generate Supabase types** — Use `supabase gen types typescript` and wire into `createClient<Database>()`. | Medium | Low |
| 24 | **Add responsive mobile design** — Hamburger menu, responsive grids, touch-friendly targets. | High | High |
| 25 | **Remove unused dependencies and type definitions** — Audit `ai-types.ts`, `communication-types.ts` for dead code. | Low | Low |

---

## Summary

The application works and delivers its core value proposition, but it has accumulated significant technical debt. The highest-impact changes are:

1. **Adopt Tailwind CSS properly** (fixes styling, responsive, hover, dark mode, code bloat all at once)
2. **Extract shared layouts and navigation** (eliminates massive code duplication)
3. **Add auth middleware** (security + DX improvement)
4. **Re-enable build checks** (safety net for the codebase)

These four changes alone would transform the project from a prototype into a maintainable production application.
