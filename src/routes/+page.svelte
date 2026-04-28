<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Zap, ArrowRight, MapPin, DollarSign, SlidersHorizontal, X, ChevronDown, Check, Home, Bot, ChevronUp } from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut, cubicInOut } from 'svelte/easing';
	import bkpmEmblem from '$lib/assets/logos/bkpm-emblem.png';
	import AuroraBackground from '$lib/components/AuroraBackground.svelte';
	import { searchStore } from '$lib/state/search.svelte.js';

	let inputValue = $state(searchStore.inputValue);
	let aiSummary = $state(searchStore.aiSummary);
	let isAiSummaryExpanded = $state(searchStore.isAiSummaryExpanded);
	let isSearching = $state(searchStore.isSearching);
	let activeFilter = $state(searchStore.activeFilter);
	let isFilterOpen = $state(searchStore.isFilterOpen);
	
	let collapseTimeout: ReturnType<typeof setTimeout>;

	// ── ADVANCED FILTER STATE ──
	let minInvestment = $state(searchStore.minInvestment);
	let maxInvestment = $state(searchStore.maxInvestment);
	let selectedStatuses = $state<string[]>(searchStore.selectedStatuses);
	let selectedRegions = $state<string[]>(searchStore.selectedRegions);
	let sortBy = $state<'default' | 'investment-asc' | 'investment-desc' | 'alpha'>(searchStore.sortBy);

	$effect(() => {
		searchStore.inputValue = inputValue;
		searchStore.aiSummary = aiSummary;
		searchStore.isAiSummaryExpanded = isAiSummaryExpanded;
		searchStore.isSearching = isSearching;
		searchStore.activeFilter = activeFilter;
		searchStore.isFilterOpen = isFilterOpen;
		searchStore.minInvestment = minInvestment;
		searchStore.maxInvestment = maxInvestment;
		searchStore.selectedStatuses = selectedStatuses;
		searchStore.selectedRegions = selectedRegions;
		searchStore.sortBy = sortBy;
	});

	function resetSearch() {
		isSearching = false;
		inputValue = '';
		aiSummary = '';
		isAiSummaryExpanded = false;
		activeFilter = 'All';
		clearAdvancedFilters();
	}

	const filters = ['All', 'Energy', 'Logistics', 'Agriculture', 'Technology', 'Tourism'];
	const statusOptions = ['Ready to Offer', 'MoU Signed', 'In Progress', 'Pre-FS', 'Preliminary'];
	const regionOptions = ['Bali', 'East Kalimantan', 'West Java', 'Jakarta, DKI', 'Surabaya'];

	const sortOptions = [
		{ value: 'default', label: 'Default' },
		{ value: 'investment-asc', label: 'Investment: Low → High' },
		{ value: 'investment-desc', label: 'Investment: High → Low' },
		{ value: 'alpha', label: 'A → Z' },
	] as const;

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
		maxInvestment = 3000;
		selectedStatuses = [];
		selectedRegions = [];
		sortBy = 'default';
	}

	// Parse investment string "$120M" → numeric millions
	function parseInvestment(s: string): number {
		const n = parseFloat(s.replace(/[^0-9.]/g, ''));
		if (s.includes('B')) return n * 1000;
		return n;
	}

	const allProjects = [
		{
			id: 'ai-uk',
			title: m.mock_p1_title(),
			category: m.mock_p1_cat(),
			status: m.mock_p1_stat(),
			location: m.mock_p1_loc(),
			investment: '$120M',
			image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'ai-uk',
			title: m.mock_p2_title(),
			category: m.mock_p2_cat(),
			status: m.mock_p2_stat(),
			location: m.mock_p2_loc(),
			investment: '$450M',
			image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'ai-uk',
			title: m.mock_p3_title(),
			category: m.mock_p3_cat(),
			status: m.mock_p3_stat(),
			location: m.mock_p3_loc(),
			investment: '$45M',
			image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'ai-uk',
			title: m.mock_p4_title(),
			category: m.mock_p4_cat(),
			status: m.mock_p4_stat(),
			location: m.mock_p4_loc(),
			investment: '$2.1B',
			image: 'https://images.unsplash.com/photo-1577705998148-ebbd7a31962e?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'ai-uk',
			title: m.mock_p1_title(),
			category: 'Technology',
			status: m.mock_p1_stat(),
			location: 'Jakarta, DKI',
			investment: '$89M',
			image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'ai-uk',
			title: m.mock_p4_title(),
			category: 'Agriculture',
			status: 'Pre-FS',
			location: 'East Kalimantan',
			investment: '$310M',
			image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400'
		}
	];

	const hasAdvancedFilters = $derived(
		selectedStatuses.length > 0 || selectedRegions.length > 0 || sortBy !== 'default' || minInvestment > 0 || maxInvestment < 3000
	);

	const activeFilterCount = $derived(
		(selectedStatuses.length > 0 ? 1 : 0) +
		(selectedRegions.length > 0 ? 1 : 0) +
		(sortBy !== 'default' ? 1 : 0) +
		(minInvestment > 0 || maxInvestment < 3000 ? 1 : 0)
	);

	const visibleProjects = $derived.by(() => {
		let list = activeFilter === 'All' ? allProjects : allProjects.filter(p => p.category === activeFilter);

		// Investment range filter
		list = list.filter(p => {
			const v = parseInvestment(p.investment);
			return v >= minInvestment && v <= maxInvestment;
		});

		// Status filter
		if (selectedStatuses.length > 0) {
			list = list.filter(p => selectedStatuses.includes(p.status));
		}

		// Region filter
		if (selectedRegions.length > 0) {
			list = list.filter(p => selectedRegions.some(r => p.location.includes(r)));
		}

		// Sort
		if (sortBy === 'investment-asc') list = [...list].sort((a, b) => parseInvestment(a.investment) - parseInvestment(b.investment));
		else if (sortBy === 'investment-desc') list = [...list].sort((a, b) => parseInvestment(b.investment) - parseInvestment(a.investment));
		else if (sortBy === 'alpha') list = [...list].sort((a, b) => a.title.localeCompare(b.title));

		return list;
	});

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
	};

	function handleSearch() {
		if (!inputValue.trim()) return;

		const query = inputValue.toLowerCase();
		const matched = Object.entries(filterKeywords).find(([kw]) => query.includes(kw));

		if (matched) {
			const [, { filter, response }] = matched;
			activeFilter = filter;
			aiSummary = response;
		} else {
			const randomPresets = [
				{ filter: 'Technology', response: `Based on your interest in "${inputValue}", I've highlighted emerging technology and digital infrastructure opportunities.` },
				{ filter: 'Energy', response: `For "${inputValue}", renewable energy projects offer some of the most aligned investment structures right now.` },
				{ filter: 'Logistics', response: `I analyzed "${inputValue}" and filtered our pipeline to show strategic logistics and supply chain projects.` },
				{ filter: 'Agriculture', response: `Your query regarding "${inputValue}" strongly correlates with our food security and sustainable agriculture initiatives.` },
				{ filter: 'Tourism', response: `Given your focus on "${inputValue}", I've filtered for high-value eco-tourism and hospitality developments.` }
			];
			const preset = randomPresets[Math.floor(Math.random() * randomPresets.length)];
			
			activeFilter = preset.filter;
			aiSummary = preset.response;
		}

		isSearching = true;
		inputValue = '';
		isAiSummaryExpanded = true;
		
		if (collapseTimeout) clearTimeout(collapseTimeout);
		collapseTimeout = setTimeout(() => {
			isAiSummaryExpanded = false;
		}, 4000);
	}


	function clearSummary() {
		aiSummary = '';
		isAiSummaryExpanded = false;
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

<svelte:head>
	<title>Investika | AI Investment Concierge</title>
</svelte:head>

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
					alt="BKPM Emblem"
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
					<textarea
						use:autosize
						bind:value={inputValue}
						onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
						placeholder={m.home_placeholder()}
						class="flex-1 resize-none border-0 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 min-h-[48px] max-h-[96px] overflow-y-auto scrollbar-hide break-words"
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
				AI auto-filters projects based on your query.
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
		<div class="flex items-center gap-3 mb-6 flex-wrap max-w-[1400px] mx-auto">
			<div class="flex items-center gap-2 flex-wrap flex-1">
				{#each filters as f}
					<button
						onclick={() => activeFilter = f}
						class="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap
							{activeFilter === f
								? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20'
								: 'bg-white border border-slate-200 text-slate-400 hover:border-bkpm-blue/40 hover:text-bkpm-blue'}"
					>
						{f}
					</button>
				{/each}
			</div>

			<div class="flex items-center gap-2 shrink-0">
				<span class="text-xs font-bold text-slate-400">{visibleProjects.length} projects</span>
				{#if activeFilter !== 'All'}
					<button onclick={() => activeFilter = 'All'} class="text-xs font-bold text-bkpm-blue hover:underline cursor-pointer flex items-center gap-1">
						<X size={12} />Clear
					</button>
				{/if}
				<button
					onclick={() => isFilterOpen = !isFilterOpen}
					class="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-400 font-bold text-xs hover:border-bkpm-blue/40 hover:text-bkpm-blue transition-all cursor-pointer"
				>
					<SlidersHorizontal size={13} strokeWidth={2.5} />
					<ChevronDown size={11} strokeWidth={3} class="transition-transform {isFilterOpen ? 'rotate-180' : ''}" />
					{#if activeFilterCount > 0}
						<div class="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-logo-green text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-sm">
							{activeFilterCount}
						</div>
					{/if}
				</button>
			</div>
		</div>

		{#if isFilterOpen}
			<div 
				class="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm max-w-[1400px] mx-auto"
				transition:slide={{ duration: 300, easing: cubicOut }}
			>
				<div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
					<h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Advanced Filters</h3>
					{#if hasAdvancedFilters}
						<button onclick={clearAdvancedFilters} class="text-[10px] font-bold text-slate-400 hover:text-bkpm-blue transition-colors uppercase cursor-pointer">
							Clear All
						</button>
					{/if}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<!-- Investment Range -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Investment Range (Millions USD)</span>
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
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Project Status</span>
						<div class="flex flex-wrap gap-2">
							{#each statusOptions as s}
								<button 
									onclick={() => toggleStatus(s)}
									class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer
										{selectedStatuses.includes(s) 
											? 'bg-logo-green/10 text-logo-green border-logo-green/20' 
											: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}"
								>
									{s}
								</button>
							{/each}
						</div>
					</div>

					<!-- Location -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Region</span>
						<div class="flex flex-wrap gap-2">
							{#each regionOptions as r}
								<button 
									onclick={() => toggleRegion(r)}
									class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer
										{selectedRegions.includes(r) 
											? 'bg-bkpm-blue/10 text-bkpm-blue border-bkpm-blue/20' 
											: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}"
								>
									{r}
								</button>
							{/each}
						</div>
					</div>

					<!-- Sort By -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sort By</span>
						<div class="relative">
							<select 
								bind:value={sortBy}
								class="w-full appearance-none pl-3 pr-8 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-bkpm-blue/30 focus:ring-2 focus:ring-bkpm-blue/10 transition-all cursor-pointer"
							>
								{#each sortOptions as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
							<ChevronDown size={12} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={3} />
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Project grid — more generous spacing -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 max-w-[1400px] mx-auto">
			{#each visibleProjects as project (project.title + project.category)}
				<a
					href="/project/{project.id}"
					class="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
					in:fly={{ y: 12, duration: 350 }}
				>
					<!-- Image strip -->
					<div class="h-36 w-full overflow-hidden bg-slate-100">
						<img src={project.image} alt={project.title} class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
					</div>
					<!-- Content -->
					<div class="p-4">
						<div class="flex items-center justify-between mb-2">
							<span class="text-[9px] font-black text-logo-green uppercase tracking-wide">{project.category}</span>
							<span class="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">{project.status}</span>
						</div>
						<h3 class="text-base font-black text-slate-900 mb-2 leading-tight">{project.title}</h3>
						<div class="flex items-center justify-between text-xs font-bold text-slate-400">
							<div class="flex items-center gap-1">
								<MapPin size={12} class="shrink-0" />
								<span class="truncate">{project.location}</span>
							</div>
							<div class="flex items-center gap-0.5 text-bkpm-blue font-black shrink-0">
								<DollarSign size={12} />{project.investment}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- FIXED BOTTOM: AI summary + search bar -->
	<div class="shrink-0 px-6 md:px-10 pt-3 pb-5 bg-white/90 backdrop-blur-xl border-t border-slate-100">
		<div class="w-full space-y-3">

			<!-- AI Summary — slides in right above the bar -->
			{#if aiSummary}
				<div
					class="rounded-2xl bg-white border border-bkpm-blue/20 px-5 py-4 shadow-lg shadow-bkpm-blue/5 relative overflow-hidden transition-all duration-300 {isAiSummaryExpanded ? '' : 'py-3'}"
					in:fly={{ y: 16, duration: 350, easing: cubicOut }}
					out:fade={{ duration: 150 }}
				>
					<div class="flex items-center justify-between {isAiSummaryExpanded ? 'mb-2' : ''}">
						<div class="flex items-center gap-2 cursor-pointer" onclick={() => isAiSummaryExpanded = !isAiSummaryExpanded}>
							<div class="h-6 w-6 rounded-md bg-bkpm-blue flex items-center justify-center shadow shadow-bkpm-blue/20">
								<Bot size={14} strokeWidth={2.5} class="text-white" />
							</div>
							<span class="text-[11px] font-black text-bkpm-blue uppercase tracking-wide">Vesti</span>
							{#if !isAiSummaryExpanded}
								<span class="text-[10px] font-bold text-slate-400 ml-2 truncate max-w-[200px] md:max-w-md hidden sm:inline-block">"{aiSummary}"</span>
							{/if}
						</div>
						<div class="flex items-center gap-1">
							<button onclick={() => isAiSummaryExpanded = !isAiSummaryExpanded} class="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-bkpm-blue transition-colors cursor-pointer">
								{#if isAiSummaryExpanded}
									<ChevronDown size={14} strokeWidth={3} />
								{:else}
									<ChevronUp size={14} strokeWidth={3} />
								{/if}
							</button>
						</div>
					</div>
					{#if isAiSummaryExpanded}
						<div transition:slide={{ duration: 200 }}>
							<p class="text-sm font-semibold text-slate-700 leading-relaxed pr-6 break-words overflow-hidden">
								{m.home_ai_prefix()} <span class="text-bkpm-blue font-black break-all">"{aiSummary}"</span>{m.home_ai_suffix()}
							</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Search bar -->
			<div class="group relative flex items-center rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/40 transition-all border border-slate-100 focus-within:border-bkpm-blue/40 focus-within:ring-4 focus-within:ring-bkpm-blue/5">
				<button onclick={resetSearch} aria-label="Reset Search" class="ml-1 p-2 text-slate-300 hover:text-bkpm-blue hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0">
					<Home size={18} strokeWidth={2.5} />
				</button>
				<textarea
					use:autosize
					bind:value={inputValue}
					onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
					placeholder={m.home_placeholder()}
					class="flex-1 resize-none border-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 min-h-[40px] max-h-[96px] overflow-y-auto scrollbar-hide break-words"
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
