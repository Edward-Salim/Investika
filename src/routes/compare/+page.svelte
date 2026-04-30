<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Bot, Briefcase, Zap, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, Anchor, Factory, MapPin, Building2, Construction, Sprout, Waves, Cpu, Palmtree, Stethoscope, Pickaxe, ShoppingBag, Layers, Truck } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import vestiAICompare from '$lib/assets/logos/vestiAI-compare.png';
	import { formatCurrency } from '$lib/utils/currency';
	
	let { data } = $props();

	// Read from global store, fallback to DB recommendations if empty
	let activeProjects = $derived(compareStore.projects.length > 0 ? compareStore.projects : data.projects.slice(0, 3));

	// Map real database projects or store projects to the UI structure dynamically
	let favorites = $derived(activeProjects.map((p: any, i: number) => {
		// If it's from the store, it already has the 'title' property formatted for ProjectCard
		if (p.title !== undefined) return p;

		// Otherwise, it's a raw DB row from fallback
		const parseInvest = (s: string | null) => {
			if (!s) return 0;
			const n = parseFloat(s.replace(/[^0-9,]/g, '').replace(',', '.'));
			if (s.includes('T')) return n * 1000;
			return n;
		};
		const parseIrr = (s: string | null) => s ? parseFloat(s.replace(/[^0-9.,]/g, '').replace(',', '.')) : 0;

		return {
			id: p.id_peluang?.toString() || String(i),
			title: p.nama || 'Strategic Investment Project',
			category: p.nama_sektor_peluang || p.nama_sektor || 'Infrastructure',
			status: p.status || p.status_proyek || 'Active',
			location: p.nama_provinsi || p.nama_kabkot || 'Indonesia',
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
			investmentNum: p.nilai_investasi_amount ? parseFloat(p.nilai_investasi_amount) : parseInvest(p.nilai_investasi),
			irrNum: p.nilai_irr_percent ? parseFloat(p.nilai_irr_percent) : parseIrr(p.nilai_irr),
			npvNum: p.nilai_npv_amount ? parseFloat(p.nilai_npv_amount) : parseInvest(p.nilai_npv)
		};
	}));

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

<div class="min-h-screen bg-slate-50/50 flex flex-col">

	<!-- Header Area (Minimalist) -->
	<div class="bg-white px-8 py-10 border-b border-slate-200">
		<div class="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
			<div>

				<h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">{m.comp_title()}</h1>
				<p class="text-xs text-slate-500 mt-3 max-w-xl leading-relaxed">
					{m.comp_subtitle()}
				</p>
			</div>
			
			<button class="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm group w-full md:w-auto">
				{m.comp_btn_export()}
				<ChevronRight size={14} class="group-hover:translate-x-1 transition-transform text-slate-400" />
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 w-full max-w-5xl mx-auto px-8 py-10 relative">
		
		<!-- Favorited Projects Row (Minimal Cards) -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
			{#each favorites as fav (fav.id)}
				<ProjectCard project={fav} />
			{/each}
		</div>

		<!-- AI Analysis Section (Minimal Layout) -->
		<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
			
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

			<div class="grid grid-cols-1">
				<!-- Top: AI Synthesis Text (Full Width) -->
				<div class="p-8 border-b border-slate-100 bg-slate-50/50">
					<div class="mb-6">
						<h2 class="text-base font-black text-slate-900 tracking-tight">{m.comp_ai_title()}</h2>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 items-center">
						<div class="space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
							<p>
								{m.comp_ai_summary_1({ project: favorites[0]?.title || 'Selected Project' })}
							</p>
							<p>
								{m.comp_ai_summary_2({ project: favorites[1]?.title || 'Selected Project' })}
							</p>
						</div>

						<div class="flex justify-center md:justify-end md:pr-12">
							<img src={vestiAICompare} alt="VestiAI Compare" class="h-40 w-40 object-contain scale-150" />
						</div>
					</div>
				</div>

				<!-- Bottom: Comparative Matrix (Full Width) -->
				<div class="p-8 bg-white">
					<div class="mb-8">
						<h3 class="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
							<AlertTriangle size={14} class="text-slate-400" />
							{m.comp_attr_title()}
						</h3>
					</div>
					
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
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 text-xs">
								<!-- Location -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_geography()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-medium text-slate-600 text-[12px]">{fav.location}</td>
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
													<Icon size={12} class="text-slate-400" />
												{/if}
												{fav.category}
											</div>
										</td>
									{/each}
								</tr>
								<!-- Capex -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_capex()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-900 text-[15px] tracking-tight">{formatCurrency(fav.capex)}</td>
									{/each}
								</tr>
								<!-- IRR -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_irr()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-logo-green text-[15px] tracking-tight">{fav.irr}</td>
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
								</tr>
								<!-- Governance / Strategic -->
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
								</tr>
								<!-- Agency -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_agency()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-medium text-slate-700 text-[11px] leading-tight">{fav.agency}</td>
									{/each}
								</tr>
								<!-- Doc Status -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_doc()}</td>
									{#each favorites as fav (fav.id)}
										<td class="py-5 px-6 font-black text-slate-900 text-[11px]">{fav.docStatus}</td>
									{/each}
								</tr>
								<!-- Risk Score -->
								<tr class="hover:bg-slate-50/20 transition-colors">
									<td class="py-5 pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">{m.comp_attr_risk()}</td>
									{#each favorites as fav, i (fav.id)}
										<td class="py-5 px-6">
											<div class="flex items-center gap-1.5">
												<TrendingUp size={14} class={i === 1 ? 'text-logo-green' : 'text-slate-400'} />
												<span class="text-[11px] font-black {i === 1 ? 'text-logo-green' : 'text-slate-600'} uppercase tracking-widest">
													{i === 1 ? m.comp_risk_low() : m.comp_risk_medium()}
												</span>
											</div>
										</td>
									{/each}
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

	</div>
</div>
