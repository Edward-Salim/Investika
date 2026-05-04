<script lang="ts">
	import {
		Bookmark,
		Image,
		MapPin,
		Zap,
		Palmtree,
		Factory,
		Waves,
		Pickaxe,
		Building2,
		ShoppingBag,
		Briefcase,
		Construction,
		Stethoscope
	} from 'lucide-svelte';
	import { compareStore } from '$lib/state/compare.svelte';
	import { bookmarkStore } from '$lib/state/bookmark.svelte';
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
		};
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
		Infrastructure: Construction,
		Energy: Zap,
		Manufacturing: Factory,
		Tourism: Palmtree,
		Healthcare: Stethoscope,
		Mining: Pickaxe,
		Property: Building2,
		Retail: ShoppingBag,
		Services: Briefcase,
		Fisheries: Waves
	};

	const capexDisplay = $derived(formatCurrency(project.capex || project.investment));
	const npvDisplay = $derived(formatCurrency(project.npv));

	const isCompared = $derived(compareStore.isCompared(project.id));
	const isBookmarked = $derived(bookmarkStore.isBookmarked(project.id));
</script>

<a
	href="/project/{project.id}"
	class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-lg"
>
	<!-- Image strip -->
	<div
		class="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-slate-50"
	>
		{#if project.image}
			<img
				src={safeUrl(project.image)}
				alt={project.title}
				class="absolute inset-0 h-full w-full object-cover"
				loading="lazy"
				decoding="async"
				onerror={(e) => (e.currentTarget as HTMLImageElement).classList.add('hidden')}
			/>
		{:else}
			<div class="flex flex-col items-center gap-2 text-slate-300">
				<Image size={24} strokeWidth={1.5} />
				<span class="text-[8px] font-black tracking-widest uppercase">{m.card_no_preview()}</span>
			</div>
		{/if}

		<!-- Subtle gradient at bottom for badge contrast -->
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
		></div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				bookmarkStore.toggle(project);
			}}
			class="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 shadow-sm transition-colors duration-200 hover:border-bkpm-blue/30 hover:bg-white"
			title={isBookmarked ? m.card_bookmark_remove() : m.card_bookmark_add()}
			aria-label={isBookmarked ? m.card_bookmark_remove() : m.card_bookmark_add()}
			role="button"
			tabindex="0"
		>
			<Bookmark
				size={15}
				strokeWidth={2.4}
				class={isBookmarked ? 'text-bkpm-blue' : 'text-slate-500'}
				fill={isBookmarked ? 'currentColor' : 'none'}
			/>
		</div>

		<!-- Top-right: status badge (IPRO / PPI) + sector icon -->
		<div class="absolute top-3 right-3 z-10 flex items-center gap-1.5">
			{#if project.status}
				<div
					class="flex h-7 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 px-2.5 shadow-sm"
				>
					<span class="text-[8px] font-black tracking-tight text-bkpm-blue uppercase">
						{project.status}
					</span>
				</div>
			{/if}
			{#if project.category}
				{@const catKey = 'cat_' + project.category.toLowerCase()}
				<div
					class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 shadow-sm"
					title={(m as any)[catKey] ? (m as any)[catKey]() : project.category}
				>
					{#if categoryIcons[project.category]}
						{@const Icon = categoryIcons[project.category]}
						<Icon size={13} strokeWidth={2.5} class="text-bkpm-blue" />
					{:else}
						<Zap size={13} strokeWidth={2.5} class="text-bkpm-blue" />
					{/if}
				</div>
			{/if}
		</div>

		<!-- Bottom-left: compare tag -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				compareStore.toggle(project);
			}}
			class="group/bm absolute bottom-4 left-0 z-20 flex cursor-pointer flex-col items-center transition-colors duration-200"
			title={isCompared
				? m.card_tooltip_remove()
				: compareStore.limitReached
					? m.card_tooltip_max()
					: m.card_tooltip_add()}
			aria-label={isCompared
				? m.card_tooltip_remove()
				: compareStore.limitReached
					? m.card_tooltip_max()
					: m.card_tooltip_add()}
			role="button"
			tabindex="0"
		>
			<div
				class="flex h-7 items-center rounded-r-full border border-slate-200/80 pr-4 pl-3 text-[9px] font-black tracking-wide uppercase shadow-sm transition-colors duration-200 select-none
					{isCompared
					? 'text-white'
					: compareStore.limitReached
						? 'text-white'
						: 'text-slate-600 group-hover/bm:text-bkpm-blue'}"
				style="
					background: {isCompared
					? '#1755CF'
					: compareStore.limitReached
						? '#ef4444'
						: 'rgba(255,255,255,0.96)'};
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

	<div class="flex flex-1 flex-col p-4">
		<h3
			class="mb-1 line-clamp-2 text-base leading-tight font-black text-slate-900 transition-colors group-hover:text-bkpm-blue"
			title={project.title}
		>
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
				class="mb-2 flex w-fit cursor-pointer items-center gap-1 text-left text-[10px] font-bold text-slate-400 transition-colors hover:text-bkpm-blue"
				role="button"
				tabindex="0"
			>
				<MapPin size={10} />
				{project.location}
			</span>
		{/if}

		<div class="mt-auto grid grid-cols-3 gap-2 border-t border-slate-50 pt-3">
			<div>
				<div class="mb-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
					{m.card_label_capex()}
				</div>
				<div class="truncate text-[10px] font-black text-slate-900" title={capexDisplay}>
					{capexDisplay}
				</div>
			</div>
			<div>
				<div class="mb-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
					{m.card_label_npv()}
				</div>
				<div class="truncate text-[10px] font-black text-slate-900" title={npvDisplay}>
					{npvDisplay}
				</div>
			</div>
			<div>
				<div class="mb-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
					{m.card_label_irr()}
				</div>
				<div class="truncate text-[10px] font-black text-logo-green" title={project.irr}>
					{project.irr}
				</div>
			</div>
		</div>
	</div>
</a>
