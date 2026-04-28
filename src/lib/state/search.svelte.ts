export const searchStore = $state({
	isSearching: false,
	inputValue: '',
	aiSummary: '',
	isAiSummaryExpanded: false,
	activeFilter: 'All',
	isFilterOpen: false,
	minInvestment: 0,
	maxInvestment: 3000,
	selectedStatuses: [] as string[],
	selectedRegions: [] as string[],
	selectedESG: [] as string[],
	minIRR: 0,
	maxIRR: 30,
	riskProfile: 'all' as 'all' | 'conservative' | 'balanced' | 'aggressive',
	sortBy: 'default' as 'default' | 'investment-asc' | 'investment-desc' | 'alpha' | 'irr-desc' | 'esg-asc'
});
