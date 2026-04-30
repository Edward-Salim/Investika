import { describe, expect, it } from 'vitest';
import { buildProjectSearchQueryDefinition } from './query';
import { normalizeProjectCard } from './normalize-project';

describe('buildProjectSearchQueryDefinition', () => {
	it('returns a query definition rooted in investment_opportunities', () => {
		const result = buildProjectSearchQueryDefinition({
			intent: 'find_projects',
			base_table: 'investment_opportunities',
			joins: [],
			filters: [],
			sort: [],
			limit: 20,
			select_strategy: 'project_cards',
			explanation: 'Searching all projects.'
		});

		expect(result.baseTable).toBe('investment_opportunities');
		expect(result.limit).toBe(20);
	});

	it('maps supported filters to query fragments', () => {
		const result = buildProjectSearchQueryDefinition({
			intent: 'find_projects',
			base_table: 'investment_opportunities',
			joins: [],
			filters: [
				{
					field: 'investment_opportunities.nama_sektor',
					operator: 'ilike',
					value: 'Energi'
				},
				{
					field: 'investment_opportunities.nilai_irr_percent',
					operator: 'gte',
					value: 15
				}
			],
			sort: [],
			limit: 20,
			select_strategy: 'project_cards',
			explanation: 'Searching energy projects.'
		});

		expect(result.filters).toEqual([
			{
				field: 'investment_opportunities.nama_sektor',
				operator: 'ilike',
				value: 'Energi'
			},
			{
				field: 'investment_opportunities.nilai_irr_percent',
				operator: 'gte',
				value: 15
			}
		]);
	});

	it('represents joining adm_provinces correctly', () => {
		const result = buildProjectSearchQueryDefinition({
			intent: 'find_projects',
			base_table: 'investment_opportunities',
			joins: [
				{
					from: 'investment_opportunities',
					to: 'adm_provinces'
				}
			],
			filters: [],
			sort: [],
			limit: 12,
			select_strategy: 'project_cards',
			explanation: 'Searching by province.'
		});

		expect(result.joins).toEqual([
			{
				from: 'investment_opportunities',
				to: 'adm_provinces',
				on: 'investment_opportunities.id_adm_provinsi = adm_provinces.id_adm_provinsi'
			}
		]);
	});
});

describe('normalizeProjectCard', () => {
	it('maps database fields into project card fields', () => {
		const result = normalizeProjectCard({
			id_peluang: 1,
			nama: 'Geothermal Expansion',
			nama_provinsi: 'Sulawesi Selatan',
			nama_sektor_peluang: 'Energi',
			nilai_investasi: '$120M',
			nilai_npv: '$40M',
			nilai_irr: '18%',
			image_url: null,
			status: 'Ready to Offer',
			id_adm_provinsi: 73
		});

		expect(result.title).toBe('Geothermal Expansion');
		expect(result.location).toBe('Sulawesi Selatan');
		expect(result.category).toBe('Energy');
		expect(result.provinceId).toBe(73);
	});
});
