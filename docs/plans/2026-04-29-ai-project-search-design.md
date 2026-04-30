# AI Project Search Design

## Summary

Build an AI-powered natural-language search on the homepage (`/`) that interprets a user query, reasons over the database schema, and returns a curated list of matching investment projects plus a short explanation of how the results were chosen.

## Product Scope

### MVP Goal

The MVP is an **AI project finder**, not a general regional analytics assistant.

Users type a natural-language query into the homepage search bar. The system uses an LLM to interpret the query against the available database schema, then returns:

- a short AI explanation of what was understood
- a filtered and ranked list of investment projects

### MVP Output Contract

For the first version, the **primary output must always be a list of projects**.

The AI may use regional tables and non-project tables to improve reasoning, filtering, and ranking, but the final response should still resolve to project results.

Examples:

- "energy projects in eastern Indonesia"
- "projects in provinces with high PDRB"
- "manufacturing opportunities with strong returns"
- "projects in regions with strong infrastructure"

### Phase 2 Note

A future phase may expand the assistant into a broader investment analyst that can return non-project outputs such as:

- region rankings
- region comparisons
- insight summaries
- analytics-first responses with optional project recommendations

This is **explicitly out of scope for the MVP**.

## Current Codebase Context

### Homepage

Relevant current files:

- `src/routes/+page.svelte`
- `src/routes/+page.server.ts`

The homepage already includes:

- a natural-language search bar
- an AI summary panel
- project cards and filter UI

Today, the search behavior is mock logic implemented in `handleSearch()` inside `src/routes/+page.svelte`.

### Database Schema

Relevant schema source:

- `src/lib/server/db/schema.ts`

Most relevant tables for MVP project search:

- `investment_opportunities`
- `investment_opportunity_details`
- `adm_provinces`
- `adm_regencies`

Additional regional context tables that may support smarter ranking/filtering:

- `regional_pdrb`
- `regional_population`
- `regional_investment_yearly`
- `regional_investment_by_sector`
- `regional_infrastructure_items`
- `regional_profiles`
- `regional_area_summaries`
- `regional_commodity_sectors`
- `regional_offices`
- `regional_studies`
- `regional_study_files`
- `regional_umr`

## Recommended Architecture

Use a **structured query planning** approach.

The AI should not return raw SQL for direct execution.
Instead, it should return a validated JSON query plan that the backend translates into safe SQL or Drizzle queries.

### Why this approach

This preserves the desired product behavior:

- AI understands the database schema
- AI can reason across multiple tables
- AI can request joins and filters
- backend still controls actual query execution

This is safer and easier to validate than direct text-to-SQL execution.

## End-to-End Flow

1. User enters a natural-language query on `/`
2. Frontend sends the query to a new server endpoint
3. Backend builds a prompt containing:
   - system instructions
   - a summarized database schema
   - allowed table joins
   - allowed operators and output format rules
   - the user query
4. Gemini is called through the OpenAI SDK-compatible interface
5. The model returns a structured query plan and explanation
6. Backend validates the plan against a strict whitelist
7. Backend translates the plan into Drizzle or safe SQL
8. Backend executes the query and retrieves project rows
9. Backend responds with:
   - `summary`
   - `appliedPlan`
   - `projects`
10. Frontend renders the explanation and project cards

## Endpoint Design

Introduce a dedicated endpoint, for example:

- `POST /api/ai-search-projects`

Request body:

```json
{
  "query": "energy projects in high-PDRB eastern provinces"
}
```

Response body:

```json
{
  "summary": "I prioritized energy projects in eastern Indonesia and boosted provinces with stronger PDRB signals.",
  "appliedPlan": {
    "intent": "find_projects"
  },
  "projects": []
}
```

## Structured Query Plan

### Core Shape

The model should return JSON only.

Suggested MVP shape:

```json
{
  "intent": "find_projects",
  "base_table": "investment_opportunities",
  "joins": [],
  "filters": [],
  "sort": [],
  "limit": 20,
  "select_strategy": "project_cards",
  "explanation": "..."
}
```

### Recommended Fields

- `intent`: must be `find_projects` in MVP
- `base_table`: expected to be `investment_opportunities`
- `joins`: requested joins using only whitelisted relationships
- `filters`: structured filter definitions
- `sort`: structured sort instructions
- `limit`: capped on the backend
- `select_strategy`: allows backend to map results to UI needs
- `explanation`: user-facing summary of what the model understood

### Example Plan

