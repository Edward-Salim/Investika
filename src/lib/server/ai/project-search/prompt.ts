import {
	approvedProjectSearchJoins,
	approvedProjectSearchOperators,
	approvedProjectSearchTables
} from './schema-summary';

export function buildProjectSearchPrompt(query: string) {
	const tableSummary = approvedProjectSearchTables
		.map(
			table =>
				`- ${table.name}: ${table.description} Columns: ${table.columns.join(', ')}`
		)
		.join('\n');

	const joinSummary = approvedProjectSearchJoins.map(join => `- ${join}`).join('\n');
	const operatorSummary = approvedProjectSearchOperators.join(', ');

	return `You are planning a safe project-card search for an investment discovery homepage.

Always return project-search plans.
Return JSON only.
Do not output SQL.
Do not include markdown fences.
Use this output contract exactly:
{
  "intent": "find_projects",
  "base_table": "investment_opportunities",
  "joins": [],
  "filters": [],
  "sort": [],
  "limit": 20,
  "select_strategy": "project_cards",
  "explanation": "Short user-facing summary"
}

Use "field" as the key name for filters and sort entries. Never use "column".
Every filter.field and sort.field must use one of the exact fully-qualified column names from the approved schema summary.
Example filter entry:
{ "field": "investment_opportunities.nama_provinsi", "operator": "ilike", "value": "Bali" }
Example sort entry:
{ "field": "investment_opportunities.nilai_irr_percent", "direction": "desc" }

Approved schema summary:
${tableSummary}

Allowed join graph:
${joinSummary}

Allowed operators:
- ${operatorSummary}

User query:
${query}`;
}
