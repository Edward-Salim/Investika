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

export const approvedProjectSearchJoins = [
	'investment_opportunities.id_adm_provinsi -> adm_provinces.id_adm_provinsi',
	'investment_opportunities.id_adm_kabkot -> adm_regencies.id_adm_kabkot',
	'investment_opportunities.id_peluang -> investment_opportunity_details.id_peluang'
] as const;

export const approvedProjectSearchOperators = ['eq', 'ilike', 'gte', 'lte'] as const;
