import { browser } from '$app/environment';

const STORAGE_KEY = 'investika_search_state';
const DEFAULT_MAX_INVESTMENT = 1_000_000_000_000_000;

const initialState = {
	isSearching: false,
	isLoading: false,
	inputValue: '',
	aiSummary: '',
	isAiSummaryExpanded: false,
	displayedProjects: [] as any[],
	activeFilter: 'All',
	isFilterOpen: false,
	minInvestment: 0,
	maxInvestment: DEFAULT_MAX_INVESTMENT,
	selectedStatuses: [] as string[],
	selectedRegions: [] as string[],
	minIRR: 0,
	maxIRR: 30,
	riskProfile: 'all' as 'all' | 'conservative' | 'balanced' | 'aggressive',
	sortBy: 'default' as 'default' | 'investment-asc' | 'investment-desc' | 'alpha' | 'irr-desc',
	committedSearch: ''
};

type SearchState = typeof initialState;

function getPersistedState(state: SearchState) {
	return {
		isSearching: state.isSearching,
		inputValue: state.inputValue,
		aiSummary: state.aiSummary,
		isAiSummaryExpanded: state.isAiSummaryExpanded,
		activeFilter: state.activeFilter,
		isFilterOpen: state.isFilterOpen,
		minInvestment: state.minInvestment,
		maxInvestment: state.maxInvestment,
		selectedStatuses: state.selectedStatuses,
		selectedRegions: state.selectedRegions,
		minIRR: state.minIRR,
		maxIRR: state.maxIRR,
		riskProfile: state.riskProfile,
		sortBy: state.sortBy,
		committedSearch: state.committedSearch
	} satisfies Partial<SearchState>;
}

function loadState() {
	if (!browser) return initialState;
	const saved = localStorage.getItem(STORAGE_KEY);
	if (!saved) return initialState;
	try {
		const parsed = { ...initialState, ...JSON.parse(saved) };

		// Migrate legacy investment filter values that assumed small non-IDR numbers.
		if (
			typeof parsed.maxInvestment === 'number' &&
			Number.isFinite(parsed.maxInvestment) &&
			parsed.maxInvestment > 0 &&
			parsed.maxInvestment <= 100000
		) {
			parsed.maxInvestment = DEFAULT_MAX_INVESTMENT;
		}

		return parsed;
	} catch (e) {
		return initialState;
	}
}

export const searchStore = $state(loadState());

if (browser) {
	$effect.root(() => {
		let persistTimeout: ReturnType<typeof setTimeout> | undefined;

		$effect(() => {
			const persistedState = getPersistedState(searchStore);

			if (persistTimeout) clearTimeout(persistTimeout);
			persistTimeout = setTimeout(() => {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
			}, 150);

			return () => {
				if (persistTimeout) clearTimeout(persistTimeout);
			};
		});
	});
}

export function resetSearchStore() {
	Object.assign(searchStore, initialState);
}
