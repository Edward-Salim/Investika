<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { 
		ArrowLeft, 
		MapPin, 
		TrendingUp, 
		CheckCircle2, 
		Download,
		Share2,
		ShieldCheck,
		FileText,
		BarChart3,
		Zap,
		Globe,
		Building2,
		Layers
	} from 'lucide-svelte';
	import { fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Project Details | Investika</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans pb-24" in:fade={{ duration: 300 }}>
	<!-- Hero Header -->
	<div class="bg-white border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12">
			<a href="/" class="inline-flex items-center text-xs font-bold text-slate-400 hover:text-bkpm-blue transition-colors uppercase tracking-wide mb-6">
				<ArrowLeft size={14} strokeWidth={3} class="mr-2" />
				{m.proj_back()}
			</a>
			
			<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div class="max-w-3xl">
					<div class="flex flex-wrap items-center gap-3 mb-4">
						<span class="px-3 py-1 rounded-full bg-logo-green/10 text-logo-green text-xs font-black uppercase tracking-wide border border-logo-green/20">{m.proj_tag_1()}</span>
						<span class="px-3 py-1 rounded-full bg-bkpm-blue/10 text-bkpm-blue text-xs font-black uppercase tracking-wide border border-bkpm-blue/20">{m.proj_tag_2()}</span>
						<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-wide border border-slate-200">{m.proj_tag_3()}</span>
					</div>
					<h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
						{m.proj_dummy_title()}
					</h1>
					<p class="text-lg md:text-xl font-medium text-slate-500 leading-relaxed">
						{m.proj_dummy_desc()}
					</p>
				</div>
				
				<div class="flex items-center space-x-3 shrink-0">
					<button class="p-3 rounded-xl border-2 border-slate-200 text-slate-400 hover:text-bkpm-blue hover:border-bkpm-blue transition-colors bg-white cursor-pointer">
						<Share2 size={20} strokeWidth={2.5} />
					</button>
					<button class="flex items-center space-x-2 px-6 py-3 bg-bkpm-blue text-white rounded-xl font-black uppercase text-xs tracking-wide shadow-lg shadow-bkpm-blue/20 hover:bg-bkpm-blue/90 transition-colors cursor-pointer">
						<Download size={16} strokeWidth={3} />
						<span>{m.proj_download()}</span>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-7xl mx-auto px-6 lg:px-8 mt-8 md:mt-12">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
			
			<!-- Left Column: Details -->
			<div class="lg:col-span-2 space-y-12">
				
				<!-- Executive Summary -->
				<section>
					<h3 class="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center">
						<FileText size={24} class="mr-3 text-bkpm-blue" />
						{m.proj_exec_summary()}
					</h3>
					<div class="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-4">
						<p>{m.proj_dummy_p1()}</p>
						<p>{m.proj_dummy_p2()}</p>
					</div>
				</section>

				<!-- Innovation Pillars -->
				<section>
					<h3 class="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center">
						<Zap size={24} class="mr-3 text-bkpm-blue" />
						{m.proj_innovation()}
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Card 1 -->
						<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div class="w-12 h-12 rounded-xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue mb-4">
								<Globe size={24} strokeWidth={2.5} />
							</div>
							<h4 class="text-lg font-black text-slate-900 mb-2">{m.proj_inn1_title()}</h4>
							<p class="text-sm font-medium text-slate-500">{m.proj_inn1_desc()}</p>
						</div>
						<!-- Card 2 -->
						<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div class="w-12 h-12 rounded-xl bg-logo-green/10 flex items-center justify-center text-logo-green mb-4">
								<Layers size={24} strokeWidth={2.5} />
							</div>
							<h4 class="text-lg font-black text-slate-900 mb-2">{m.proj_inn2_title()}</h4>
							<p class="text-sm font-medium text-slate-500">{m.proj_inn2_desc()}</p>
						</div>
						<!-- Card 3 -->
						<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
								<MapPin size={24} strokeWidth={2.5} />
							</div>
							<h4 class="text-lg font-black text-slate-900 mb-2">{m.proj_inn3_title()}</h4>
							<p class="text-sm font-medium text-slate-500">{m.proj_inn3_desc()}</p>
						</div>
						<!-- Card 4 -->
						<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
								<ShieldCheck size={24} strokeWidth={2.5} />
							</div>
							<h4 class="text-lg font-black text-slate-900 mb-2">{m.proj_inn4_title()}</h4>
							<p class="text-sm font-medium text-slate-500">{m.proj_inn4_desc()}</p>
						</div>
					</div>
				</section>
				
				<!-- Expected Impact -->
				<section>
					<h3 class="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center">
						<TrendingUp size={24} class="mr-3 text-bkpm-blue" />
						{m.proj_impact()}
					</h3>
					<div class="bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
						<!-- BG Decor -->
						<div class="absolute -right-20 -top-20 w-64 h-64 bg-bkpm-blue blur-[100px] opacity-30 rounded-full"></div>
						<div class="absolute -left-20 -bottom-20 w-64 h-64 bg-logo-green blur-[100px] opacity-20 rounded-full"></div>
						
						<ul class="relative z-10 space-y-6">
							<li class="flex items-start space-x-4">
								<CheckCircle2 size={24} class="text-logo-green shrink-0 mt-0.5" strokeWidth={3} />
								<div>
									<h5 class="text-lg font-black mb-1">{m.proj_imp1_title()}</h5>
									<p class="text-slate-400 font-medium text-sm">{m.proj_imp1_desc()}</p>
								</div>
							</li>
							<li class="flex items-start space-x-4">
								<CheckCircle2 size={24} class="text-logo-green shrink-0 mt-0.5" strokeWidth={3} />
								<div>
									<h5 class="text-lg font-black mb-1">{m.proj_imp2_title()}</h5>
									<p class="text-slate-400 font-medium text-sm">{m.proj_imp2_desc()}</p>
								</div>
							</li>
							<li class="flex items-start space-x-4">
								<CheckCircle2 size={24} class="text-logo-green shrink-0 mt-0.5" strokeWidth={3} />
								<div>
									<h5 class="text-lg font-black mb-1">{m.proj_imp3_title()}</h5>
									<p class="text-slate-400 font-medium text-sm">{m.proj_imp3_desc()}</p>
								</div>
							</li>
						</ul>
					</div>
				</section>

			</div>

			<!-- Right Column: Sidebar Factsheet -->
			<div class="lg:col-span-1">
				<div class="sticky top-8 bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
					<h3 class="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-6 flex items-center">
						{m.proj_factsheet()}
					</h3>

					<div class="space-y-6">
						<!-- Financials -->
						<div>
							<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{m.fact_capex()}</div>
							<div class="text-3xl font-black text-slate-900 tracking-tight">{m.proj_dummy_capex_val1()}</div>
							<div class="text-xs font-medium text-logo-green mt-1">{m.proj_dummy_capex_val2()}</div>
						</div>

						<div class="h-[1px] w-full bg-slate-100"></div>

						<!-- Metrics Grid -->
						<div class="grid grid-cols-2 gap-6">
							<div>
								<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{m.fact_irr()}</div>
								<div class="text-lg font-black text-slate-900">14.5%</div>
							</div>
							<div>
								<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{m.fact_payback()}</div>
								<div class="text-lg font-black text-slate-900">{m.proj_dummy_payback_val()}</div>
							</div>
						</div>

						<div class="h-[1px] w-full bg-slate-100"></div>

						<!-- Core Details -->
						<div class="space-y-4">
							<div class="flex items-start space-x-3">
								<MapPin size={18} class="text-slate-400 mt-0.5 shrink-0" />
								<div>
									<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</div>
									<div class="text-sm font-bold text-slate-900">{m.proj_dummy_loc()}</div>
								</div>
							</div>
							
							<div class="flex items-start space-x-3">
								<Building2 size={18} class="text-slate-400 mt-0.5 shrink-0" />
								<div>
									<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.fact_agency()}</div>
									<div class="text-sm font-bold text-slate-900">{m.proj_dummy_agency()}</div>
								</div>
							</div>

							<div class="flex items-start space-x-3">
								<BarChart3 size={18} class="text-slate-400 mt-0.5 shrink-0" />
								<div>
									<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.fact_status()}</div>
									<div class="text-sm font-bold text-slate-900">{m.doc_pre_fs()}</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Primary Action -->
					<div class="mt-8 pt-8 border-t border-slate-100">
						<button class="w-full py-4 bg-logo-green text-white rounded-2xl font-black uppercase text-xs tracking-wide shadow-lg shadow-logo-green/20 hover:bg-logo-green/90 hover:-translate-y-0.5 transition-all mb-3 cursor-pointer">
							{m.proj_btn_interest()}
						</button>
						<button class="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer">
							{m.proj_btn_meeting()}
						</button>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>
