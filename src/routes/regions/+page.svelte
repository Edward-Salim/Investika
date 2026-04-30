<script lang="ts">
	import { Map, ChevronDown, ChevronLeft, ChevronRight, BarChart2, Briefcase, Users, DollarSign, Activity, Factory, MapPin, Search, Image, AlertCircle, Bot, Check, Newspaper, Sparkles, ExternalLink, Loader2 } from 'lucide-svelte';
	import { page } from '$app/state';
	import { fly, fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	let { data } = $props<{ data: PageData }>();

	// Initialize from URL param or default to first province
	const urlId = page.url.searchParams.get('id');
	let selectedId = $state<number>(urlId ? parseInt(urlId) : data.provinces?.[0]?.id_adm_provinsi);

	let selectedRegion = $derived(
		data.provinces?.find((p: any) => p.id_adm_provinsi == selectedId) ?? data.provinces?.[0]
	);
	let searchQuery = $state('');
	let selectedWilayah = $state<string | null>(null);
	let officePage = $state(0);
	const officePageSize = 5;

	// Reset office pagination when region changes
	$effect(() => {
		if (selectedId) officePage = 0;
	});

	let paginatedOffices = $derived({
		items: selectedRegion?.offices?.slice(officePage * officePageSize, (officePage + 1) * officePageSize) ?? [],
		total: selectedRegion?.offices?.length ?? 0,
		totalPages: Math.ceil((selectedRegion?.offices?.length ?? 0) / officePageSize),
		start: officePage * officePageSize + 1,
		end: Math.min((officePage + 1) * officePageSize, selectedRegion?.offices?.length ?? 0)
	});

	const wilayahFilters = [
		{ id: 'wilayah indonesia bagian barat', label: 'Barat' },
		{ id: 'wilayah indonesia bagian tengah', label: 'Tengah' },
		{ id: 'wilayah indonesia bagian timur', label: 'Timur' }
	];

	let filteredProvinces = $derived(
		data.provinces.filter((p: any) => {
			const matchesSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesWilayah = !selectedWilayah || p.wilayah_group === selectedWilayah;
			return matchesSearch && matchesWilayah;
		})
	);

	const safeUrl = (url: string | null) => {
		if (!url) return null;
		if (url.includes('bkpm.go.id')) {
			return `/api/proxy-image?url=${encodeURIComponent(url.replace(/ /g, '%20'))}`;
		}
		return url.replace(/ /g, '%20');
	};

	let imageError = $state(false);
	
	// Reset image error when selection changes
	$effect(() => {
		if (selectedId) imageError = false;
	});

	const formatCompact = (val: number) => {
		if (val === null || val === undefined || isNaN(val)) return 'TBD';
		if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
		if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
		if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
		return val.toString();
	};
</script>

<div class="flex-1 flex min-h-0 bg-slate-50 overflow-hidden relative">
	{#if data.error}
		<div class="absolute inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center p-8">
			<div class="max-w-2xl w-full bg-red-50 border border-red-100 rounded-[32px] p-8 shadow-2xl space-y-4">
				<div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-6">
					<AlertCircle size={24} />
				</div>
				<h2 class="text-2xl font-black text-slate-900">Database Connection Error</h2>
				<p class="text-red-600 font-bold font-mono text-sm bg-white p-4 rounded-2xl border border-red-100">
					{data.error}
				</p>
				{#if data.stack}
					<pre class="text-[10px] text-slate-400 overflow-auto max-h-40 p-4 bg-slate-900 rounded-2xl">
						{data.stack}
					</pre>
				{/if}
				<button 
					onclick={() => window.location.reload()}
					class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-bkpm-blue transition-colors"
				>
					Retry Connection
				</button>
			</div>
		</div>
	{/if}

	<!-- Sidebar: List of Regions -->
	<div class="w-[280px] border-r border-slate-200 bg-white flex flex-col shrink-0">
		<div class="p-5 border-b border-slate-100">
			<h2 class="text-lg font-black text-slate-900 tracking-tight mb-3">Regions</h2>
			
			<!-- Wilayah Filter -->
			<div class="flex gap-1 p-1 bg-slate-50 rounded-lg mb-3">
				<button 
					onclick={() => selectedWilayah = null}
					class="flex-1 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-md transition-all {selectedWilayah === null ? 'bg-white text-bkpm-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
				>
					All
				</button>
				{#each wilayahFilters as filter (filter.id)}
					<button 
						onclick={() => selectedWilayah = filter.id}
						class="flex-1 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-md transition-all {selectedWilayah === filter.id ? 'bg-white text-bkpm-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
					>
						{filter.label}
					</button>
				{/each}
			</div>

			<div class="relative">
				<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<input 
					type="text" 
					placeholder="Search daerah..." 
					bind:value={searchQuery}
					class="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-bkpm-blue/50 transition-all"
				/>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-2 space-y-1">
			{#each filteredProvinces as province (province.id_adm_provinsi)}
				<button 
					onclick={() => selectedId = province.id_adm_provinsi}
					class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group {selectedId == province.id_adm_provinsi ? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20' : 'hover:bg-slate-50 text-slate-600'}"
				>
					<span class="text-sm font-bold truncate pr-2">{province.nama}</span>
					<span class="text-[10px] font-black px-2 py-0.5 rounded-full {selectedId == province.id_adm_provinsi ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}">
						{province.count}
					</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="flex-1 overflow-y-auto relative custom-scrollbar min-w-0">
		{#if selectedRegion}
			<div class="max-w-5xl mx-auto pb-8" in:fade={{ duration: 400 }}>
				<!-- Hero Banner with Region Name -->
				<div class="relative w-full aspect-[4/1] min-h-[200px] md:min-h-[260px] max-h-[300px] bg-slate-900 overflow-hidden shadow-xl group border-b border-slate-800">
					<!-- Banner Image -->
					{#if selectedRegion.image_url && !imageError}
						<img 
							src={safeUrl(selectedRegion.image_url)} 
							alt={selectedRegion.nama} 
							class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3000ms] ease-out" 
							onerror={() => imageError = true}
						/>
					{:else}
						<div class="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Indonesia_blank_map.svg/1024px-Indonesia_blank_map.svg.png')] bg-cover bg-center opacity-10"></div>
					{/if}

					<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
					<div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>

					<!-- Logo Overlay -->
					{#if selectedRegion.logo_url}
						<div class="absolute top-6 right-6 w-14 h-14 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2.5 md:p-3 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform duration-700">
							<img 
								src={safeUrl(selectedRegion.logo_url)} 
								alt="{selectedRegion.nama} Logo" 
								class="w-full h-full object-contain drop-shadow-xl"
							/>
						</div>
					{/if}

					<!-- Header Content inside Banner -->
					<div class="absolute bottom-6 left-6 md:left-8 text-white z-10 max-w-3xl pr-8">
						<div class="flex flex-wrap items-center gap-2 mb-2">
							<span class="px-2 py-0.5 bg-white/20 backdrop-blur-md text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest rounded-full border border-white/10">
								{selectedRegion.wilayah_group?.replace('wilayah indonesia bagian ', 'indonesia ') || 'Indonesia'}
							</span>
							<div class="px-2.5 py-0.5 bg-bkpm-blue text-white rounded-full flex items-center gap-1 shadow-md border border-bkpm-blue/50">
								<Briefcase size={10} strokeWidth={3} />
								<span class="text-[8px] md:text-[9px] font-black">{selectedRegion.count} <span class="opacity-80 font-bold ml-0.5">Projects</span></span>
							</div>
						</div>
						<h1 class="text-2xl md:text-4xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-lg">{selectedRegion.nama}</h1>
						<p class="text-[10px] md:text-xs font-medium text-white/80 line-clamp-2 leading-relaxed max-w-xl drop-shadow-md">
							{selectedRegion.deskripsi ? selectedRegion.deskripsi.replace(/<[^>]*>/g, '') : `Explore high-yield investment clusters and strategic growth opportunities within ${selectedRegion.nama}.`}
						</p>
					</div>
				</div>

				<div class="px-5 md:px-8">
					<!-- Stats Grid (Overlapping Banner) -->
					<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-6 relative z-20 mb-6">
						<!-- Area -->
						<div class="bg-white/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/60 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
							<div class="w-8 h-8 rounded-xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue mb-2 group-hover:bg-bkpm-blue group-hover:text-white transition-colors">
								<Map size={14} strokeWidth={2.5} />
							</div>
							<h4 class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Land Area</h4>
							<p class="text-xs md:text-sm font-black text-slate-900 leading-none">
								{selectedRegion.luas_wilayah ? new Intl.NumberFormat('id-ID').format(Number(selectedRegion.luas_wilayah)) + ' km²' : 'TBD'}
							</p>
						</div>

						<!-- Population -->
						<div class="bg-white/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/60 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
							<div class="w-8 h-8 rounded-xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue mb-2 group-hover:bg-bkpm-blue group-hover:text-white transition-colors">
								<Users size={14} strokeWidth={2.5} />
							</div>
							<h4 class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Population (2024)</h4>
							<p class="text-xs md:text-sm font-black text-slate-900 leading-none">
								{selectedRegion.population > 0 ? formatCompact(selectedRegion.population) + ' Jiwa' : 'TBD'}
							</p>
						</div>

						<!-- UMR -->
						<div class="bg-white/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/60 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
							<div class="w-8 h-8 rounded-xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue mb-2 group-hover:bg-bkpm-blue group-hover:text-white transition-colors">
								<DollarSign size={14} strokeWidth={2.5} />
							</div>
							<h4 class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Min. Wage (2025)</h4>
							<p class="text-xs md:text-sm font-black text-slate-900 leading-none">
								{selectedRegion.umr > 0 ? 'Rp ' + formatCompact(Number(selectedRegion.umr)) : 'TBD'}
							</p>
						</div>

						<!-- PDRB -->
						<div class="bg-white/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/60 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
							<div class="w-8 h-8 rounded-xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue mb-2 group-hover:bg-bkpm-blue group-hover:text-white transition-colors">
								<BarChart2 size={14} strokeWidth={2.5} />
							</div>
							<h4 class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">GRDP / PDRB (2024)</h4>
							<p class="text-xs md:text-sm font-black text-slate-900 leading-none">
								{selectedRegion.pdrb > 0 ? 'Rp ' + formatCompact(Number(selectedRegion.pdrb)) : 'TBD'}
							</p>
						</div>
					</div>

					<!-- Single Column Stacked Layout -->
					<div class="flex flex-col gap-12 mt-4">
						
						<!-- Active Opportunities Section -->
						<div class="space-y-5">
							<div class="flex items-center justify-between border-b border-slate-100 pb-4">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-2xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue">
										<Briefcase size={20} strokeWidth={2.5} />
									</div>
									<div>
										<h3 class="text-xl font-black text-slate-900 tracking-tight">Active Opportunities</h3>
										<p class="text-xs text-slate-400 mt-0.5">High-impact investment projects in {selectedRegion.nama}</p>
									</div>
								</div>
								<a href="/search" class="text-[10px] font-bold text-bkpm-blue hover:bg-bkpm-blue/5 transition-all uppercase tracking-widest px-4 py-2 rounded-xl border border-bkpm-blue/10">Explore All</a>
							</div>
							
							{#if selectedRegion.projects.length > 0}
								<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
									{#each selectedRegion.projects as project (project.id)}
										<ProjectCard {project} hideLocation={true} />
									{/each}
								</div>
							{:else}
								<div class="py-16 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center text-center">
									<div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-200 mb-4">
										<Briefcase size={32} />
									</div>
									<h4 class="text-base font-black text-slate-600 mb-1">No active projects available yet</h4>
									<p class="text-sm text-slate-400 max-w-sm text-balance">We're currently finalizing new investment opportunities for this region. Please check back soon.</p>
								</div>
							{/if}
						</div>

						<!-- Secondary Stats Grid (Sectors & Infrastructure) -->
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<!-- Sector Dominance -->
							{#if selectedRegion.sectorInvestment.length > 0}
								<div class="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
									<div class="absolute top-0 right-0 w-80 h-80 bg-bkpm-blue/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-bkpm-blue/20 transition-colors duration-1000"></div>
									
									<div class="relative z-10">
										<div class="flex items-center gap-4 mb-8">
											<div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-bkpm-blue backdrop-blur-xl border border-white/5">
												<Activity size={20} strokeWidth={2.5} />
											</div>
											<div>
												<h3 class="text-xl font-black text-white tracking-tight">Sector Dominance</h3>
												<p class="text-xs font-medium text-slate-400 mt-1">Leading investment industries by capital realization</p>
											</div>
										</div>
										<div class="space-y-6">
											{#each selectedRegion.sectorInvestment.slice(0, 5) as sector, i (i)}
												<div class="flex flex-col gap-2.5">
													<div class="flex justify-between items-end">
														<span class="text-sm font-bold text-slate-100 flex items-center gap-4">
															<span class="text-[11px] font-black text-bkpm-blue w-5 opacity-80">0{i + 1}</span>
															{sector.sektor}
														</span>
														<span class="text-[10px] font-black text-bkpm-blue bg-bkpm-blue/10 border border-bkpm-blue/20 px-3 py-1 rounded-lg shadow-inner">
															Rp {formatCompact(Number(sector.nilai || 0))}
														</span>
													</div>
													<div class="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden shadow-inner border border-white/5">
														<div class="h-full bg-gradient-to-r from-bkpm-blue to-cyan-400 rounded-full shadow-[0_0_10px_rgba(30,58,138,0.5)]" style="width: {Math.random() * 50 + 30}%"></div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								</div>
							{/if}

							<!-- Key Infrastructure -->
							{#if selectedRegion.infrastructure.length > 0}
								<div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
									<div class="flex items-center gap-4 mb-8">
										<div class="w-12 h-12 rounded-2xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue">
											<Factory size={22} strokeWidth={2.5} />
										</div>
										<div>
											<h3 class="text-xl font-black text-slate-900 tracking-tight">Key Infrastructure</h3>
											<p class="text-xs font-medium text-slate-400 mt-1">Strategic industrial and utility assets</p>
										</div>
									</div>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
										{#each selectedRegion.infrastructure.slice(0, 8) as item, i (i)}
											<div class="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex items-center justify-between group hover:bg-white hover:border-bkpm-blue/20 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-500">
												<div class="flex items-center gap-4 min-w-0">
													<div class="w-2.5 h-2.5 rounded-full bg-bkpm-blue/20 group-hover:bg-bkpm-blue group-hover:scale-125 transition-all duration-500"></div>
													<span class="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{item.nama}</span>
												</div>
												<span class="shrink-0 px-2.5 py-1 bg-white text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-100 group-hover:text-bkpm-blue group-hover:border-bkpm-blue/20 transition-all">
													{item.kategori || 'Asset'}
												</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<!-- Regional Intelligence News Feed -->
						<section class="space-y-6">
							<div class="flex items-center gap-4 border-b border-slate-100 pb-5">
								<div class="w-10 h-10 rounded-2xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue">
									<Newspaper size={20} strokeWidth={2.5} />
								</div>
								<div>
									<h3 class="text-xl font-black text-slate-900 tracking-tight">Regional Intelligence</h3>
									<p class="text-xs text-slate-400 mt-0.5">Real-time news and AI-synthesized market sentiment for {selectedRegion.nama}</p>
								</div>
							</div>

							<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
								<!-- News Feed -->
								<div class="lg:col-span-2 space-y-4">
									{#each [
										{ date: '2h ago', title: `New Industrial Cluster Development Plan in ${selectedRegion.nama} Approved`, source: 'Antara News' },
										{ date: '5h ago', title: `Foreign Direct Investment in ${selectedRegion.nama} Reaches Record High in Q1`, source: 'Jakarta Post' },
										{ date: '1d ago', title: `Infrastructure Expansion: New Toll Road Connecting Primary Ports in ${selectedRegion.nama}`, source: 'Bisnis Indonesia' },
										{ date: '2d ago', title: `Regional Government Streamlines Licensing for Green Energy Projects`, source: 'Tempo' }
									] as news}
										<div class="p-5 bg-white rounded-3xl border border-slate-100 hover:border-bkpm-blue/20 hover:shadow-lg hover:shadow-slate-200/40 transition-all group cursor-pointer">
											<div class="flex justify-between items-start gap-4">
												<div class="space-y-2">
													<div class="flex items-center gap-2">
														<span class="text-[9px] font-black text-bkpm-blue uppercase tracking-widest">{news.source}</span>
														<span class="h-1 w-1 bg-slate-300 rounded-full"></span>
														<span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{news.date}</span>
													</div>
													<h4 class="text-sm font-semibold text-slate-900 group-hover:text-bkpm-blue transition-colors leading-snug">
														{news.title}
													</h4>
												</div>
												<ExternalLink size={14} class="text-slate-300 group-hover:text-bkpm-blue transition-colors shrink-0" />
											</div>
										</div>
									{/each}
								</div>

								<!-- VestiAI Intelligence Summary -->
								<div class="lg:col-span-1">
									<div class="bg-slate-950 rounded-[2.5rem] p-8 relative overflow-hidden h-full">
										<!-- Decoration -->
										<div class="absolute top-0 right-0 w-32 h-32 bg-bkpm-blue/20 rounded-full blur-3xl"></div>
										
										<div class="relative z-10 space-y-6">
											<div class="flex items-center gap-3">
												<div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-bkpm-blue backdrop-blur-xl border border-white/10">
													<Sparkles size={16} />
												</div>
												<h4 class="text-sm font-bold text-white uppercase tracking-widest">VestiAI Summary</h4>
											</div>

											<div class="space-y-4">
												<p class="text-sm text-slate-300 leading-relaxed italic">
													"Sentiment in {selectedRegion.nama} is shifting toward **Aggressive Infrastructure Growth**. Recent approvals for industrial clusters suggest a high degree of government alignment with FDI goals."
												</p>

												<div class="h-px w-full bg-white/10"></div>

												<div class="space-y-3">
													<h5 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Takeaways</h5>
													<ul class="space-y-3">
														<li class="flex items-start gap-3">
															<div class="h-1.5 w-1.5 rounded-full bg-bkpm-blue mt-1.5 shrink-0"></div>
															<span class="text-xs text-slate-400 leading-relaxed">License processing time reduced by ~20% for renewable sectors.</span>
														</li>
														<li class="flex items-start gap-3">
															<div class="h-1.5 w-1.5 rounded-full bg-logo-green mt-1.5 shrink-0"></div>
															<span class="text-xs text-slate-400 leading-relaxed">New port connectivity increases supply chain reliability in the region.</span>
														</li>
													</ul>
												</div>

												<button class="w-full mt-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all">
													Generate Detailed Report
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</section>

						<!-- Institutional Section (Full Width Table) -->
						<div class="space-y-6">
							<div class="flex items-center gap-4 border-b border-slate-100 pb-5">
								<div class="w-10 h-10 rounded-2xl bg-logo-green/10 flex items-center justify-center text-logo-green">
									<MapPin size={20} strokeWidth={2.5} />
								</div>
								<div>
									<h3 class="text-xl font-black text-slate-900 tracking-tight">Institutional Contacts</h3>
									<p class="text-xs text-slate-400 mt-0.5">Direct connection to regional investment authorities</p>
								</div>
							</div>
							
							{#if selectedRegion.offices.length > 0}
								<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
									<div class="overflow-x-auto custom-scrollbar">
										<table class="w-full text-left border-collapse">
											<thead>
												<tr class="border-b border-slate-100">
													<th class="py-3 px-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Office</th>
													<th class="py-3 px-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Address</th>
													<th class="py-3 px-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Contact</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-slate-50">
												{#each paginatedOffices.items as office, i (i)}
													<tr class="hover:bg-slate-50/50 transition-all group">
														<td class="py-3 px-5 align-top">
															<span class="text-xs font-semibold text-slate-900 group-hover:text-logo-green transition-colors leading-snug">{office.nama}</span>
														</td>
														<td class="py-3 px-5 align-top">
															<span class="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{office.alamat || '-'}</span>
														</td>
														<td class="py-3 px-5 align-top text-right whitespace-nowrap">
															{#if office.telepon}
																<span class="text-xs font-semibold text-slate-900">{office.telepon}</span>
															{:else}
																<span class="text-xs text-slate-300">—</span>
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>

									<!-- Pagination -->
									{#if paginatedOffices.totalPages > 1}
										<div class="flex items-center justify-between px-8 py-4 border-t border-slate-100">
											<span class="text-xs text-slate-400">
												Showing <span class="font-semibold text-slate-600">{paginatedOffices.start}–{paginatedOffices.end}</span> of <span class="font-semibold text-slate-600">{paginatedOffices.total}</span>
											</span>
											<div class="flex items-center gap-2">
												<button
													onclick={() => officePage = Math.max(0, officePage - 1)}
													disabled={officePage === 0}
													class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {officePage === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}"
												>
													<ChevronLeft size={14} />
													Prev
												</button>
												<span class="text-xs font-semibold text-slate-500 px-2">{officePage + 1} / {paginatedOffices.totalPages}</span>
												<button
													onclick={() => officePage = Math.min(paginatedOffices.totalPages - 1, officePage + 1)}
													disabled={officePage >= paginatedOffices.totalPages - 1}
													class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {officePage >= paginatedOffices.totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}"
												>
													Next
													<ChevronRight size={14} />
												</button>
											</div>
										</div>
									{/if}
								</div>
							{:else}
								<div class="py-20 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center text-center">
									<div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-200 mb-4">
										<MapPin size={32} />
									</div>
									<h4 class="text-base font-black text-slate-400">Institutional data is being verified for this region</h4>
								</div>
							{/if}
						</div>

					</div>
				</div>
			</div>
		{:else}
			<!-- Loading State -->
			<div class="flex-1 flex flex-col items-center justify-center text-center p-16">
				<div class="w-14 h-14 rounded-2xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue mb-6">
					<Loader2 size={24} class="animate-spin" />
				</div>
				<h3 class="text-lg font-semibold text-slate-900 mb-2">Loading Regional Data</h3>
				<p class="text-sm text-slate-400 max-w-sm">Fetching investment opportunities, infrastructure data, and institutional contacts…</p>
			</div>
		{/if}
	</div>
</div>

