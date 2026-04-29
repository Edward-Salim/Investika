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
		Layers,
		Image
	} from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let project = $derived(data.project);

	// Helper for currency formatting
	const formatCurrency = (amount: string | number | null, currency: string | null) => {
		if (!amount) return 'TBD';
		const val = typeof amount === 'string' ? parseFloat(amount) : amount;
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD',
			maximumFractionDigits: 0
		}).format(val);
	};

	// Helper to encode URLs with spaces or special characters and proxy restricted ones
	const safeUrl = (url: string | null) => {
		if (!url) return null;
		
		// If it's a BKPM link, use our proxy to bypass hotlinking protection
		if (url.includes('bkpm.go.id')) {
			return `/api/proxy-image?url=${encodeURIComponent(url.replace(/ /g, '%20'))}`;
		}
		
		return url.replace(/ /g, '%20');
	};

	let imageError = $state(false);
</script>



<div class="min-h-screen bg-slate-50 font-sans pb-24" in:fade={{ duration: 300 }}>
	<!-- Immersive Hero Image Section -->
	<div class="h-[40vh] md:h-[50vh] w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
		{#if project.image_url && !imageError}
			<img 
				src={safeUrl(project.image_url)} 
				alt={project.nama} 
				class="w-full h-full object-cover opacity-60"
				onerror={() => imageError = true}
			/>
		{:else}
			<div class="flex flex-col items-center gap-3 text-white/20">
				<Image size={64} strokeWidth={1} />
				<span class="text-xs font-black uppercase tracking-[0.2em]">No Project Preview</span>
			</div>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
		
		<div class="absolute top-8 left-8">
			<a href="/" class="inline-flex items-center text-xs font-black text-white/80 hover:text-white transition-colors uppercase tracking-widest px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
				<ArrowLeft size={14} strokeWidth={3} class="mr-2" />
				{m.proj_back()}
			</a>
		</div>

		<div class="absolute bottom-0 left-0 w-full p-8 md:p-12">
			<div class="max-w-7xl mx-auto">
				<div class="flex flex-wrap items-center gap-2 mb-6">
					<!-- Sector Badge -->
					{#if project.nama_sektor_peluang}
						<div class="h-8 px-3 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
							<Zap size={14} strokeWidth={3} class="text-white" />
							<span class="text-[10px] font-black text-white uppercase tracking-widest">{project.nama_sektor_peluang}</span>
						</div>
					{/if}
					<!-- Tier Badge -->
					{#if project.nama_sektor}
						<div class="h-8 px-3 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
							<Layers size={14} strokeWidth={3} class="text-white/60" />
							<span class="text-[10px] font-black text-white/80 uppercase tracking-widest">{project.nama_sektor}</span>
						</div>
					{/if}
					<!-- Status Badge -->
					{#if project.status}
						<div class="h-8 px-3 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
							<span class="text-[10px] font-black text-white uppercase tracking-widest">{project.status}</span>
						</div>
					{/if}
				</div>
				<h1 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
					{project.nama}
				</h1>
			</div>
		</div>
	</div>

	<!-- Project Header Meta -->
	<div class="bg-white border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-10">
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
				<div class="max-w-3xl">
					<p class="text-xl font-medium text-slate-500 leading-relaxed italic border-l-4 border-bkpm-blue pl-6">
						{project.deskripsi || m.proj_dummy_desc()}
					</p>
				</div>
				
				<div class="flex items-center space-x-3 shrink-0">
					<button class="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-bkpm-blue hover:border-bkpm-blue transition-all bg-white cursor-pointer shadow-sm">
						<Share2 size={20} strokeWidth={2.5} />
					</button>
					<button class="flex items-center space-x-3 px-8 py-4 bg-bkpm-blue text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-bkpm-blue/30 hover:bg-bkpm-blue/90 hover:-translate-y-0.5 transition-all cursor-pointer">
						<Download size={18} strokeWidth={3} />
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
						<p>{project.deskripsi || m.proj_dummy_p1()}</p>
						{#if project.details?.alamat}
							<p><strong>Address:</strong> {project.details.alamat}</p>
						{/if}
					</div>
				</section>

				<!-- Innovation Pillars / Key Attributes -->
				<section>
					<h3 class="text-xl font-black text-slate-900 tracking-tight mb-5 flex items-center">
						<Zap size={20} class="mr-2 text-bkpm-blue" />
						Key Project Attributes
					</h3>
					
					<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12">
						<div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
							<!-- Scheme -->
							<div class="p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
								<div class="flex items-center gap-2 mb-0.5">
									<Globe size={12} class="text-bkpm-blue" />
									<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Business Scheme</span>
								</div>
								<span class="text-sm font-black text-slate-900">{project.details?.skema_kerja_sama || "TBD"}</span>
							</div>
							
							<!-- Land -->
							<div class="p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
								<div class="flex items-center gap-2 mb-0.5">
									<Layers size={12} class="text-logo-green" />
									<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Land Area</span>
								</div>
								<span class="text-sm font-black text-slate-900">{project.details?.luas_lahan || "TBD"}</span>
							</div>
							
							<!-- Region -->
							<div class="p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
								<div class="flex items-center gap-2 mb-0.5">
									<MapPin size={12} class="text-amber-500" />
									<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Region</span>
								</div>
								<span class="text-sm font-black text-slate-900 line-clamp-1">
									<a href="/regions?id={project.id_adm_provinsi}" class="hover:text-bkpm-blue transition-colors" title="{project.nama_kabkot || ''}, {project.nama_provinsi || ''}">
										{project.nama_kabkot || ''}{project.nama_kabkot && project.nama_provinsi ? ', ' : ''}{project.nama_provinsi || ''}
									</a>
								</span>
							</div>
							
							<!-- KBLI -->
							<div class="p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
								<div class="flex items-center gap-2 mb-0.5">
									<ShieldCheck size={12} class="text-purple-500" />
									<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">KBLI Code</span>
								</div>
								<span class="text-sm font-black text-slate-900">{project.details?.kode_kbli || "N/A"}</span>
							</div>
						</div>
					</div>
				</section>
				
				<!-- Readiness / Impact -->
				<section>
					<h3 class="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center">
						<TrendingUp size={24} class="mr-3 text-bkpm-blue" />
						Project Readiness
					</h3>
					<div class="bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
						<!-- BG Decor -->
						<div class="absolute -right-20 -top-20 w-64 h-64 bg-bkpm-blue blur-[100px] opacity-30 rounded-full"></div>
						<div class="absolute -left-20 -bottom-20 w-64 h-64 bg-logo-green blur-[100px] opacity-20 rounded-full"></div>
						
						<ul class="relative z-10 space-y-6">
							<li class="flex items-start space-x-4">
								<CheckCircle2 size={24} class="text-logo-green shrink-0 mt-0.5" strokeWidth={3} />
								<div>
									<h5 class="text-lg font-black mb-1">Current Phase</h5>
									<p class="text-slate-400 font-medium text-sm">{project.details?.readiness_status || project.project_status_enum || "Pre-Feasibility Study"}</p>
								</div>
							</li>
							<li class="flex items-start space-x-4">
								<CheckCircle2 size={24} class="text-logo-green shrink-0 mt-0.5" strokeWidth={3} />
								<div>
									<h5 class="text-lg font-black mb-1">Investment Priority</h5>
									<p class="text-slate-400 font-medium text-sm">{project.details?.is_ipro ? 'Investment Project Ready to Offer (IPRO)' : 'Strategic National Project'}</p>
								</div>
							</li>
							{#if project.details?.lokasi_kawasan}
							<li class="flex items-start space-x-4">
								<CheckCircle2 size={24} class="text-logo-green shrink-0 mt-0.5" strokeWidth={3} />
								<div>
									<h5 class="text-lg font-black mb-1">Special Economic Zone</h5>
									<p class="text-slate-400 font-medium text-sm">{project.details.lokasi_kawasan}</p>
								</div>
							</li>
							{/if}
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
						<!-- CAPEX -->
						<div>
							<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{m.fact_capex()}</div>
							<div class="text-3xl font-black text-slate-900 tracking-tight">
								{project.nilai_investasi || 'TBD'}
							</div>
						</div>

						<div class="h-[1px] w-full bg-slate-100"></div>

						<!-- NPV -->
						{#if project.nilai_npv}
						<div>
							<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Expected NPV</div>
							<div class="text-xl font-black text-slate-800">
								{project.nilai_npv}
							</div>
						</div>
						<div class="h-[1px] w-full bg-slate-100"></div>
						{/if}

						<!-- Metrics Grid -->
						<div class="grid grid-cols-2 gap-6">
							<div>
								<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{m.fact_irr()}</div>
								<div class="text-lg font-black text-logo-green">{project.nilai_irr || 'TBD'}</div>
							</div>
							<div>
								<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{m.fact_payback()}</div>
								<div class="text-lg font-black text-slate-900">{project.nilai_pp ? project.nilai_pp + ' Years' : 'TBD'}</div>
							</div>
						</div>

						<div class="h-[1px] w-full bg-slate-100"></div>

						<!-- Core Details -->
						<div class="space-y-4">
							<div class="flex items-start space-x-3">
								<MapPin size={18} class="text-slate-400 mt-0.5 shrink-0" />
								<div>
									<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</div>
									<div class="text-sm font-bold text-slate-900">
										{project.nama_kabkot || ''}{project.nama_kabkot && project.nama_provinsi ? ', ' : ''}{project.nama_provinsi || ''}
									</div>
								</div>
							</div>
							
							<div class="flex items-start space-x-3">
								<Building2 size={18} class="text-slate-400 mt-0.5 shrink-0" />
								<div>
									<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.fact_agency()}</div>
									<div class="text-sm font-bold text-slate-900 truncate max-w-[150px]" title={project.details?.contact_name || 'BKPM'}>
										{project.details?.contact_name || 'Ministry of Investment'}
									</div>
								</div>
							</div>

							<div class="flex items-start space-x-3">
								<BarChart3 size={18} class="text-slate-400 mt-0.5 shrink-0" />
								<div>
									<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.fact_status()}</div>
									<div class="text-sm font-bold text-slate-900">{project.status || project.status_proyek || 'Active'}</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Primary Action -->
					<div class="mt-8 pt-8 border-t border-slate-100">
						<button class="w-full py-4 bg-logo-green text-white rounded-2xl font-black uppercase text-xs tracking-wide shadow-lg shadow-logo-green/20 hover:bg-logo-green/90 hover:-translate-y-0.5 transition-all mb-3 cursor-pointer">
							{m.proj_btn_interest()}
						</button>
						{#if project.details?.contact_email}
							<a href="mailto:{project.details.contact_email}" class="block w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer text-center">
								{m.proj_btn_meeting()}
							</a>
						{:else}
							<button class="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer">
								{m.proj_btn_meeting()}
							</button>
						{/if}
					</div>
				</div>
			</div>

		</div>
	</div>
</div>

