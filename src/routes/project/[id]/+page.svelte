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
		Image,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
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
	let isExpanded = $state(false);
	let activeGallerySlide = $state(0);
	let activeContactSlide = $state(0);
	let expandedInfographic = $state<string | null>(null);
	let currentView: 'info' | 'gallery' = $state('info');

	const isImageAsset = (url: unknown) =>
		typeof url === 'string' && /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);

	let galleryImages = $derived.by(() => {
		if (!project?.galleries) return [];
		return [
			...new Set(
				project.galleries.map((g: any) => g.image_url).filter((url: unknown) => typeof url === 'string')
			)
		] as string[];
	});

	let infographicImages = $derived.by(() => {
		let items: string[] = [];
		if (project?.infos) {
			const infoImages = project.infos
				.map((i: any) => i.url_rest || i.nama)
				.filter((url: unknown) => isImageAsset(url)) as string[];
			items = [...items, ...infoImages];
		}
		return [...new Set(items)];
	});

	let documents = $derived.by(() => {
		if (!project?.infos) return [];
		return project.infos.filter((i: any) => {
			const url = i.url_rest || i.nama;
			return !isImageAsset(url);
		});
	});

	let contacts = $derived(project?.contacts ?? []);
	let activeContact = $derived(contacts[activeContactSlide] ?? null);
	let expandedInfographicIndex = $derived(
		expandedInfographic ? infographicImages.findIndex((img) => img === expandedInfographic) : -1
	);
	let formattedLastUpdated = $derived.by(() => {
		if (!project?.fetched_at) return null;
		const date = new Date(project.fetched_at);
		if (Number.isNaN(date.getTime())) return null;
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	});

	const startAutoSlide = (length: number, update: () => void) => {
		if (length <= 1) return;
		const interval = setInterval(update, 4000);
		return () => clearInterval(interval);
	};

	onMount(() => {
		const cleanups = [
			startAutoSlide(galleryImages.length, () => {
				activeGallerySlide = (activeGallerySlide + 1) % galleryImages.length;
			})
		].filter(Boolean);

		return () => {
			for (const cleanup of cleanups) cleanup?.();
		};
	});
</script>



