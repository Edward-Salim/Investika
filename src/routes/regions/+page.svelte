<script lang="ts">
	import { Map, ChevronLeft, ChevronRight, BarChart2, Briefcase, Users, DollarSign, Activity, Factory, MapPin, Search, AlertCircle, Bot, ExternalLink, Loader2 } from 'lucide-svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { fly, fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	let { data } = $props<{ data: PageData }>();

	let selectedId = $state<number | undefined>(undefined);

	$effect(() => {
		const urlId = page.url.searchParams.get('id');
		selectedId = urlId ? parseInt(urlId) : data.provinces?.[0]?.id_adm_provinsi;
	});

	let selectedRegion = $derived(
		data.provinces?.find((p: any) => p.id_adm_provinsi == selectedId) ?? data.provinces?.[0]
	);
	let searchQuery = $state('');
	let selectedWilayah = $state<string | null>(null);
	let newsItems = $state<Array<{ title: string; link: string; source: string; sourceUrl: string; sourceIcon: string; date: string }>>([]);
	let isNewsLoading = $state(false);
	let projectRail = $state<HTMLDivElement | null>(null);

	const infraColumns = [
		{ key: 'nama', label: 'Asset' },
		{ key: 'kategori', label: 'Category' },
		{ key: 'jenis', label: 'Type' }
	];

	const officeColumns = [
		{ key: 'nama', label: 'Office' },
		{ key: 'alamat', label: 'Address' },
		{ key: 'telepon', label: 'Contact', align: 'right' as const }
	];

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
			.slice(0, 6)
			.map((sector: any) => ({
				name: sector.sektor,
				value: Number(sector.nilai || 0)
			}));
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
	<div class="border-r border-slate-200 bg-white flex flex-col min-w-0">
		<div class="p-5 border-b border-slate-100">
			<h2 class="text-lg font-black text-slate-900 tracking-tight mb-3">Regions</h2>
			
			<!-- Wilayah Filter -->
			<div class="flex gap-1 p-1 bg-slate-50 rounded-lg mb-3">
				<button 
					onclick={() => selectedWilayah = null}
					class="flex-1 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-md transition-all cursor-pointer {selectedWilayah === null ? 'bg-white text-bkpm-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
				>
					All
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
								<span class="text-[8px] font-black md:text-[9px]">{selectedRegion.count} <span class="ml-0.5 font-bold opacity-80">Projects</span></span>
							</div>
						</div>
						<h1 class="mb-2 text-3xl font-black leading-none tracking-tight text-white drop-shadow-lg md:text-5xl">{selectedRegion.nama}</h1>
						<p class="max-w-2xl text-[11px] font-medium leading-relaxed text-white/90 md:text-sm drop-shadow-md">
							{stripHtml(selectedRegion.deskripsi).slice(0, 220) || `Explore high-yield investment clusters and strategic growth opportunities within ${selectedRegion.nama}.`}{stripHtml(selectedRegion.deskripsi).length > 220 ? '…' : ''}
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
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">Land Area</h4>
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
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">Population (2024)</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.population > 0 ? formatCompact(selectedRegion.population) + ' Jiwa' : 'TBD'}
							</p>
						</div>

						<!-- UMR -->
						<div class="group rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm shadow-slate-200/70 transition-transform hover:-translate-y-0.5">
							<div class="mb-2 flex items-center gap-2.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bkpm-blue/10 text-bkpm-blue transition-colors group-hover:bg-bkpm-blue group-hover:text-white">
									<DollarSign size={13} strokeWidth={2.5} />
								</div>
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">Min. Wage (2025)</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.umr > 0 ? 'Rp ' + formatCompact(Number(selectedRegion.umr)) : 'TBD'}
							</p>
						</div>

						<!-- PDRB -->
						<div class="group rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm shadow-slate-200/70 transition-transform hover:-translate-y-0.5">
							<div class="mb-2 flex items-center gap-2.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bkpm-blue/10 text-bkpm-blue transition-colors group-hover:bg-bkpm-blue group-hover:text-white">
									<BarChart2 size={13} strokeWidth={2.5} />
								</div>
								<h4 class="text-[8px] font-black uppercase tracking-widest leading-none text-slate-400">GRDP / PDRB (2024)</h4>
							</div>
							<p class="text-sm font-black leading-none text-slate-900">
								{selectedRegion.pdrb > 0 ? 'Rp ' + formatCompact(Number(selectedRegion.pdrb)) : 'TBD'}
							</p>
						</div>
					</div>

					<!-- Single Column Stacked Layout -->
					<div class="mt-4 flex min-w-0 flex-col gap-12">
						
						<!-- Active Opportunities Section -->
						<div class="space-y-5">
							<div class="flex items-end justify-between gap-4 border-b border-slate-200/70 pb-4">
								<div>
									<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">Active Opportunities</h2>
									<p class="mt-1 text-xs font-medium text-slate-400">High-impact investment projects in {selectedRegion.nama}</p>
								</div>
								<a href="/search" class="text-[10px] font-bold text-bkpm-blue hover:bg-bkpm-blue/5 transition-all uppercase tracking-widest px-4 py-2 rounded-xl border border-bkpm-blue/10">Explore All</a>
							</div>
							
							{#if selectedRegion.projects.length > 0}
								<div class="space-y-4">
									<div
										bind:this={projectRail}
										class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
									>
										{#each selectedRegion.projects as project (project.id)}
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
									<h4 class="text-base font-black text-slate-600 mb-1">No active projects available yet</h4>
									<p class="text-sm text-slate-400 max-w-sm text-balance">We're currently finalizing new investment opportunities for this region. Please check back soon.</p>
								</div>
							{/if}
						</div>

						<!-- Sector & Infrastructure -->
						<div class="flex min-w-0 flex-col gap-8">
							<!-- Sector Dominance -->
							<!-- Sector Dominance -->
							{#if selectedRegion.sectorInvestment.length > 0}
								<section class="space-y-6">
									<div class="border-b border-slate-200/70 pb-4">
										<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">Sector Dominance</h2>
										<p class="mt-1 text-xs font-medium text-slate-400">Leading investment industries by capital realization</p>
									</div>

									<div class="space-y-4">
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
													<span class="shrink-0 text-[10px] font-black text-bkpm-blue bg-bkpm-blue/5 px-2 py-0.5 rounded-md">Rp {formatCompact(sector.value)}</span>
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
								</section>
							{/if}

							<!-- Key Infrastructure -->
							{#if selectedRegion.infrastructure.length > 0}
								<section class="space-y-6">
									<div class="border-b border-slate-200/70 pb-4">
										<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">Key Infrastructure</h2>
										<p class="mt-1 text-xs font-medium text-slate-400">Strategic industrial and utility assets in {selectedRegion.nama}</p>
									</div>
									<DataTable 
										data={selectedRegion.infrastructure} 
										columns={infraColumns}
										pageSize={5}
									>
										{#snippet cell(item, col)}
											{#if col.key === 'nama'}
												<span class="text-xs font-semibold text-slate-900 group-hover:text-bkpm-blue transition-colors leading-snug">{stripHtml(item.nama) || '-'}</span>
											{:else if col.key === 'kategori'}
												<span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stripHtml(item.kategori) || 'Asset'}</span>
											{:else if col.key === 'jenis'}
												<span class="text-[12px] font-medium text-slate-500">{stripHtml(item.jenis) || '-'}</span>
											{/if}
										{/snippet}
									</DataTable>
								</section>
							{/if}
						</div>

						<!-- Regional Intelligence News Feed -->
						<section class="space-y-4">
							<div class="border-b border-slate-200/70 pb-4">
								<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">Regional Intelligence</h2>
								<p class="mt-1 text-xs font-medium text-slate-400">News and AI market read for {selectedRegion.nama}</p>
							</div>

							<div class="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
								<!-- VestiAI Intelligence Summary -->
								<div class="xl:order-2">
									<div class="relative h-full overflow-hidden rounded-[1.75rem] border border-slate-900 bg-slate-950 p-5 shadow-sm">
										<!-- Decoration -->
										<div class="absolute right-0 top-0 h-24 w-24 rounded-full bg-bkpm-blue/15 blur-3xl"></div>
										
										<div class="relative z-10 space-y-4">
											<div class="flex items-center gap-2.5">
												<div class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-bkpm-blue backdrop-blur-xl">
													<Bot size={14} />
												</div>
												<h4 class="text-xs font-black tracking-[0.08em] text-white">VestiAI Summary</h4>
											</div>

											<div class="space-y-3">
												<p class="text-sm italic leading-relaxed text-slate-300">
													"Sentiment in {selectedRegion.nama} is shifting toward **Aggressive Infrastructure Growth**. Recent approvals for industrial clusters suggest a high degree of government alignment with FDI goals."
												</p>
											</div>
										</div>
									</div>
								</div>

								<!-- News Feed -->
								<div class="space-y-3 xl:order-1">
									{#if isNewsLoading}
										<div class="rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-[11px] font-medium text-slate-400">
											Loading live regional headlines...
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
											No live headlines available for {selectedRegion.nama} right now.
										</div>
									{/if}
								</div>
							</div>
						</section>

						<!-- Institutional Section (Full Width Table) -->
						<div class="space-y-6">
							<div class="border-b border-slate-200/70 pb-4">
								<h2 class="text-lg font-black tracking-tight text-slate-900 md:text-xl">Institutional Contacts</h2>
								<p class="mt-1 text-xs font-medium text-slate-400">Direct connection to regional investment authorities</p>
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
