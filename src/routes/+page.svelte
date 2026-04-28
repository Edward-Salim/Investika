<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Zap, ArrowRight, MapPin, DollarSign, SlidersHorizontal, X, ChevronDown, Check, Home, Bot, ChevronUp, LayoutGrid, Truck, Sprout, Cpu, Palmtree, Factory, Waves, Pickaxe, Building2, ShoppingBag, Briefcase, Construction, Stethoscope, RotateCcw } from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut, cubicInOut } from 'svelte/easing';
	import bkpmEmblem from '$lib/assets/logos/bkpm-emblem.png';
	import AuroraBackground from '$lib/components/AuroraBackground.svelte';
	import { searchStore } from '$lib/state/search.svelte.js';
	import { settingsStore } from '$lib/state/settings.svelte.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	
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
	let committedSearch = $state(''); // Only updates on submit, not on every keystroke
	
	let collapseTimeout: ReturnType<typeof setTimeout>;

	// ── ADVANCED FILTER STATE ──
	let minInvestment = $state(searchStore.minInvestment);
	let maxInvestment = $state(searchStore.maxInvestment);
	let selectedStatuses = $state<string[]>(searchStore.selectedStatuses);
	let selectedRegions = $state<string[]>(searchStore.selectedRegions);
	let selectedESG = $state<string[]>(searchStore.selectedESG);
	let minIRR = $state(searchStore.minIRR);
	let maxIRR = $state(searchStore.maxIRR);
	let riskProfile = $state<'all' | 'conservative' | 'balanced' | 'aggressive'>(searchStore.riskProfile);
	let sortBy = $state<'default' | 'investment-asc' | 'investment-desc' | 'alpha' | 'irr-desc' | 'esg-asc'>(searchStore.sortBy);

	// Reactive check: if input is cleared, clear the committed search automatically
	$effect(() => {
		if (inputValue === '') {
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
		searchStore.selectedESG = selectedESG;
		searchStore.minIRR = minIRR;
		searchStore.maxIRR = maxIRR;
		searchStore.riskProfile = riskProfile;
		searchStore.sortBy = sortBy;
		searchStore.committedSearch = committedSearch;
	}); 

	function resetSearch() {
		isSearching = false;
		inputValue = '';
		committedSearch = '';
		aiSummary = '';
		isAiSummaryExpanded = false;
		activeFilter = 'All';
		clearAdvancedFilters();
	}

	function clearAll() {
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
		{ name: 'Technology', label: m.sector_tech?.() || 'Technology', icon: Cpu, description: 'Digital infrastructure, data centers, and emerging AI ecosystems.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
		{ name: 'Tourism', label: m.sector_tour(), icon: MapPin, description: 'High-value hospitality and eco-tourism across priority destinations.', tier: 'Tersier', activeClass: 'bg-bkpm-blue text-white shadow-bkpm-blue/20', hoverClass: 'hover:border-bkpm-blue/40 hover:text-bkpm-blue' },
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
		'Tourism': MapPin,
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
	const regionOptions = ['Bali', 'East Kalimantan', 'West Java', 'Jakarta, DKI', 'Central Sulawesi', 'South Papua'];
	const esgOptions = ['AAA', 'AA', 'A', 'B'];

	const sortOptions = [
		{ value: 'default', label: 'Default' },
		{ value: 'investment-asc', label: 'Investment: Low → High' },
		{ value: 'investment-desc', label: 'Investment: High → Low' },
		{ value: 'irr-desc', label: 'Yield: High → Low' },
		{ value: 'alpha', label: 'A → Z' },
	] as const;

	function toggleESG(e: string) {
		selectedESG = selectedESG.includes(e) ? selectedESG.filter(x => x !== e) : [...selectedESG, e];
	}

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
		minIRR = 0;
		maxIRR = 30;
		selectedStatuses = [];
		selectedRegions = [];
		selectedESG = [];
		riskProfile = 'all';
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
			id: 'p1',
			title: 'Nusa Penida Wind Farm',
			category: 'Energy',
			status: 'Ready to Offer',
			location: 'Bali',
			investment: '$120M',
			irr: '14%',
			esg: 'AAA',
			image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p2',
			title: 'IKN Smart Logistics Hub',
			category: 'Logistics',
			status: 'MoU Signed',
			location: 'East Kalimantan',
			investment: '$450M',
			irr: '11.5%',
			esg: 'AA',
			image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p3',
			title: 'Java Sea Algae Farm',
			category: 'Agriculture',
			status: 'Preliminary',
			location: 'West Java',
			investment: '$45M',
			irr: '18%',
			esg: 'AAA',
			image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p4',
			title: 'Surabaya Port Expansion',
			category: 'Logistics',
			status: 'In Progress',
			location: 'East Java',
			investment: '$2.1B',
			irr: '9.8%',
			esg: 'A',
			image: surabayaPortImg
		},
		{
			id: 'p5',
			title: 'Batam Semiconductor Park',
			category: 'Technology',
			status: 'Ready to Offer',
			location: 'Riau Islands',
			investment: '$890M',
			irr: '16.5%',
			esg: 'AA',
			image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p6',
			title: 'Merauke Food Estate',
			category: 'Agriculture',
			status: 'Pre-FS',
			location: 'South Papua',
			investment: '$310M',
			irr: '12%',
			esg: 'B',
			image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p7',
			title: 'Morowali Nickel Smelter',
			category: 'Downstream',
			status: 'In Progress',
			location: 'Central Sulawesi',
			investment: '$1.4B',
			irr: '15%',
			esg: 'B',
			image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p8',
			title: 'Lombok Wellness Resort',
			category: 'Tourism',
			status: 'Ready to Offer',
			location: 'West Nusa Tenggara',
			investment: '$75M',
			irr: '13.2%',
			esg: 'AAA',
			image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p9',
			title: 'Jakarta Digital Exchange',
			category: 'Technology',
			status: 'MoU Signed',
			location: 'Jakarta, DKI',
			investment: '$210M',
			irr: '17.5%',
			esg: 'AA',
			image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400'
		},
		{
			id: 'p10',
			title: 'Flores Geothermal Plant',
			category: 'Energy',
			status: 'Preliminary',
			location: 'East Nusa Tenggara',
			investment: '$180M',
			irr: '15.5%',
			esg: 'AAA',
			image: floresGeothermalImg
		}
	];

	const hasAdvancedFilters = $derived(
		selectedStatuses.length > 0 || 
		selectedRegions.length > 0 || 
		selectedESG.length > 0 || 
		sortBy !== 'default' || 
		minInvestment > 0 || 
		maxInvestment < 3000 ||
		minIRR > 0
	);

	const activeFilterCount = $derived(
		(selectedStatuses.length > 0 ? 1 : 0) +
		(selectedRegions.length > 0 ? 1 : 0) +
		(sortBy !== 'default' ? 1 : 0) +
		(minInvestment > 0 || maxInvestment < 3000 ? 1 : 0)
	);

	const filteredProjects = $derived(
		allProjects
			.filter(p => {
				const matchesSearch = !committedSearch || 
					p.title.toLowerCase().includes(committedSearch.toLowerCase()) ||
					p.category.toLowerCase().includes(committedSearch.toLowerCase()) ||
					p.location.toLowerCase().includes(committedSearch.toLowerCase());
				
				const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
				
				const investVal = parseInvestment(p.investment);
				const matchesInvestment = investVal >= minInvestment && investVal <= maxInvestment;
				
				const irrVal = parseFloat(p.irr.replace('%', ''));
				const matchesIRR = irrVal >= minIRR && irrVal <= maxIRR;
				
				const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(p.status);
				const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(p.location);
				const matchesESG = selectedESG.length === 0 || selectedESG.includes(p.esg);
				
				return matchesSearch && matchesCategory && matchesInvestment && matchesIRR && matchesStatus && matchesRegion && matchesESG;
			})
			.sort((a, b) => {
				if (sortBy === 'investment-asc') return parseInvestment(a.investment) - parseInvestment(b.investment);
				if (sortBy === 'investment-desc') return parseInvestment(b.investment) - parseInvestment(a.investment);
				if (sortBy === 'irr-desc') return parseFloat(b.irr.replace('%', '')) - parseFloat(a.irr.replace('%', ''));
				if (sortBy === 'alpha') return a.title.localeCompare(b.title);
				return 0;
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

	function handleSearch() {
		if (!inputValue.trim()) {
			committedSearch = '';
			return;
		}

		const query = inputValue.toLowerCase();
		clearAdvancedFilters(); // Reset for a clean AI parse

		// ── COMPLEX AI PARSING (MOCK AGENT LOGIC) ──
		let detectedFilters = [];

		// Yield/IRR
		if (query.includes('yield') || query.includes('return') || query.includes('profitable') || query.includes('high irr')) {
			minIRR = 15;
			sortBy = 'irr-desc';
			detectedFilters.push('High Yield (15%+)');
		}

		// Sustainability/ESG
		if (query.includes('sustainable') || query.includes('green') || query.includes('esg') || query.includes('impact') || query.includes('clean')) {
			selectedESG = ['AAA'];
			detectedFilters.push('AAA Sustainability Rating');
		}

		// Readiness
		if (query.includes('ready') || query.includes('available') || query.includes('immediate') || query.includes('now')) {
			selectedStatuses = ['Ready to Offer'];
			detectedFilters.push('Ready to Offer Status');
		}

		// Investment Size
		if (query.includes('big') || query.includes('large') || query.includes('billion') || query.includes('major')) {
			minInvestment = 1000;
			detectedFilters.push('Billion-Dollar Projects');
		} else if (query.includes('small') || query.includes('entry') || query.includes('medium')) {
			maxInvestment = 500;
			detectedFilters.push('Mid-Cap Opportunities');
		}

		// Region Parsing
		const regions = [
			{ kw: 'bali', name: 'Bali' },
			{ kw: 'kalimantan', name: 'East Kalimantan' },
			{ kw: 'java', name: 'West Java' },
			{ kw: 'jakarta', name: 'Jakarta, DKI' },
			{ kw: 'sulawesi', name: 'Central Sulawesi' },
			{ kw: 'papua', name: 'South Papua' }
		];
		regions.forEach(r => {
			if (query.includes(r.kw)) {
				selectedRegions = [...selectedRegions, r.name];
				detectedFilters.push(r.name);
			}
		});

		// Sector Matching
		const matched = Object.entries(filterKeywords).find(([kw]) => query.includes(kw));
		if (matched) {
			const [, { filter, response }] = matched;
			activeFilter = filter;
			aiSummary = detectedFilters.length > 0 
				? `${response} I've also applied advanced filters for ${detectedFilters.join(', ')} based on your specific requirements.`
				: response;
		} else {
			activeFilter = 'All';
			aiSummary = detectedFilters.length > 0
				? `I've analyzed our project pipeline and identified several opportunities matching your criteria for ${detectedFilters.join(', ')}.`
				: `I've analyzed our strategic pipeline for "${inputValue}" and identified several key projects that align with your investment profile.`;
		}

		isSearching = true;
		committedSearch = inputValue;
		inputValue = '';
		isAiSummaryExpanded = true;
		
		if (collapseTimeout) clearTimeout(collapseTimeout);
		collapseTimeout = setTimeout(() => {
			isAiSummaryExpanded = false;
		}, 6000);
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
		<div class="mb-6 max-w-[1400px] mx-auto">
			<div class="flex items-center justify-between gap-3">
				<!-- Sector Dropdown -->
				<div class="relative flex-1">
					<button
						onclick={() => isSectorDropdownOpen = !isSectorDropdownOpen}
						class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wide border border-slate-200 bg-white shadow-sm hover:border-bkpm-blue/40 transition-all cursor-pointer group"
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
						<div class="fixed inset-0 z-10" onclick={() => isSectorDropdownOpen = false}></div>
						<div 
							class="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 max-h-[50vh] overflow-y-auto"
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

							{#each ['Primer', 'Sekunder', 'Tersier'] as tier}
								<div class="px-5 py-2 mt-2 border-t border-slate-50">
									<span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">
										{tier === 'Primer' ? m.onb_cat_primer() : tier === 'Sekunder' ? m.onb_cat_sekunder() : m.onb_cat_tersier()}
									</span>
								</div>
								{#each sectorFilters.filter(f => f.tier === tier) as f}
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

				<!-- Global Reset Button -->

	
				<div class="flex items-center gap-2 shrink-0">
					<span class="text-xs font-bold text-slate-400">{m.filter_projects_count({ count: filteredProjects.length })}</span>
					<button
						onclick={() => isFilterOpen = !isFilterOpen}
						class="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-400 font-bold text-xs hover:border-bkpm-blue/40 hover:text-bkpm-blue transition-all cursor-pointer"
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
						class="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-bkpm-blue hover:border-bkpm-blue/40 shadow-sm transition-all cursor-pointer group shrink-0"
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

					<!-- ESG Rating -->
					<div class="space-y-3">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{m.filter_esg()}</span>
						<div class="flex flex-wrap gap-2">
							{#each esgOptions as esg}
								<button 
									onclick={() => toggleESG(esg)}
									class="px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wide transition-all cursor-pointer
										{selectedESG.includes(esg) 
											? 'bg-slate-800 text-white border-slate-800' 
											: 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300'}"
								>
									{esg}
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
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 max-w-[1400px] mx-auto">
			{#each filteredProjects as project (project.id)}
				<a
					href="/project/{project.id}"
					class="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 block relative"
					in:fly={{ y: 20, duration: 400 }}
				>
					<!-- Top Right Badge (ESG) -->
					<div class="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm">
						<div class="flex items-center gap-1">
							<span class="text-[8px] font-black text-slate-400 uppercase">ESG</span>
							<span class="text-[10px] font-black text-emerald-600">{project.esg}</span>
						</div>
					</div>

					<!-- Image strip -->
					<div class="h-32 w-full overflow-hidden bg-slate-100 relative">
						<img src={project.image} alt={project.title} class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
					</div>

					<!-- Content -->
					<div class="p-4">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-1.5">
								{#if categoryIcons[project.category]}
									{@const Icon = categoryIcons[project.category]}
									<Icon size={11} class="text-bkpm-blue" strokeWidth={3} />
								{/if}
								<span class="text-[9px] font-black text-bkpm-blue uppercase tracking-widest">{project.category}</span>
							</div>
							<span class="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
								{statusOptions.find(o => o.id === project.status)?.label || project.status}
							</span>
						</div>
						<h3 class="text-sm font-black text-slate-900 mb-2 leading-tight group-hover:text-bkpm-blue transition-colors line-clamp-2">{project.title}</h3>
						
						<!-- Financial Strip -->
						<div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 mt-auto">
							<div class="space-y-0.5">
								<span class="text-[7px] font-black text-slate-300 uppercase tracking-wider">{m.card_investment()}</span>
								<div class="flex items-center gap-0.5 text-bkpm-blue font-black text-xs">
									{formatInvestment(project.investment)}
								</div>
							</div>
							<div class="space-y-0.5">
								<span class="text-[7px] font-black text-slate-300 uppercase tracking-wider">{m.card_yield()}</span>
								<div class="flex items-center gap-1 text-slate-800 font-black text-xs">
									<Zap size={12} class="text-amber-500" strokeWidth={3} />{project.irr}
								</div>
							</div>
						</div>

						<div class="flex items-center gap-1 text-[9px] font-bold text-slate-400 mt-3">
							<MapPin size={10} class="shrink-0 text-slate-300" />
							<span class="truncate">{project.location}</span>
						</div>
					</div>
				</a>
			{:else}
				<div class="col-span-full py-20 text-center">
					<div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
						<SlidersHorizontal size={24} class="text-slate-200" />
					</div>
					<h3 class="text-xl font-black text-slate-800 mb-2">No results found</h3>
					<p class="text-slate-400 font-medium">Try adjusting your filters or presets.</p>
					<button onclick={resetSearch} class="mt-6 px-6 py-2 bg-bkpm-blue text-white rounded-xl font-black text-xs uppercase tracking-wide cursor-pointer hover:bg-bkpm-blue/90 transition-all">
						Clear All Filters
					</button>
				</div>
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
						<button 
							type="button" 
							class="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 text-left" 
							onclick={() => isAiSummaryExpanded = !isAiSummaryExpanded}
						>
							<div class="h-6 w-6 rounded-md bg-bkpm-blue flex items-center justify-center shadow shadow-bkpm-blue/20">
								<Bot size={14} strokeWidth={2.5} class="text-white" />
							</div>
							<span class="text-[11px] font-black text-bkpm-blue tracking-wide">VestiAI</span>
							{#if !isAiSummaryExpanded}
								<span class="text-[10px] font-bold text-slate-400 ml-2 truncate max-w-[200px] md:max-w-md hidden sm:inline-block">"{aiSummary}"</span>
							{/if}
						</button>
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
