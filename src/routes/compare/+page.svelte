<script lang="ts">
	import { Bot, Briefcase, Zap, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, Anchor, Factory, MapPin } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { compareStore } from '$lib/state/compare.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	
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
			capex: p.nilai_investasi_amount ? `Rp ${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(Number(p.nilai_investasi_amount))}` : p.nilai_investasi || 'TBD',
			irr: p.nilai_irr_percent ? `${p.nilai_irr_percent}%` : p.nilai_irr || 'TBD',
			npv: p.nilai_npv || 'TBD',
			image: p.image_url || null,
			investmentNum: p.nilai_investasi_amount ? parseFloat(p.nilai_investasi_amount) : parseInvest(p.nilai_investasi),
			irrNum: p.nilai_irr_percent ? parseFloat(p.nilai_irr_percent) : parseIrr(p.nilai_irr),
			npvNum: p.nilai_npv_amount ? parseFloat(p.nilai_npv_amount) : parseInvest(p.nilai_npv)
		};
	}));

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
				<div class="flex items-center gap-3 mb-4">
					<div class="px-2.5 py-1 bg-slate-50 rounded text-slate-500 border border-slate-200 flex items-center gap-2">
						<Bot size={12} class="text-slate-400" />
						<span class="text-[9px] font-black uppercase tracking-widest">VestiAI</span>
					</div>
					<div class="px-2.5 py-1 bg-slate-50 rounded border border-slate-200 flex items-center gap-1.5 text-slate-500">
						<Briefcase size={12} />
						<span class="text-[9px] font-bold uppercase tracking-widest">{favorites.length} Saved Projects</span>
					</div>
				</div>
				<h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Portfolio Synthesis</h1>
				<p class="text-xs text-slate-500 mt-3 max-w-xl leading-relaxed">
					AI-driven comparative analysis evaluating financial viability, regional risk profiles, and execution timelines across your short-listed opportunities.
				</p>
			</div>
			
			<button class="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm group w-full md:w-auto">
				Export Report
				<ChevronRight size={14} class="group-hover:translate-x-1 transition-transform text-slate-400" />
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 w-full max-w-5xl mx-auto px-8 py-10 relative">
		
		<!-- Favorited Projects Row (Minimal Cards) -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
			{#each favorites as fav}
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
					<h3 class="text-sm font-black text-slate-900">Synthesizing Data</h3>
					<p class="text-[10px] text-slate-500 font-bold tracking-wide mt-1 uppercase">Cross-referencing models</p>
				</div>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-12">
				<!-- Left: AI Synthesis Text -->
				<div class="lg:col-span-5 p-8 border-r border-slate-100 bg-slate-50/50">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
							<Bot size={16} strokeWidth={2.5} />
						</div>
						<h2 class="text-base font-black text-slate-900 tracking-tight">Executive Summary</h2>
					</div>
					
					<div class="space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
						<p>
							Based on multidimensional analysis of your selected portfolio, <strong class="text-slate-900">Kawasan Industri Terpadu Batang</strong> emerges as the most balanced asset for core institutional allocation, driven by immediate off-taker demand and heavy state-backed infrastructure support.
						</p>
						<p>
							<strong class="text-slate-900">Pelabuhan Patimban</strong> offers the highest certainty of execution (Low Risk) due to G2G financing structures, though IRR is capped at 11.2%.
						</p>
						<p>
							For yield enhancement, <strong class="text-slate-900">KEK Mandalika</strong> presents a high-alpha opportunity (18.4% ROI) but carries distinct operational and regional absorption risks.
						</p>
					</div>

					<div class="mt-8 pt-6 border-t border-slate-200">
						<div class="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
							<CheckCircle2 size={16} class="text-slate-400 shrink-0 mt-0.5" />
							<div>
								<h4 class="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Recommendation</h4>
								<p class="text-[11px] text-slate-600 leading-snug">Structure a blended 70/30 barbell strategy weighting Batang (Core) and Mandalika (Satellite) for optimal risk-adjusted returns.</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Right: Comparative Matrix -->
				<div class="lg:col-span-7 p-8 bg-white">
					<h3 class="text-[10px] font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
						<AlertTriangle size={14} class="text-slate-400" />
						Risk & Return Matrix
					</h3>
					
					<div class="overflow-x-auto custom-scrollbar">
						<table class="w-full text-left border-collapse min-w-[400px]">
							<thead>
								<tr class="border-b border-slate-200">
									<th class="pb-3 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
									{#each favorites as fav}
										<th class="pb-3 px-3 text-[10px] font-black text-slate-900 w-1/4 leading-snug">{fav.title}</th>
									{/each}
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 text-xs">
								<!-- Risk Profile -->
								<tr class="hover:bg-slate-50/50 transition-colors">
									<td class="py-3.5 pr-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Risk Profile</td>
									<td class="py-3.5 px-3">
										<span class="text-[10px] font-black text-slate-600">MEDIUM</span>
									</td>
									<td class="py-3.5 px-3">
										<span class="text-[10px] font-black text-slate-600">LOW</span>
									</td>
									<td class="py-3.5 px-3">
										<span class="text-[10px] font-black text-slate-600">HIGH</span>
									</td>
								</tr>
								<!-- Execution Timeline -->
								<tr class="hover:bg-slate-50/50 transition-colors">
									<td class="py-3.5 pr-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Timeline</td>
									<td class="py-3.5 px-3 font-medium text-slate-700 text-[11px]">24 Months</td>
									<td class="py-3.5 px-3 font-medium text-slate-700 text-[11px]">36 Months</td>
									<td class="py-3.5 px-3 font-medium text-slate-700 text-[11px]">18 Months</td>
								</tr>
								<!-- Govt Support -->
								<tr class="hover:bg-slate-50/50 transition-colors">
									<td class="py-3.5 pr-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">PSN Status</td>
									<td class="py-3.5 px-3">
										<CheckCircle2 size={14} class="text-slate-400" />
									</td>
									<td class="py-3.5 px-3">
										<CheckCircle2 size={14} class="text-slate-400" />
									</td>
									<td class="py-3.5 px-3">
										<CheckCircle2 size={14} class="text-slate-400" />
									</td>
								</tr>
								<!-- Primary Driver -->
								<tr class="hover:bg-slate-50/50 transition-colors">
									<td class="py-3.5 pr-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Growth Driver</td>
									<td class="py-3.5 px-3 text-[10px] font-medium text-slate-600 leading-snug">EV Supply Chain</td>
									<td class="py-3.5 px-3 text-[10px] font-medium text-slate-600 leading-snug">Export Logistics</td>
									<td class="py-3.5 px-3 text-[10px] font-medium text-slate-600 leading-snug">Tourism</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div class="mt-8 pt-6 border-t border-slate-100 flex justify-end">
						<button class="px-6 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-sm">
							Request Due Diligence
						</button>
					</div>
				</div>
			</div>
		</div>

	</div>
</div>
