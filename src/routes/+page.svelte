<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { browser } from '$app/environment';
	import {
		Zap,
		ArrowRight,
		MapPin,
		DollarSign,
		SlidersHorizontal,
		X,
		ChevronDown,
		Check,
		Home,
		Bot,
		Search,
		ChevronUp,
		LayoutGrid,
		Truck,
		Sprout,
		Cpu,
		Palmtree,
		Factory,
		Waves,
		Pickaxe,
		Building2,
		ShoppingBag,
		Briefcase,
		Construction,
		Stethoscope,
		RotateCcw,
		Image,
		Paperclip,
		Bookmark
	} from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut, cubicInOut } from 'svelte/easing';
	import { onMount, tick } from 'svelte';
	import bkpmEmblem from '$lib/assets/logos/bkpm-emblem.png';
	import AuroraBackground from '$lib/components/AuroraBackground.svelte';
	import { searchStore } from '$lib/state/search.svelte.js';
	import { settingsStore } from '$lib/state/settings.svelte.js';
	import { bookmarkStore } from '$lib/state/bookmark.svelte';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import type { PageData } from './$types';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import ProjectCardSkeleton from '$lib/components/ProjectCardSkeleton.svelte';
	import vestiAIAsk from '$lib/assets/logos/vestiAI-ask.png';

	let { data } = $props<{ data: PageData }>();
	const serverProjects = $derived(data.projects);
	const totalProjects = $derived(data.totalProjects ?? serverProjects.length);
	const homepagePageSize = $derived(serverProjects.length || 18);

	let inputValue = $state(searchStore.inputValue);
	let aiSummary = $state(searchStore.aiSummary);
	let isAiSummaryExpanded = $state(searchStore.isAiSummaryExpanded);
	let viewMode = $state<'hero' | 'catalog' | 'search'>(searchStore.isSearching ? 'search' : 'hero');
	let activeFilter = $state(searchStore.activeFilter);
	let isFilterOpen = $state(searchStore.isFilterOpen);
	let isSectorDropdownOpen = $state(false);
	let isBookmarkListOpen = $state(true);
	let committedSearch = $state(searchStore.committedSearch);

	let collapseTimeout: ReturnType<typeof setTimeout>;
	let catalogSearchTimeout: ReturnType<typeof setTimeout> | undefined;
	let catalogProjects = $state<PageData['projects']>([]);
	let displayedProjects = $state<PageData['projects']>([]);
	let hasMoreCatalogProjects = $state(false);
	let isLoadingMoreProjects = $state(false);
	let isCatalogSearchLoading = $state(false);
	let catalogSearchResults = $state<PageData['projects']>([]);
	let loadMoreSentinel = $state<HTMLDivElement | null>(null);
	let loadMoreObserver: IntersectionObserver | null = null;
	let resultsScrollContainer = $state<HTMLDivElement | null>(null);
	const DEFAULT_MAX_INVESTMENT = 1_000_000_000_000_000;

	$effect(() => {
		if (catalogProjects.length === 0 && serverProjects.length > 0) {
			catalogProjects = serverProjects;
			hasMoreCatalogProjects = serverProjects.length >= homepagePageSize;
		}
	});

	$effect(() => {
		if (viewMode === 'search') {
			const storedResults = Array.isArray(searchStore.displayedProjects)
				? (searchStore.displayedProjects as PageData['projects'])
				: [];
			const hasSearchContext =
				searchStore.isLoading || committedSearch.trim().length > 0 || aiSummary.trim().length > 0;

			if (storedResults.length > 0 || hasSearchContext) {
				displayedProjects = storedResults;
				return;
			}

			// Recover gracefully from persisted "search mode" without any stored results.
			viewMode = 'hero';
			searchStore.isSearching = false;
			searchStore.displayedProjects = [];
			displayedProjects = catalogProjects;
			return;
		}

		displayedProjects = catalogProjects;
	});

	$effect(() => {
		if (!browser) return;
		if (viewMode !== 'catalog') return;

		const query = committedSearch.trim();
		if (catalogSearchTimeout) clearTimeout(catalogSearchTimeout);

		if (!query) {
			isCatalogSearchLoading = false;
			catalogSearchResults = [];
			return;
		}

		catalogSearchTimeout = setTimeout(async () => {
			isCatalogSearchLoading = true;
			try {
				const response = await fetch(`/api/projects/search?q=${encodeURIComponent(query)}`);
				const payload = await response.json().catch(() => null);

				if (!response.ok || !Array.isArray(payload?.projects)) {
					throw new Error(payload?.error || 'Catalog search failed');
				}

				catalogSearchResults = payload.projects as PageData['projects'];
			} catch (error) {
				console.error('Catalog text search failed:', error);
				catalogSearchResults = [];
			} finally {
				isCatalogSearchLoading = false;
			}
		}, 220);

		return () => {
			if (catalogSearchTimeout) clearTimeout(catalogSearchTimeout);
		};
	});

	async function loadMoreProjects() {
		if (viewMode !== 'catalog' || isLoadingMoreProjects || !hasMoreCatalogProjects) return;

		isLoadingMoreProjects = true;

		try {
			const response = await fetch(
				`/api/projects?offset=${catalogProjects.length}&limit=${homepagePageSize}`
			);
			const payload = await response.json().catch(() => null);

			if (!response.ok || !Array.isArray(payload?.projects)) {
				throw new Error(payload?.error || 'Failed to load more projects');
			}

			if (payload.projects.length === 0) {
				hasMoreCatalogProjects = false;
				return;
			}

			const existingIds = new Set(catalogProjects.map((project) => project.id));
			const appendedProjects = payload.projects.filter(
				(project: PageData['projects'][number]) => !existingIds.has(project.id)
			);

			if (appendedProjects.length > 0) {
				catalogProjects = [...catalogProjects, ...appendedProjects];
			}

			hasMoreCatalogProjects = Boolean(payload.hasMore) && appendedProjects.length > 0;
		} catch (error) {
			console.error('Failed to load more homepage projects:', error);
			hasMoreCatalogProjects = false;
		} finally {
			isLoadingMoreProjects = false;
		}
	}

	onMount(() => {
		// Check for view=catalog in URL to auto-open catalog section
		const params = new URLSearchParams(window.location.search);
		if (params.get('view') === 'catalog') {
			openCatalogView();
		}

		if (typeof IntersectionObserver === 'undefined') return;

		loadMoreObserver = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void loadMoreProjects();
				}
			},
			{ rootMargin: '600px 0px' }
		);

		return () => {
			loadMoreObserver?.disconnect();
		};
	});

	$effect(() => {
		if (!loadMoreObserver || !loadMoreSentinel || viewMode !== 'catalog' || !hasMoreCatalogProjects)
			return;
		loadMoreObserver.observe(loadMoreSentinel);
		return () => {
			if (loadMoreSentinel) {
				loadMoreObserver?.unobserve(loadMoreSentinel);
			}
		};
	});

	// ── ADVANCED FILTER STATE ──
	let minInvestment = $state(searchStore.minInvestment);
	let maxInvestment = $state(searchStore.maxInvestment);
	let selectedStatuses = $state<string[]>(searchStore.selectedStatuses);
	let selectedRegions = $state<string[]>(searchStore.selectedRegions);
	let showBookmarkedOnly = $state(searchStore.showBookmarkedOnly);
	let minIRR = $state(searchStore.minIRR);
	let maxIRR = $state(searchStore.maxIRR);
	let riskProfile = $state<'all' | 'conservative' | 'balanced' | 'aggressive'>(
		searchStore.riskProfile
	);
	let sortBy = $state<'default' | 'investment-asc' | 'investment-desc' | 'alpha' | 'irr-desc'>(
		searchStore.sortBy
	);

	$effect(() => {
		if (viewMode !== 'search' && inputValue === '') {
			committedSearch = '';
		}
	});

	function formatInvestment(raw: string | number) {
		// Parse "$120M" → 120 or pass through plain numbers
		const usdMillions =
			typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ''));
		if (isNaN(usdMillions)) return String(raw);

		if (!settingsStore.followLanguageCurrency) {
			return `$${usdMillions.toLocaleString()}M`;
		}

		const lang = getLocale();
		switch (lang) {
			case 'id':
				return `Rp ${(usdMillions * 0.016).toFixed(1)}T`;
			case 'zh':
				return `¥ ${(usdMillions * 0.0072).toFixed(1)}B`;
			case 'ja':
				return `¥ ${(usdMillions * 0.15).toFixed(1)}B`;
			case 'ko':
				return `₩ ${(usdMillions * 0.00135).toFixed(2)}T`;
			default:
				return `$${usdMillions.toLocaleString()}M`;
		}
	}

	// Helper to encode URLs and proxy restricted BKPM images
	const safeUrl = (url: string | null) => {
		if (!url)
			return 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=400';
		if (url.includes('bkpm.go.id')) {
			return `/api/proxy-image?url=${encodeURIComponent(url.replace(/ /g, '%20'))}`;
		}
		return url.replace(/ /g, '%20');
	};

	$effect(() => {
		searchStore.inputValue = inputValue;
		searchStore.aiSummary = aiSummary;
		searchStore.isAiSummaryExpanded = isAiSummaryExpanded;
		searchStore.isSearching = viewMode === 'search';
		searchStore.activeFilter = activeFilter;
		searchStore.isFilterOpen = isFilterOpen;
		searchStore.minInvestment = minInvestment;
		searchStore.maxInvestment = maxInvestment;
		searchStore.selectedStatuses = selectedStatuses;
		searchStore.selectedRegions = selectedRegions;
		searchStore.showBookmarkedOnly = showBookmarkedOnly;
		searchStore.minIRR = minIRR;
		searchStore.maxIRR = maxIRR;
		searchStore.riskProfile = riskProfile;
		searchStore.sortBy = sortBy;
		searchStore.committedSearch = committedSearch;
	});

	function resetSearch() {
		catalogProjects = serverProjects;
		displayedProjects = serverProjects;
		hasMoreCatalogProjects = serverProjects.length >= homepagePageSize;
		searchStore.displayedProjects = [];
		viewMode = 'hero';
		inputValue = '';
		committedSearch = '';
		aiSummary = '';
		isAiSummaryExpanded = false;
		activeFilter = 'All';
		clearAdvancedFilters();
	}

	function clearAll() {
		catalogProjects = serverProjects;
		displayedProjects = serverProjects;
		hasMoreCatalogProjects = serverProjects.length >= homepagePageSize;
		searchStore.displayedProjects = [];
		viewMode = 'catalog';
		inputValue = '';
		committedSearch = '';
		aiSummary = '';
		isAiSummaryExpanded = false;
		activeFilter = 'All';
		clearAdvancedFilters();
		// We stay in the catalog dashboard view
	}

	const sectorFilters = $derived([
		{
			name: 'All',
			label: m.filter_all_sectors(),
			icon: LayoutGrid,
			description: "Explore the full spectrum of Indonesia's strategic investment opportunities.",
			tier: 'All',
			activeClass: 'bg-slate-800 text-white shadow-slate-800/20',
			hoverClass: 'hover:border-slate-800/40 hover:text-slate-800'
		},
		// Primer (Primary Sector)
		{
			name: 'Agriculture',
			label: m.sector_agri(),
			icon: Sprout,
			description: 'Food security initiatives and sustainable agro-processing developments.',
			tier: 'Primer',
			activeClass: 'bg-emerald-600 text-white shadow-emerald-600/20',
			hoverClass: 'hover:border-emerald-600/40 hover:text-emerald-600'
		},
		{
			name: 'Fisheries',
			label: m.sector_fish(),
			icon: Waves,
			description: 'Sustainable aquaculture, deep-sea fisheries, and marine processing hubs.',
			tier: 'Primer',
			activeClass: 'bg-emerald-600 text-white shadow-emerald-600/20',
			hoverClass: 'hover:border-emerald-600/40 hover:text-emerald-600'
		},
		{
			name: 'Mining',
			label: m.sector_mine(),
			icon: Pickaxe,
			description: 'Critical mineral extraction and processing supporting global supply chains.',
			tier: 'Primer',
			activeClass: 'bg-emerald-600 text-white shadow-emerald-600/20',
			hoverClass: 'hover:border-emerald-600/40 hover:text-emerald-600'
		},
		// Sekunder (Secondary Sector)
		{
			name: 'Manufacturing',
			label: m.sector_mfg(),
			icon: Factory,
			description: 'Value-added processing, industrial estates, and manufacturing hubs.',
			tier: 'Sekunder',
			activeClass: 'bg-amber-600 text-white shadow-amber-600/20',
			hoverClass: 'hover:border-amber-600/40 hover:text-amber-600'
		},
		{
			name: 'Construction',
			label: m.sector_const(),
			icon: Construction,
			description: 'Toll roads, bridges, and smart city developments connecting the archipelago.',
			tier: 'Sekunder',
			activeClass: 'bg-amber-600 text-white shadow-amber-600/20',
			hoverClass: 'hover:border-amber-600/40 hover:text-amber-600'
		},
		// Tersier (Tertiary Sector)
		{
			name: 'Energy',
			label: m.sector_energy(),
			icon: Zap,
			description: 'Renewable and traditional power generation driving national energy security.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Logistics',
			label: m.sector_log(),
			icon: Truck,
			description:
				'Ports, supply chain hubs, and connectivity networks enhancing trade efficiency.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Technology',
			label: m.sector_tech(),
			icon: Cpu,
			description: 'Digital infrastructure, data centers, and emerging AI ecosystems.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Tourism',
			label: m.sector_tour(),
			icon: Palmtree,
			description: 'High-value hospitality and eco-tourism across priority destinations.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Healthcare',
			label: m.sector_serv(),
			icon: Stethoscope,
			description: 'Medical infrastructure and pharmaceutical production for national resilience.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Property',
			label: m.sector_prop(),
			icon: Building2,
			description: 'Commercial and mixed-use developments in emerging urban centers.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Retail',
			label: m.sector_retail(),
			icon: ShoppingBag,
			description: 'Consumer-facing infrastructure driven by a growing middle class.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		},
		{
			name: 'Services',
			label: m.sector_serv(),
			icon: Briefcase,
			description: 'Professional, financial, and specialized business service ecosystems.',
			tier: 'Tersier',
			activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20',
			hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue'
		}
	]);

	const activeDef = $derived(
		sectorFilters.find((f) => f.name === activeFilter) || sectorFilters[0]
	);

	const categoryIcons: Record<string, any> = {
		Energy: Zap,
		Construction: Construction,
		Logistics: Truck,
		Agriculture: Sprout,
		Fisheries: Waves,
		Technology: Cpu,
		Manufacturing: Factory,
		Tourism: Palmtree,
		Healthcare: Stethoscope,
		Mining: Pickaxe,
		Property: Building2,
		Retail: ShoppingBag,
		Services: Briefcase
	};
	const statusOptions = [
		{ id: 'Ready to Offer', label: m.filter_ready() },
		{ id: 'MoU Signed', label: m.filter_mou() },
		{ id: 'In Progress', label: m.filter_in_progress() },
		{ id: 'Pre-FS', label: m.filter_pre_fs() },
		{ id: 'Preliminary', label: m.filter_preliminary() }
	];
	const regionOptions = [
		{ id: 'wilayah indonesia bagian barat', label: m.reg_filter_west() },
		{ id: 'wilayah indonesia bagian tengah', label: m.reg_filter_central() },
		{ id: 'wilayah indonesia bagian timur', label: m.reg_filter_east() }
	];

	function toggleStatus(s: string) {
		selectedStatuses = selectedStatuses.includes(s)
			? selectedStatuses.filter((x) => x !== s)
			: [...selectedStatuses, s];
	}

	function toggleRegion(r: string) {
		selectedRegions = selectedRegions.includes(r)
			? selectedRegions.filter((x) => x !== r)
			: [...selectedRegions, r];
	}

	function clearAdvancedFilters() {
		minInvestment = 0;
		maxInvestment = DEFAULT_MAX_INVESTMENT;
		minIRR = 0;
		maxIRR = 30;
		selectedStatuses = [];
		selectedRegions = [];
		showBookmarkedOnly = false;
		riskProfile = 'all';
		sortBy = 'default';
	}

	function hasUsefulValue(value: unknown) {
		if (value === null || value === undefined) return false;
		if (typeof value === 'number') return Number.isFinite(value) && value > 0;
		if (typeof value === 'string') {
			const normalized = value.trim().toLowerCase();
			return (
				normalized !== '' &&
				normalized !== 'tbd' &&
				normalized !== 'nan' &&
				normalized !== 'no data'
			);
		}
		return true;
	}

	function getProjectCompletenessScore(project: any) {
		let score = 0;

		if (hasUsefulValue(project.image)) score += 4;
		if (hasUsefulValue(project.investmentNum)) score += 3;
		if (hasUsefulValue(project.irrNum)) score += 3;
		if (hasUsefulValue(project.npvNum)) score += 2;
		if (hasUsefulValue(project.location)) score += 1;
		if (hasUsefulValue(project.status)) score += 1;
		if (hasUsefulValue(project.category)) score += 1;

		return score;
	}

	const allProjects = $derived(
		viewMode === 'catalog' && committedSearch.trim() ? catalogSearchResults : displayedProjects
	);
	const normalizedCommittedSearch = $derived(committedSearch.trim().toLowerCase());

	const hasAdvancedFilters = $derived(
		selectedStatuses.length > 0 ||
			selectedRegions.length > 0 ||
			showBookmarkedOnly ||
			sortBy !== 'default' ||
			minInvestment > 0 ||
			maxInvestment < DEFAULT_MAX_INVESTMENT ||
			minIRR > 0
	);

	const activeFilterCount = $derived(
		(selectedStatuses.length > 0 ? 1 : 0) +
			(selectedRegions.length > 0 ? 1 : 0) +
			(showBookmarkedOnly ? 1 : 0) +
			(sortBy !== 'default' ? 1 : 0) +
			(minInvestment > 0 || maxInvestment < DEFAULT_MAX_INVESTMENT ? 1 : 0)
	);

	const filteredProjects = $derived(
		allProjects
			.filter((p: any) => {
				const matchesSearch =
					viewMode === 'catalog' && normalizedCommittedSearch
						? true
						: viewMode === 'search'
							? true
							: !normalizedCommittedSearch ||
								p.title.toLowerCase().includes(normalizedCommittedSearch) ||
								p.category.toLowerCase().includes(normalizedCommittedSearch) ||
								p.location.toLowerCase().includes(normalizedCommittedSearch);

				const matchesCategory = activeFilter === 'All' || p.category === activeFilter;

				const matchesInvestment =
					p.investmentNum >= minInvestment && p.investmentNum <= maxInvestment;
				const matchesIRR = p.irrNum >= minIRR && p.irrNum <= maxIRR;

				const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(p.status);
				const matchesRegion =
					selectedRegions.length === 0 || (p.wilayah && selectedRegions.includes(p.wilayah));
				const matchesBookmark = !showBookmarkedOnly || bookmarkStore.isBookmarked(p.id);

				return (
					matchesSearch &&
					matchesCategory &&
					matchesInvestment &&
					matchesIRR &&
					matchesStatus &&
					matchesRegion &&
					matchesBookmark
				);
			})
			.sort((a: any, b: any) => {
				if (sortBy === 'investment-asc') return a.investmentNum - b.investmentNum;
				if (sortBy === 'investment-desc') return b.investmentNum - a.investmentNum;
				if (sortBy === 'irr-desc') return b.irrNum - a.irrNum;
				if (sortBy === 'alpha') return a.title.localeCompare(b.title);

				const completenessDelta = getProjectCompletenessScore(b) - getProjectCompletenessScore(a);
				if (completenessDelta !== 0) return completenessDelta;

				const irrDelta =
					(Number.isFinite(b.irrNum) ? b.irrNum : 0) - (Number.isFinite(a.irrNum) ? a.irrNum : 0);
				if (irrDelta !== 0) return irrDelta;

				const investmentDelta =
					(Number.isFinite(b.investmentNum) ? b.investmentNum : 0) -
					(Number.isFinite(a.investmentNum) ? a.investmentNum : 0);
				if (investmentDelta !== 0) return investmentDelta;

				return a.title.localeCompare(b.title);
			})
	);

	const visibleProjectCountLabel = $derived.by(() => {
		if (
			viewMode === 'catalog' &&
			!committedSearch.trim() &&
			activeFilter === 'All' &&
			!hasAdvancedFilters
		) {
			return totalProjects;
		}

		return filteredProjects.length;
	});

	const bookmarkedProjects = $derived(
		bookmarkStore.projects.filter((project: any) => typeof project?.id !== 'undefined')
	);

	const isEmptyAiSearchResult = $derived(
		viewMode === 'search' && committedSearch.trim().length > 0 && displayedProjects.length === 0
	);

	const quickLinks = [m.home_quick_1(), m.home_quick_2(), m.home_quick_3(), m.home_quick_4()];

	// Maps query keywords → filter + tailored AI response
	const filterKeywords: Record<string, { filter: string; response: string }> = {
		energy: {
			filter: 'Energy',
			response:
				'I found renewable energy and power generation projects matching your query. These include wind, solar, and geothermal opportunities with strong IRR profiles and active government incentives.'
		},
		solar: {
			filter: 'Energy',
			response:
				"Solar energy projects are a high-priority sector under Indonesia's 2030 renewables target. I've filtered for energy projects with active pre-FS documentation."
		},
		wind: {
			filter: 'Energy',
			response:
				'Wind farm developments in Eastern Indonesia offer some of the strongest IRR targets in the pipeline. Showing energy sector projects now.'
		},
		logistics: {
			filter: 'Logistics',
			response:
				"Indonesia's logistics sector is a key bottleneck being addressed through 5 strategic port expansions and national toll road integration. Filtered to logistics projects."
		},
		port: {
			filter: 'Logistics',
			response:
				"Port development projects are centrally coordinated through the Ministry of Transportation. I've filtered for logistics and connectivity projects."
		},
		farming: {
			filter: 'Agriculture',
			response:
				'Agriculture and food security projects span 12 active investment opportunities, particularly in East Kalimantan and Papua. Filter applied.'
		},
		agriculture: {
			filter: 'Agriculture',
			response:
				"Indonesia's agricultural sector offers co-investment structures with BUMN partners. I've filtered projects in this sector for your review."
		},
		food: {
			filter: 'Agriculture',
			response:
				'Food production and downstream agro-processing projects are prioritized under the national food security agenda. Showing agriculture filter.'
		},
		tech: {
			filter: 'Technology',
			response:
				"AI, data infrastructure, and digital economy projects are now a priority vertical. I've identified technology-sector opportunities matching your interest."
		},
		ai: {
			filter: 'Technology',
			response:
				'AI and digital infrastructure investments are being accelerated under the Indonesia Digital Vision 2045. Showing technology projects.'
		},
		digital: {
			filter: 'Technology',
			response:
				'Digital economy projects include data centers, e-government platforms, and AI-driven services. Filter applied to technology sector.'
		},
		tourism: {
			filter: 'Tourism',
			response:
				'10 priority tourism destinations are open for investment, including Labuan Bajo, Lake Toba, and the Mandalika Circuit. Filtered to tourism projects.'
		},
		hotel: {
			filter: 'Tourism',
			response:
				'Hospitality and eco-tourism projects in the 10 priority destinations are actively seeking strategic partners. Showing tourism sector.'
		},
		hospital: {
			filter: 'Healthcare',
			response:
				"Healthcare infrastructure and pharmaceutical production are key sectors for national resilience. I've identified strategic healthcare projects."
		},
		mining: {
			filter: 'Mining',
			response:
				"Critical mineral mining and processing remain the backbone of Indonesia's export economy. Showing mining opportunities."
		},
		office: {
			filter: 'Property',
			response:
				'Mixed-use and commercial property developments in IKN and major urban centers are actively seeking investment.'
		},
		retail: {
			filter: 'Retail',
			response:
				'Consumer-facing retail and shopping center developments in growing secondary cities show high potential.'
		},
		infrastructure: {
			filter: 'Infrastructure',
			response:
				'National strategic infrastructure projects include toll roads, bridges, and smart city developments.'
		}
	};

	async function handleSearch() {
		const query = inputValue.trim();
		if (!query) {
			committedSearch = '';
			return;
		}

		clearAdvancedFilters();
		viewMode = 'search';
		isAiSummaryExpanded = true;
		committedSearch = query;
		searchStore.isLoading = true;

		try {
			const response = await fetch('/api/ai-search-projects', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ query })
			});

			const payload = await response.json().catch(() => null);
			if (!response.ok || !payload) {
				throw new Error('AI search failed');
			}

			displayedProjects = Array.isArray(payload.projects) ? payload.projects : [];
			searchStore.displayedProjects = displayedProjects;
			aiSummary =
				typeof payload.summary === 'string' && payload.summary.trim()
					? payload.summary.trim()
					: m.home_ai_results_count({ count: displayedProjects.length });
			inputValue = '';
			await tick();
			resultsScrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
		} catch {
			catalogProjects = serverProjects;
			displayedProjects = serverProjects;
			hasMoreCatalogProjects = serverProjects.length >= homepagePageSize;
			searchStore.displayedProjects = [];
			viewMode = 'catalog';
			aiSummary = m.home_ai_search_error();
		} finally {
			searchStore.isLoading = false;
			if (collapseTimeout) clearTimeout(collapseTimeout);
			collapseTimeout = setTimeout(() => {
				isAiSummaryExpanded = false;
			}, 6000);
		}
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
		event.preventDefault();
		void handleSearch();
	}

	function clearSummary() {
		aiSummary = '';
		isAiSummaryExpanded = false;
	}

	function openCatalogView() {
		catalogProjects = serverProjects;
		displayedProjects = serverProjects;
		hasMoreCatalogProjects = serverProjects.length >= homepagePageSize;
		searchStore.displayedProjects = [];
		aiSummary = '';
		isAiSummaryExpanded = false;
		committedSearch = '';
		activeFilter = 'All';
		clearAdvancedFilters();
		viewMode = 'catalog';
	}

	function autosize(node: HTMLTextAreaElement) {
		const update = () => {
			node.style.height = 'auto';
			node.style.height = `${Math.min(node.scrollHeight, 96)}px`;
		};
		node.addEventListener('input', update);
		update();
		return {
			destroy() {
				node.removeEventListener('input', update);
			}
		};
	}
