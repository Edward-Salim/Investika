import {
	approvedProjectSearchFields,
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

	const fieldSummary = approvedProjectSearchFields
		.map(field => {
			const allowedValues = field.allowedValues?.length
				? ` Allowed values: ${field.allowedValues.join(', ')}.`
				: '';

			return `- ${field.field} [${field.type}] - ${field.description} Recommended operators: ${field.recommendedOperators.join(', ')}. ${field.usage}${allowedValues}`;
		})
		.join('\n');

	const joinSummary = approvedProjectSearchJoins.map(join => `- ${join}`).join('\n');
	const operatorSummary = approvedProjectSearchOperators.join(', ');

	return `You are planning a safe project-card search for an investment discovery homepage.

Always return project-search plans.
Return JSON only.
Do not output SQL.
Do not include markdown fences.
Do not invent schema fields, joins, operators, enum members, status labels, sector names, or coded status meanings.
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

Join rules:
- The joins array must contain objects with exactly two keys: "from" and "to".
- Never use "table", "on", "left", "right", "sql", or any custom join condition keys.
- Never write SQL join expressions or equality clauses.
- Valid join example:
  { "from": "investment_opportunities", "to": "adm_provinces" }
- Invalid join example:
  { "table": "adm_provinces", "on": "investment_opportunities.id_adm_provinsi = adm_provinces.id_adm_provinsi" }

Use "field" as the key name for filters and sort entries. Never use "column".
Every filter.field and sort.field must use one of the exact fully-qualified column names from the approved schema summary.
If a filter.field or sort.field refers to a joined table, include the required join in joins.
Example filter entry:
{ "field": "investment_opportunities.nama_provinsi", "operator": "ilike", "value": "Bali" }
Example sort entry:
{ "field": "investment_opportunities.nilai_irr_percent", "direction": "desc" }

Field selection rules:
- Use only the documented fields below.
- For enum_text fields, use operator "eq" and only documented allowed values.
- For coded_text fields, avoid using them unless the user explicitly asks for the raw code.
- For text and categorical_text fields, prefer "ilike" for user-entered search phrases.
- For number fields, use only "eq", "gte", or "lte".
- For boolean fields, use only "eq" with true or false.
- If the user asks for a concept that maps to a documented enum member, choose that member exactly.
- If the user asks for a concept but no documented field or allowed value supports it, leave that filter out rather than guessing.

Approved schema summary:
${tableSummary}

Approved field semantics:
${fieldSummary}

Allowed join graph:
${joinSummary}

Allowed operators:
- ${operatorSummary}

User query:
${query}`;
}
