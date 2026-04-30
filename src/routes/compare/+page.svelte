<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Bot, Briefcase, Zap, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, Anchor, Factory, MapPin, Building2, Construction, Sprout, Waves, Cpu, Palmtree, Stethoscope, Pickaxe, ShoppingBag, Truck, Download, Plus, ShieldCheck, Target, Activity } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import vestiAICompare from '$lib/assets/logos/vestiAI-compare.png';
	import { formatCurrency } from '$lib/utils/currency';
	
	let { data } = $props();
	const normalizeProject = (p: any, i: number) => {
		// If it's from the store, it already has the 'title' property formatted for ProjectCard
		if (p.title !== undefined) {
			return {
				...p,
				capex: p.capex ?? p.investment ?? 'TBD',
				npv: p.npv ?? 'TBD',
				payback: p.payback ?? p.nilai_pp ?? 'TBD',
				agency: p.agency ?? 'Ministry of Investment',
				docStatus: p.docStatus ?? p.status ?? 'Active',
				isPsn: Boolean(p.isPsn),
				isKek: Boolean(p.isKek),
				readiness: p.readiness ?? p.status ?? 'Active',
				scheme: p.scheme ?? 'TBD',
				landArea: p.landArea ?? 'TBD',
				kbli: p.kbli ?? 'N/A',
				riskLabel: p.riskLabel ?? (p.irrNum >= 18 ? 'Low' : p.irrNum >= 12 ? 'Balanced' : 'Watchlist'),
				province: p.location ?? 'Indonesia',
				city: p.city ?? null
			};
		}

		// Otherwise, it's a raw DB row from fallback
		const parseInvest = (s: string | null) => {
			if (!s) return 0;
			const n = parseFloat(s.replace(/[^0-9,]/g, '').replace(',', '.'));
			if (s.includes('T')) return n * 1000;
			return n;
		};
		const parseIrr = (s: string | null) => s ? parseFloat(s.replace(/[^0-9.,]/g, '').replace(',', '.')) : 0;

		const investmentNum = p.nilai_investasi_amount ? parseFloat(p.nilai_investasi_amount) : parseInvest(p.nilai_investasi);
		const irrNum = p.nilai_irr_percent ? parseFloat(p.nilai_irr_percent) : parseIrr(p.nilai_irr);
		const npvNum = p.nilai_npv_amount ? parseFloat(p.nilai_npv_amount) : parseInvest(p.nilai_npv);

		return {
			id: p.id_peluang?.toString() || String(i),
			title: p.nama || 'Strategic Investment Project',
			category: p.nama_sektor_peluang || p.nama_sektor || 'Infrastructure',
			status: p.status || p.status_proyek || 'Active',
			location: p.nama_provinsi || p.nama_kabkot || 'Indonesia',
			province: p.nama_provinsi || 'Indonesia',
			city: p.nama_kabkot || null,
			provinceId: p.id_adm_provinsi,
			investment: p.nilai_investasi || 'TBD',
			capex: p.nilai_investasi_amount || p.nilai_investasi,
			irr: p.nilai_irr_percent ? `${p.nilai_irr_percent}%` : p.nilai_irr || 'TBD',
			npv: p.nilai_npv_amount || p.nilai_npv,
			image: p.image_url || null,
			isPsn: p.nama_psn ? true : false,
			isKek: p.status_kek ? true : false,
			agency: p.nama_pengelola || 'Ministry of Investment',
			docStatus: p.status_doc || 'PPI',
			investmentNum,
			irrNum,
			npvNum,
			payback: p.nilai_pp ? `${p.nilai_pp}` : 'TBD',
			readiness: p.status || p.status_proyek || 'Active',
			scheme: p.skema_kerja_sama || 'TBD',
			landArea: p.luas_lahan || 'TBD',
			kbli: p.kode_kbli || 'N/A',
			riskLabel: irrNum >= 18 ? 'Low' : irrNum >= 12 ? 'Balanced' : 'Watchlist'
		};
	};

	let favorites = $derived(compareStore.projects.map((p: any, i: number) => normalizeProject(p, i)));

	let hasSelection = $derived(favorites.length > 0);
	let totalCapex = $derived(favorites.reduce((sum, p) => sum + (p.investmentNum || 0), 0));

	const categoryIcons: Record<string, any> = {
		'Energy': Zap,
		'Construction': Construction,
		'Infrastructure': Construction,
		'Logistics': Truck,
		'Agriculture': Sprout,
		'Fisheries': Waves,
		'Technology': Cpu,
		'Manufacturing': Factory,
		'Industri': Factory,
		'Tourism': Palmtree,
		'Healthcare': Stethoscope,
		'Mining': Pickaxe,
		'Property': Building2,
		'Retail': ShoppingBag,
		'Services': Briefcase
	};

	let isAnalyzing = $state(true);
	
	// Simulate AI "thinking" delay
	$effect(() => {
		const timer = setTimeout(() => {
			isAnalyzing = false;
		}, 2000);
		return () => clearTimeout(timer);
	});
</script>

<svelte:head>
	<title>AI Portfolio Comparison | Investika</title>
