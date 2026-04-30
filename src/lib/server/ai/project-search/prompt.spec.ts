import { describe, expect, it } from 'vitest';
import { buildProjectSearchPrompt } from './prompt';

describe('buildProjectSearchPrompt', () => {
	it('includes schema guidance and output rules', () => {
		const prompt = buildProjectSearchPrompt('energy projects in Sulawesi');

		expect(prompt).toContain('investment_opportunities');
		expect(prompt).toContain('adm_provinces');
		expect(prompt).toContain('Always return project-search plans');
		expect(prompt).toContain('Do not output SQL');
		expect(prompt).toContain('energy projects in Sulawesi');
	});

	it('requires validator-compatible field keys and fully-qualified column names', () => {
		const prompt = buildProjectSearchPrompt('apa projek yang bagus yang ada di bali');

		expect(prompt).toContain('Use "field" as the key name for filters and sort entries. Never use "column".');
		expect(prompt).toContain('Every filter.field and sort.field must use one of the exact fully-qualified column names from the approved schema summary.');
		expect(prompt).toContain('"field": "investment_opportunities.nama_provinsi"');
		expect(prompt).toContain('"field": "investment_opportunities.nilai_irr_percent"');
		expect(prompt).not.toContain('"column":');
	});
});