<div class="min-h-screen bg-slate-50 font-sans pb-24" in:fade={{ duration: 300 }}>
	<!-- Immersive Hero Image Section -->
	<div class="h-[40vh] md:h-[50vh] w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
		{#if project.image_url && !imageError}
			<img 
				src={safeUrl(project.image_url)} 
				alt={project.nama} 
				class="absolute inset-0 w-full h-full object-cover opacity-60"
				onerror={() => imageError = true}
			/>
		{:else}
			<div class="flex flex-col items-center gap-3 text-white/20">
				<Image size={64} strokeWidth={1} />
				<span class="text-xs font-black uppercase tracking-[0.2em]">No Project Preview</span>
			</div>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
		


		<div class="absolute top-8 right-8 flex items-center space-x-3">
			<!-- Share button removed from here -->
		</div>

		<div class="absolute bottom-0 left-0 w-full p-8 md:p-12">
			<div class="max-w-7xl mx-auto">
				<div class="flex flex-wrap items-center gap-3 mb-6">
					<!-- Sector Badge -->
					{#if project.nama_sektor_peluang}
						<div class="h-8 px-3 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
							<Zap size={14} strokeWidth={3} class="text-white" />
							<span class="text-[10px] font-black text-white uppercase tracking-widest">{project.nama_sektor_peluang}</span>
						</div>
					{/if}
					
					<!-- Share Button (Moved here) -->
					<button class="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
						<Share2 size={14} strokeWidth={2.5} />
					</button>
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
			<div class="max-w-none">
				<p class="text-sm font-medium text-slate-500 leading-relaxed italic border-l-4 border-bkpm-blue pl-6 {isExpanded ? '' : 'line-clamp-2'}">
					{project.deskripsi || m.proj_dummy_desc()}
				</p>
				<button 
					onclick={() => isExpanded = !isExpanded}
					class="mt-2 ml-6 text-[10px] font-black uppercase tracking-widest text-bkpm-blue hover:text-bkpm-blue/80 transition-colors cursor-pointer"
				>
					{isExpanded ? 'Show Less' : 'Read More'}
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-7xl mx-auto px-6 lg:px-8 mt-8 md:mt-12">
		
		<!-- Innovation Pillars / Key Attributes -->
		<section class="mb-12">
			<h3 class="text-xl font-black text-slate-900 tracking-tight mb-5 flex items-center">
				<Zap size={20} class="mr-2 text-bkpm-blue" />
				Key Project Attributes
			</h3>
			
			<div class="bg-slate-100 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
				<div class="grid grid-cols-2 md:grid-cols-3 gap-px">
					<!-- Scheme -->
					<div class="bg-white p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Business Scheme</span>
						</div>
						<span class="text-sm font-black text-slate-900">{project.details?.skema_kerja_sama || "TBD"}</span>
					</div>
					
					<!-- Land -->
					<div class="bg-white p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Land Area</span>
						</div>
						<span class="text-sm font-black text-slate-900">{project.details?.luas_lahan || "TBD"}</span>
					</div>
					
					<!-- Region -->
					<div class="bg-white p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Region</span>
						</div>
						<span class="text-sm font-black text-slate-900">
							<a href="/regions?id={project.id_adm_provinsi}" class="hover:text-bkpm-blue transition-colors" title="{project.nama_kabkot || ''}, {project.nama_provinsi || ''}">
								{project.nama_kabkot || ''}{project.nama_kabkot && project.nama_provinsi ? ', ' : ''}{project.nama_provinsi || ''}
							</a>
						</span>
					</div>
					
					<!-- KBLI -->
					<div class="bg-white p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">KBLI Code</span>
						</div>
						<span class="text-sm font-black text-slate-900">{project.details?.kode_kbli || "N/A"}</span>
					</div>

					<!-- Government Agency -->
					<div class="bg-white p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">{m.fact_agency()}</span>
						</div>
						<span class="text-sm font-black text-slate-900 line-clamp-1" title={project.details?.contact_name || 'Ministry of Investment'}>
							{project.details?.contact_name || 'Ministry of Investment'}
						</span>
					</div>

					<!-- Document Status -->
					<div class="bg-white p-6 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">{m.fact_status()}</span>
						</div>
						<span class="text-sm font-black text-slate-900">{project.status || project.status_proyek || 'Active'}</span>
					</div>
				</div>
			</div>
		</section>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
			

			<!-- Left Column: Details -->
			<div class="lg:col-span-2 space-y-12 transition-all duration-500">
				
				{#if currentView === 'info'}
				<div in:fade={{ duration: 300, delay: 150 }} class="space-y-12">
					<!-- Readiness / Impact -->
					<section>
						<h3 class="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center">
							<TrendingUp size={24} class="mr-3 text-bkpm-blue" />
							Project Readiness
						</h3>
						
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<!-- Current Phase Card -->
							<div class="relative bg-white rounded-2xl p-6 text-slate-900 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between">
								<div class="absolute -right-8 -top-8 w-24 h-24 bg-bkpm-blue/5 blur-2xl rounded-full"></div>
								<div class="relative z-10 flex items-center justify-between mb-4">
									<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Phase</span>
									<div class="h-2 w-2 rounded-full bg-logo-green animate-pulse"></div>
								</div>
								<div class="relative z-10 space-y-2 mt-auto">
									<h4 class="text-base font-black tracking-tight text-slate-900">{project.details?.readiness_status || "DIMINATI"}</h4>
									<div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
										<div class="h-full bg-bkpm-blue w-2/3 rounded-full"></div>
									</div>
									<p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
										Late-stage preparation phase
									</p>
								</div>
							</div>

							<!-- Investment Priority Card -->
							<div class="relative bg-white rounded-2xl p-6 text-slate-900 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between">
								<div class="absolute -right-8 -top-8 w-24 h-24 bg-logo-green/5 blur-2xl rounded-full"></div>
								<div class="relative z-10 mb-4">
									<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Investment Priority</span>
								</div>
								<div class="relative z-10 mt-auto">
									<div class="inline-flex items-center px-2 py-1 mb-2 rounded-md bg-logo-green/10 border border-logo-green/20">
										<CheckCircle2 size={10} class="text-logo-green mr-1.5" />
										<span class="text-[9px] font-black text-logo-green uppercase tracking-widest">Priority High</span>
									</div>
									<h4 class="text-[15px] font-black leading-tight text-slate-800">
										{project.details?.is_ipro ? 'Investment Project Ready to Offer (IPRO)' : 'Strategic National Project'}
									</h4>
								</div>
							</div>

							<!-- SEZ Card -->
							<div class="relative bg-white rounded-2xl p-6 text-slate-900 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between">
								<div class="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full"></div>
								<div class="relative z-10 mb-4">
									<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Economic Zone Status</span>
								</div>
								<div class="relative z-10 mt-auto space-y-2">
									<h4 class="text-[13px] font-black text-slate-800 leading-snug line-clamp-3">
										{project.details?.lokasi_kawasan || "Destinasi Pariwisata Prioritas Raja Ampat"}
									</h4>
									<div class="flex items-center gap-2">
										<div class="flex -space-x-1">
											<div class="w-5 h-5 rounded-full bg-bkpm-blue border border-white flex items-center justify-center">
												<Globe size={10} class="text-white" />
											</div>
											<div class="w-5 h-5 rounded-full bg-logo-green border border-white"></div>
										</div>
										<p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Verified Special Zone</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					<!-- Investment Incentives -->
					{#if project.incentives && project.incentives.length > 0}
					<section>
						<h3 class="text-xl font-black text-slate-900 tracking-tight mb-5 flex items-center">
							<ShieldCheck size={20} class="mr-2 text-bkpm-blue" />
							Investment Incentives
						</h3>
						<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
							{#each project.incentives as incentive}
								<div class="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
									<h4 class="text-sm font-black text-slate-900 mb-2">{incentive.nama}</h4>
									{#if incentive.keterangan}
										<p class="text-sm text-slate-500 leading-relaxed">{incentive.keterangan}</p>
									{/if}
								</div>
							{/each}
						</div>
					</section>
					{/if}

					<!-- Additional Information (Documents) -->
					{#if documents && documents.length > 0}
					<section>
						<h3 class="text-xl font-black text-slate-900 tracking-tight mb-5 flex items-center">
							<FileText size={20} class="mr-2 text-bkpm-blue" />
							Additional Information
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each documents as info}
								<div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
									<h4 class="text-sm font-black text-slate-900 mb-3 break-all line-clamp-2" title={info.nama}>
										{info.nama && info.nama.startsWith('http') ? 'Project Document' : info.nama}
									</h4>
									{#if info.url_rest || (info.nama && info.nama.startsWith('http'))}
										<a href={info.url_rest || info.nama} target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-xs font-bold text-bkpm-blue hover:text-bkpm-blue/80 uppercase tracking-widest transition-colors">
											<Download size={14} class="mr-1.5" strokeWidth={3} />
											View Document
										</a>
									{/if}
								</div>
							{/each}
						</div>
					</section>
					{/if}
				</div>
				{/if}

				{#if currentView === 'gallery'}
				<div in:fade={{ duration: 300, delay: 150 }} class="space-y-12">
					{#if galleryImages.length > 0}
					<section>
						<h3 class="text-xl font-black text-slate-900 tracking-tight mb-5 flex items-center">
							<Image size={20} class="mr-2 text-bkpm-blue" />
							Project Galleries
						</h3>
						
						<div class="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video md:aspect-[21/9] group shadow-sm border border-slate-200">
							{#each galleryImages as imgUrl, i}
								<div class="absolute inset-0 transition-opacity duration-1000 ease-in-out {i === activeGallerySlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
									<img 
										src={safeUrl(imgUrl)} 
										alt="Project Gallery {i + 1}" 
										class="w-full h-full object-cover"
									/>
								</div>
							{/each}
							
							{#if galleryImages.length > 1}
							<button 
								class="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/10 opacity-0 group-hover:opacity-100"
								onclick={() => activeGallerySlide = (activeGallerySlide - 1 + galleryImages.length) % galleryImages.length}
								aria-label="Previous gallery slide"
							>
								<ChevronLeft size={20} strokeWidth={2.5} />
							</button>

							<button 
								class="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/10 opacity-0 group-hover:opacity-100"
								onclick={() => activeGallerySlide = (activeGallerySlide + 1) % galleryImages.length}
								aria-label="Next gallery slide"
							>
								<ChevronRight size={20} strokeWidth={2.5} />
							</button>

							<div class="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
								{#each galleryImages as _, i}
									<button 
										class="h-2 rounded-full transition-all duration-300 cursor-pointer {i === activeGallerySlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}"
										onclick={() => activeGallerySlide = i}
										aria-label="Go to gallery slide {i + 1}"
									></button>
								{/each}
							</div>
							{/if}
						</div>
					</section>
					{/if}

					{#if infographicImages.length > 0}
					<section>
						<h3 class="text-xl font-black text-slate-900 tracking-tight mb-5 flex items-center">
							<Image size={20} class="mr-2 text-bkpm-blue" />
							Project Infographics
						</h3>
						
						<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
							{#each infographicImages as imgUrl, i}
								<button
									type="button"
									onclick={() => expandedInfographic = imgUrl}
									class="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/40 cursor-zoom-in"
								>
									<div class="bg-slate-100 p-3">
										<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
											<img 
												src={safeUrl(imgUrl)} 
												alt="Project Infographic {i + 1}" 
												class="h-[26rem] w-full object-contain"
											/>
										</div>
									</div>
									<div class="flex items-center justify-between border-t border-slate-100 px-4 py-3">
										<div class="text-[10px] font-black uppercase tracking-widest text-slate-400">Infographic {i + 1}</div>
									</div>
								</button>
							{/each}
						</div>
					</section>
					{/if}

					{#if galleryImages.length === 0 && infographicImages.length === 0}
					<div class="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
						<Image size={48} strokeWidth={1} class="mx-auto text-slate-300 mb-4" />
						<p class="text-slate-500 font-medium">No media available for this project.</p>
					</div>
					{/if}
				</div>
				{/if}

			</div>


			<!-- Right Column: Sidebar Factsheet -->
			<div class="lg:col-span-1">
				<div class="sticky top-8 space-y-4">
					<!-- View Switcher -->
					<div class="flex items-center p-1.5 bg-slate-100/80 backdrop-blur-md border border-slate-200/50 rounded-full mb-6 relative shadow-inner">
						<div class="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out {currentView === 'gallery' ? 'left-[calc(50%+3px)]' : 'left-1.5'}"></div>
						<button 
							class="flex-1 cursor-pointer py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors {currentView === 'info' ? 'text-bkpm-blue' : 'text-slate-500 hover:text-slate-700'}"
							onclick={() => currentView = 'info'}
						>
							Info View
						</button>
						<button 
							class="flex-1 cursor-pointer py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors {currentView === 'gallery' ? 'text-bkpm-blue' : 'text-slate-500 hover:text-slate-700'}"
							onclick={() => currentView = 'gallery'}
						>
							Gallery View
						</button>
					</div>
					<div class="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
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

						{#if formattedLastUpdated}
						<div class="h-[1px] w-full bg-slate-100"></div>
						<div>
							<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Last updated</div>
							<div class="text-sm font-black text-slate-800">{formattedLastUpdated}</div>
						</div>
						{/if}


						<!-- Contacts -->
						{#if contacts.length > 0}
						<div class="h-[1px] w-full bg-slate-100 mt-8 mb-8"></div>
						<div class="space-y-4">
							<div class="flex items-center justify-between gap-3">
								<div class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Project Contacts</div>
								{#if contacts.length > 1}
									<div class="flex items-center gap-2">
										<span class="text-[10px] font-bold text-slate-400">{activeContactSlide + 1} / {contacts.length}</span>
										<div class="flex items-center gap-1">
											<button
												type="button"
												onclick={() => activeContactSlide = (activeContactSlide - 1 + contacts.length) % contacts.length}
												class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-bkpm-blue/20 hover:text-bkpm-blue cursor-pointer"
												aria-label="Previous contact"
											>
												<ChevronLeft size={14} strokeWidth={2.5} />
											</button>
											<button
												type="button"
												onclick={() => activeContactSlide = (activeContactSlide + 1) % contacts.length}
												class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-bkpm-blue/20 hover:text-bkpm-blue cursor-pointer"
												aria-label="Next contact"
											>
												<ChevronRight size={14} strokeWidth={2.5} />
											</button>
										</div>
									</div>
								{/if}
							</div>
							{#if activeContact}
								<div class="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/60">
									<div class="font-black text-[15px] leading-snug text-slate-900 mb-3">{activeContact.nama}</div>
									<div class="space-y-2">
										{#if activeContact.email}
											<div class="text-[13px] flex items-start gap-2">
												<span class="font-bold text-slate-400 w-12 shrink-0">Email:</span> 
												<span class="text-slate-600 break-all">{activeContact.email}</span>
											</div>
										{/if}
										{#if activeContact.telepon}
											<div class="text-[13px] flex items-start gap-2">
												<span class="font-bold text-slate-400 w-12 shrink-0">Phone:</span> 
												<span class="text-slate-600">{activeContact.telepon}</span>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</div>
						{/if}

						<!-- Primary Action -->
						<div class="mt-8 pt-8 border-t border-slate-100 space-y-3">
							<button class="w-full py-4 bg-logo-green text-white rounded-2xl font-black uppercase text-xs tracking-wide shadow-lg shadow-logo-green/20 hover:bg-logo-green/90 hover:-translate-y-0.5 transition-all cursor-pointer">
								{m.proj_btn_interest()}
							</button>
							{#if project.details?.contact_email}
								<a href="mailto:{project.details.contact_email}" class="block w-full py-4 bg-white text-slate-700 rounded-2xl font-black uppercase text-xs tracking-wide shadow-sm border border-slate-100 hover:bg-slate-50 hover:-translate-y-0.5 transition-all cursor-pointer text-center">
									{m.proj_btn_meeting()}
								</a>
							{:else}
								<button class="w-full py-4 bg-white text-slate-700 rounded-2xl font-black uppercase text-xs tracking-wide shadow-sm border border-slate-100 hover:bg-slate-50 hover:-translate-y-0.5 transition-all cursor-pointer">
									{m.proj_btn_meeting()}
								</button>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		</div>
	</div>
</div>

{#if expandedInfographic}
	<div
		class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 p-6 cursor-zoom-out"
		role="dialog"
		aria-modal="true"
		aria-label="Expanded project infographic viewer"
		tabindex="0"
		onclick={() => expandedInfographic = null}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				expandedInfographic = null;
				return;
			}
			if (infographicImages.length <= 1) return;
			if (e.key === 'ArrowLeft') {
				expandedInfographic =
					infographicImages[
						(expandedInfographicIndex - 1 + infographicImages.length) % infographicImages.length
					];
			}
			if (e.key === 'ArrowRight') {
				expandedInfographic =
					infographicImages[(expandedInfographicIndex + 1) % infographicImages.length];
			}
		}}
	>
		{#if infographicImages.length > 1}
			<button
				type="button"
				class="absolute left-6 top-1/2 z-[121] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer"
				onclick={(e) => {
					e.stopPropagation();
					expandedInfographic =
						infographicImages[
							(expandedInfographicIndex - 1 + infographicImages.length) % infographicImages.length
						];
				}}
				aria-label="Previous infographic"
			>
				<ChevronLeft size={22} strokeWidth={2.5} />
			</button>

			<button
				type="button"
				class="absolute right-6 top-1/2 z-[121] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer"
				onclick={(e) => {
					e.stopPropagation();
					expandedInfographic =
						infographicImages[(expandedInfographicIndex + 1) % infographicImages.length];
				}}
				aria-label="Next infographic"
			>
				<ChevronRight size={22} strokeWidth={2.5} />
			</button>
		{/if}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onclick={(e) => e.stopPropagation()}>
			<img
				src={safeUrl(expandedInfographic)}
				alt="Expanded project infographic"
				class="max-h-[90vh] max-w-[90vw] rounded-2xl bg-white object-contain shadow-2xl"
			/>
		</div>
	</div>
{/if}
