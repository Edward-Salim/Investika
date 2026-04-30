<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Map, ChevronLeft, ChevronRight, BarChart2, Briefcase, Users, DollarSign, Activity, Factory, MapPin, Search, AlertCircle, Bot, ExternalLink, Loader2 } from 'lucide-svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import vestiAINews from '$lib/assets/logos/vestiAI-news.png';
	import DataTable from '$lib/components/DataTable.svelte';
	import RegionStaticMap from '$lib/components/RegionStaticMap.svelte';
	import InfraInteractiveMap from '$lib/components/InfraInteractiveMap.svelte';
	import { formatCurrency } from '$lib/utils/currency';

	let { data } = $props<{ data: PageData }>();

	// Helper for dynamic message lookup to avoid type lag
	function msg(key: string, fallback: string): string {
		return (m as any)[key] ? (m as any)[key]() : fallback;
	}

	let selectedId = $state<number | undefined>(undefined);

	$effect(() => {
		const urlId = page.url.searchParams.get('id');
		const newSelectedId = urlId ? parseInt(urlId) : data.provinces?.[0]?.id_adm_provinsi;
		if (newSelectedId && selectedId !== newSelectedId) {
			selectedId = newSelectedId;
		}
	});

	const selectRegion = (id: number) => {
		selectedId = id;
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('id', id.toString());
		goto(newUrl.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	};

	let selectedRegion = $derived(
		data.provinces?.find((p: any) => p.id_adm_provinsi == selectedId) ?? data.provinces?.[0]
	);
	let searchQuery = $state('');
	let selectedWilayah = $state<string | null>(null);
	let newsItems = $state<Array<{ title: string; link: string; source: string; sourceUrl: string; sourceIcon: string; date: string }>>([]);
	let isNewsLoading = $state(false);
	let projectRail = $state<HTMLDivElement | null>(null);

	const infraColumns = [
		{ key: 'nama', label: m.reg_infra_col_asset() },
		{ key: 'kategori', label: m.reg_infra_col_cat() },
		{ key: 'jenis', label: m.reg_infra_col_type() }
	];

	const officeColumns = [
		{ key: 'nama', label: m.fact_agency() },
		{ key: 'alamat', label: msg('fact_address', 'Address') },
		{ key: 'telepon', label: msg('fact_contact', 'Contact'), align: 'right' as const }
	];

	const wilayahFilters = [
		{ id: 'wilayah indonesia bagian barat', label: m.reg_filter_west() },
		{ id: 'wilayah indonesia bagian tengah', label: m.reg_filter_central() },
		{ id: 'wilayah indonesia bagian timur', label: m.reg_filter_east() }
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

	$effect(() => {
		if (!browser || !selectedRegion?.nama) return;

		let cancelled = false;
		isNewsLoading = true;

		fetch(`/api/region-news?region=${encodeURIComponent(selectedRegion.nama)}`)
			.then(async (response) => {
				if (!response.ok) throw new Error('Failed to fetch region news');
				return response.json();
			})
			.then((payload) => {
				if (!cancelled) {
					newsItems = Array.isArray(payload.items) ? payload.items : [];
				}
			})
			.catch(() => {
				if (!cancelled) {
					newsItems = [];
				}
			})
			.finally(() => {
				if (!cancelled) {
					isNewsLoading = false;
				}
			});

		return () => {
			cancelled = true;
		};
	});

	const formatCompact = (val: number) => {
		if (val === null || val === undefined || isNaN(val)) return 'TBD';
		if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
		if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
		if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
		return val.toString();
	};

	const stripHtml = (value: string | null | undefined) => value ? value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';

	let sectorDominanceChart = $derived.by(() => {
		const sectors: Array<{ name: string; value: number }> = (selectedRegion?.sectorInvestment ?? [])
			.map((sector: any) => ({
				name: sector.sektor,
				value: Number(sector.nilai || 0)
			}))
			.sort((a: any, b: any) => b.value - a.value)
			.slice(0, 6);
		const maxValue = Math.max(...sectors.map((sector) => sector.value), 1);
		return sectors.map((sector) => ({
			...sector,
			width: `${Math.max(14, (sector.value / maxValue) * 100)}%`
		}));
	});
</script>

<div class="grid min-h-0 min-w-0 flex-1 grid-cols-[260px_minmax(0,1fr)] bg-slate-50 overflow-hidden relative xl:grid-cols-[280px_minmax(0,1fr)]">
	{#if data.error}
		<div class="absolute inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center p-8">
			<div class="max-w-2xl w-full bg-red-50 border border-red-100 rounded-[32px] p-8 shadow-2xl space-y-4">
				<div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-6">
					<AlertCircle size={24} />
				</div>
				<h2 class="text-2xl font-black text-slate-900">{m.reg_db_error()}</h2>
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
					{m.reg_retry()}
				</button>
			</div>
		</div>
	{/if}

	<!-- Sidebar: List of Regions -->
	<div class="border-r border-slate-200 bg-white flex flex-col min-w-0">
		<div class="p-5 border-b border-slate-100">
			<h2 class="text-lg font-black text-slate-900 tracking-tight mb-3">{m.reg_title()}</h2>
			
			<!-- Wilayah Filter -->
			<div class="flex gap-1 p-1 bg-slate-50 rounded-lg mb-3">
				<button 
					onclick={() => selectedWilayah = null}
					class="flex-1 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-md transition-all cursor-pointer {selectedWilayah === null ? 'bg-white text-bkpm-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
				>
					{m.reg_filter_all()}
				</button>
				{#each wilayahFilters as filter (filter.id)}
					<button 
						onclick={() => selectedWilayah = filter.id}
						class="flex-1 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-md transition-all cursor-pointer {selectedWilayah === filter.id ? 'bg-white text-bkpm-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
					>
						{filter.label}
					</button>
				{/each}
			</div>

			<div class="relative">
				<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<input 
					type="text" 
					placeholder={m.reg_search_placeholder()}
					bind:value={searchQuery}
					class="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-bkpm-blue/50 transition-all"
				/>
			</div>
		</div>

		<!-- Selected Region Context Map -->
		{#if selectedRegion}
			<div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
				<div class="h-28 w-full">
					<RegionStaticMap 
						lat={selectedRegion.lat} 
						lon={selectedRegion.lon} 
						name={selectedRegion.nama} 
						zoom={7} 
					/>
				</div>
			</div>
		{/if}

		<div class="flex-1 overflow-y-auto p-2 space-y-1">
			{#each filteredProvinces as province (province.id_adm_provinsi)}
				<button 
					onclick={() => selectRegion(province.id_adm_provinsi)}
					class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer {selectedId == province.id_adm_provinsi ? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20' : 'hover:bg-slate-50 text-slate-600'}"
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
	<div class="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
		{#if selectedRegion}
			<div class="w-full min-w-0 pb-8" in:fade={{ duration: 400 }}>
				<!-- Hero Banner with Region Name -->
				<div class="relative w-full h-[260px] md:h-[320px] overflow-hidden border-b border-slate-800 bg-slate-900 shadow-xl group">
					<!-- Banner Image -->
					{#if selectedRegion.image_url && !imageError}
						<img 
							src={safeUrl(selectedRegion.image_url)} 
							alt={selectedRegion.nama} 
							class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3000ms] ease-out" 
							onerror={() => imageError = true}
						/>
					{:else}
						<div class="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Indonesia_blank_map.svg/1024px-Indonesia_blank_map.svg.png')] bg-cover bg-center opacity-10"></div>
					{/if}

					<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
					<div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>

					<!-- Logo Overlay -->
					{#if selectedRegion.logo_url}
						<div class="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/10 p-3 shadow-xl backdrop-blur-md transition-transform duration-700 md:h-24 md:w-24 md:p-4">
							<img 
								src={safeUrl(selectedRegion.logo_url)} 
								alt="{selectedRegion.nama} Logo" 
								class="h-full w-full object-contain drop-shadow-xl"
							/>
						</div>
					{/if}

					<!-- Header Content inside Banner -->
					<div class="absolute inset-x-4 bottom-4 z-10 md:inset-x-6 md:bottom-6 xl:inset-x-8">
						<div class="max-w-3xl p-5 text-white md:p-6">
						<div class="mb-3 flex flex-wrap items-center gap-2">
							<span class="rounded-full border border-white/10 bg-white/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white md:text-[9px]">
								{selectedRegion.wilayah_group?.replace('wilayah indonesia bagian ', 'indonesia ') || 'Indonesia'}
							</span>
							<div class="flex items-center gap-1 rounded-full border border-bkpm-blue/40 bg-bkpm-blue px-2.5 py-1 text-white shadow-md">
								<Briefcase size={10} strokeWidth={3} />
								<span class="text-[8px] font-black md:text-[9px]">{selectedRegion.count} <span class="ml-0.5 font-bold opacity-80">{m.reg_label_projects()}</span></span>
							</div>
						</div>
						<h1 class="mb-2 text-3xl font-black leading-none tracking-tight text-white drop-shadow-lg md:text-5xl">{selectedRegion.nama}</h1>
						<p class="max-w-2xl text-[11px] font-medium leading-relaxed text-white/90 md:text-sm drop-shadow-md">
							{stripHtml(selectedRegion.deskripsi).slice(0, 220) || m.reg_hero_desc_fallback({ region: selectedRegion.nama })}{stripHtml(selectedRegion.deskripsi).length > 220 ? '…' : ''}
						</p>
						</div>
					</div>
				</div>

				<div class="min-w-0 px-4 md:px-6 xl:px-8">
					<!-- Stats Grid (Overlapping Banner) -->
					<div class="relative z-20 mb-10 -mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:-mt-6 2xl:grid-cols-4">
						<!-- Area -->
						<div class="group rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm shadow-slate-200/70 transition-transform hover:-translate-y-0.5">
							<div class="mb-2 flex items-center gap-2.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bkpm-blue/10 text-bkpm-blue transition-colors group-hover:bg-bkpm-blue group-hover:text-white">
									<Map size={13} strokeWidth={2.5} />
								</div>
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">{m.reg_stat_area()}</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.luas_wilayah ? new Intl.NumberFormat('id-ID').format(Number(selectedRegion.luas_wilayah)) + ' km²' : 'TBD'}
							</p>
						</div>

						<!-- Population -->
						<div class="group rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm shadow-slate-200/70 transition-transform hover:-translate-y-0.5">
							<div class="mb-2 flex items-center gap-2.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bkpm-blue/10 text-bkpm-blue transition-colors group-hover:bg-bkpm-blue group-hover:text-white">
									<Users size={13} strokeWidth={2.5} />
								</div>
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">{m.reg_stat_pop()}</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.population > 0 ? formatCompact(selectedRegion.population) + ' ' + m.reg_stat_pop_unit() : 'TBD'}
							</p>
						</div>

						<!-- UMR -->
						<div class="group rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm shadow-slate-200/70 transition-transform hover:-translate-y-0.5">
							<div class="mb-2 flex items-center gap-2.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bkpm-blue/10 text-bkpm-blue transition-colors group-hover:bg-bkpm-blue group-hover:text-white">
									<DollarSign size={13} strokeWidth={2.5} />
								</div>
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">{m.reg_stat_wage()}</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.umr > 0 ? formatCurrency(selectedRegion.umr) : 'TBD'}
							</p>
						</div>

						<!-- PDRB -->
						<div class="group rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm shadow-slate-200/70 transition-transform hover:-translate-y-0.5">
							<div class="mb-2 flex items-center gap-2.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bkpm-blue/10 text-bkpm-blue transition-colors group-hover:bg-bkpm-blue group-hover:text-white">
									<BarChart2 size={13} strokeWidth={2.5} />
								</div>
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">{m.reg_stat_grdp()}</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.pdrb > 0 ? formatCurrency(selectedRegion.pdrb) : 'TBD'}
							</p>
						</div>
					</div>

					<!-- Single Column Stacked Layout -->
					<div class="mt-4 flex min-w-0 flex-col gap-12">
						
						<!-- Active Opportunities Section -->
						<div class="space-y-5">
							<div class="flex items-end justify-between gap-4 border-b border-slate-200/70 pb-4">
								<div>
									<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">{m.reg_opp_title()}</h2>
									<p class="mt-1 text-xs font-medium text-slate-400">{m.reg_opp_subtitle({ region: selectedRegion.nama })}</p>
								</div>
								<a href="/search" class="text-[10px] font-bold text-bkpm-blue hover:bg-bkpm-blue/5 transition-all uppercase tracking-widest px-4 py-2 rounded-xl border border-bkpm-blue/10">{m.reg_opp_explore()}</a>
							</div>
							
							{#if selectedRegion.projects.length > 0}
								<div class="space-y-4">
									<div
										bind:this={projectRail}
										class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
									>
										{#each [...selectedRegion.projects].sort((a, b) => Number(b.total_capex) - Number(a.total_capex)) as project (project.id)}
											<div class="w-[320px] shrink-0">
												<ProjectCard {project} hideLocation={true} />
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<div class="py-16 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center text-center">
									<div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-200 mb-4">
										<Briefcase size={32} />
									</div>
									<h4 class="text-base font-black text-slate-600 mb-1">{m.reg_opp_empty_title()}</h4>
									<p class="text-sm text-slate-400 max-w-sm text-balance">{m.reg_opp_empty_desc()}</p>
								</div>
							{/if}
						</div>

						<!-- Sector & Infrastructure -->
						<div class="flex min-w-0 flex-col gap-8">
							<!-- Sector Dominance -->
							{#if selectedRegion.sectorInvestment.length > 0}
								<section class="space-y-6">
									<div class="border-b border-slate-200/70 pb-4">
										<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">{m.reg_sector_title()}</h2>
										<p class="mt-1 text-xs font-medium text-slate-400">{m.reg_sector_subtitle()}</p>
									</div>

									<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
										<!-- Static Region Map -->
										<div class="lg:col-span-4 min-h-[240px]">
											<RegionStaticMap 
												lat={selectedRegion.lat} 
												lon={selectedRegion.lon} 
												name={selectedRegion.nama} 
												zoom={selectedRegion.nama === 'Aceh' ? 7 : 8} 
											/>
										</div>

										<!-- Sector Bars -->
										<div class="lg:col-span-8 space-y-4">
											{#each sectorDominanceChart as sector, i (`${sector.name}-${i}`)}
												<div class="group relative flex flex-col gap-2">
													<!-- Header: Rank, Name, Value -->
													<div class="flex items-center justify-between gap-3">
														<div class="flex items-center gap-2.5 min-w-0">
															<div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white shadow-sm">
																{i + 1}
															</div>
															<span class="truncate text-[10px] font-black text-slate-700 uppercase tracking-tight">{sector.name}</span>
														</div>
														<span class="shrink-0 text-[10px] font-black text-bkpm-blue bg-bkpm-blue/5 px-2 py-0.5 rounded-md">{formatCurrency(sector.value)}</span>
													</div>
													
													<!-- Progress Bar -->
													<div class="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
														<div
															class="h-full rounded-full bg-gradient-to-r from-bkpm-blue to-cyan-400 transition-all duration-1000"
															style="width: {sector.width}"
														></div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								</section>
							{/if}

							<!-- Key Infrastructure -->
							{#if selectedRegion.infrastructure.length > 0}
								<section class="space-y-6">
									<div class="border-b border-slate-200/70 pb-4">
										<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">{m.reg_infra_title()}</h2>
										<p class="mt-1 text-xs font-medium text-slate-400">{m.reg_infra_subtitle({ region: selectedRegion.nama })}</p>
									</div>
									<div class="h-[450px]">
										{#key selectedId}
											<InfraInteractiveMap 
												items={selectedRegion.infrastructure} 
												projects={selectedRegion.projects}
												centerLat={selectedRegion.lat} 
												centerLon={selectedRegion.lon} 
												regionName={selectedRegion.nama}
											/>
										{/key}
									</div>
								</section>
							{/if}
						</div>

						<!-- Regional Intelligence News Feed -->
						<section class="mt-12 space-y-4">
							<div class="border-b border-slate-200/70 pb-4">
								<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">{m.reg_intel_title()}</h2>
								<p class="mt-1 text-xs font-medium text-slate-400">{m.reg_intel_subtitle({ region: selectedRegion.nama })}</p>
							</div>

							<div class="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
								<!-- VestiAI Intelligence Summary -->
								<div class="xl:order-2">
									<div class="relative h-full overflow-hidden rounded-[1.75rem] border border-slate-900 bg-slate-950 p-5 shadow-sm">
										<!-- Decoration -->
										<div class="absolute right-0 top-0 h-24 w-24 rounded-full bg-bkpm-blue/15 blur-3xl"></div>
										
										<div class="relative z-10 space-y-4">
											<div class="flex items-start gap-5">
												<img src={vestiAINews} alt="VestiAI" class="h-24 w-24 object-contain scale-150 shrink-0" />
												<div class="space-y-2.5">
													<h4 class="text-xs font-black tracking-[0.08em] text-white">{m.reg_ai_summary()}</h4>
													<p class="text-sm italic leading-relaxed text-slate-300">
														"{m.reg_ai_text_template({ region: selectedRegion.nama })}"
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>

								<!-- News Feed -->
								<div class="space-y-3 xl:order-1">
									{#if isNewsLoading}
										<div class="rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-[11px] font-medium text-slate-400">
											{m.reg_news_loading()}
										</div>
									{:else if newsItems.length > 0}
										{#each newsItems as news}
											<a
												href={news.link}
												target="_blank"
												rel="noreferrer"
												class="group block rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-all hover:border-bkpm-blue/20 hover:shadow-sm hover:shadow-slate-200/30"
											>
												<div class="flex items-start gap-3">
													<div class="min-w-0 flex-1 space-y-1.5">
														<div class="flex items-center gap-2">
															{#if news.sourceIcon}
																<img
																	src={news.sourceIcon}
																	alt={news.source}
																	class="h-4 w-4 shrink-0 rounded-sm"
																/>
															{/if}
															<span class="truncate text-[9px] font-black uppercase tracking-widest text-bkpm-blue">{news.source}</span>
															<span class="h-1 w-1 rounded-full bg-slate-300"></span>
															<span class="text-[9px] font-bold uppercase tracking-widest text-slate-400">{news.date}</span>
														</div>
														<h4 class="line-clamp-2 text-[14px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-bkpm-blue">
															{news.title}
														</h4>
													</div>
													<ExternalLink size={12} class="mt-0.5 shrink-0 text-slate-300 transition-colors group-hover:text-bkpm-blue" />
												</div>
											</a>
										{/each}
									{:else}
										<div class="rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-[11px] font-medium text-slate-400">
											{m.reg_news_empty({ region: selectedRegion.nama })}
										</div>
									{/if}
								</div>
							</div>
						</section>

						<!-- Institutional Section (Full Width Table) -->
						<div class="space-y-6">
							<div class="border-b border-slate-200/70 pb-4">
								<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">{m.reg_inst_title()}</h2>
								<p class="mt-1 text-xs font-medium text-slate-400">{m.reg_inst_subtitle()}</p>
							</div>
							
							{#if selectedRegion.offices.length > 0}
								<DataTable 
									data={selectedRegion.offices} 
									columns={officeColumns}
									pageSize={5}
								>
									{#snippet cell(item, col)}
										{#if col.key === 'nama'}
											<span class="text-xs font-semibold text-slate-900 group-hover:text-logo-green transition-colors leading-snug">{item.nama}</span>
										{:else if col.key === 'alamat'}
											<span class="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{stripHtml(item.alamat) || '-'}</span>
										{:else if col.key === 'telepon'}
											<div class="text-right">
												{#if item.telepon}
													<div class="flex flex-col items-end gap-1">
														{#each item.telepon.split(',').slice(0, 2) as phone}
															<span class="text-xs font-semibold text-slate-900 whitespace-nowrap">{phone.trim()}</span>
														{/each}
														{#if item.telepon.split(',').length > 2}
															<span class="text-[9px] font-bold text-slate-400 uppercase">+{item.telepon.split(',').length - 2} more</span>
														{/if}
													</div>
												{:else}
													<span class="text-xs text-slate-300">—</span>
												{/if}
											</div>
										{/if}
									{/snippet}
								</DataTable>
							{:else}
								<div class="py-20 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center text-center">
									<div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-200 mb-4">
										<MapPin size={32} />
									</div>
									<h4 class="text-base font-black text-slate-400">{m.reg_inst_empty()}</h4>
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
				<h3 class="text-lg font-semibold text-slate-900 mb-2">{m.reg_loading_title()}</h3>
				<p class="text-sm text-slate-400 max-w-sm">{m.reg_loading_desc()}</p>
			</div>
		{/if}
	</div>
</div>

