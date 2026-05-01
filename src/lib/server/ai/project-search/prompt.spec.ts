import { describe, expect, it } from 'vitest';
import { buildProjectSearchPrompt } from './prompt';

describe('buildProjectSearchPrompt', () => {
	it('includes schema guidance and output rules', () => {
		const prompt = buildProjectSearchPrompt('energy projects in Sulawesi');

		expect(prompt).toContain('investment_opportunities');
		expect(prompt).toContain('adm_provinces');
		expect(prompt).toContain('Always return project-search plans');
		expect(prompt).toContain('Do not output SQL');
		expect(prompt).toContain('Do not invent schema fields, joins, operators, enum members, status labels, sector names, or coded status meanings.');
		expect(prompt).toContain('energy projects in Sulawesi');
	});

	it('requires validator-compatible field keys and fully-qualified column names', () => {
		const prompt = buildProjectSearchPrompt('apa projek yang bagus yang ada di bali');

		expect(prompt).toContain('Use "field" as the key name for filters and sort entries. Never use "column".');
		expect(prompt).toContain('Every filter.field and sort.field must use one of the exact fully-qualified column names from the approved schema summary.');
		expect(prompt).toContain('If a filter.field or sort.field refers to a joined table, include the required join in joins.');
		expect(prompt).toContain('"field": "investment_opportunities.nama_provinsi"');
		expect(prompt).toContain('"field": "investment_opportunities.nilai_irr_percent"');
		expect(prompt).not.toContain('"column":');
	});

	it('forces numeric investment metrics to use normalized number fields instead of raw text fields', () => {
		const prompt = buildProjectSearchPrompt('proyek dengan investasi dan irr tertinggi');

		expect(prompt).toContain(
			'For investment value, NPV, and IRR constraints or ranking, use only these normalized numeric fields: investment_opportunities.nilai_investasi_amount, investment_opportunities.nilai_npv_amount, and investment_opportunities.nilai_irr_percent.'
		);
		expect(prompt).toContain(
			'Never use these raw text display fields for numeric filtering or sorting: investment_opportunities.nilai_investasi, investment_opportunities.nilai_npv, or investment_opportunities.nilai_irr.'
		);
		expect(prompt).toContain(
			'Treat investment value and NPV amounts as IDR by default unless the user explicitly asks for another currency or conversion behavior.'
		);
		expect(prompt).toContain(
			'This is the numeric field for investment value filters and sorting. Treat the amount as IDR by default unless the user explicitly asks for another currency or conversion behavior. Do not use the raw text field investment_opportunities.nilai_investasi for numeric logic.'
		);
		expect(prompt).toContain(
			'This is the numeric field for IRR filters and sorting. Do not use the raw text field investment_opportunities.nilai_irr for numeric logic.'
		);
		expect(prompt).toContain(
			'This is the numeric field for NPV filters and sorting. Treat the amount as IDR by default unless the user explicitly asks for another currency or conversion behavior. Do not use the raw text field investment_opportunities.nilai_npv for numeric logic.'
		);
	});

	it('makes the join shape explicit', () => {
		const prompt = buildProjectSearchPrompt('proyek di Jawa dengan irr tertinggi');

		expect(prompt).toContain('The joins array must contain objects with exactly two keys: "from" and "to".');
		expect(prompt).toContain('Never use "table", "on", "left", "right", "sql", or any custom join condition keys.');
		expect(prompt).toContain('{ "from": "investment_opportunities", "to": "adm_provinces" }');
		expect(prompt).toContain('{ "table": "adm_provinces", "on": "investment_opportunities.id_adm_provinsi = adm_provinces.id_adm_provinsi" }');
	});

	it('documents enum members and usage rules for categorical fields', () => {
		const prompt = buildProjectSearchPrompt('ipro projects in tourism');

		expect(prompt).toContain('investment_opportunities.status [enum_text]');
		expect(prompt).toContain('Allowed values: PID, PPI, IPRO.');
		expect(prompt).toContain('PID is a regional investment profile that describes a region and its business environment.');
		expect(prompt).toContain('IPRO is an investment project ready to offer, typically the most execution-ready category.');
		expect(prompt).toContain('investment_opportunities.status_proyek [enum_text]');
		expect(prompt).toContain('Allowed values: RE/PUBLISH, DIMINATI.');
		expect(prompt).toContain('investment_opportunities.nama_sektor_peluang [categorical_text]');
		expect(prompt).toContain('Text values are inconsistent in casing and naming. Prefer ilike.');
		expect(prompt).toContain('Primer refers to natural-resource extraction sectors such as agriculture, fisheries, plantations, forestry, and mining.');
		expect(prompt).toContain('Sekunder refers to manufacturing, industrial processing, and value-added production.');
		expect(prompt).toContain('Tersier refers to service sectors such as tourism, logistics, finance, health, education, and digital services.');
		expect(prompt).toContain('investment_opportunities.project_status_enum [coded_text]');
		expect(prompt).toContain('Avoid using this field unless the user explicitly refers to the raw codes.');
	});
});
