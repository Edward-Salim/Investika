type ProjectSearchFieldType =
	| 'text'
	| 'categorical_text'
	| 'enum_text'
	| 'coded_text'
	| 'number'
	| 'boolean';

type ProjectSearchFieldSummary = {
	field: string;
	type: ProjectSearchFieldType;
	description: string;
	recommendedOperators: readonly string[];
	usage: string;
	allowedValues?: readonly string[];
};

export const approvedProjectSearchTables = [
	{
		name: 'investment_opportunities',
		description: 'Primary table for investment project cards.',
		columns: [
			'id_peluang',
			'id_adm_provinsi',
			'id_adm_kabkot',
			'nama',
			'nama_provinsi',
			'nama_kabkot',
			'nama_sektor',
			'nama_sektor_peluang',
			'tahun',
			'status',
			'status_proyek',
			'project_status_enum',
			'nilai_investasi',
			'nilai_investasi_amount',
			'nilai_irr',
			'nilai_irr_percent',
			'nilai_npv',
			'nilai_npv_amount',
			'image_url'
		]
	},
	{
		name: 'adm_provinces',
		description: 'Province names and regional metadata for project location filtering.',
		columns: ['id_adm_provinsi', 'nama', 'wilayah_group']
	},
	{
		name: 'adm_regencies',
		description: 'Regency or city names linked to projects.',
		columns: ['id_adm_kabkot', 'id_adm_provinsi', 'nama']
	},
	{
		name: 'investment_opportunity_details',
		description: 'Extended project detail flags and readiness information.',
		columns: ['id_peluang', 'is_ikn', 'is_ipro', 'readiness_status']
	}
] as const;

