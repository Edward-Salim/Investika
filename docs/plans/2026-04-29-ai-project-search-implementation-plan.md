# AI Project Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-powered homepage search that interprets natural-language investment queries, plans a schema-aware project search, and returns project cards plus a short AI explanation.

**Architecture:** Add a dedicated server endpoint that calls Gemini through an OpenAI SDK-compatible client, injects a summarized database schema and allowed join graph into the prompt, validates a structured query plan, translates the approved plan into safe database queries, and returns normalized project-card results to the homepage. Replace the current mock `handleSearch()` parser with an async request flow while keeping the existing summary panel and project-card UI.

**Tech Stack:** SvelteKit, Svelte 5 runes, TypeScript, Drizzle ORM, Postgres, Vitest, OpenAI SDK-compatible Gemini endpoint

---

### Task 1: Add the AI client and environment contract

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `src/lib/server/ai/client.ts`
- Test: `src/lib/server/ai/client.spec.ts`

**Step 1: Write the failing test**

Create `src/lib/server/ai/client.spec.ts` with tests that assert:
- creating the AI client throws or returns a clear failure when the API key is missing
- the client uses the configured model name from environment
- the exported helper does not make network calls during construction

Example skeleton:

```ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: {
    GEMINI_API_KEY: '',
    GEMINI_MODEL: 'gemini-2.5-flash'
  }
}));

describe('createAiClient', () => {
  it('fails clearly when GEMINI_API_KEY is missing', async () => {
    const { createAiClient } = await import('./client');
    expect(() => createAiClient()).toThrow(/GEMINI_API_KEY/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/lib/server/ai/client.spec.ts`
Expected: FAIL because `src/lib/server/ai/client.ts` does not exist yet.

**Step 3: Write minimal implementation**

- Add the OpenAI SDK dependency in `package.json`
- Add placeholder env entries in `.env.example`:
  - `GEMINI_API_KEY=`
  - `GEMINI_MODEL=gemini-2.5-flash`
  - `GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/`
- Create `src/lib/server/ai/client.ts` that:
  - reads env from `$env/dynamic/private`
  - exports `createAiClient()`
  - instantiates the OpenAI client with Gemini base URL
  - exports a helper for resolving the configured model name

Example implementation:

```ts
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

export function getAiModel() {
  return env.GEMINI_MODEL || 'gemini-2.5-flash';
}

export function createAiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for AI project search.');
  }

  return new OpenAI({
    apiKey: env.GEMINI_API_KEY,
    baseURL: env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/'
  });
}
```

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/lib/server/ai/client.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add package.json .env.example src/lib/server/ai/client.ts src/lib/server/ai/client.spec.ts
rtk git commit -m "feat: add ai client for project search"
```

### Task 2: Define the structured query-plan types and validation rules

**Files:**
- Create: `src/lib/server/ai/project-search/types.ts`
- Create: `src/lib/server/ai/project-search/validator.ts`
- Test: `src/lib/server/ai/project-search/validator.spec.ts`

**Step 1: Write the failing test**

Create `src/lib/server/ai/project-search/validator.spec.ts` covering:
- accepts `intent: 'find_projects'`
- rejects unsupported intents
- rejects unknown tables, fields, joins, and operators
- clamps or rejects oversized limits
- accepts a valid join from `investment_opportunities` to `adm_provinces`

Example skeleton:

```ts
import { describe, expect, it } from 'vitest';
import { validateProjectSearchPlan } from './validator';

