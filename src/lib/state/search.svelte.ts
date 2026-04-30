import { browser } from '$app/environment';

const STORAGE_KEY = 'investika_search_state';

const initialState = {
	isSearching: false,
	inputValue: '',
	aiSummary: '',
	isAiSummaryExpanded: false,
	displayedProjects: [] as any[],
	activeFilter: 'All',
	isFilterOpen: false,
	minInvestment: 0,
	maxInvestment: 100000,
	selectedStatuses: [] as string[],
	selectedRegions: [] as string[],
	minIRR: 0,
	maxIRR: 30,
	riskProfile: 'all' as 'all' | 'conservative' | 'balanced' | 'aggressive',
	sortBy: 'default' as 'default' | 'investment-asc' | 'investment-desc' | 'alpha' | 'irr-desc',
	committedSearch: ''
};

function loadState() {
	if (!browser) return initialState;
	const saved = localStorage.getItem(STORAGE_KEY);
	if (!saved) return initialState;
	try {
		return { ...initialState, ...JSON.parse(saved) };
	} catch (e) {
		return initialState;
	}
}

export const searchStore = $state(loadState());

if (browser) {
	$effect.root(() => {
		$effect(() => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(searchStore));
		});
	});
}

export function resetSearchStore() {
	Object.assign(searchStore, initialState);
}
