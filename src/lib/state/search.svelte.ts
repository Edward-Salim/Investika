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
	sortBy: 'default' as 'default' | 'investment-asc' | 'investment-desc' | 'alpha'
});