export const approvedProjectSearchFields: readonly ProjectSearchFieldSummary[] = [
	{
		field: 'investment_opportunities.nama',
		type: 'text',
		description: 'Project title shown on the card.',
		recommendedOperators: ['ilike'],
		usage: 'Use for keyword search on the project name. Do not treat as an enum.'
	},
	{
		field: 'investment_opportunities.nama_provinsi',
		type: 'text',
		description: 'Province name stored on the project row.',
		recommendedOperators: ['ilike', 'eq'],
		usage: 'Use for province filtering. Prefer ilike for user-entered location text.'
	},
	{
		field: 'investment_opportunities.nama_kabkot',
		type: 'text',
		description: 'Regency or city name stored on the project row.',
		recommendedOperators: ['ilike', 'eq'],
		usage: 'Use for kabupaten or kota filtering. Prefer ilike for user-entered location text.'
	},
	{
		field: 'investment_opportunities.nama_sektor',
		type: 'categorical_text',
		description: 'High-level business sector grouping for the project.',
		recommendedOperators: ['ilike', 'eq'],
		usage:
			'Category-like field. Prefer ilike when matching user wording. Use eq only with one of the documented values. Primer refers to natural-resource extraction sectors such as agriculture, fisheries, plantations, forestry, and mining. Sekunder refers to manufacturing, industrial processing, and value-added production. Tersier refers to service sectors such as tourism, logistics, finance, health, education, and digital services.',
		allowedValues: [
			'Industri',
			'Tersier',
			'Pariwisata',
			'Sekunder',
			'Primer',
			'Infrastruktur',
			'Agro Industri',
			'Kawasan Industri dan Real Estate',
			'Energi Terbarukan',
			'Sumber Daya Alam',
			'Industri Manufaktur',
			'Jasa',
			'Jasa dan Kawasan'
		]
	},
	{
		field: 'investment_opportunities.nama_sektor_peluang',
		type: 'categorical_text',
		description: 'More specific sector label for the opportunity.',
		recommendedOperators: ['ilike', 'eq'],
		usage:
			'Text values are inconsistent in casing and naming. Prefer ilike. Use eq only when the exact documented value is clearly intended. This field can express more specific sector wording than nama_sektor, for example tourism, industrial processing, agriculture, fisheries, transport, energy, construction, or trade.',
		allowedValues: [
			'Industri',
			'PARIWISATA',
			'PERINDUSTRIAN',
			'Agro Industri',
			'Infrastruktur',
			'PERTANIAN',
			'PERIKANAN',
			'KONSTRUKSI',
			'Kawasan Industri dan Real Estate',
			'PENGANGKUTAN',
			'ENERGI',
			'Energi Terbarukan',
			'PERDAGANGAN',
			'Sumber Daya Alam',
			'Industri Manufaktur',
			'Jasa dan Kawasan'
		]
	},
	{
		field: 'investment_opportunities.status',
		type: 'enum_text',
		description: 'Official PIR content type classification.',
		recommendedOperators: ['eq'],
		usage:
			'Use only as an exact-match enum. Never invent new members. PID is a regional investment profile that describes a region and its business environment. PPI is a curated map or catalog of investment opportunities promoted by the government. IPRO is an investment project ready to offer, typically the most execution-ready category.',
		allowedValues: ['PID', 'PPI', 'IPRO']
	},
	{
		field: 'investment_opportunities.status_proyek',
		type: 'enum_text',
		description: 'Project readiness or publication status label on the opportunity record.',
		recommendedOperators: ['eq'],
		usage:
			'Use only as an exact-match enum. Never invent new members. RE/PUBLISH indicates a published or ready-to-publish opportunity record. DIMINATI indicates an opportunity with investor interest.',
		allowedValues: ['RE/PUBLISH', 'DIMINATI']
	},
	{
		field: 'investment_opportunities.project_status_enum',
		type: 'coded_text',
		description: 'Internal coded status field with unknown business mapping.',
		recommendedOperators: ['eq'],
		usage:
			'Avoid using this field unless the user explicitly refers to the raw codes. Do not infer business meaning from the codes.',
		allowedValues: ['0', '1', '2', '3', '4', '6', '7']
	},
	{
		field: 'investment_opportunities.tahun',
		type: 'number',
		description: 'Project year.',
		recommendedOperators: ['eq', 'gte', 'lte'],
		usage: 'Use numeric comparisons only.'
	},
	{
		field: 'investment_opportunities.nilai_investasi_amount',
		type: 'number',
		description: 'Normalized investment value amount.',
		recommendedOperators: ['gte', 'lte', 'eq'],
		usage:
			'Use numeric comparisons only. This is the numeric field for investment value filters and sorting. Treat the amount as IDR by default unless the user explicitly asks for another currency or conversion behavior. Do not use the raw text field investment_opportunities.nilai_investasi for numeric logic.'
	},
	{
		field: 'investment_opportunities.nilai_irr_percent',
		type: 'number',
		description: 'Normalized IRR percentage.',
		recommendedOperators: ['gte', 'lte', 'eq'],
		usage:
			'Use numeric comparisons only. This is the numeric field for IRR filters and sorting. Do not use the raw text field investment_opportunities.nilai_irr for numeric logic.'
	},
	{
		field: 'investment_opportunities.nilai_npv_amount',
		type: 'number',
		description: 'Normalized NPV amount.',
		recommendedOperators: ['gte', 'lte', 'eq'],
		usage:
			'Use numeric comparisons only. This is the numeric field for NPV filters and sorting. Treat the amount as IDR by default unless the user explicitly asks for another currency or conversion behavior. Do not use the raw text field investment_opportunities.nilai_npv for numeric logic.'
	},
	{
		field: 'adm_provinces.nama',
		type: 'text',
		description: 'Province master-data name from the joined table.',
		recommendedOperators: ['ilike', 'eq'],
		usage: 'Requires the adm_provinces join. Prefer ilike for user-entered location text.'
	},
	{
		field: 'adm_regencies.nama',
		type: 'text',
		description: 'Regency or city master-data name from the joined table.',
		recommendedOperators: ['ilike', 'eq'],
		usage: 'Requires the adm_regencies join. Prefer ilike for user-entered location text.'
	},
	{
		field: 'investment_opportunity_details.is_ikn',
		type: 'boolean',
		description: 'Whether the project is associated with IKN.',
		recommendedOperators: ['eq'],
		usage: 'Requires the investment_opportunity_details join. Use boolean true or false.'
	},
	{
		field: 'investment_opportunity_details.is_ipro',
		type: 'boolean',
		description: 'Whether the project is flagged as IPRO in the detail table.',
		recommendedOperators: ['eq'],
		usage: 'Requires the investment_opportunity_details join. Use boolean true or false.'
	},
	{
		field: 'investment_opportunity_details.readiness_status',
		type: 'enum_text',
		description: 'Readiness label from the detail record.',
		recommendedOperators: ['eq'],
		usage:
			'Requires the investment_opportunity_details join. Use only as an exact-match enum. Never invent new members. RE/PUBLISH indicates a published or ready-to-publish opportunity record. DIMINATI indicates an opportunity with investor interest.',
		allowedValues: ['RE/PUBLISH', 'DIMINATI']
	}
] as const;

export const approvedProjectSearchJoins = [
	'investment_opportunities.id_adm_provinsi -> adm_provinces.id_adm_provinsi',
	'investment_opportunities.id_adm_kabkot -> adm_regencies.id_adm_kabkot',
	'investment_opportunities.id_peluang -> investment_opportunity_details.id_peluang'
] as const;

export const approvedProjectSearchOperators = ['eq', 'ilike', 'gte', 'lte'] as const;
