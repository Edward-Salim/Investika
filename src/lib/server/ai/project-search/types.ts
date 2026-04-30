export type ProjectSearchIntent = 'find_projects';

export type ProjectSearchTable =
	| 'investment_opportunities'
	| 'adm_provinces'
	| 'adm_regencies'
	| 'investment_opportunity_details';

export type ProjectSearchField =
	| 'investment_opportunities.nama'
	| 'investment_opportunities.nama_provinsi'
	| 'investment_opportunities.nama_kabkot'
	| 'investment_opportunities.nama_sektor'
	| 'investment_opportunities.nama_sektor_peluang'
	| 'investment_opportunities.status'
	| 'investment_opportunities.status_proyek'
	| 'investment_opportunities.project_status_enum'
	| 'investment_opportunities.tahun'
	| 'investment_opportunities.nilai_investasi_amount'
	| 'investment_opportunities.nilai_irr_percent'
	| 'investment_opportunities.nilai_npv_amount'
	| 'adm_provinces.nama'
	| 'adm_regencies.nama'
	| 'investment_opportunity_details.is_ikn'
	| 'investment_opportunity_details.is_ipro'
	| 'investment_opportunity_details.readiness_status';

export type ProjectSearchOperator = 'eq' | 'ilike' | 'gte' | 'lte';

export type ProjectSearchJoin =
	| {
			from: 'investment_opportunities';
			to: 'adm_provinces';
	  }
	| {
			from: 'investment_opportunities';
			to: 'adm_regencies';
	  }
	| {
			from: 'investment_opportunities';
			to: 'investment_opportunity_details';
	  };

export type ProjectSearchFilter = {
	field: ProjectSearchField;
	operator: ProjectSearchOperator;
	value: string | number | boolean;
};

export type ProjectSearchSort = {
	field: ProjectSearchField;
	direction: 'asc' | 'desc';
};

export type ProjectSearchPlan = {
	intent: ProjectSearchIntent;
	base_table: 'investment_opportunities';
	joins: ProjectSearchJoin[];
	filters: ProjectSearchFilter[];
	sort: ProjectSearchSort[];
	limit: number;
	select_strategy: 'project_cards';
	explanation: string;
};