</svelte:head>

<div class="h-full bg-slate-50/50 flex flex-col">



	<!-- Main Content -->
	<div class="flex-1 w-full max-w-5xl mx-auto px-8 py-10 relative flex flex-col">
		
		{#if hasSelection}
			<!-- 1. AI Synthesis & Strategy (Summary) -->
			<div class="rounded-2xl bg-gradient-to-r from-bkpm-blue to-cyan-400 p-[2px] mb-8 shadow-sm">
				<div class="bg-white rounded-[calc(1rem-2px)] relative overflow-hidden min-h-[140px] flex flex-col justify-center">
					{#if isAnalyzing}
						<div class="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center" in:fade out:fade>
							<div class="w-12 h-12 relative flex items-center justify-center mb-4">
								<div class="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
								<div class="absolute inset-0 rounded-full border-[3px] border-slate-400 border-t-transparent animate-spin"></div>
								<Bot size={18} class="text-slate-600 animate-pulse" />
							</div>
							<h3 class="text-sm font-black text-slate-900">{m.comp_loading_title()}</h3>
						</div>
					{/if}

					<div class="p-6 relative z-10">
						<div class="mb-3">
							<h2 class="text-xs font-black tracking-widest text-slate-900">{m.comp_ai_title()}</h2>
						</div>
						
						<div class="max-w-2xl">
							<div class="space-y-3 text-xs text-slate-600 leading-relaxed font-medium">
								<p>
									{m.comp_ai_summary_1({ project: favorites[0]?.title || 'Selected Project' })}
								</p>
								<p>
									{m.comp_ai_summary_2({ project: favorites[1]?.title || 'Selected Project' })}
								</p>
							</div>

							<div class="mt-6 flex flex-wrap gap-3 relative z-20">
								<div class="flex items-center gap-2 px-3 py-1.5 bg-slate-950/5 rounded-xl border border-slate-950/5">
									<Target size={14} class="text-slate-400" />
									<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.comp_pill_capex()}</span>
									<span class="text-[10px] font-black text-slate-900">{formatCurrency(totalCapex)}</span>
								</div>
								
								<div class="flex items-center gap-2 px-3 py-1.5 bg-slate-950/5 rounded-xl border border-slate-950/5">
									<ShieldCheck size={14} class="text-slate-400" />
									<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.comp_pill_synergy()}</span>
									<span class="text-[10px] font-black text-slate-900">High G2G</span>
								</div>
								
								<div class="flex items-center gap-2 px-3 py-1.5 bg-slate-950/5 rounded-xl border border-slate-950/5">
									<Activity size={14} class="text-slate-400" />
									<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.comp_pill_irr()}</span>
									<span class="text-[10px] font-black text-slate-900">~14.5%</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Bleeding / "Coppable" Background Image -->
					<div class="absolute -right-12 -bottom-16 opacity-20 pointer-events-none transform rotate-12">
						<img src={vestiAICompare} alt="" class="h-64 w-64 object-contain" />
					</div>
				</div>
			</div>



			<!-- 2. Selected Projects (Wrapper) -->
			<div class="mb-6 flex items-center justify-between gap-4">
				<div>
					<h2 class="text-sm font-black uppercase tracking-[0.18em] text-slate-900">{m.nav_projects()}</h2>
				</div>
				<div class="flex items-center gap-3">
					<button class="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer group">
						<Download size={14} class="text-slate-400 group-hover:text-bkpm-blue transition-colors" />
						{m.comp_btn_export()}
					</button>
					<button
						type="button"
						onclick={() => compareStore.clear()}
						class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 cursor-pointer"
					>
						{m.comp_btn_clear()}
					</button>
				</div>
			</div>

			<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-12">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					{#each favorites as fav (fav.id)}
						<ProjectCard project={fav} />
					{/each}
					
					{#each Array(3 - favorites.length) as _}
						<a 
							href="/?view=catalog"
							class="border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center group hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer"
						>
							<div class="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white group-hover:border-bkpm-blue/20 transition-all">
								<Plus size={18} class="text-slate-300 group-hover:text-bkpm-blue" />
							</div>
							<span class="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-400">{m.comp_btn_browse()}</span>
						</a>
					{/each}
				</div>
			</div>


		{:else}
			<div class="flex-1 flex flex-col items-center justify-center py-12">
				<div class="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
					<div class="relative shrink-0">
						<div class="absolute -inset-10 bg-slate-100/50 rounded-full blur-3xl -z-10"></div>
						<img src={vestiAICompare} alt="VestiAI Compare" class="h-64 w-64 md:h-80 md:w-80 object-contain" />
					</div>

					<div class="flex-1">
						<h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">{m.comp_empty_title()}</h2>
						<p class="mt-4 text-sm leading-relaxed text-slate-500 max-w-xl font-medium">
							{m.comp_empty_desc()}
						</p>
						
						<div class="mt-8 flex flex-wrap gap-6 items-center">
							<a
								href="/"
								class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
							>
								{m.comp_btn_browse()}
								<ChevronRight size={14} />
							</a>
							
							<div class="flex flex-wrap gap-2">
								<span class="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">CAPEX</span>
								<span class="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">IRR</span>
								<span class="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">NPV</span>
								<span class="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Readiness</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if hasSelection}
		<!-- 3. Structural Attribute Comparison (Table) -->
		<div class="mb-4 flex items-center justify-between gap-4">
			<div>
				<h2 class="text-sm font-black uppercase tracking-[0.18em] text-slate-900">{m.comp_attr_title()}</h2>
			</div>
		</div>

		<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative mb-12">
			{#if isAnalyzing}
				<div class="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center" in:fade out:fade>
					<div class="w-12 h-12 relative flex items-center justify-center mb-4">
						<div class="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
						<div class="absolute inset-0 rounded-full border-[3px] border-slate-400 border-t-transparent animate-spin"></div>
						<Bot size={18} class="text-slate-600 animate-pulse" />
					</div>
					<h3 class="text-sm font-black text-slate-900">{m.comp_loading_title()}</h3>
					<p class="text-[10px] text-slate-500 font-bold tracking-wide mt-1 uppercase">{m.comp_loading_subtitle()}</p>
				</div>
			{/if}

			<div class="p-8">
				<div class="overflow-x-auto custom-scrollbar -mx-8 px-8">
					<table class="w-full text-left border-collapse min-w-[800px] table-fixed">
							<thead>
								<tr class="border-b border-slate-200">
									<th class="pb-5 pr-6 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[180px]">{m.comp_attr_header()}</th>
									{#each favorites as fav (fav.id)}
										<th class="pb-5 px-6 text-[12px] font-black text-slate-900 leading-tight">
											<div class="truncate" title={fav.title}>{fav.title}</div>
										</th>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<th class="pb-5 px-6 bg-slate-50/30">
											<div class="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{m.comp_empty_slot()}</div>
										</th>
									{/each}
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 text-xs">
								<!-- Location -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_geography()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-medium text-slate-600 text-[12px]">{fav.location}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Sector -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_sector()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6">
											<div class="inline-flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-wider">
												{#if categoryIcons[fav.category]}
													{@const Icon = categoryIcons[fav.category]}
													<span class="shrink-0"><Icon size={12} class="text-slate-400" /></span>
												{/if}
												{fav.category}
											</div>
										</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Capex -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_capex()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-900 text-[15px] tracking-tight">{formatCurrency(fav.capex)}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- NPV -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_npv()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-900 text-[13px] tracking-tight">{formatCurrency(fav.npv)}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- IRR -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_irr()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-logo-green text-[15px] tracking-tight">{fav.irr}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Payback -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_payback()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-700 text-[12px]">{fav.payback}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Status -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_readiness()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6">
											<div class="flex items-center gap-2">
												<div class="h-2 w-2 rounded-full bg-logo-green shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
												<span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">{fav.status}</span>
											</div>
										</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Scheme -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_scheme()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-medium text-slate-700 text-[11px] leading-tight">{fav.scheme}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Land Area -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_land()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-medium text-slate-700 text-[11px]">{fav.landArea}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- KBLI -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_kbli()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-800 text-[11px] tracking-wide">{fav.kbli}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Governance -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_strategic()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6">
											<div class="flex flex-col gap-1.5">
												{#if fav.isPsn}
													<span class="text-[9px] font-black text-bkpm-blue uppercase tracking-tighter bg-bkpm-blue/5 px-1.5 py-0.5 rounded border border-bkpm-blue/10 self-start">{m.comp_psn_tag()}</span>
												{/if}
												{#if fav.isKek}
													<span class="text-[9px] font-black text-logo-green uppercase tracking-tighter bg-logo-green/5 px-1.5 py-0.5 rounded border border-logo-green/10 self-start">{m.comp_kek_tag()}</span>
												{/if}
												{#if !fav.isPsn && !fav.isKek}
													<span class="text-[11px] text-slate-400 font-medium italic">{m.comp_standard_gov()}</span>
												{/if}
											</div>
										</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Agency -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_agency()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-medium text-slate-700 text-[11px] leading-tight">{fav.agency}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Doc Status -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_doc()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-900 text-[11px]">{fav.docStatus}</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
								<!-- Risk Score -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_risk()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6">
											<div class="flex items-center gap-1.5">
												<TrendingUp size={14} class={fav.riskLabel === 'Low' ? 'text-logo-green' : fav.riskLabel === 'Balanced' ? 'text-amber-500' : 'text-slate-400'} />
												<span class="text-[11px] font-black {fav.riskLabel === 'Low' ? 'text-logo-green' : fav.riskLabel === 'Balanced' ? 'text-amber-600' : 'text-slate-600'} uppercase tracking-widest">
													{fav.riskLabel === 'Low' ? m.comp_risk_low() : fav.riskLabel === 'Balanced' ? m.comp_risk_medium() : 'Watchlist'}
												</span>
											</div>
										</td>
									{/each}
									{#each Array(3 - favorites.length) as _}
										<td class="py-5 px-6 bg-slate-50/30 opacity-50">
											<div class="h-px w-4 bg-slate-200"></div>
										</td>
									{/each}
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

	</div>
</div>
