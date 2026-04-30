import type {
	ProjectSearchField,
	ProjectSearchFilter,
	ProjectSearchJoin,
	ProjectSearchOperator,
	ProjectSearchPlan,
	ProjectSearchSort,
	ProjectSearchTable
} from './types';

const MAX_LIMIT = 24;

const allowedTables = new Set<ProjectSearchTable>([
	'investment_opportunities',
	'adm_provinces',
	'adm_regencies',
	'investment_opportunity_details'
]);

const allowedFields = new Set<ProjectSearchField>([
	'investment_opportunities.nama',
	'investment_opportunities.nama_provinsi',
	'investment_opportunities.nama_kabkot',
	'investment_opportunities.nama_sektor',
	'investment_opportunities.nama_sektor_peluang',
	'investment_opportunities.status',
	'investment_opportunities.status_proyek',
	'investment_opportunities.project_status_enum',
	'investment_opportunities.tahun',
	'investment_opportunities.nilai_investasi_amount',
	'investment_opportunities.nilai_irr_percent',
	'investment_opportunities.nilai_npv_amount',
	'adm_provinces.nama',
	'adm_regencies.nama',
	'investment_opportunity_details.is_ikn',
	'investment_opportunity_details.is_ipro',
	'investment_opportunity_details.readiness_status'
]);

const allowedOperators = new Set<ProjectSearchOperator>(['eq', 'ilike', 'gte', 'lte']);
const allowedDirections = new Set(['asc', 'desc']);
const allowedJoinEdges = new Set([
	'investment_opportunities->adm_provinces',
	'investment_opportunities->adm_regencies',
	'investment_opportunities->investment_opportunity_details'
]);

function asRecord(input: unknown) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		throw new Error('Project search plan must be an object.');
	}

	return input as Record<string, unknown>;
}

function normalizeJoin(input: unknown): ProjectSearchJoin {
	const join = asRecord(input);
	const from = join.from;
	const to = join.to;

	if (!allowedTables.has(from as ProjectSearchTable) || !allowedTables.has(to as ProjectSearchTable)) {
		throw new Error('Project search plan contains an unknown join table.');
	}

	const edge = `${from}->${to}`;
	if (!allowedJoinEdges.has(edge)) {
		throw new Error('Project search plan contains an unsupported join path.');
	}

	if (edge === 'investment_opportunities->adm_provinces') {
		return {
			from: 'investment_opportunities',
			to: 'adm_provinces'
		};
	}

	if (edge === 'investment_opportunities->adm_regencies') {
		return {
			from: 'investment_opportunities',
			to: 'adm_regencies'
		};
	}

	return {
		from: 'investment_opportunities',
		to: 'investment_opportunity_details'
	};
}

function normalizeFilter(input: unknown): ProjectSearchFilter {
	const filter = asRecord(input);
	const field = filter.field;
	const operator = filter.operator;
	const value = filter.value;

	if (!allowedFields.has(field as ProjectSearchField)) {
		throw new Error('Project search plan contains an unknown filter field.');
	}

	if (!allowedOperators.has(operator as ProjectSearchOperator)) {
		throw new Error('Project search plan contains an unsupported filter operator.');
	}

	if (!['string', 'number', 'boolean'].includes(typeof value)) {
		throw new Error('Project search plan filter value must be a string, number, or boolean.');
	}

	return {
		field: field as ProjectSearchField,
		operator: operator as ProjectSearchOperator,
		value: value as string | number | boolean
	};
}

function normalizeSort(input: unknown): ProjectSearchSort {
	const sort = asRecord(input);
	const field = sort.field;
	const direction = sort.direction;

	if (!allowedFields.has(field as ProjectSearchField)) {
		throw new Error('Project search plan contains an unknown sort field.');
	}

	if (!allowedDirections.has(direction as string)) {
		throw new Error('Project search plan contains an unsupported sort direction.');
	}

	return {
		field: field as ProjectSearchField,
		direction: direction as 'asc' | 'desc'
	};
}

function normalizeArray<T>(input: unknown, label: string, normalizeItem: (value: unknown) => T): T[] {
	if (!Array.isArray(input)) {
		throw new Error(`Project search plan ${label} must be an array.`);
	}

	return input.map(normalizeItem);
}

function getRequiredJoinForField(field: ProjectSearchField) {
	if (field === 'adm_provinces.nama') {
		return 'adm_provinces';
	}

	if (field === 'adm_regencies.nama') {
		return 'adm_regencies';
	}

	if (
		field === 'investment_opportunity_details.is_ikn' ||
		field === 'investment_opportunity_details.is_ipro' ||
		field === 'investment_opportunity_details.readiness_status'
	) {
		return 'investment_opportunity_details';
	}

	return null;
}

export function validateProjectSearchPlan(input: unknown): ProjectSearchPlan {
	const plan = asRecord(input);

	if (plan.intent !== 'find_projects') {
		throw new Error('Project search plan intent must be find_projects.');
	}

	if (plan.base_table !== 'investment_opportunities') {
		throw new Error('Project search plan base_table must be investment_opportunities.');
	}

	if (plan.select_strategy !== 'project_cards') {
		throw new Error('Project search plan select_strategy must be project_cards.');
	}

	if (typeof plan.explanation !== 'string' || !plan.explanation.trim()) {
		throw new Error('Project search plan explanation is required.');
	}

	const rawLimit = typeof plan.limit === 'number' ? Math.trunc(plan.limit) : Number(plan.limit);
	if (!Number.isFinite(rawLimit) || rawLimit < 1) {
		throw new Error('Project search plan limit must be a positive number.');
	}

	const joins = normalizeArray(plan.joins, 'joins', normalizeJoin);
	const filters = normalizeArray(plan.filters, 'filters', normalizeFilter);
	const sort = normalizeArray(plan.sort, 'sort', normalizeSort);
	const joinedTables = new Set(joins.map(join => join.to));

	for (const filter of filters) {
		const requiredJoin = getRequiredJoinForField(filter.field);
		if (requiredJoin && !joinedTables.has(requiredJoin)) {
			throw new Error(`Project search plan filter field ${filter.field} requires the ${requiredJoin} join.`);
		}
	}

	for (const sortRule of sort) {
		const requiredJoin = getRequiredJoinForField(sortRule.field);
		if (requiredJoin && !joinedTables.has(requiredJoin)) {
			throw new Error(`Project search plan sort field ${sortRule.field} requires the ${requiredJoin} join.`);
		}
	}

	return {
		intent: 'find_projects',
		base_table: 'investment_opportunities',
		joins,
		filters,
		sort,
		limit: Math.min(rawLimit, MAX_LIMIT),
		select_strategy: 'project_cards',
		explanation: plan.explanation.trim()
	};
}
