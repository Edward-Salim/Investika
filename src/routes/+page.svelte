<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Zap, ArrowRight, MapPin, DollarSign, SlidersHorizontal, X, ChevronDown, Check, Home, Bot, Search, ChevronUp, LayoutGrid, Truck, Sprout, Cpu, Palmtree, Factory, Waves, Pickaxe, Building2, ShoppingBag, Briefcase, Construction, Stethoscope, RotateCcw, Image, Paperclip } from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut, cubicInOut } from 'svelte/easing';
	import bkpmEmblem from '$lib/assets/logos/bkpm-emblem.png';
	import AuroraBackground from '$lib/components/AuroraBackground.svelte';
	import { searchStore } from '$lib/state/search.svelte.js';
	import { settingsStore } from '$lib/state/settings.svelte.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import type { PageData } from './$types';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import ProjectCardSkeleton from '$lib/components/ProjectCardSkeleton.svelte';
	import vestiAIAsk from '$lib/assets/logos/vestiAI-ask.png';

	let { data } = $props<{ data: PageData }>();

	// Project Images
	import surabayaPortImg from '$lib/assets/projects/surabaya-port.png';
	import floresGeothermalImg from '$lib/assets/projects/flores-geothermal.png';

	let inputValue = $state(searchStore.inputValue);
	let aiSummary = $state(searchStore.aiSummary);
	let isAiSummaryExpanded = $state(searchStore.isAiSummaryExpanded);
	let isSearching = $state(searchStore.isSearching);
	let activeFilter = $state(searchStore.activeFilter);
	let isFilterOpen = $state(searchStore.isFilterOpen);
	let isSectorDropdownOpen = $state(false);
	let committedSearch = $state(searchStore.committedSearch);

	let collapseTimeout: ReturnType<typeof setTimeout>;
	let displayedProjects = $state<PageData['projects']>([]);

	$effect(() => {
		if (isSearching && searchStore.displayedProjects.length > 0) {
			displayedProjects = searchStore.displayedProjects as PageData['projects'];
			return;
		}

		displayedProjects = data.projects;
	});

	$effect(() => {
		if (!isSearching) {
			displayedProjects = data.projects;
		}
	});

	// ── ADVANCED FILTER STATE ──
	let minInvestment = $state(searchStore.minInvestment);
	let maxInvestment = $state(searchStore.maxInvestment);
	let selectedStatuses = $state<string[]>(searchStore.selectedStatuses);
	let selectedRegions = $state<string[]>(searchStore.selectedRegions);
	let minIRR = $state(searchStore.minIRR);
	let maxIRR = $state(searchStore.maxIRR);
	let riskProfile = $state<'all' | 'conservative' | 'balanced' | 'aggressive'>(searchStore.riskProfile);
	let sortBy = $state<'default' | 'investment-asc' | 'investment-desc' | 'alpha' | 'irr-desc'>(searchStore.sortBy);

	$effect(() => {
		if (!isSearching && inputValue === '') {
			committedSearch = '';
		}
	});

	function formatInvestment(raw: string | number) {
		// Parse "$120M" → 120 or pass through plain numbers
		const usdMillions = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ''));
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
		if (!url) return 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=400';
		if (url.includes('bkpm.go.id')) {
			return `/api/proxy-image?url=${encodeURIComponent(url.replace(/ /g, '%20'))}`;
		}
		return url.replace(/ /g, '%20');
	};

	$effect(() => {
		searchStore.inputValue = inputValue;
		searchStore.aiSummary = aiSummary;
		searchStore.isAiSummaryExpanded = isAiSummaryExpanded;
		searchStore.isSearching = isSearching;
		searchStore.displayedProjects = displayedProjects;
		searchStore.activeFilter = activeFilter;
		searchStore.isFilterOpen = isFilterOpen;
		searchStore.minInvestment = minInvestment;
		searchStore.maxInvestment = maxInvestment;
		searchStore.selectedStatuses = selectedStatuses;
		searchStore.selectedRegions = selectedRegions;
		searchStore.minIRR = minIRR;
		searchStore.maxIRR = maxIRR;
		searchStore.riskProfile = riskProfile;
		searchStore.sortBy = sortBy;
		searchStore.committedSearch = committedSearch;
	});

	function resetSearch() {
		displayedProjects = data.projects;
		isSearching = false;
		inputValue = '';
		committedSearch = '';
		aiSummary = '';
		isAiSummaryExpanded = false;
		activeFilter = 'All';
		clearAdvancedFilters();
	}

	function clearAll() {
		displayedProjects = data.projects;
		inputValue = '';
		committedSearch = '';
		aiSummary = '';
		isAiSummaryExpanded = false;
		activeFilter = 'All';
		clearAdvancedFilters();
		// We stay in the dashboard (isSearching remains true)
	}

	const sectorFilters = $derived([
		{ name: 'All', label: m.filter_all_sectors(), icon: LayoutGrid, description: 'Explore the full spectrum of Indonesia\'s strategic investment opportunities.', tier: 'All', activeClass: 'bg-slate-800 text-white shadow-slate-800/20', hoverClass: 'hover:border-slate-800/40 hover:text-slate-800' },
		// Primer (Primary Sector)
		{ name: 'Agriculture', label: m.sector_agri(), icon: Sprout, description: 'Food security initiatives and sustainable agro-processing developments.', tier: 'Primer', activeClass: 'bg-emerald-600 text-white shadow-emerald-600/20', hoverClass: 'hover:border-emerald-600/40 hover:text-emerald-600' },
		{ name: 'Fisheries', label: m.sector_fish(), icon: Waves, description: 'Sustainable aquaculture, deep-sea fisheries, and marine processing hubs.', tier: 'Primer', activeClass: 'bg-emerald-600 text-white shadow-emerald-600/20', hoverClass: 'hover:border-emerald-600/40 hover:text-emerald-600' },
		{ name: 'Mining', label: m.sector_mine(), icon: Pickaxe, description: 'Critical mineral extraction and processing supporting global supply chains.', tier: 'Primer', activeClass: 'bg-emerald-600 text-white shadow-emerald-600/20', hoverClass: 'hover:border-emerald-600/40 hover:text-emerald-600' },
		// Sekunder (Secondary Sector)
		{ name: 'Manufacturing', label: m.sector_mfg(), icon: Factory, description: 'Value-added processing, industrial estates, and manufacturing hubs.', tier: 'Sekunder', activeClass: 'bg-amber-600 text-white shadow-amber-600/20', hoverClass: 'hover:border-amber-600/40 hover:text-amber-600' },
		{ name: 'Construction', label: m.sector_const(), icon: Construction, description: 'Toll roads, bridges, and smart city developments connecting the archipelago.', tier: 'Sekunder', activeClass: 'bg-amber-600 text-white shadow-amber-600/20', hoverClass: 'hover:border-amber-600/40 hover:text-amber-600' },
		// Tersier (Tertiary Sector)
		{ name: 'Energy', label: m.sector_energy(), icon: Zap, description: 'Renewable and traditional power generation driving national energy security.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Logistics', label: m.sector_log(), icon: Truck, description: 'Ports, supply chain hubs, and connectivity networks enhancing trade efficiency.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Technology', label: m.sector_tech(), icon: Cpu, description: 'Digital infrastructure, data centers, and emerging AI ecosystems.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Tourism', label: m.sector_tour(), icon: Palmtree, description: 'High-value hospitality and eco-tourism across priority destinations.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Healthcare', label: m.sector_serv(), icon: Stethoscope, description: 'Medical infrastructure and pharmaceutical production for national resilience.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Property', label: m.sector_prop(), icon: Building2, description: 'Commercial and mixed-use developments in emerging urban centers.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Retail', label: m.sector_retail(), icon: ShoppingBag, description: 'Consumer-facing infrastructure driven by a growing middle class.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Services', label: m.sector_serv(), icon: Briefcase, description: 'Professional, financial, and specialized business service ecosystems.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' }
	]);

	const activeDef = $derived(sectorFilters.find(f => f.name === activeFilter) || sectorFilters[0]);

	const categoryIcons: Record<string, any> = {
		'Energy': Zap,
		'Construction': Construction,
		'Logistics': Truck,
		'Agriculture': Sprout,
		'Fisheries': Waves,
		'Technology': Cpu,
		'Manufacturing': Factory,
		'Tourism': Palmtree,
		'Healthcare': Stethoscope,
		'Mining': Pickaxe,
		'Property': Building2,
		'Retail': ShoppingBag,
		'Services': Briefcase
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
			? selectedStatuses.filter(x => x !== s)
			: [...selectedStatuses, s];
	}

	function toggleRegion(r: string) {
		selectedRegions = selectedRegions.includes(r)
			? selectedRegions.filter(x => x !== r)
			: [...selectedRegions, r];
	}

	function clearAdvancedFilters() {
		minInvestment = 0;
		maxInvestment = 100000;
		minIRR = 0;
		maxIRR = 30;
		selectedStatuses = [];
		selectedRegions = [];
		riskProfile = 'all';
		sortBy = 'default';
	}

	function hasUsefulValue(value: unknown) {
		if (value === null || value === undefined) return false;
		if (typeof value === 'number') return Number.isFinite(value) && value > 0;
		if (typeof value === 'string') {
			const normalized = value.trim().toLowerCase();
			return normalized !== '' && normalized !== 'tbd' && normalized !== 'nan' && normalized !== 'no data';
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

	const allProjects = $derived(displayedProjects);

	const hasAdvancedFilters = $derived(
		selectedStatuses.length > 0 ||
		selectedRegions.length > 0 ||
		sortBy !== 'default' ||
		minInvestment > 0 ||
		maxInvestment < 100000 ||
		minIRR > 0
	);

	const activeFilterCount = $derived(
		(selectedStatuses.length > 0 ? 1 : 0) +
		(selectedRegions.length > 0 ? 1 : 0) +
		(sortBy !== 'default' ? 1 : 0) +
		(minInvestment > 0 || maxInvestment < 100000 ? 1 : 0)
	);

	const filteredProjects = $derived(
		allProjects
			.filter((p: any) => {
				const matchesSearch = !committedSearch ||
					p.title.toLowerCase().includes(committedSearch.toLowerCase()) ||
					p.category.toLowerCase().includes(committedSearch.toLowerCase()) ||
					p.location.toLowerCase().includes(committedSearch.toLowerCase());

				const matchesCategory = activeFilter === 'All' || p.category === activeFilter;

				const matchesInvestment = p.investmentNum >= minInvestment && p.investmentNum <= maxInvestment;
				const matchesIRR = p.irrNum >= minIRR && p.irrNum <= maxIRR;

				const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(p.status);
				const matchesRegion = selectedRegions.length === 0 || (p.wilayah && selectedRegions.includes(p.wilayah));

				return matchesSearch && matchesCategory && matchesInvestment && matchesIRR && matchesStatus && matchesRegion;
			})
			.sort((a: any, b: any) => {
				if (sortBy === 'investment-asc') return a.investmentNum - b.investmentNum;
				if (sortBy === 'investment-desc') return b.investmentNum - a.investmentNum;
				if (sortBy === 'irr-desc') return b.irrNum - a.irrNum;
				if (sortBy === 'alpha') return a.title.localeCompare(b.title);

				const completenessDelta = getProjectCompletenessScore(b) - getProjectCompletenessScore(a);
				if (completenessDelta !== 0) return completenessDelta;

				const irrDelta = (Number.isFinite(b.irrNum) ? b.irrNum : 0) - (Number.isFinite(a.irrNum) ? a.irrNum : 0);
				if (irrDelta !== 0) return irrDelta;

				const investmentDelta =
					(Number.isFinite(b.investmentNum) ? b.investmentNum : 0) -
					(Number.isFinite(a.investmentNum) ? a.investmentNum : 0);
				if (investmentDelta !== 0) return investmentDelta;

				return a.title.localeCompare(b.title);
			})
	);

	const quickLinks = [
		m.home_quick_1(),
		m.home_quick_2(),
		m.home_quick_3(),
		m.home_quick_4()
	];

	// Maps query keywords → filter + tailored AI response
	const filterKeywords: Record<string, { filter: string; response: string }> = {
		energy:      { filter: 'Energy',      response: 'I found renewable energy and power generation projects matching your query. These include wind, solar, and geothermal opportunities with strong IRR profiles and active government incentives.' },
		solar:       { filter: 'Energy',      response: 'Solar energy projects are a high-priority sector under Indonesia\'s 2030 renewables target. I\'ve filtered for energy projects with active pre-FS documentation.' },
		wind:        { filter: 'Energy',      response: 'Wind farm developments in Eastern Indonesia offer some of the strongest IRR targets in the pipeline. Showing energy sector projects now.' },
		logistics:   { filter: 'Logistics',   response: 'Indonesia\'s logistics sector is a key bottleneck being addressed through 5 strategic port expansions and national toll road integration. Filtered to logistics projects.' },
		port:        { filter: 'Logistics',   response: 'Port development projects are centrally coordinated through the Ministry of Transportation. I\'ve filtered for logistics and connectivity projects.' },
		farming:     { filter: 'Agriculture', response: 'Agriculture and food security projects span 12 active investment opportunities, particularly in East Kalimantan and Papua. Filter applied.' },
		agriculture: { filter: 'Agriculture', response: 'Indonesia\'s agricultural sector offers co-investment structures with BUMN partners. I\'ve filtered projects in this sector for your review.' },
		food:        { filter: 'Agriculture', response: 'Food production and downstream agro-processing projects are prioritized under the national food security agenda. Showing agriculture filter.' },
		tech:        { filter: 'Technology',  response: 'AI, data infrastructure, and digital economy projects are now a priority vertical. I\'ve identified technology-sector opportunities matching your interest.' },
		ai:          { filter: 'Technology',  response: 'AI and digital infrastructure investments are being accelerated under the Indonesia Digital Vision 2045. Showing technology projects.' },
		digital:     { filter: 'Technology',  response: 'Digital economy projects include data centers, e-government platforms, and AI-driven services. Filter applied to technology sector.' },
		tourism:     { filter: 'Tourism',     response: '10 priority tourism destinations are open for investment, including Labuan Bajo, Lake Toba, and the Mandalika Circuit. Filtered to tourism projects.' },
		hotel:       { filter: 'Tourism',     response: 'Hospitality and eco-tourism projects in the 10 priority destinations are actively seeking strategic partners. Showing tourism sector.' },
		hospital:    { filter: 'Healthcare',  response: 'Healthcare infrastructure and pharmaceutical production are key sectors for national resilience. I\'ve identified strategic healthcare projects.' },
		mining:      { filter: 'Mining',      response: 'Critical mineral mining and processing remain the backbone of Indonesia\'s export economy. Showing mining opportunities.' },
		office:      { filter: 'Property',    response: 'Mixed-use and commercial property developments in IKN and major urban centers are actively seeking investment.' },
		retail:      { filter: 'Retail',      response: 'Consumer-facing retail and shopping center developments in growing secondary cities show high potential.' },
		infrastructure: { filter: 'Infrastructure', response: 'National strategic infrastructure projects include toll roads, bridges, and smart city developments.' },
	};

	async function handleSearch() {
		const query = inputValue.trim();
		if (!query) {
			committedSearch = '';
			return;
		}

		clearAdvancedFilters();
		isSearching = true;
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
			aiSummary = typeof payload.summary === 'string' && payload.summary.trim()
				? payload.summary.trim()
				: m.home_ai_results_count({ count: displayedProjects.length });
			inputValue = '';
		} catch {
			displayedProjects = data.projects;
			aiSummary = m.home_ai_search_error();
		} finally {
			searchStore.isLoading = false;
			if (collapseTimeout) clearTimeout(collapseTimeout);
			collapseTimeout = setTimeout(() => {
				isAiSummaryExpanded = false;
			}, 6000);
		}
	}


	function clearSummary() {
		aiSummary = '';
		isAiSummaryExpanded = false;
	}

	function openCatalogView() {
		displayedProjects = data.projects;
		aiSummary = '';
		isAiSummaryExpanded = false;
		committedSearch = '';
		activeFilter = 'All';
		clearAdvancedFilters();
		isSearching = true;
	}

	function autosize(node: HTMLTextAreaElement) {
		const update = () => {
			node.style.height = 'auto';
			node.style.height = `${Math.min(node.scrollHeight, 96)}px`;
		};
		node.addEventListener('input', update);
		update();
		return { destroy() { node.removeEventListener('input', update); } };
	}
</script>



<!-- Full-height column layout: projects fill top, search bar fixed at bottom -->
<div class="w-full h-full flex flex-col overflow-hidden">


{#if !isSearching}
	<!-- ── INITIAL HERO VIEW (before first search) ── -->
	<AuroraBackground class="flex-1 w-full">
		<div
			class="flex flex-col items-center justify-center px-4 md:px-8 pb-24 relative z-10 w-full h-full"
			in:fade={{ duration: 600, easing: cubicOut }}
			out:fly={{ y: -60, duration: 450, easing: cubicInOut, opacity: 0 }}
		>
		<div class="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div class="mb-4 flex justify-center">
				<img
					src={bkpmEmblem}
					alt="BKPM"
					class="h-24 w-auto transition-transform hover:scale-105"
				/>
			</div>
			<h1 class="text-4xl font-black tracking-tighter text-slate-900 sm:text-6xl leading-[1.1]">
				{m.home_title_1()} <span class="text-bkpm-blue underline decoration-logo-green/40 underline-offset-8 decoration-8">{m.home_title_2()}</span>
			</h1>
			<p class="mt-4 text-lg font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
				{m.home_subtitle()}
			</p>
		</div>

		<!-- Centered search bar -->
		<div class="w-full max-w-2xl">
			<!-- Gradient border wrapper -->
			<div class="gradient-border-wrap rounded-3xl p-[3px]">
				<div class="flex items-center rounded-[21px] bg-white p-1 shadow-2xl shadow-slate-200/50 transition-all">
					<button type="button" class="ml-1 p-2 text-slate-300 hover:text-bkpm-blue hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0" title={m.home_attach_file()}><Paperclip size={18} strokeWidth={2.5} /></button><textarea
						use:autosize
						bind:value={inputValue}
						onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
						placeholder={m.home_placeholder()}
						class="flex-1 resize-none border-0 bg-transparent pl-2 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 min-h-[48px] max-h-[96px] overflow-y-auto scrollbar-hide break-words"
						style="word-break: break-word; overflow-wrap: anywhere;"
						rows="1"
					></textarea>
					<button
						onclick={handleSearch}
						aria-label="Send message"
						class="mr-2 rounded-xl p-2 transition-all duration-300 shadow-sm shrink-0
						{inputValue ? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20 scale-100' : 'bg-slate-50 text-slate-200'}"
					>
						<ArrowRight size={16} strokeWidth={3.5} />
					</button>
				</div>
			</div>

			<!-- AI hint -->
			<p class="mt-4 text-xs font-medium text-slate-400 text-center">
				{m.home_hint_ai()}
				<button
					type="button"
					onclick={openCatalogView}
					class="ml-2 inline-flex cursor-pointer items-center gap-1 font-semibold text-bkpm-blue transition-colors hover:text-logo-green"
				>
					{m.home_hint_browse()}
					<ArrowRight size={12} strokeWidth={3} />
				</button>
			</p>
		</div>
		</div>
	</AuroraBackground>
{:else}
	<!-- ── POST-SEARCH LAYOUT ── -->

	<!-- SCROLLABLE: compact header + project grid -->
	<div
		class="flex-1 overflow-y-auto px-6 md:px-10 pt-6 pb-2"
		in:fly={{ y: 50, duration: 550, delay: 250, easing: cubicOut, opacity: 0 }}
	>
		<!-- Compact header row -->
		<div class="mb-6 max-w-[1400px] mx-auto">
			<div class="flex items-center justify-between gap-3">
				<!-- Sector & Search Group -->
				<div class="flex items-center gap-2 flex-1">
					<!-- Sector Dropdown -->
					<div class="relative z-30 shrink-0">
						<button
							onclick={() => isSectorDropdownOpen = !isSectorDropdownOpen}
							class="group flex h-11 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm shadow-slate-200/60 transition-all hover:border-bkpm-blue/40 cursor-pointer"
						>
							<activeDef.icon size={16} strokeWidth={2.5} class="transition-colors
								{activeDef.tier === 'Primer' ? 'text-emerald-500 group-hover:text-emerald-600' :
								 activeDef.tier === 'Sekunder' ? 'text-amber-500 group-hover:text-amber-600' :
								 activeDef.name === 'All' ? 'text-slate-400 group-hover:text-bkpm-blue' :
								 'text-bkpm-blue group-hover:text-bkpm-blue'}"
							/>
							<span class="text-slate-700 group-hover:text-slate-900">{activeDef.label}</span>
							<ChevronDown size={14} class="ml-1 text-slate-400 transition-transform {isSectorDropdownOpen ? 'rotate-180' : ''}" />
						</button>

						{#if isSectorDropdownOpen}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="fixed inset-0 z-40" onclick={() => isSectorDropdownOpen = false}></div>
							<div
								class="absolute left-0 top-full z-50 mt-2 w-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl"
								style="max-height: min(24rem, calc(100vh - 18rem));"
								transition:slide={{ duration: 200, easing: cubicOut }}
							>
								<button
									onclick={() => { activeFilter = 'All'; isSectorDropdownOpen = false; }}
									class="w-full text-left px-5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors {activeFilter === 'All' ? 'bg-slate-50' : ''}"
								>
									<div class="flex items-center gap-3">
										<LayoutGrid size={16} class="text-slate-400" />
										<span class="text-xs font-black uppercase text-slate-700 tracking-wide">{m.filter_all_sectors()}</span>
									</div>
									{#if activeFilter === 'All'}
										<Check size={14} strokeWidth={3} class="text-slate-400" />
									{/if}
								</button>

								{#each ['Primer', 'Sekunder', 'Tersier'] as tier (tier)}
									<div class="px-5 py-2 mt-2 border-t border-slate-50">
										<span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">
											{tier === 'Primer' ? m.onb_cat_primer() : tier === 'Sekunder' ? m.onb_cat_sekunder() : m.onb_cat_tersier()}
										</span>
									</div>
									{#each sectorFilters.filter(f => f.tier === tier) as f (f.name)}
										<button
											onclick={() => { activeFilter = f.name; isSectorDropdownOpen = false; }}
											class="w-full text-left px-5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer {activeFilter === f.name ? 'bg-slate-50' : ''}"
										>
											<div class="flex items-center gap-3">
												<f.icon size={15} class="transition-transform group-hover:scale-110 {tier === 'Primer' ? 'text-emerald-500' : tier === 'Sekunder' ? 'text-amber-500' : 'text-bkpm-blue'}" />
												<span class="text-xs font-bold {activeFilter === f.name ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}">{f.label}</span>
											</div>
											{#if activeFilter === f.name}
												<Check size={14} strokeWidth={3} class={tier === 'Primer' ? 'text-emerald-500' : tier === 'Sekunder' ? 'text-amber-500' : 'text-bkpm-blue'} />
											{/if}
										</button>
									{/each}
								{/each}
							</div>
						{/if}
					</div>

					<!-- Simple Search Bar -->
					<div class="relative w-full max-w-sm">
						<Search size={14} class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							bind:value={committedSearch}
							placeholder={m.search_placeholder()}
							class="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-bold text-slate-700 shadow-sm shadow-slate-200/60 transition-all placeholder:text-slate-400 focus:outline-none focus:border-bkpm-blue/40 focus:ring-4 focus:ring-bkpm-blue/5"
						/>
					</div>
				</div>

				<!-- Global Reset Button -->


				<div class="flex items-center gap-2 shrink-0">
					<span class="px-1 text-xs font-black text-slate-500">
						{m.filter_projects_count({ count: filteredProjects.length })}
					</span>
					<button
						onclick={() => isFilterOpen = !isFilterOpen}
						class="relative flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 shadow-sm shadow-slate-200/60 transition-all hover:border-bkpm-blue/40 hover:text-bkpm-blue cursor-pointer"
					>
						<SlidersHorizontal size={14} strokeWidth={2.5} />
						{m.filter_advanced()}
						{#if activeFilterCount > 0}
							<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bkpm-blue text-[9px] font-black text-white shadow-sm ring-2 ring-white">
								{activeFilterCount}
							</span>
						{/if}
					</button>

					<button
						onclick={clearAll}
						class="group flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm shadow-slate-200/60 transition-all hover:border-bkpm-blue/40 hover:text-bkpm-blue cursor-pointer"
						title={m.filter_reset()}
					>
						<RotateCcw size={14} strokeWidth={2.5} class="group-hover:rotate-[-45deg] transition-transform" />
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
				class="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm max-w-[1400px] mx-auto"
				transition:slide={{ duration: 300, easing: cubicOut }}
			>
				<div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
					<h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">{m.filter_advanced()}</h3>
					{#if hasAdvancedFilters}
						<button onclick={clearAdvancedFilters} class="text-[10px] font-bold text-slate-400 hover:text-bkpm-blue transition-colors uppercase cursor-pointer">
							{m.filter_clear_all()}
						</button>
					{/if}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<!-- Investment Range -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{m.filter_investment_range()}</span>
						<div class="flex items-center gap-3">
							<div class="relative flex-1">
								<span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
								<input type="number" bind:value={minInvestment} class="w-full pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:border-bkpm-blue/30 focus:ring-2 focus:ring-bkpm-blue/10 transition-all" />
							</div>
							<span class="text-slate-300 font-black text-xs">-</span>
							<div class="relative flex-1">
								<span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
								<input type="number" bind:value={maxInvestment} class="w-full pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:border-bkpm-blue/30 focus:ring-2 focus:ring-bkpm-blue/10 transition-all" />
							</div>
						</div>
					</div>

					<!-- Status -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{m.filter_status()}</span>
						<div class="flex flex-wrap gap-2">
							{#each statusOptions as s}
								<button
									onclick={() => toggleStatus(s.id)}
									class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer
										{selectedStatuses.includes(s.id)
											? 'bg-logo-green/10 text-logo-green border-logo-green/20'
											: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}"
								>
									{s.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Location -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{m.filter_region()}</span>
						<div class="flex flex-wrap gap-2">
							{#each regionOptions as r}
								<button
									onclick={() => toggleRegion(r.id)}
									class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer
										{selectedRegions.includes(r.id)
											? 'bg-bkpm-blue/10 text-bkpm-blue border-bkpm-blue/20'
											: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}"
								>
									{r.label}
								</button>
							{/each}
						</div>
					</div>


					<!-- IRR Range -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.filter_irr()} ({minIRR}% - {maxIRR}%)</span>
						</div>
						<div class="px-2">
							<input
								type="range"
								min="0"
								max="30"
								step="1"
								bind:value={minIRR}
								class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bkpm-blue"
							/>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Project grid — more generous spacing -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 max-w-[1400px] mx-auto">
			{#if searchStore.isLoading}
				{#each Array(6) as _}
					<ProjectCardSkeleton />
				{/each}
			{:else}
				{#each filteredProjects as project (project.id)}
					<ProjectCard {project} />
				{:else}
					<div class="col-span-full py-20 text-center">
						<div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
							<SlidersHorizontal size={24} class="text-slate-200" />
						</div>
						<h3 class="text-xl font-black text-slate-800 mb-2">{m.no_results_title()}</h3>
						<p class="text-slate-400 font-medium">{m.no_results_desc()}</p>
						<button onclick={resetSearch} class="mt-6 px-6 py-2 bg-bkpm-blue text-white rounded-xl font-black text-xs uppercase tracking-wide cursor-pointer hover:bg-bkpm-blue/90 transition-all">
							{m.btn_clear_filters()}
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- FIXED BOTTOM: AI summary + search bar -->
	<div class="shrink-0 px-6 md:px-10 pt-3 pb-5 bg-white/90 backdrop-blur-xl border-t border-slate-100">
		<div class="w-full space-y-3">

			<!-- AI Summary — slides in right above the bar -->
			{#if aiSummary}
				<div
					class="rounded-2xl bg-white border border-bkpm-blue/20 px-4 py-2.5 shadow-lg shadow-bkpm-blue/5 relative overflow-hidden transition-all duration-300"
					in:fly={{ y: 16, duration: 350, easing: cubicOut }}
					out:fade={{ duration: 150 }}
				>
					<div class="flex items-start gap-6">
						<!-- Mascot & Branding on Left -->
						<div class="flex flex-col items-center shrink-0">
							<button 
								type="button" 
								class="flex flex-col items-center gap-0 cursor-pointer bg-transparent border-none p-0" 
								onclick={() => isAiSummaryExpanded = !isAiSummaryExpanded}
							>
								<img src={vestiAIAsk} alt="VestiAI" class="h-10 w-10 object-contain scale-125" />
								<span class="text-[8px] font-black text-bkpm-blue tracking-tight mt-0.5">VestiAI</span>
							</button>
						</div>

						<!-- Intelligence Content on Right -->
						<div class="flex-1 min-w-0 pt-1.5">
							<button 
								onclick={() => isAiSummaryExpanded = !isAiSummaryExpanded} 
								class="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-bkpm-blue transition-colors cursor-pointer z-10"
							>
								{#if isAiSummaryExpanded}
									<ChevronDown size={14} strokeWidth={3} />
								{:else}
									<ChevronUp size={14} strokeWidth={3} />
								{/if}
							</button>

							{#if isAiSummaryExpanded}
								<div transition:slide={{ duration: 200 }}>
									<p class="text-xs font-semibold text-slate-700 leading-relaxed pr-6 break-words">
										{m.home_ai_prefix()} <span class="text-bkpm-blue font-black">"{aiSummary}"</span>{m.home_ai_suffix()}
									</p>
								</div>
							{:else}
								<p class="text-[11px] font-bold text-slate-400 truncate max-w-sm md:max-w-xl">
									"{aiSummary}"
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Search bar -->
			<div class="group relative flex items-center rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/40 transition-all border border-slate-100 focus-within:border-bkpm-blue/40 focus-within:ring-4 focus-within:ring-bkpm-blue/5">
				<button onclick={resetSearch} aria-label="Reset Search" class="ml-1 p-2 text-slate-300 hover:text-bkpm-blue hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0">
					<Home size={18} strokeWidth={2.5} />
				</button>
				<button type="button" class="ml-1 p-2 text-slate-300 hover:text-bkpm-blue hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0" title={m.home_attach_file()}><Paperclip size={18} strokeWidth={2.5} /></button><textarea
					use:autosize
					bind:value={inputValue}
					onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
					placeholder={m.home_placeholder()}
					class="flex-1 resize-none border-0 bg-transparent pl-2 pr-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 min-h-[40px] max-h-[96px] overflow-y-auto scrollbar-hide break-words"
					style="word-break: break-word; overflow-wrap: anywhere;"
					rows="1"
				></textarea>
				<button
					onclick={handleSearch}
					aria-label="Send message"
					class="mr-1 rounded-lg p-2 transition-all duration-300 shrink-0
					{inputValue ? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20' : 'bg-slate-50 text-slate-200'}"
				>
					<ArrowRight size={16} strokeWidth={3} />
				</button>
			</div>
		</div>
	</div>
{/if}
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar { display: none; }
	.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

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
			) border-box;
		border: 3px solid transparent;
		animation: spin-border 6s linear infinite;
		box-shadow: 0 20px 60px -12px rgba(0, 92, 171, 0.12);
	}

	@keyframes spin-border {
		to { --angle: 360deg; }
	}
</style>