describe('validateProjectSearchPlan', () => {
  it('accepts a valid plan', () => {
    const result = validateProjectSearchPlan({
      intent: 'find_projects',
      base_table: 'investment_opportunities',
      joins: [],
      filters: [],
      sort: [],
      limit: 20,
      select_strategy: 'project_cards',
      explanation: 'Searching all projects.'
    });

    expect(result.intent).toBe('find_projects');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/validator.spec.ts`
Expected: FAIL because validator files do not exist yet.

**Step 3: Write minimal implementation**

Create `types.ts` with:
- `ProjectSearchIntent`
- `ProjectSearchJoin`
- `ProjectSearchFilter`
- `ProjectSearchSort`
- `ProjectSearchPlan`

Create `validator.ts` with:
- constant allowlists for tables, operators, and fields
- constant allowlist for join edges
- `validateProjectSearchPlan(input)` that:
  - validates object shape
  - rejects unknown or unsupported values
  - enforces `intent === 'find_projects'`
  - enforces `base_table === 'investment_opportunities'`
  - caps limit to a safe max, such as 24
  - returns a normalized typed plan

Keep validation hand-written and narrow; do not introduce a schema library unless clearly needed.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/validator.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/lib/server/ai/project-search/types.ts src/lib/server/ai/project-search/validator.ts src/lib/server/ai/project-search/validator.spec.ts
rtk git commit -m "feat: validate ai project search plans"
```

### Task 3: Build the schema summary and prompt generator

**Files:**
- Create: `src/lib/server/ai/project-search/schema-summary.ts`
- Create: `src/lib/server/ai/project-search/prompt.ts`
- Test: `src/lib/server/ai/project-search/prompt.spec.ts`

**Step 1: Write the failing test**

Create `prompt.spec.ts` that asserts:
- the generated prompt mentions `investment_opportunities` and allowed supporting tables
- the prompt includes the rule to always return project-search plans
- the prompt explicitly forbids SQL output
- the prompt embeds the user query

Example skeleton:

```ts
import { describe, expect, it } from 'vitest';
import { buildProjectSearchPrompt } from './prompt';

describe('buildProjectSearchPrompt', () => {
  it('includes schema guidance and output rules', () => {
    const prompt = buildProjectSearchPrompt('energy projects in Sulawesi');
    expect(prompt).toContain('investment_opportunities');
    expect(prompt).toContain('Always return project-search plans');
    expect(prompt).toContain('Do not output SQL');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/prompt.spec.ts`
Expected: FAIL because prompt builder files do not exist yet.

**Step 3: Write minimal implementation**

Create `schema-summary.ts` that exports static metadata derived from `src/lib/server/db/schema.ts`, including:
- approved tables
- relevant columns for each table
- human-readable descriptions
- allowed join paths

Create `prompt.ts` that exports `buildProjectSearchPrompt(query: string)` and returns one structured prompt string with:
- product goal
- output contract
- schema summary
- join graph summary
- operator allowlist
- JSON-only response instructions
- the user query

Do not read raw TypeScript source at runtime for the prompt; keep the prompt input stable and explicit.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/prompt.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/lib/server/ai/project-search/schema-summary.ts src/lib/server/ai/project-search/prompt.ts src/lib/server/ai/project-search/prompt.spec.ts
rtk git commit -m "feat: add prompt builder for ai project search"
```

### Task 4: Implement the planner that calls Gemini and parses JSON safely

**Files:**
- Create: `src/lib/server/ai/project-search/planner.ts`
- Test: `src/lib/server/ai/project-search/planner.spec.ts`

**Step 1: Write the failing test**

Create `planner.spec.ts` with mocked AI client responses covering:
- valid JSON plan response
- invalid JSON response
- empty content response
- plan explanation preserved after validation

Example skeleton:

```ts
import { describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('$lib/server/ai/client', () => ({
  createAiClient: () => ({
    chat: {
      completions: {
        create: createMock
      }
    }
  }),
  getAiModel: () => 'gemini-2.5-flash'
}));

describe('planProjectSearch', () => {
  it('parses a valid AI response into a validated plan', async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              intent: 'find_projects',
              base_table: 'investment_opportunities',
              joins: [],
              filters: [],
              sort: [],
              limit: 20,
              select_strategy: 'project_cards',
              explanation: 'Searching all projects.'
            })
          }
        }
      ]
    });

    const { planProjectSearch } = await import('./planner');
    const plan = await planProjectSearch('all projects');
    expect(plan.intent).toBe('find_projects');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/planner.spec.ts`
Expected: FAIL because planner does not exist yet.

**Step 3: Write minimal implementation**

Create `planner.ts` that:
- builds the prompt using `buildProjectSearchPrompt`
- calls `createAiClient().chat.completions.create(...)`
- requests JSON output only
- extracts message content
- parses JSON carefully
- passes the result through `validateProjectSearchPlan`
- throws a clear, user-safe error when parsing or validation fails

Keep the planner focused on model communication and normalization only.
Do not mix database querying into this module.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/planner.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/lib/server/ai/project-search/planner.ts src/lib/server/ai/project-search/planner.spec.ts
rtk git commit -m "feat: add ai planner for project search"
```

### Task 5: Translate validated plans into safe database queries

**Files:**
- Create: `src/lib/server/ai/project-search/query.ts`
- Create: `src/lib/server/ai/project-search/normalize-project.ts`
- Test: `src/lib/server/ai/project-search/query.spec.ts`

**Step 1: Write the failing test**

Create `query.spec.ts` that verifies:
- a validated empty plan returns a query definition rooted in `investment_opportunities`
- supported filters map to the expected query fragments
- joining `adm_provinces` is represented correctly
- the normalized project shape matches the existing `ProjectCard` contract from `src/lib/components/ProjectCard.svelte`

Since direct Drizzle query execution is awkward to unit test, prefer testing:
- query-definition building in pure functions
- normalization of a sample database row into the UI shape

Example skeleton:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeProjectCard } from './normalize-project';