```json
{
  "intent": "find_projects",
  "base_table": "investment_opportunities",
  "joins": [
    {
      "table": "adm_provinces",
      "on": [
        {
          "left": "investment_opportunities.id_adm_provinsi",
          "right": "adm_provinces.id_adm_provinsi"
        }
      ]
    },
    {
      "table": "regional_pdrb",
      "on": [
        {
          "left": "investment_opportunities.id_adm_provinsi",
          "right": "regional_pdrb.id_adm_provinsi"
        }
      ]
    }
  ],
  "filters": [
    {
      "field": "investment_opportunities.nama_sektor",
      "operator": "ilike",
      "value": "%energi%"
    },
    {
      "field": "adm_provinces.wilayah_group",
      "operator": "ilike",
      "value": "%timur%"
    },
    {
      "field": "regional_pdrb.tahun",
      "operator": "=",
      "value": 2024
    }
  ],
  "sort": [
    {
      "field": "regional_pdrb.nilai",
      "direction": "desc"
    }
  ],
  "limit": 20,
  "select_strategy": "project_cards",
  "explanation": "I searched for energy projects in eastern Indonesia and prioritized provinces with stronger PDRB signals."
}
```

## Allowed Join Model

The AI may request joins, but only through backend-approved relationships.

Initial allowed relationships:

- `investment_opportunities.id_peluang -> investment_opportunity_details.id_peluang`
- `investment_opportunities.id_adm_provinsi -> adm_provinces.id_adm_provinsi`
- `investment_opportunities.id_adm_kabkot -> adm_regencies.id_adm_kabkot`
- regional tables joined through `id_adm_provinsi`
- regional tables joined through `id_adm_kabkot`

The backend should reject any join path outside this allowlist.

## Filter and Sort Rules

### Allowed Operators

Restrict filters to a small set such as:

- `=`
- `>=`
- `<=`
- `between`
- `in`
- `ilike`

### Allowed Fields

Only allow whitelisted fields from approved tables.
The backend should maintain the field map explicitly rather than trusting model output.

### Limit Rules

- enforce a backend max limit, such as `24` or `30`
- set a default if omitted
- reject negative or excessively large values

## Prompt Design

### Prompt Principle

Do not send raw TypeScript source as prompt context.
Instead, build a schema summary that is concise and stable.

### Include in Prompt

The backend prompt should include:

- product objective: always return projects
- summarized table list
- relevant columns per table
- allowed join relationships
- allowed operators
- JSON response schema
- rules against SQL output
- instructions to keep explanations short and user-friendly

### Important Behavioral Rule

The prompt must strongly state:

> Always return project-search plans. Use regional tables only to help filter, rank, or contextualize project opportunities.

This keeps the MVP aligned with Mode A.

## Backend Layers

Recommended server-side structure:

1. **Prompt builder**
   - converts schema metadata into prompt-safe text
2. **AI planner**
   - calls Gemini through the OpenAI SDK-compatible client
3. **Plan validator**
   - validates intent, fields, joins, operators, and limit
4. **Query executor**
   - builds and runs the real database query

Optional supporting modules:

- field allowlist registry
- join registry
- query-plan type definitions
- response normalizer for project cards

## Frontend Integration

The homepage already has the right interaction model.

Update `src/routes/+page.svelte` so that:

- `handleSearch()` sends the user query to the backend endpoint
- loading state uses the existing `isSearching`
- AI explanation updates `aiSummary`
- project results replace the current locally filtered mock results

This allows the UI to evolve with minimal visual disruption.

## Error Handling

The UI should fail gracefully when:

- model output is invalid JSON
- the query plan is rejected by validation
- the model cannot confidently interpret the query
- the database query fails

Recommended user-facing behavior:

- show a concise fallback message
- return zero projects or keep the previous safe state
- encourage rephrasing

Example fallback copy:

- "I couldn't confidently interpret that query. Try rephrasing it with sector, region, or investment criteria."

## Security and Safety Constraints

The backend must never directly execute raw model SQL.

Required protections:

- read-only design
- validated structured output only
- strict table and field whitelist
- strict join allowlist
- limit enforcement
- no arbitrary SQL fragments
- no mutation operations of any kind

Even if the model hallucinates unsupported fields or joins, the validator should reject the plan before execution.

## Performance Notes

- keep schema prompt compact
- limit result count
- prefer a normalized project-card projection
- consider caching prompt metadata or schema summary
- later, add observability for rejected plans and common query patterns

## Phase 2 Considerations

Potential future expansion:

- new intents such as `rank_regions`, `compare_regions`, or `summarize_sector`
- UI support for rankings and analytical summaries
- hybrid responses with both insights and projects
- richer aggregation support

These should be introduced only after the Mode A project-finder MVP is stable.

## Recommended Next Step

Create an implementation plan that covers:

- backend endpoint
- prompt builder and schema summarizer
- structured query-plan types and validator
- AI client integration
- query execution layer
- homepage wiring and state updates
- verification strategy