</script>

<!-- Full-height column layout: projects fill top, search bar fixed at bottom -->
<div class="flex h-full w-full flex-col overflow-hidden">
	{#if viewMode === 'hero'}
		<!-- ── INITIAL HERO VIEW (before first search) ── -->
		<AuroraBackground class="w-full flex-1">
			<div
				class="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 pb-24 md:px-8"
				in:fade={{ duration: 600, easing: cubicOut }}
				out:fly={{ y: -60, duration: 450, easing: cubicInOut, opacity: 0 }}
			>
				<div class="animate-in fade-in slide-in-from-bottom-4 mb-10 text-center duration-700">
					<div class="mb-4 flex justify-center">
						<img
							src={bkpmEmblem}
							alt="BKPM"
							class="h-24 w-auto transition-transform hover:scale-105"
						/>
					</div>
					<h1 class="text-4xl leading-[1.1] font-black tracking-tighter text-slate-900 sm:text-6xl">
						{m.home_title_1()}
						<span
							class="text-bkpm-blue underline decoration-logo-green/40 decoration-8 underline-offset-8"
							>{m.home_title_2()}</span
						>
					</h1>
					<p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed font-medium text-slate-500">
						{m.home_subtitle()}
					</p>
				</div>

				<!-- Centered search bar -->
				<div class="w-full max-w-2xl">
					<!-- Gradient border wrapper -->
					<div class="gradient-border-wrap rounded-3xl p-[3px]">
						<div
							class="flex items-center rounded-[21px] bg-white p-1 shadow-2xl shadow-slate-200/50 transition-all"
						>
							<button
								type="button"
								class="ml-1 shrink-0 cursor-pointer rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-50 hover:text-bkpm-blue"
								title={m.home_attach_file()}><Paperclip size={18} strokeWidth={2.5} /></button
							><textarea
								use:autosize
								bind:value={inputValue}
								onkeydown={handleSearchKeydown}
								placeholder={m.home_placeholder()}
								class="scrollbar-hide max-h-[96px] min-h-[48px] flex-1 resize-none overflow-y-auto border-0 bg-transparent py-3 pr-4 pl-2 text-sm font-semibold break-words text-slate-800 placeholder-slate-300 focus:ring-0 focus:outline-none"
								style="word-break: break-word; overflow-wrap: anywhere;"
								rows="1"
							></textarea>
							<button
								onclick={handleSearch}
								aria-label="Send message"
								class="mr-2 shrink-0 rounded-xl p-2 shadow-sm transition-all duration-300
						{inputValue
									? 'scale-100 bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20'
									: 'bg-slate-50 text-slate-200'}"
							>
								<ArrowRight size={16} strokeWidth={3.5} />
							</button>
						</div>
					</div>

					<!-- AI hint -->
					<p class="mt-4 text-center text-xs font-medium text-slate-400">
						{m.home_hint_ai()}
						<button
							type="button"
							onclick={openCatalogView}
							class="ml-2 inline-flex cursor-pointer items-center gap-1 font-semibold text-bkpm-blue transition-colors hover:text-logo-green"
						>
							{m.home_hint_browse()}
							<ArrowRight size={12} strokeWidth={3} />
						</button>
						<a
							href="/bookmarks"
							class="ml-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-black text-slate-600 shadow-sm transition-colors hover:border-bkpm-blue/20 hover:text-bkpm-blue"
						>
							<Bookmark
								size={11}
								strokeWidth={2.5}
								fill={bookmarkStore.projects.length > 0 ? 'currentColor' : 'none'}
							/>
							{m.nav_bookmarks()}
							{#if bookmarkStore.projects.length > 0}
								<span
									class="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bkpm-blue px-1 text-[9px] font-black text-white"
								>
									{bookmarkStore.projects.length}
								</span>
							{/if}
						</a>
					</p>
				</div>
			</div>
		</AuroraBackground>
	{:else}
		<!-- ── POST-SEARCH LAYOUT ── -->

		<!-- SCROLLABLE: compact header + project grid -->
		<div
			bind:this={resultsScrollContainer}
			class="flex-1 overflow-y-auto px-6 pt-6 pb-2 md:px-10"
			in:fly={{ y: 50, duration: 550, delay: 250, easing: cubicOut, opacity: 0 }}
		>
			<!-- Compact header row -->
			<div class="mx-auto mb-6 max-w-[1400px]">
				<div class="flex items-center justify-between gap-3">
					<!-- Sector & Search Group -->
					<div class="flex flex-1 items-center gap-2">
						<!-- Sector Dropdown -->
						<div class="relative z-30 shrink-0">
							<button
								onclick={() => (isSectorDropdownOpen = !isSectorDropdownOpen)}
								class="group flex h-11 cursor-pointer items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black tracking-wide text-slate-700 uppercase shadow-sm shadow-slate-200/60 transition-all hover:border-bkpm-blue/40"
							>
								<activeDef.icon
									size={16}
									strokeWidth={2.5}
									class="transition-colors
								{activeDef.tier === 'Primer'
										? 'text-emerald-500 group-hover:text-emerald-600'
										: activeDef.tier === 'Sekunder'
											? 'text-amber-500 group-hover:text-amber-600'
											: activeDef.name === 'All'
												? 'text-slate-400 group-hover:text-bkpm-blue'
												: 'text-bkpm-blue group-hover:text-bkpm-blue'}"
								/>
								<span class="text-slate-700 group-hover:text-slate-900">{activeDef.label}</span>
								<ChevronDown
									size={14}
									class="ml-1 text-slate-400 transition-transform {isSectorDropdownOpen
										? 'rotate-180'
										: ''}"
								/>
							</button>

							{#if isSectorDropdownOpen}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="fixed inset-0 z-40"
									onclick={() => (isSectorDropdownOpen = false)}
								></div>
								<div
									class="absolute top-full left-0 z-50 mt-2 w-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl"
									style="max-height: min(24rem, calc(100vh - 18rem));"
									transition:slide={{ duration: 200, easing: cubicOut }}
								>
									<button
										onclick={() => {
											activeFilter = 'All';
											isSectorDropdownOpen = false;
										}}
										class="flex w-full items-center justify-between px-5 py-2.5 text-left transition-colors hover:bg-slate-50 {activeFilter ===
										'All'
											? 'bg-slate-50'
											: ''}"
									>
										<div class="flex items-center gap-3">
											<LayoutGrid size={16} class="text-slate-400" />
											<span class="text-xs font-black tracking-wide text-slate-700 uppercase"
												>{m.filter_all_sectors()}</span
											>
										</div>
										{#if activeFilter === 'All'}
											<Check size={14} strokeWidth={3} class="text-slate-400" />
										{/if}
									</button>

									{#each ['Primer', 'Sekunder', 'Tersier'] as tier (tier)}
										<div class="mt-2 border-t border-slate-50 px-5 py-2">
											<span class="text-[9px] font-black tracking-widest text-slate-300 uppercase">
												{tier === 'Primer'
													? m.onb_cat_primer()
													: tier === 'Sekunder'
														? m.onb_cat_sekunder()
														: m.onb_cat_tersier()}
											</span>
										</div>
										{#each sectorFilters.filter((f) => f.tier === tier) as f (f.name)}
											<button
												onclick={() => {
													activeFilter = f.name;
													isSectorDropdownOpen = false;
												}}
												class="group flex w-full cursor-pointer items-center justify-between px-5 py-2.5 text-left transition-colors hover:bg-slate-50 {activeFilter ===
												f.name
													? 'bg-slate-50'
													: ''}"
											>
												<div class="flex items-center gap-3">
													<f.icon
														size={15}
														class="transition-transform group-hover:scale-110 {tier === 'Primer'
															? 'text-emerald-500'
															: tier === 'Sekunder'
																? 'text-amber-500'
																: 'text-bkpm-blue'}"
													/>
													<span
														class="text-xs font-bold {activeFilter === f.name
															? 'text-slate-900'
															: 'text-slate-600 group-hover:text-slate-900'}">{f.label}</span
													>
												</div>
												{#if activeFilter === f.name}
													<Check
														size={14}
														strokeWidth={3}
														class={tier === 'Primer'
															? 'text-emerald-500'
															: tier === 'Sekunder'
																? 'text-amber-500'
																: 'text-bkpm-blue'}
													/>
												{/if}
											</button>
										{/each}
									{/each}
								</div>
							{/if}
						</div>

						<!-- Simple Search Bar -->
						<div class="relative w-full max-w-sm">
							<Search size={14} class="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={committedSearch}
								placeholder={m.search_placeholder()}
								class="h-11 w-full rounded-2xl border border-slate-200 bg-white pr-4 pl-10 text-xs font-bold text-slate-700 shadow-sm shadow-slate-200/60 transition-all placeholder:text-slate-400 focus:border-bkpm-blue/40 focus:ring-4 focus:ring-bkpm-blue/5 focus:outline-none"
							/>
						</div>
					</div>

					<!-- Global Reset Button -->

					<div class="flex shrink-0 items-center gap-2">
						<span class="px-1 text-xs font-black text-slate-500">
							{m.filter_projects_count({ count: visibleProjectCountLabel })}
						</span>
						<button
							onclick={() => (showBookmarkedOnly = !showBookmarkedOnly)}
							class="relative flex h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 text-xs font-black shadow-sm transition-all
							{showBookmarkedOnly
								? 'border-bkpm-blue/20 bg-bkpm-blue text-white shadow-bkpm-blue/20'
								: 'border-slate-200 bg-white text-slate-500 shadow-slate-200/60 hover:border-bkpm-blue/40 hover:text-bkpm-blue'}"
							title={m.filter_bookmarked_only()}
							aria-label={m.filter_bookmarked_only()}
						>
							<Bookmark
								size={14}
								strokeWidth={2.5}
								fill={showBookmarkedOnly ? 'currentColor' : 'none'}
							/>
							{m.filter_bookmarked()}
							{#if bookmarkStore.projects.length > 0}
								<span
									class="inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-black"
								>
									{bookmarkStore.projects.length}
								</span>
							{/if}
						</button>
						<button
							onclick={() => (isFilterOpen = !isFilterOpen)}
							class="relative flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 shadow-sm shadow-slate-200/60 transition-all hover:border-bkpm-blue/40 hover:text-bkpm-blue"
						>
							<SlidersHorizontal size={14} strokeWidth={2.5} />
							{m.filter_advanced()}
							{#if activeFilterCount > 0}
								<span
									class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bkpm-blue text-[9px] font-black text-white shadow-sm ring-2 ring-white"
								>
									{activeFilterCount}
								</span>
							{/if}
						</button>

						<button
							onclick={clearAll}
							class="group flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm shadow-slate-200/60 transition-all hover:border-bkpm-blue/40 hover:text-bkpm-blue"
							title={m.filter_reset()}
						>
							<RotateCcw
								size={14}
								strokeWidth={2.5}
								class="transition-transform group-hover:rotate-[-45deg]"
							/>
						</button>
					</div>
				</div>

				<!-- Sector Description -->
				{#if activeFilter !== 'All'}
					<div class="mt-3 px-1" transition:slide={{ duration: 200 }}>
						<p class="text-[11px] font-medium text-slate-500">
							{activeDef.description}
						</p>
					</div>
				{/if}
			</div>
			{#if isFilterOpen}
				<div
					class="mx-auto mb-6 max-w-[1400px] rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
					transition:slide={{ duration: 300, easing: cubicOut }}
				>
					<div class="mb-4 flex items-center justify-between border-b border-slate-50 pb-3">
						<h3 class="text-xs font-black tracking-widest text-slate-800 uppercase">
							{m.filter_advanced()}
						</h3>
						{#if hasAdvancedFilters}
							<button
								onclick={clearAdvancedFilters}
								class="cursor-pointer text-[10px] font-bold text-slate-400 uppercase transition-colors hover:text-bkpm-blue"
							>
								{m.filter_clear_all()}
							</button>
						{/if}
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<!-- Investment Range -->
						<div class="space-y-3">
							<span class="mb-2 block text-[10px] font-bold tracking-wider text-slate-400 uppercase"
								>{m.filter_investment_range()}</span
							>
							<div class="flex items-center gap-3">
								<div class="relative flex-1">
									<span
										class="absolute top-1/2 left-2 -translate-y-1/2 text-xs font-bold text-slate-400"
										>$</span
									>
									<input
										type="number"
										bind:value={minInvestment}
										class="w-full rounded-lg border border-slate-100 bg-slate-50 py-1.5 pr-2 pl-6 text-xs font-bold text-slate-700 transition-all focus:border-bkpm-blue/30 focus:ring-2 focus:ring-bkpm-blue/10 focus:outline-none"
									/>
								</div>
								<span class="text-xs font-black text-slate-300">-</span>
								<div class="relative flex-1">
									<span
										class="absolute top-1/2 left-2 -translate-y-1/2 text-xs font-bold text-slate-400"
										>$</span
									>
									<input
										type="number"
										bind:value={maxInvestment}
										class="w-full rounded-lg border border-slate-100 bg-slate-50 py-1.5 pr-2 pl-6 text-xs font-bold text-slate-700 transition-all focus:border-bkpm-blue/30 focus:ring-2 focus:ring-bkpm-blue/10 focus:outline-none"
									/>
								</div>
							</div>
						</div>

						<!-- Status -->
						<div class="space-y-3">
							<span class="mb-2 block text-[10px] font-bold tracking-wider text-slate-400 uppercase"
								>{m.filter_status()}</span
							>
							<div class="flex flex-wrap gap-2">
								{#each statusOptions as s}
									<button
										onclick={() => toggleStatus(s.id)}
										class="cursor-pointer rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all
										{selectedStatuses.includes(s.id)
											? 'border-logo-green/20 bg-logo-green/10 text-logo-green'
											: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}"
									>
										{s.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- Location -->
						<div class="space-y-3">
							<span class="mb-2 block text-[10px] font-bold tracking-wider text-slate-400 uppercase"
								>{m.filter_region()}</span
							>
							<div class="flex flex-wrap gap-2">
								{#each regionOptions as r}
									<button
										onclick={() => toggleRegion(r.id)}
										class="cursor-pointer rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all
										{selectedRegions.includes(r.id)
											? 'border-bkpm-blue/20 bg-bkpm-blue/10 text-bkpm-blue'
											: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}"
									>
										{r.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- IRR Range -->
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase"
									>{m.filter_irr()} ({minIRR}% - {maxIRR}%)</span
								>
							</div>
							<div class="px-2">
								<input
									type="range"
									min="0"
									max="30"
									step="1"
									bind:value={minIRR}
									class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-bkpm-blue"
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if viewMode === 'catalog' && bookmarkedProjects.length > 0 && !showBookmarkedOnly}
				<div
					class="mx-auto mb-6 max-w-[1400px] overflow-hidden rounded-[28px] border border-bkpm-blue/10 bg-white shadow-sm shadow-slate-200/40"
				>
					<div class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
						<button
							type="button"
							onclick={() => (isBookmarkListOpen = !isBookmarkListOpen)}
							class="flex cursor-pointer items-center gap-3 text-left"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-2xl bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20"
							>
								<Bookmark size={16} strokeWidth={2.5} fill="currentColor" />
							</div>
							<div>
								<p class="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
									{m.bookmark_saved_title()}
								</p>
								<p class="text-sm font-black text-slate-900">
									{m.bookmark_saved_count({ count: bookmarkedProjects.length })}
								</p>
							</div>
						</button>

						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={() => (showBookmarkedOnly = true)}
								class="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase transition-colors hover:border-bkpm-blue/30 hover:text-bkpm-blue"
							>
								{m.filter_bookmarked_only()}
							</button>
							<button
								type="button"
								onclick={() => bookmarkStore.clear()}
								class="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase transition-colors hover:border-red-200 hover:text-red-500"
							>
								{m.bookmark_clear_all()}
							</button>
							<button
								type="button"
								onclick={() => (isBookmarkListOpen = !isBookmarkListOpen)}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-bkpm-blue/30 hover:text-bkpm-blue"
								aria-label={isBookmarkListOpen ? m.bookmark_hide_list() : m.bookmark_show_list()}
							>
								<ChevronDown
									size={16}
									strokeWidth={2.5}
									class={isBookmarkListOpen
										? 'rotate-180 transition-transform'
										: 'transition-transform'}
								/>
							</button>
						</div>
					</div>

					{#if isBookmarkListOpen}
						<div class="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 lg:grid-cols-3">
							{#each bookmarkedProjects as project (project.id)}
								<ProjectCard {project} />
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Project grid — more generous spacing -->
			<div
				class="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 pb-12 md:grid-cols-2 lg:grid-cols-3"
			>
				{#if searchStore.isLoading || isCatalogSearchLoading}
					{#each Array(6) as _}
						<ProjectCardSkeleton />
					{/each}
				{:else}
					{#each filteredProjects as project (project.id)}
						<ProjectCard {project} />
					{:else}
						<div class="col-span-full py-20 text-center">
							<div
								class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4"
							>
								<SlidersHorizontal size={24} class="text-slate-200" />
							</div>
							<h3 class="text-xl font-black text-slate-800 mb-2">
								{isEmptyAiSearchResult ? m.home_ai_no_results_title() : m.no_results_title()}
							</h3>
							<p class="text-slate-400 font-medium">
								{isEmptyAiSearchResult ? m.home_ai_no_results_desc() : m.no_results_desc()}
							</p>
							<button
								onclick={resetSearch}
								class="mt-6 px-6 py-2 bg-bkpm-blue text-white rounded-xl font-black text-xs uppercase tracking-wide cursor-pointer hover:bg-bkpm-blue/90 transition-all"
							>
								{isEmptyAiSearchResult ? m.home_ai_clear() : m.btn_clear_filters()}
							</button>
						</div>
					{/each}
				{/if}
			</div>

			{#if viewMode === 'catalog'}
				<div bind:this={loadMoreSentinel} class="mx-auto h-px w-full max-w-[1400px]"></div>
				{#if isLoadingMoreProjects}
					<div class="mx-auto flex max-w-[1400px] items-center justify-center pt-2 pb-10">
						<div
							class="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold tracking-[0.18em] text-slate-500 uppercase shadow-sm"
						>
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-bkpm-blue"
							></div>
							Loading more projects
						</div>
					</div>
				{:else if hasMoreCatalogProjects}
					<div class="mx-auto flex max-w-[1400px] justify-center pt-2 pb-10">
						<p class="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
							Scroll for more projects
						</p>
					</div>
				{/if}
			{/if}
		</div>

		<!-- FIXED BOTTOM: AI summary + search bar -->
		<div
			class="shrink-0 border-t border-slate-100 bg-white/90 px-6 pt-3 pb-5 backdrop-blur-xl md:px-10"
		>
			<div class="w-full space-y-3">
				<!-- AI Summary — slides in right above the bar -->
				{#if aiSummary}
					<div
						class="relative overflow-hidden rounded-2xl border border-bkpm-blue/20 bg-white px-4 py-2.5 shadow-lg shadow-bkpm-blue/5 transition-all duration-300"
						in:fly={{ y: 16, duration: 350, easing: cubicOut }}
						out:fade={{ duration: 150 }}
					>
						<div class="flex items-start gap-6">
							<!-- Mascot & Branding on Left -->
							<div class="flex shrink-0 flex-col items-center">
								<button
									type="button"
									class="flex cursor-pointer flex-col items-center gap-0 border-none bg-transparent p-0"
									onclick={() => (isAiSummaryExpanded = !isAiSummaryExpanded)}
								>
									<img src={vestiAIAsk} alt="VestiAI" class="h-10 w-10 scale-125 object-contain" />
									<span class="mt-0.5 text-[8px] font-black tracking-tight text-bkpm-blue"
										>VestiAI</span
									>
								</button>
							</div>

							<!-- Intelligence Content on Right -->
							<div class="min-w-0 flex-1 pt-1.5">
								<button
									onclick={() => (isAiSummaryExpanded = !isAiSummaryExpanded)}
									class="absolute top-2 right-2 z-10 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-bkpm-blue"
								>
									{#if isAiSummaryExpanded}
										<ChevronDown size={14} strokeWidth={3} />
									{:else}
										<ChevronUp size={14} strokeWidth={3} />
									{/if}
								</button>

								{#if isAiSummaryExpanded}
									<div transition:slide={{ duration: 200 }}>
										<p
											class="pr-6 text-xs leading-relaxed font-semibold break-words text-slate-700"
										>
											{m.home_ai_prefix()}
											<span class="font-black text-bkpm-blue">"{aiSummary}"</span
											>{m.home_ai_suffix()}
										</p>
									</div>
								{:else}
									<p class="max-w-sm truncate text-[11px] font-bold text-slate-400 md:max-w-xl">
										"{aiSummary}"
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Search bar -->
				<div
					class="group relative flex items-center rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/40 transition-all focus-within:border-bkpm-blue/40 focus-within:ring-4 focus-within:ring-bkpm-blue/5"
				>
					<button
						onclick={resetSearch}
						aria-label="Reset Search"
						class="ml-1 shrink-0 cursor-pointer rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-50 hover:text-bkpm-blue"
					>
						<Home size={18} strokeWidth={2.5} />
					</button>
					<button
						type="button"
						class="ml-1 shrink-0 cursor-pointer rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-50 hover:text-bkpm-blue"
						title={m.home_attach_file()}><Paperclip size={18} strokeWidth={2.5} /></button
					><textarea
						use:autosize
						bind:value={inputValue}
						onkeydown={handleSearchKeydown}
						placeholder={m.home_placeholder()}
						class="scrollbar-hide max-h-[96px] min-h-[40px] flex-1 resize-none overflow-y-auto border-0 bg-transparent py-2.5 pr-4 pl-2 text-sm font-semibold break-words text-slate-800 placeholder-slate-300 focus:ring-0 focus:outline-none"
						style="word-break: break-word; overflow-wrap: anywhere;"
						rows="1"
					></textarea>
					<button
						onclick={handleSearch}
						aria-label="Send message"
						class="mr-1 shrink-0 rounded-lg p-2 transition-all duration-300
					{inputValue
							? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20'
							: 'bg-slate-50 text-slate-200'}"
					>
						<ArrowRight size={16} strokeWidth={3} />
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	/* Animated gradient border for landing search bar */
	@property --angle {
		syntax: '<angle>';
		initial-value: 0deg;
		inherits: false;
	}

	.gradient-border-wrap {
		background:
			linear-gradient(white, white) padding-box,
			conic-gradient(
					from var(--angle),
					rgba(0, 92, 171, 0.3) 0%,
					rgba(76, 175, 80, 0.3) 25%,
					rgba(0, 92, 171, 0.3) 50%,
					rgba(76, 175, 80, 0.3) 75%,
					rgba(0, 92, 171, 0.3) 100%
				)
				border-box;
		border: 3px solid transparent;
		animation: spin-border 6s linear infinite;
		box-shadow: 0 20px 60px -12px rgba(0, 92, 171, 0.12);
	}

	@keyframes spin-border {
		to {
			--angle: 360deg;
		}
	}
</style>
