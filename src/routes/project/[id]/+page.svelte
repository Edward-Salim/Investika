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
		Bookmark,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { formatCurrency } from '$lib/utils/currency';
	import { bookmarkStore } from '$lib/state/bookmark.svelte';

	let { data } = $props<{ data: PageData }>();
	let project = $derived(data.project);
	let isBookmarked = $derived(bookmarkStore.isBookmarked(project.id_peluang ?? project.id ?? ''));

	// Helper for currency formatting (deprecated, now using shared utility)
	const _formatCurrency = (amount: string | number | null) => formatCurrency(amount);

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
				project.galleries
					.map((g: any) => g.image_url)
					.filter((url: unknown) => typeof url === 'string')
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
	let activeGalleryImage = $derived(galleryImages[activeGallerySlide] ?? null);
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

<div class="min-h-screen bg-slate-50 pb-24 font-sans" in:fade={{ duration: 300 }}>
	<!-- Immersive Hero Image Section -->
	<div
		class="relative flex h-[40vh] w-full items-center justify-center overflow-hidden bg-slate-900 md:h-[50vh]"
	>
		{#if project.image_url && !imageError}
			<img
				src={safeUrl(project.image_url)}
				alt={project.nama}
				class="absolute inset-0 h-full w-full object-cover opacity-60"
				decoding="async"
				onerror={() => (imageError = true)}
			/>
		{:else}
			<div class="flex flex-col items-center gap-3 text-white/20">
				<Image size={64} strokeWidth={1} />
				<span class="text-xs font-black tracking-[0.2em] uppercase">{m.proj_no_preview()}</span>
			</div>
		{/if}
		<div
			class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"
		></div>

		<div class="absolute top-8 right-8 flex items-center space-x-3">
			<!-- Share button removed from here -->
		</div>

		<div class="absolute bottom-0 left-0 w-full p-8 md:p-12">
			<div class="mx-auto max-w-7xl">
				<div class="mb-6 flex flex-wrap items-center gap-3">
					<!-- Sector Badge -->
					{#if project.nama_sektor_peluang}
						{@const sectorKey = project.nama_sektor_peluang.toLowerCase()}
						<div
							class="flex h-8 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 backdrop-blur-md"
						>
							<Zap size={14} strokeWidth={3} class="text-white" />
							<span class="text-[10px] font-black tracking-widest text-white uppercase">
								{#if sectorKey.includes('industri') || sectorKey.includes('manufacturing')}
									{m.cat_manufacturing()}
								{:else if sectorKey.includes('pariwisata') || sectorKey.includes('tourism')}
									{m.cat_tourism()}
								{:else if sectorKey.includes('perikanan') || sectorKey.includes('fisheries')}
									{m.cat_fisheries()}
								{:else if sectorKey.includes('infrastruktur') || sectorKey.includes('infrastructure')}
									{m.cat_infrastructure()}
								{:else if sectorKey.includes('energi') || sectorKey.includes('energy')}
									{m.cat_energy()}
								{:else}
									{project.nama_sektor_peluang}
								{/if}
							</span>
						</div>
					{/if}

					<!-- Share Button (Moved here) -->
					<button
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
					>
						<Share2 size={14} strokeWidth={2.5} />
					</button>
					<button
						type="button"
						onclick={() => bookmarkStore.toggle(project)}
						class="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 text-white backdrop-blur-md transition-all hover:bg-white/20"
					>
						<Bookmark size={14} strokeWidth={2.5} fill={isBookmarked ? 'currentColor' : 'none'} />
						<span class="text-[10px] font-black tracking-widest uppercase">
							{isBookmarked ? m.proj_bookmark_saved() : m.proj_bookmark_save()}
						</span>
					</button>
				</div>
				<h1
					class="mb-4 max-w-4xl text-3xl leading-[1.1] font-black tracking-tighter text-white drop-shadow-2xl md:text-5xl"
				>
					{#if project.id_peluang === 928 || project.id === '928' || project.id_peluang === 1 || project.id === '1'}
						{m.mock_p1_title()}
					{:else if project.id_peluang === 933 || project.id === '933' || project.id_peluang === 2 || project.id === '2'}
						{m.mock_p2_title()}
					{:else if project.id_peluang === 866 || project.id === '866' || project.id_peluang === 3 || project.id === '3'}
						{m.mock_p3_title()}
					{:else}
						{project.nama}
					{/if}
				</h1>
			</div>
		</div>
	</div>

	<!-- Project Header Meta -->
	<div class="border-b border-slate-200 bg-white">
		<div class="mx-auto max-w-7xl px-6 py-8 md:py-10 lg:px-8">
			<div class="max-w-none">
				<p
					class="border-l-4 border-bkpm-blue pl-6 text-sm leading-relaxed font-medium text-slate-500 italic {isExpanded
						? ''
						: 'line-clamp-2'}"
				>
					{#if project.id_peluang === 928 || project.id === '928' || project.id_peluang === 1 || project.id === '1'}
						{m.mock_p1_desc()}
					{:else if project.id_peluang === 933 || project.id === '933' || project.id_peluang === 2 || project.id === '2'}
						{m.mock_p2_desc()}
					{:else if project.id_peluang === 866 || project.id === '866' || project.id_peluang === 3 || project.id === '3'}
						{m.mock_p3_desc()}
					{:else}
						{project.deskripsi || m.proj_dummy_desc()}
					{/if}
				</p>
				<button
					onclick={() => (isExpanded = !isExpanded)}
					class="mt-2 ml-6 cursor-pointer text-[10px] font-black tracking-widest text-bkpm-blue uppercase transition-colors hover:text-bkpm-blue/80"
				>
					{isExpanded ? m.proj_read_less() : m.proj_read_more()}
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="mx-auto mt-8 max-w-7xl px-6 md:mt-12 lg:px-8">
		<!-- Innovation Pillars / Key Attributes -->
		<section class="mb-12">
			<h3 class="mb-5 flex items-center text-xl font-black tracking-tight text-slate-900">
				<Zap size={20} class="mr-2 text-bkpm-blue" />
				{m.proj_attr_title()}
			</h3>

			<div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
				<div class="grid grid-cols-2 gap-px md:grid-cols-3">
					<!-- Scheme -->
					<div class="flex flex-col gap-1.5 bg-white p-6 transition-colors hover:bg-slate-50/50">
						<div class="mb-0.5 flex items-center gap-2">
							<span class="text-[10px] font-black tracking-wider text-slate-400 uppercase"
								>{m.proj_attr_scheme()}</span
							>
						</div>
						<span class="text-sm font-black text-slate-900"
							>{project.details?.skema_kerja_sama || 'TBD'}</span
						>
					</div>

					<!-- Land -->
					<div class="flex flex-col gap-1.5 bg-white p-6 transition-colors hover:bg-slate-50/50">
						<div class="mb-0.5 flex items-center gap-2">
							<span class="text-[10px] font-black tracking-wider text-slate-400 uppercase"
								>{m.proj_attr_land()}</span
							>
						</div>
						<span class="text-sm font-black text-slate-900"
							>{project.details?.luas_lahan || 'TBD'}</span
						>
					</div>

					<!-- Region -->
					<div class="flex flex-col gap-1.5 bg-white p-6 transition-colors hover:bg-slate-50/50">
						<div class="mb-0.5 flex items-center gap-2">
							<span class="text-[10px] font-black tracking-wider text-slate-400 uppercase"
								>{m.proj_attr_region()}</span
							>
						</div>
						<span class="text-sm font-black text-slate-900">
							<a
								href="/regions?id={project.id_adm_provinsi}"
								class="transition-colors hover:text-bkpm-blue"
								title="{project.nama_kabkot || ''}, {project.nama_provinsi || ''}"
							>
								{project.nama_kabkot || ''}{project.nama_kabkot && project.nama_provinsi
									? ', '
									: ''}{project.nama_provinsi || ''}
							</a>
						</span>
					</div>

					<!-- KBLI -->
					<div class="flex flex-col gap-1.5 bg-white p-6 transition-colors hover:bg-slate-50/50">
						<div class="mb-0.5 flex items-center gap-2">
							<span class="text-[10px] font-black tracking-wider text-slate-400 uppercase"
								>{m.proj_attr_kbli()}</span
							>
						</div>
						<span class="text-sm font-black text-slate-900"
							>{project.details?.kode_kbli || 'N/A'}</span
						>
					</div>

					<!-- Government Agency -->
					<div class="flex flex-col gap-1.5 bg-white p-6 transition-colors hover:bg-slate-50/50">
						<div class="mb-0.5 flex items-center gap-2">
							<span class="text-[10px] font-black tracking-wider text-slate-400 uppercase"
								>{m.fact_agency()}</span
							>
						</div>
						<span
							class="line-clamp-1 text-sm font-black text-slate-900"
							title={project.details?.contact_name || 'Ministry of Investment'}
						>
							{project.details?.contact_name || 'Ministry of Investment'}
						</span>
					</div>

					<!-- Document Status -->
					<div class="flex flex-col gap-1.5 bg-white p-6 transition-colors hover:bg-slate-50/50">
						<div class="mb-0.5 flex items-center gap-2">
							<span class="text-[10px] font-black tracking-wider text-slate-400 uppercase"
								>{m.fact_status()}</span
							>
						</div>
						<span class="text-sm font-black text-slate-900"
							>{project.status || project.status_proyek || 'Active'}</span
						>
					</div>
				</div>
			</div>
		</section>

		<div class="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
			<!-- Left Column: Details -->
			<div class="space-y-12 transition-all duration-500 lg:col-span-2">
				{#if currentView === 'info'}
					<div in:fade={{ duration: 300, delay: 150 }} class="space-y-12">
						<!-- Readiness / Impact -->
						<section>
							<h3 class="mb-8 flex items-center text-2xl font-black tracking-tight text-slate-900">
								<TrendingUp size={24} class="mr-3 text-bkpm-blue" />
								{m.proj_ready_title()}
							</h3>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<!-- Current Phase Card -->
								<div
									class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md"
								>
									<div
										class="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-bkpm-blue/5 blur-2xl"
									></div>
									<div class="relative z-10 mb-4 flex items-center justify-between">
										<span class="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
											>{m.proj_ready_phase()}</span
										>
										<div class="h-2 w-2 animate-pulse rounded-full bg-logo-green"></div>
									</div>
									<div class="relative z-10 mt-auto space-y-2">
										<h4 class="text-base font-black tracking-tight text-slate-900">
											{project.details?.readiness_status || 'DIMINATI'}
										</h4>
										<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
											<div class="h-full w-2/3 rounded-full bg-bkpm-blue"></div>
										</div>
										<p class="mt-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
											{m.proj_ready_phase_desc()}
										</p>
									</div>
								</div>

								<!-- Investment Priority Card -->
								<div
									class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md"
								>
									<div
										class="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-logo-green/5 blur-2xl"
									></div>
									<div class="relative z-10 mb-4">
										<span class="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
											>{m.proj_ready_priority()}</span
										>
									</div>
									<div class="relative z-10 mt-auto">
										<div
											class="mb-2 inline-flex items-center rounded-md border border-logo-green/20 bg-logo-green/10 px-2 py-1"
										>
											<CheckCircle2 size={10} class="mr-1.5 text-logo-green" />
											<span class="text-[9px] font-black tracking-widest text-logo-green uppercase"
												>{m.proj_ready_priority_high()}</span
											>
										</div>
										<h4 class="text-[15px] leading-tight font-black text-slate-800">
											{project.details?.is_ipro ? m.proj_ready_ipro() : m.proj_ready_psn()}
										</h4>
									</div>
								</div>

								<!-- SEZ Card -->
								<div
									class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md"
								>
									<div
										class="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl"
									></div>
									<div class="relative z-10 mb-4">
										<span class="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
											>{m.proj_ready_zone()}</span
										>
									</div>
									<div class="relative z-10 mt-auto space-y-2">
										<h4 class="line-clamp-3 text-[13px] leading-snug font-black text-slate-800">
											{project.details?.lokasi_kawasan ||
												'Destinasi Pariwisata Prioritas Raja Ampat'}
										</h4>
										<div class="flex items-center gap-2">
											<div class="flex -space-x-1">
												<div
													class="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-bkpm-blue"
												>
													<Globe size={10} class="text-white" />
												</div>
												<div class="h-5 w-5 rounded-full border border-white bg-logo-green"></div>
											</div>
											<p class="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
												{m.proj_ready_verified()}
											</p>
										</div>
									</div>
								</div>
							</div>
						</section>

						<!-- Investment Incentives -->
						{#if project.incentives && project.incentives.length > 0}
							<section>
								<h3 class="mb-5 flex items-center text-xl font-black tracking-tight text-slate-900">
									<ShieldCheck size={20} class="mr-2 text-bkpm-blue" />
									{m.proj_sec_incentives()}
								</h3>
								<div
									class="space-y-6 overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
								>
									{#each project.incentives as incentive}
										<div class="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
											<h4 class="mb-2 text-sm font-black text-slate-900">{incentive.nama}</h4>
											{#if incentive.keterangan}
												<p class="text-sm leading-relaxed text-slate-500">{incentive.keterangan}</p>
											{/if}
										</div>
									{/each}
								</div>
							</section>
						{/if}

						<!-- Additional Information (Documents) -->
						{#if documents && documents.length > 0}
							<section>
								<h3 class="mb-5 flex items-center text-xl font-black tracking-tight text-slate-900">
									<FileText size={20} class="mr-2 text-bkpm-blue" />
									{m.proj_sec_info()}
								</h3>
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									{#each documents as info}
										<div
											class="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
										>
											<h4
												class="mb-3 line-clamp-2 text-sm font-black break-all text-slate-900"
												title={info.nama}
											>
												{info.nama && info.nama.startsWith('http') ? 'Project Document' : info.nama}
											</h4>
											{#if info.url_rest || (info.nama && info.nama.startsWith('http'))}
												<a
													href={info.url_rest || info.nama}
													target="_blank"
													rel="noopener noreferrer"
													class="inline-flex items-center text-xs font-bold tracking-widest text-bkpm-blue uppercase transition-colors hover:text-bkpm-blue/80"
												>
													<Download size={14} class="mr-1.5" strokeWidth={3} />
													{m.proj_doc_view()}
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
								<h3 class="mb-5 flex items-center text-xl font-black tracking-tight text-slate-900">
									<Image size={20} class="mr-2 text-bkpm-blue" />
									{m.proj_sec_gallery()}
								</h3>

								<div
									class="group relative aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm md:aspect-[21/9]"
								>
									{#if activeGalleryImage}
										<div
											class="absolute inset-0 z-10 opacity-100 transition-opacity duration-500 ease-in-out"
										>
											<img
												src={safeUrl(activeGalleryImage)}
												alt="Project Gallery {activeGallerySlide + 1}"
												class="h-full w-full object-cover"
												loading="eager"
												decoding="async"
											/>
										</div>
									{/if}

									{#if galleryImages.length > 1}
										<button
											class="absolute top-1/2 left-4 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/30 text-white opacity-0 backdrop-blur-md transition-colors group-hover:opacity-100 hover:bg-black/50"
											onclick={() =>
												(activeGallerySlide =
													(activeGallerySlide - 1 + galleryImages.length) % galleryImages.length)}
											aria-label={m.aria_prev_slide()}
										>
											<ChevronLeft size={20} strokeWidth={2.5} />
										</button>

										<button
											class="absolute top-1/2 right-4 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/30 text-white opacity-0 backdrop-blur-md transition-colors group-hover:opacity-100 hover:bg-black/50"
											onclick={() =>
												(activeGallerySlide = (activeGallerySlide + 1) % galleryImages.length)}
											aria-label={m.aria_next_slide()}
										>
											<ChevronRight size={20} strokeWidth={2.5} />
										</button>

										<div class="absolute right-0 bottom-6 left-0 z-20 flex justify-center gap-2">
											{#each galleryImages as _, i}
												<button
													class="h-2 cursor-pointer rounded-full transition-all duration-300 {i ===
													activeGallerySlide
														? 'w-8 bg-white'
														: 'w-2 bg-white/50 hover:bg-white/80'}"
													onclick={() => (activeGallerySlide = i)}
													aria-label={m.aria_gallery_dot({ i: i + 1 })}
												></button>
											{/each}
										</div>
									{/if}
								</div>
							</section>
						{/if}

						{#if infographicImages.length > 0}
							<section>
								<h3 class="mb-5 flex items-center text-xl font-black tracking-tight text-slate-900">
									<Image size={20} class="mr-2 text-bkpm-blue" />
									{m.proj_sec_infographic()}
								</h3>

								<div class="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
									{#each infographicImages as imgUrl, i}
										<button
											type="button"
											onclick={() => (expandedInfographic = imgUrl)}
											class="group cursor-zoom-in overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/40"
										>
											<div class="bg-slate-100 p-3">
												<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
													<img
														src={safeUrl(imgUrl)}
														alt="Project Infographic {i + 1}"
														class="block h-auto max-h-[32rem] w-full object-contain"
														loading="lazy"
														decoding="async"
													/>
												</div>
											</div>
											<div
												class="flex items-center justify-between border-t border-slate-100 px-4 py-3"
											>
												<div
													class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
												>
													Infographic {i + 1}
												</div>
											</div>
										</button>
									{/each}
								</div>
							</section>
						{/if}

						{#if galleryImages.length === 0 && infographicImages.length === 0}
							<div class="rounded-3xl border border-slate-100 bg-white py-20 text-center shadow-sm">
								<Image size={48} strokeWidth={1} class="mx-auto mb-4 text-slate-300" />
								<p class="font-medium text-slate-500">{m.proj_media_none()}</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Right Column: Sidebar Factsheet -->
			<div class="lg:col-span-1">
				<div class="sticky top-8 space-y-4">
					<!-- View Switcher -->
					<div
						class="relative mb-6 flex items-center rounded-full border border-slate-200/50 bg-slate-100/80 p-1.5 shadow-inner backdrop-blur-md"
					>
						<div
							class="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-full bg-white shadow-sm transition-all duration-300 ease-out {currentView ===
							'gallery'
								? 'left-[calc(50%+3px)]'
								: 'left-1.5'}"
						></div>
						<button
							class="relative z-10 flex-1 cursor-pointer rounded-full px-4 py-3 text-[10px] font-black tracking-widest uppercase transition-colors {currentView ===
							'info'
								? 'text-bkpm-blue'
								: 'text-slate-500 hover:text-slate-700'}"
							onclick={() => (currentView = 'info')}
						>
							{m.proj_view_info()}
						</button>
						<button
							class="relative z-10 flex-1 cursor-pointer rounded-full px-4 py-3 text-[10px] font-black tracking-widest uppercase transition-colors {currentView ===
							'gallery'
								? 'text-bkpm-blue'
								: 'text-slate-500 hover:text-slate-700'}"
							onclick={() => (currentView = 'gallery')}
						>
							{m.proj_view_gallery()}
						</button>
					</div>
					<div
						class="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
					>
						<div class="space-y-6">
							<!-- CAPEX -->
							<div>
								<div class="mb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
									{m.fact_capex()}
								</div>
								<div class="text-3xl font-black tracking-tight text-slate-900">
									{formatCurrency(project.nilai_investasi_amount || project.nilai_investasi)}
								</div>
							</div>

							<div class="h-[1px] w-full bg-slate-100"></div>

							<!-- NPV -->
							{#if project.nilai_npv}
								<div>
									<div class="mb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
										{m.proj_metric_npv()}
									</div>
									<div class="text-xl font-black text-slate-800">
										{formatCurrency(project.nilai_npv_amount || project.nilai_npv)}
									</div>
								</div>
								<div class="h-[1px] w-full bg-slate-100"></div>
							{/if}

							<!-- Metrics Grid -->
							<div class="grid grid-cols-2 gap-6">
								<div>
									<div class="mb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
										{m.fact_irr()}
									</div>
									<div class="text-lg font-black text-logo-green">{project.nilai_irr || 'TBD'}</div>
								</div>
								<div>
									<div class="mb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
										{m.fact_payback()}
									</div>
									<div class="text-lg font-black text-slate-900">
										{project.nilai_pp ? project.nilai_pp + ' ' + m.fact_years() : 'TBD'}
									</div>
								</div>
							</div>

							{#if formattedLastUpdated}
								<div class="h-[1px] w-full bg-slate-100"></div>
								<div>
									<div class="mb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
										{m.proj_last_updated()}
									</div>
									<div class="text-sm font-black text-slate-800">{formattedLastUpdated}</div>
								</div>
							{/if}

							<!-- Contacts -->
							{#if contacts.length > 0}
								<div class="mt-8 mb-8 h-[1px] w-full bg-slate-100"></div>
								<div class="space-y-4">
									<div class="flex items-center justify-between gap-3">
										<div class="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
											{m.proj_sec_contacts()}
										</div>
										{#if contacts.length > 1}
											<div class="flex items-center gap-2">
												<span class="text-[10px] font-bold text-slate-400"
													>{activeContactSlide + 1} / {contacts.length}</span
												>
												<div class="flex items-center gap-1">
													<button
														type="button"
														onclick={() =>
															(activeContactSlide =
																(activeContactSlide - 1 + contacts.length) % contacts.length)}
														class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-bkpm-blue/20 hover:text-bkpm-blue"
														aria-label={m.aria_prev_slide()}
													>
														<ChevronLeft size={14} strokeWidth={2.5} />
													</button>
													<button
														type="button"
														onclick={() =>
															(activeContactSlide = (activeContactSlide + 1) % contacts.length)}
														class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-bkpm-blue/20 hover:text-bkpm-blue"
														aria-label={m.aria_next_slide()}
													>
														<ChevronRight size={14} strokeWidth={2.5} />
													</button>
												</div>
											</div>
										{/if}
									</div>
									{#if activeContact}
										<div class="rounded-2xl border border-slate-100/60 bg-slate-50/80 p-5">
											<div class="mb-3 text-[15px] leading-snug font-black text-slate-900">
												{activeContact.nama}
											</div>
											<div class="space-y-2">
												{#if activeContact.email}
													<div class="flex items-start gap-2 text-[13px]">
														<span class="w-12 shrink-0 font-bold text-slate-400"
															>{m.proj_label_email()}</span
														>
														<span class="break-all text-slate-600">{activeContact.email}</span>
													</div>
												{/if}
												{#if activeContact.telepon}
													<div class="flex items-start gap-2 text-[13px]">
														<span class="w-12 shrink-0 font-bold text-slate-400"
															>{m.proj_label_phone()}</span
														>
														<span class="text-slate-600">{activeContact.telepon}</span>
													</div>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							{/if}

							<!-- Primary Action -->
							<div class="mt-8 space-y-3 border-t border-slate-100 pt-8">
								<button
									type="button"
									onclick={() => bookmarkStore.toggle(project)}
									class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-xs font-black tracking-wide text-slate-700 uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
								>
									<Bookmark
										size={14}
										strokeWidth={2.5}
										fill={isBookmarked ? 'currentColor' : 'none'}
										class={isBookmarked ? 'text-bkpm-blue' : 'text-slate-500'}
									/>
									<span class={isBookmarked ? 'text-bkpm-blue' : ''}>
										{isBookmarked ? m.proj_bookmark_saved() : m.proj_bookmark_save()}
									</span>
								</button>
								<button
									class="w-full cursor-pointer rounded-2xl bg-logo-green py-4 text-xs font-black tracking-wide text-white uppercase shadow-lg shadow-logo-green/20 transition-all hover:-translate-y-0.5 hover:bg-logo-green/90"
								>
									{m.proj_btn_interest()}
								</button>
								{#if project.details?.contact_email}
									<a
										href="mailto:{project.details.contact_email}"
										class="block w-full cursor-pointer rounded-2xl border border-slate-100 bg-white py-4 text-center text-xs font-black tracking-wide text-slate-700 uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
									>
										{m.proj_btn_meeting()}
									</a>
								{:else}
									<button
										class="w-full cursor-pointer rounded-2xl border border-slate-100 bg-white py-4 text-xs font-black tracking-wide text-slate-700 uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
									>
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
		class="fixed inset-0 z-[120] flex cursor-zoom-out items-center justify-center bg-slate-950/90 p-6"
		role="dialog"
		aria-modal="true"
		aria-label={m.proj_sec_infographic()}
		tabindex="0"
		onclick={() => (expandedInfographic = null)}
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
				class="absolute top-1/2 left-6 z-[121] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
				onclick={(e) => {
					e.stopPropagation();
					expandedInfographic =
						infographicImages[
							(expandedInfographicIndex - 1 + infographicImages.length) % infographicImages.length
						];
				}}
				aria-label={m.aria_prev_slide()}
			>
				<ChevronLeft size={22} strokeWidth={2.5} />
			</button>

			<button
				type="button"
				class="absolute top-1/2 right-6 z-[121] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
				onclick={(e) => {
					e.stopPropagation();
					expandedInfographic =
						infographicImages[(expandedInfographicIndex + 1) % infographicImages.length];
				}}
				aria-label={m.aria_next_slide()}
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
				decoding="async"
			/>
		</div>
	</div>
{/if}