describe('normalizeProjectCard', () => {
  it('maps database fields into project card fields', () => {
    const result = normalizeProjectCard({
      id_peluang: 1,
      nama: 'Geothermal Expansion',
      nama_provinsi: 'Sulawesi Selatan',
      nama_sektor: 'Energi',
      nilai_investasi: '$120M',
      nilai_npv: '$40M',
      nilai_irr: '18%',
      image_url: null,
      status: 'Ready to Offer',
      id_adm_provinsi: 73
    });

    expect(result.title).toBe('Geothermal Expansion');
    expect(result.location).toBe('Sulawesi Selatan');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/query.spec.ts`
Expected: FAIL because the modules do not exist yet.

**Step 3: Write minimal implementation**

Create `normalize-project.ts` that converts database rows into the same project-card shape currently assembled in `src/routes/+page.svelte`.

Create `query.ts` with two functions:
- `buildProjectSearchQueryDefinition(plan)` for pure, testable planning
- `executeProjectSearchPlan(db, plan)` for real Drizzle execution

Implementation rules:
- only support the approved joins and operators
- keep projection narrow to project-card fields
- preserve deterministic sorting and limit behavior
- choose latest-year heuristics explicitly for regional yearly tables if needed

Do not over-generalize into a full query language.
Implement only the cases needed for the MVP allowlist.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/lib/server/ai/project-search/query.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/lib/server/ai/project-search/query.ts src/lib/server/ai/project-search/normalize-project.ts src/lib/server/ai/project-search/query.spec.ts
rtk git commit -m "feat: execute validated ai project searches"
```

### Task 6: Add the SvelteKit API endpoint for AI project search

**Files:**
- Create: `src/routes/api/ai-search-projects/+server.ts`
- Test: `src/routes/api/ai-search-projects/+server.spec.ts`

**Step 1: Write the failing test**

Create `+server.spec.ts` that covers:
- rejects missing or empty `query`
- returns 503 when `db` is unavailable
- returns 200 with `{ summary, appliedPlan, projects }` on success
- returns a safe 400 or 422 when the AI plan cannot be interpreted

Mock the planner and query executor instead of hitting the real model or database.

Example skeleton:

```ts
import { describe, expect, it, vi } from 'vitest';
import { POST } from './+server';

vi.mock('$lib/server/ai/project-search/planner', () => ({
  planProjectSearch: vi.fn()
}));

vi.mock('$lib/server/ai/project-search/query', () => ({
  executeProjectSearchPlan: vi.fn()
}));

describe('POST /api/ai-search-projects', () => {
  it('rejects empty queries', async () => {
    const response = await POST(
      new Request('http://localhost/api/ai-search-projects', {
        method: 'POST',
        body: JSON.stringify({ query: '' })
      }) as any
    );

    expect(response.status).toBe(400);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/routes/api/ai-search-projects/+server.spec.ts`
Expected: FAIL because endpoint does not exist yet.

**Step 3: Write minimal implementation**

Create `+server.ts` that:
- accepts JSON `{ query: string }`
- trims and validates the query
- checks `db`
- calls `planProjectSearch(query)`
- calls `executeProjectSearchPlan(db, plan)`
- returns `{ summary: plan.explanation, appliedPlan: plan, projects }`
- maps recoverable planner/validation errors to user-safe response codes and messages

Keep error payloads small and avoid leaking internal prompt or schema details.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/routes/api/ai-search-projects/+server.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/routes/api/ai-search-projects/+server.ts src/routes/api/ai-search-projects/+server.spec.ts
rtk git commit -m "feat: add ai project search endpoint"
```

### Task 7: Move homepage project shaping into shared helpers

**Files:**
- Create: `src/lib/projects/project-card.ts`
- Modify: `src/routes/+page.server.ts`
- Modify: `src/routes/+page.svelte`
- Test: `src/lib/projects/project-card.spec.ts`

**Step 1: Write the failing test**

Create `project-card.spec.ts` that verifies:
- category mapping from Indonesian sector labels to UI labels
- investment and IRR numeric parsing
- fallback title and location behavior

This extracts logic currently embedded in `src/routes/+page.svelte` into one reusable place for both initial page load and AI endpoint results.

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/lib/projects/project-card.spec.ts`
Expected: FAIL because helper does not exist yet.

**Step 3: Write minimal implementation**

Create `src/lib/projects/project-card.ts` with helpers to:
- map raw project rows into the UI project-card model
- parse investment and IRR fields consistently
- preserve fields used by `ProjectCard.svelte`

Update `src/routes/+page.server.ts` to map server-loaded projects through this helper.
Update `src/routes/+page.svelte` to stop duplicating the card mapping logic inline.

Keep the helper focused on data shaping only.
Do not move unrelated filter UI state into it.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/lib/projects/project-card.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/lib/projects/project-card.ts src/lib/projects/project-card.spec.ts src/routes/+page.server.ts src/routes/+page.svelte
rtk git commit -m "refactor: share project card mapping"
```

### Task 8: Replace mock homepage search with async AI search flow

**Files:**
- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/state/search.svelte.ts`
- Test: `src/routes/+page.svelte.spec.ts`

**Step 1: Write the failing test**

Create `src/routes/+page.svelte.spec.ts` that verifies:
- submitting text calls the AI endpoint
- success response updates the AI summary panel
- success response replaces visible project cards
- failed response shows a safe fallback summary
- empty input does not trigger a request

Use a mocked `fetch` and pass minimal `PageData` props.

**Step 2: Run test to verify it fails**

Run: `rtk yarn vitest run src/routes/+page.svelte.spec.ts`
Expected: FAIL because the async search flow is not implemented yet.

**Step 3: Write minimal implementation**

Update `src/routes/+page.svelte` so that:
- `handleSearch()` becomes `async`
- it posts to `/api/ai-search-projects`
- it stores AI-returned projects in local component state
- it updates `aiSummary`, `isSearching`, and `committedSearch`
- it preserves the existing summary panel UX
- it falls back to a concise error summary on failure

Update `src/lib/state/search.svelte.ts` only as needed to persist any new homepage AI-search state.
Keep advanced filters local to the homepage until a clear reuse need appears.

**Step 4: Run test to verify it passes**

Run: `rtk yarn vitest run src/routes/+page.svelte.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
rtk git add src/routes/+page.svelte src/lib/state/search.svelte.ts src/routes/+page.svelte.spec.ts
rtk git commit -m "feat: connect homepage search to ai endpoint"
```

### Task 9: Verify server-side and client-side integration

**Files:**
- Modify: `docs/plans/2026-04-29-ai-project-search-design.md` (only if implementation details need a minor correction)
- Test: existing files only

**Step 1: Run focused unit tests**

Run:

```bash
rtk yarn vitest run \
  src/lib/server/ai/client.spec.ts \
  src/lib/server/ai/project-search/validator.spec.ts \
  src/lib/server/ai/project-search/prompt.spec.ts \
  src/lib/server/ai/project-search/planner.spec.ts \
  src/lib/server/ai/project-search/query.spec.ts \
  src/routes/api/ai-search-projects/+server.spec.ts \
  src/lib/projects/project-card.spec.ts \
  src/routes/+page.svelte.spec.ts
```

Expected: PASS.

**Step 2: Run type and lint checks**

Run:

```bash
rtk yarn check
rtk yarn lint
```

Expected: PASS.

**Step 3: Start the app locally**

Run: `rtk yarn dev`
Expected: Vite dev server starts successfully.

**Step 4: Manually test the homepage flow**

Verify in browser:
- homepage still loads initial project cards
- entering a valid natural-language query updates the AI summary
- project cards update from API response
- empty query does nothing
- a forced planner failure shows the fallback message without breaking the page

**Step 5: Commit**

```bash
rtk git add src docs/plans/2026-04-29-ai-project-search-design.md
rtk git commit -m "feat: add ai-powered homepage project search"
```

### Task 10: Request review before merge

**Files:**
- No code changes required

**Step 1: Run review skill**

Use `superpowers:requesting-code-review` after implementation is complete.

**Step 2: Address feedback**

If feedback is received, use `superpowers:receiving-code-review` before applying suggested changes.

**Step 3: Re-run verification**

Run the same checks from Task 9 after any changes.

**Step 4: Decide branch completion path**

Use `superpowers:finishing-a-development-branch` when tests pass and implementation is accepted.

**Step 5: Commit follow-up fixes if needed**

```bash
rtk git add <reviewed-files>
rtk git commit -m "fix: address ai project search review feedback"
```
