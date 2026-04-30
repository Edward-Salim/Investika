import { describe, expect, it } from 'vitest';
import { validateProjectSearchPlan } from './validator';

describe('validateProjectSearchPlan', () => {
	it('accepts a valid plan', () => {
		const result = validateProjectSearchPlan({
			intent: 'find_projects',
			base_table: 'investment_opportunities',
			joins: [
				{
					from: 'investment_opportunities',
					to: 'adm_provinces'
				}
			],
			filters: [
				{
					field: 'investment_opportunities.nama_sektor',
					operator: 'ilike',
					value: 'energi'
				}
			],
			sort: [
				{
					field: 'investment_opportunities.tahun',
					direction: 'desc'
				}
			],
			limit: 20,
			select_strategy: 'project_cards',
			explanation: 'Searching energy projects in matching provinces.'
		});

		expect(result.intent).toBe('find_projects');
		expect(result.limit).toBe(20);
		expect(result.joins).toEqual([
			{
				from: 'investment_opportunities',
				to: 'adm_provinces'
			}
		]);
	});

	it('rejects unsupported intents', () => {
		expect(() =>
			validateProjectSearchPlan({
				intent: 'summarize_regions',
				base_table: 'investment_opportunities',
				joins: [],
				filters: [],
				sort: [],
				limit: 20,
				select_strategy: 'project_cards',
				explanation: 'Nope.'
			})
		).toThrow(/intent/i);
	});

	it('rejects unknown tables, fields, joins, and operators', () => {
		expect(() =>
			validateProjectSearchPlan({
				intent: 'find_projects',
				base_table: 'countries',
				joins: [
					{
						from: 'investment_opportunities',
						to: 'countries'
					}
				],
				filters: [
					{
						field: 'investment_opportunities.unknown_field',
						operator: 'contains_all',
						value: 'test'
					}
				],
				sort: [],
				limit: 20,
				select_strategy: 'project_cards',
				explanation: 'Nope.'
			})
		).toThrow();
	});

	it('clamps oversized limits', () => {
		const result = validateProjectSearchPlan({
			intent: 'find_projects',
			base_table: 'investment_opportunities',
			joins: [],
			filters: [],
			sort: [],
			limit: 100,
			select_strategy: 'project_cards',
			explanation: 'Searching all projects.'
		});

		expect(result.limit).toBe(24);
	});

	it('accepts a valid join from investment_opportunities to adm_provinces', () => {
		const result = validateProjectSearchPlan({
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

		expect(result.joins).toHaveLength(1);
		expect(result.joins[0]).toEqual({
			from: 'investment_opportunities',
			to: 'adm_provinces'
		});
	});

	it('rejects joined-table filters when the required join is missing', () => {
		expect(() =>
			validateProjectSearchPlan({
				intent: 'find_projects',
				base_table: 'investment_opportunities',
				joins: [],
				filters: [
					{
						field: 'adm_regencies.nama',
						operator: 'ilike',
						value: 'Denpasar'
					}
				],
				sort: [],
				limit: 12,
				select_strategy: 'project_cards',
				explanation: 'Searching by regency.'
			})
		).toThrow(/join/i);
	});

	it('rejects joined-table sorts when the required join is missing', () => {
		expect(() =>
			validateProjectSearchPlan({
				intent: 'find_projects',
				base_table: 'investment_opportunities',
				joins: [],
				filters: [],
				sort: [
					{
						field: 'investment_opportunity_details.readiness_status',
						direction: 'asc'
					}
				],
				limit: 12,
				select_strategy: 'project_cards',
				explanation: 'Sorting by readiness.'
			})
		).toThrow(/join/i);
	});
});
