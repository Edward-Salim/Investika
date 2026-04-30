<script lang="ts">
	import { Image, MapPin, Zap, Palmtree, Factory, Waves, Pickaxe, Building2, ShoppingBag, Briefcase, Construction, Stethoscope } from 'lucide-svelte';
	import { compareStore } from '$lib/state/compare.svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';
	import { formatCurrency } from '$lib/utils/currency';

	let { project, hideLocation = false } = $props<{
		project: {
			id: string | number;
			image: string | null;
			title: string;
			category: string;
			status?: string;
			location?: string;
			investment?: string;
			capex?: string;
			npv: string;
			irr: string;
			provinceId?: number | null;
		},
		hideLocation?: boolean;
	}>();

	function safeUrl(url: string | null) {
		if (!url) return '';
		if (url.includes('bkpm.go.id')) {
			return `/api/proxy-image?url=${encodeURIComponent(url.replace(/ /g, '%20'))}`;
		}
		if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
			return url;
		}
		return `/${url}`;
	}

	const categoryIcons: Record<string, any> = {
		'Infrastructure': Construction,
		'Energy': Zap,
		'Manufacturing': Factory,
		'Tourism': Palmtree,
		'Healthcare': Stethoscope,
		'Mining': Pickaxe,
		'Property': Building2,
		'Retail': ShoppingBag,
		'Services': Briefcase,
		'Fisheries': Waves
	};

	const capexDisplay = $derived(formatCurrency(project.capex || project.investment));
	const npvDisplay = $derived(formatCurrency(project.npv));

	const isCompared = $derived(compareStore.isCompared(project.id));
</script>

<a
	href="/project/{project.id}"
	class="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col relative h-full"
	in:fly={{ y: 20, duration: 400 }}
>
	<!-- Image strip -->
	<div class="aspect-video w-full overflow-hidden bg-slate-50 relative flex items-center justify-center">
		{#if project.image}
			<img
				src={safeUrl(project.image)}
				alt={project.title}
				class="absolute inset-0 h-full w-full object-cover"
				onerror={(e) => (e.currentTarget as HTMLImageElement).classList.add('hidden')}
			/>
		{:else}
			<div class="flex flex-col items-center gap-2 text-slate-300">
				<Image size={24} strokeWidth={1.5} />
				<span class="text-[8px] font-black uppercase tracking-widest">{m.card_no_preview()}</span>
			</div>
		{/if}

		<!-- Subtle gradient at bottom for badge contrast -->
		<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

		<!-- Top-right: status badge (IPRO / PPI) + sector icon -->
		<div class="absolute top-3 right-3 z-10 flex items-center gap-1.5">
			{#if project.status}
				<div class="h-7 px-2.5 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-sm">
					<span class="text-[8px] font-black text-bkpm-blue uppercase tracking-tight">
						{project.status}
					</span>
				</div>
			{/if}
			{#if project.category}
				{@const catKey = 'cat_' + project.category.toLowerCase()}
				<div class="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-sm" 
					 title={(m as any)[catKey] ? (m as any)[catKey]() : project.category}>
					{#if categoryIcons[project.category]}
						{@const Icon = categoryIcons[project.category]}
						<Icon size={13} strokeWidth={2.5} class="text-bkpm-blue" />
					{:else}
						<Zap size={13} strokeWidth={2.5} class="text-bkpm-blue" />
					{/if}
				</div>
			{/if}
		</div>

		<!-- Bottom-left: Horizontal bookmark tag -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={(e) => { 
				e.preventDefault(); 
				e.stopPropagation();
				e.stopImmediatePropagation();
				compareStore.toggle(project); 
			}}
			class="absolute bottom-4 left-0 z-20 flex flex-col items-center transition-all duration-300 group/bm cursor-pointer"
			title={isCompared ? m.card_tooltip_remove() : compareStore.limitReached ? m.card_tooltip_max() : m.card_tooltip_add()}
			role="button"
			tabindex="0"
		>
			<div
				class="flex items-center pl-3 pr-5 h-7 text-[9px] font-black uppercase tracking-wide shadow-md transition-all duration-300 select-none
					{isCompared
						? 'text-white'
						: compareStore.limitReached
							? 'text-white'
							: 'text-slate-600 group-hover/bm:text-bkpm-blue'}"
				style="
					clip-path: polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%);
					background: {isCompared
						? '#1755CF'
						: compareStore.limitReached
							? '#ef4444'
							: 'rgba(255,255,255,0.92)'};
					backdrop-filter: blur(8px);
				"
			>
				{#if isCompared}
					{m.card_added()} &nbsp;<span class="opacity-60">{compareStore.projects.length}/3</span>
				{:else if compareStore.limitReached}
					{m.card_max()}
				{:else}
					{m.card_compare()}
				{/if}
			</div>
		</div>
	</div>

	<div class="p-4 flex flex-col flex-1">
		<h3 class="text-base font-black text-slate-900 leading-tight mb-1 group-hover:text-bkpm-blue transition-colors line-clamp-2" title={project.title}>
			{project.title}
		</h3>

		{#if !hideLocation && project.location}
			<span 
				onclick={(e) => { 
					e.preventDefault(); 
					e.stopPropagation(); 
					if (project.provinceId) {
						goto(`/regions?id=${project.provinceId}`);
					}
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						e.stopPropagation();
						if (project.provinceId) {
							goto(`/regions?id=${project.provinceId}`);
						}
					}
				}}
				class="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-2 hover:text-bkpm-blue transition-colors cursor-pointer text-left w-fit"
				role="button"
				tabindex="0"
			>
				<MapPin size={10} />
				{project.location}
			</span>
		{/if}

		<div class="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 mt-auto">
			<div>
				<div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.card_label_capex()}</div>
				<div class="text-[10px] font-black text-slate-900 truncate" title={capexDisplay}>
					{capexDisplay}
				</div>
			</div>
			<div>
				<div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.card_label_npv()}</div>
				<div class="text-[10px] font-black text-slate-900 truncate" title={npvDisplay}>
					{npvDisplay}
				</div>
			</div>
			<div>
				<div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.card_label_irr()}</div>
				<div class="text-[10px] font-black text-logo-green truncate" title={project.irr}>{project.irr}</div>
			</div>
		</div>
	</div>
</a>
