import { and, asc, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import {
	admProvinces,
	admRegencies,
	investmentOpportunityDetails,
	investmentOpportunities
} from '$lib/server/db/schema';
import type { ProjectSearchPlan } from './types';
import { normalizeProjectCard } from './normalize-project';

const joinDefinitions = {
	adm_provinces: {
		from: 'investment_opportunities',
		to: 'adm_provinces',
		on: 'investment_opportunities.id_adm_provinsi = adm_provinces.id_adm_provinsi'
	},
	adm_regencies: {
		from: 'investment_opportunities',
		to: 'adm_regencies',
		on: 'investment_opportunities.id_adm_kabkot = adm_regencies.id_adm_kabkot'
	},
	investment_opportunity_details: {
		from: 'investment_opportunities',
		to: 'investment_opportunity_details',
		on: 'investment_opportunities.id_peluang = investment_opportunity_details.id_peluang'
	}
} as const satisfies Record<
	'adm_provinces' | 'adm_regencies' | 'investment_opportunity_details',
	{
		from: 'investment_opportunities';
		to: 'adm_provinces' | 'adm_regencies' | 'investment_opportunity_details';
		on: string;
	}
>;

const projectSelect = {
	id_peluang: investmentOpportunities.id_peluang,
	nama: investmentOpportunities.nama,
	nama_provinsi: investmentOpportunities.nama_provinsi,
	nama_kabkot: investmentOpportunities.nama_kabkot,
	nama_sektor_peluang: investmentOpportunities.nama_sektor_peluang,
	status: investmentOpportunities.status,
	status_proyek: investmentOpportunities.status_proyek,
	nilai_investasi: investmentOpportunities.nilai_investasi,
	nilai_irr: investmentOpportunities.nilai_irr,
	nilai_npv: investmentOpportunities.nilai_npv,
	nilai_investasi_amount: investmentOpportunities.nilai_investasi_amount,
	nilai_irr_percent: investmentOpportunities.nilai_irr_percent,
	nilai_npv_amount: investmentOpportunities.nilai_npv_amount,
	image_url: investmentOpportunities.image_url,
	id_adm_provinsi: investmentOpportunities.id_adm_provinsi,
	wilayah_group: admProvinces.wilayah_group
};

function getFieldExpression(field: string) {
	switch (field) {
		case 'investment_opportunities.nama':
			return investmentOpportunities.nama;
		case 'investment_opportunities.nama_provinsi':
			return investmentOpportunities.nama_provinsi;
		case 'investment_opportunities.nama_kabkot':
			return investmentOpportunities.nama_kabkot;
		case 'investment_opportunities.nama_sektor':
			return investmentOpportunities.nama_sektor;
		case 'investment_opportunities.nama_sektor_peluang':
			return investmentOpportunities.nama_sektor_peluang;
		case 'investment_opportunities.status':
			return investmentOpportunities.status;
		case 'investment_opportunities.status_proyek':
			return investmentOpportunities.status_proyek;
		case 'investment_opportunities.project_status_enum':
			return investmentOpportunities.project_status_enum;
		case 'investment_opportunities.tahun':
			return investmentOpportunities.tahun;
		case 'investment_opportunities.nilai_investasi_amount':
			return investmentOpportunities.nilai_investasi_amount;
		case 'investment_opportunities.nilai_irr_percent':
			return investmentOpportunities.nilai_irr_percent;
		case 'investment_opportunities.nilai_npv_amount':
			return investmentOpportunities.nilai_npv_amount;
		case 'adm_provinces.nama':
			return admProvinces.nama;
		case 'adm_regencies.nama':
			return admRegencies.nama;
		case 'investment_opportunity_details.is_ikn':
			return investmentOpportunityDetails.is_ikn;
		case 'investment_opportunity_details.is_ipro':
			return investmentOpportunityDetails.is_ipro;
		case 'investment_opportunity_details.readiness_status':
			return investmentOpportunityDetails.readiness_status;
		default:
			throw new Error(`Unsupported project search field: ${field}`);
	}
}

function buildFilterCondition(filter: ProjectSearchPlan['filters'][number]) {
	const field = getFieldExpression(filter.field);

	switch (filter.operator) {
		case 'eq':
			return eq(field, filter.value as never);
		case 'ilike':
			return ilike(field as never, `%${String(filter.value)}%`);
		case 'gte':
			return gte(field, filter.value as never);
		case 'lte':
			return lte(field, filter.value as never);
		default:
			throw new Error(`Unsupported project search operator: ${filter.operator}`);
	}
}

function buildSortClause(sort: ProjectSearchPlan['sort'][number]) {
	const field = getFieldExpression(sort.field);
	return sort.direction === 'asc' ? asc(field) : desc(field);
}

export function buildProjectSearchQueryDefinition(plan: ProjectSearchPlan) {
	return {
		baseTable: plan.base_table,
		joins: plan.joins.map(join => joinDefinitions[join.to]),
		filters: plan.filters.map(filter => ({
			field: filter.field,
			operator: filter.operator,
			value: filter.value
		})),
		sort: plan.sort.map(sort => ({
			field: sort.field,
			direction: sort.direction
		})),
		limit: plan.limit
	};
}

export async function executeProjectSearchPlan(db: any, plan: ProjectSearchPlan) {
	let query = db.select(projectSelect).from(investmentOpportunities);

	const joinedTables = new Set<string>();
	for (const join of plan.joins) {
		if (join.to === 'adm_provinces' && !joinedTables.has(join.to)) {
			query = query.leftJoin(admProvinces, eq(investmentOpportunities.id_adm_provinsi, admProvinces.id_adm_provinsi));
			joinedTables.add(join.to);
		}

		if (join.to === 'adm_regencies' && !joinedTables.has(join.to)) {
			query = query.leftJoin(admRegencies, eq(investmentOpportunities.id_adm_kabkot, admRegencies.id_adm_kabkot));
			joinedTables.add(join.to);
		}

		if (join.to === 'investment_opportunity_details' && !joinedTables.has(join.to)) {
			query = query.leftJoin(investmentOpportunityDetails, eq(investmentOpportunities.id_peluang, investmentOpportunityDetails.id_peluang));
			joinedTables.add(join.to);
		}
	}

	if (!joinedTables.has('adm_provinces')) {
		query = query.leftJoin(admProvinces, eq(investmentOpportunities.id_adm_provinsi, admProvinces.id_adm_provinsi));
	}

	if (plan.filters.length > 0) {
		query = query.where(and(...plan.filters.map(buildFilterCondition)));
	}

	if (plan.sort.length > 0) {
		query = query.orderBy(...plan.sort.map(buildSortClause));
	} else {
		query = query.orderBy(desc(investmentOpportunities.id_peluang));
	}

	const rows = await query.limit(plan.limit);
	return rows.map(normalizeProjectCard);
}
