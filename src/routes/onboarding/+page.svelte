<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { 
		Sprout, 
		Waves, 
		Pickaxe, 
		Factory, 
		Construction, 
		Truck, 
		ShoppingBag, 
		Building2, 
		MapPin, 
		Briefcase,
		ShieldCheck,
		Shield,
		ArrowRight,
		Check
	} from 'lucide-svelte';
	
	let currentStep = $state(1);
	let selectedSectors = $state<string[]>([]);
	let selectedScale = $state('');
	const localeCurrencyMap: Record<string, string> = { id: 'IDR', zh: 'CNY', ja: 'JPY', ko: 'KRW', en: 'USD' };
	let currency = $state(localeCurrencyMap[getLocale()] ?? 'USD');
	let isDropdownOpen = $state(false);
	let isFinalizing = $state(false);

	const sectors = $derived([
		// Primer
		{ id: 'agriculture', name: m.sector_agri(), category: 'Primer', icon: Sprout, stats: m.sector_agri_sub() },
		{ id: 'fisheries', name: m.sector_fish(), category: 'Primer', icon: Waves, stats: m.sector_fish_sub() },
		{ id: 'mining', name: m.sector_mine(), category: 'Primer', icon: Pickaxe, stats: m.sector_mine_sub() },
		// Sekunder
		{ id: 'manufacturing', name: m.sector_mfg(), category: 'Sekunder', icon: Factory, stats: m.sector_mfg_sub() },
		{ id: 'construction', name: m.sector_const(), category: 'Sekunder', icon: Construction, stats: m.sector_const_sub() },
		// Tersier
		{ id: 'logistics', name: m.sector_log(), category: 'Tersier', icon: Truck, stats: m.sector_log_sub() },
		{ id: 'retail', name: m.sector_retail(), category: 'Tersier', icon: ShoppingBag, stats: m.sector_retail_sub() },
		{ id: 'property', name: m.sector_prop(), category: 'Tersier', icon: Building2, stats: m.sector_prop_sub() },
		{ id: 'tourism', name: m.sector_tour(), category: 'Tersier', icon: MapPin, stats: m.sector_tour_sub() },
		{ id: 'services', name: m.sector_serv(), category: 'Tersier', icon: Briefcase, stats: m.sector_serv_sub() }
	]);

	const currencies = [
		{ code: 'USD', symbol: '$', name: m.onb_cur_usd() },
		{ code: 'IDR', symbol: 'Rp', name: m.onb_cur_idr() },
		{ code: 'CNY', symbol: '¥', name: m.onb_cur_cny() },
		{ code: 'JPY', symbol: '¥', name: m.onb_cur_jpy() },
		{ code: 'KRW', symbol: '₩', name: m.onb_cur_krw() },
		{ code: 'SGD', symbol: 'S$', name: m.onb_cur_sgd() }
	];

	const scales = $derived.by(() => {
		const s = currencies.find(c => c.code === currency)?.symbol || '$';
		const scaleConfigs = [
			{ id: 'small', desc: m.onb_scale_small_desc() },
			{ id: 'medium', desc: m.onb_scale_medium_desc() },
			{ id: 'large', desc: m.onb_scale_large_desc() },
			{ id: 'mega', desc: m.onb_scale_mega_desc() }
		];

		if (currency === 'USD') return [
			{ id: 'small', label: `< ${s}10M`, description: scaleConfigs[0].desc },
			{ id: 'medium', label: `${s}10M - ${s}100M`, description: scaleConfigs[1].desc },
			{ id: 'large', label: `${s}100M - ${s}1B`, description: scaleConfigs[2].desc },
			{ id: 'mega', label: `${s}1B+`, description: scaleConfigs[3].desc }
		];
		if (currency === 'IDR') return [
			{ id: 'small', label: `< ${s}150B`, description: scaleConfigs[0].desc },
			{ id: 'medium', label: `${s}150B - ${s}1.5T`, description: scaleConfigs[1].desc },
			{ id: 'large', label: `${s}1.5T - ${s}15T`, description: scaleConfigs[2].desc },
			{ id: 'mega', label: `${s}15T+`, description: scaleConfigs[3].desc }
		];
		if (currency === 'CNY') return [
			{ id: 'small', label: `< ${s}70M`, description: scaleConfigs[0].desc },
			{ id: 'medium', label: `${s}70M - ${s}700M`, description: scaleConfigs[1].desc },
			{ id: 'large', label: `${s}700M - ${s}7B`, description: scaleConfigs[2].desc },
			{ id: 'mega', label: `${s}7B+`, description: scaleConfigs[3].desc }
		];
		if (currency === 'JPY') return [
			{ id: 'small', label: `< ${s}1.5B`, description: scaleConfigs[0].desc },
			{ id: 'medium', label: `${s}1.5B - ${s}15B`, description: scaleConfigs[1].desc },
			{ id: 'large', label: `${s}15B - ${s}150B`, description: scaleConfigs[2].desc },
			{ id: 'mega', label: `${s}150B+`, description: scaleConfigs[3].desc }
		];
		if (currency === 'KRW') return [
			{ id: 'small', label: `< ${s}13B`, description: scaleConfigs[0].desc },
			{ id: 'medium', label: `${s}13B - ${s}130B`, description: scaleConfigs[1].desc },
			{ id: 'large', label: `${s}130B - ${s}1.3T`, description: scaleConfigs[2].desc },
			{ id: 'mega', label: `${s}1.3T+`, description: scaleConfigs[3].desc }
		];
		if (currency === 'SGD') return [
			{ id: 'small', label: `< ${s}13M`, description: scaleConfigs[0].desc },
			{ id: 'medium', label: `${s}13M - ${s}130M`, description: scaleConfigs[1].desc },
			{ id: 'large', label: `${s}130M - ${s}1.3B`, description: scaleConfigs[2].desc },
			{ id: 'mega', label: `${s}1.3B+`, description: scaleConfigs[3].desc }
		];
		return [];
	});

	function toggleSector(id: string) {
		if (selectedSectors.includes(id)) {
			selectedSectors = selectedSectors.filter(s => s !== id);
		} else {
			selectedSectors = [...selectedSectors, id];
		}
	}

	function nextStep() {
		if (currentStep === 2) {
			currentStep = 3;
			isFinalizing = true;
			// Brief display of success state then auto-redirect
			setTimeout(() => {
				goto('/');
			}, 2500);
		} else if (currentStep < 3) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1 && !isFinalizing) currentStep--;
	}
</script>

<svelte:head>
	<title>Onboarding | Investika</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex flex-col items-center py-12 md:py-16 px-4 md:px-6">
	<!-- Connected Progress Bar -->
	<div class="w-full max-w-lg mb-8">
		<div class="flex justify-between mb-4 px-6 relative">
			<!-- Background Line Track -->
			<div class="absolute top-4 left-16 right-16 h-1 bg-slate-100 rounded-full -z-10"></div>
			<!-- Active Progress Track -->
			<div 
				class="absolute top-4 left-16 h-1 bg-bkpm-blue rounded-full transition-all duration-700 ease-out -z-10"
				style="width: calc({(currentStep - 1) / 2 * 100}% - 0px)"
			></div>

			{#each [1, 2, 3] as step (step)}
				<div class="flex flex-col items-center">
					<div 
						class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 z-10
						{currentStep >= step ? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/30 scale-110' : 'bg-white text-slate-400 border-2 border-slate-100'}"
					>
						{#if currentStep > step}
							<ShieldCheck size={16} strokeWidth={3} />
						{:else}
							{step}
						{/if}
					</div>
					<span class="text-[10px] font-black uppercase tracking-tight mt-3 {currentStep >= step ? 'text-bkpm-blue' : 'text-slate-400'}">
						{step === 1 ? m.onb_profile() : step === 2 ? m.onb_scale() : m.onb_setup()}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Precision Fitted Container -->
	<div class="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col mx-auto relative overflow-visible">
		
		<!-- Fixed Header Section (Prevents Dropdown Clipping) -->
		{#if currentStep < 3}
			<div class="px-6 md:px-10 pt-8 pb-4 shrink-0 overflow-visible z-30" transition:fade={{ duration: 300 }}>
				{#if currentStep === 1}
					<h2 class="text-3xl font-black text-slate-900 tracking-tight mb-1">{m.onb_title_sectors()}</h2>
					<p class="text-sm font-medium text-slate-500">{m.onb_sub_sectors()}</p>
				{:else if currentStep === 2}
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-3xl font-black text-slate-900 tracking-tight mb-1">{m.onb_title_scale()}</h2>
							<p class="text-sm font-medium text-slate-500">{m.onb_sub_scale()}</p>
						</div>
						
						<!-- Custom Currency Dropdown -->
						<div class="relative">
							<button 
								onclick={() => isDropdownOpen = !isDropdownOpen}
								onblur={() => setTimeout(() => isDropdownOpen = false, 200)}
								class="bg-slate-100 border-2 border-transparent px-5 py-3 rounded-xl text-[11px] font-black text-slate-700 flex items-center space-x-3 hover:border-slate-200 transition-all cursor-pointer min-w-[140px] justify-between shadow-sm active:scale-[0.98]"
							>
								<span>{currency} ({currencies.find(c => c.code === currency)?.symbol})</span>
								<ArrowRight size={14} strokeWidth={3} class="rotate-90 text-slate-400 transition-transform {isDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}" />
							</button>

							{#if isDropdownOpen}
								<div 
									class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-50 overflow-hidden"
									in:fly={{ y: 10, duration: 200 }}
									out:fade={{ duration: 150 }}
								>
									{#each currencies as cur}
										<button 
											onclick={() => { currency = cur.code; isDropdownOpen = false; }}
											class="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer
											{currency === cur.code ? 'bg-bkpm-blue/5' : ''}"
										>
											<div class="flex flex-col">
												<span class="text-[11px] font-black text-slate-900">{cur.code} ({cur.symbol})</span>
												<span class="text-[9px] font-medium text-slate-400 uppercase tracking-tight">{cur.name}</span>
											</div>
											{#if currency === cur.code}
												<ShieldCheck size={14} class="text-bkpm-blue" />
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Content Area -->
		<div class="flex-1 px-6 md:px-10 pb-10">
			{#if currentStep === 1}
				<div class="pt-2" in:fly={{ x: 20, duration: 500 }} out:fly={{ x: -20, duration: 500 }}>
					<div class="space-y-8">
						{#each ['Primer', 'Sekunder', 'Tersier'] as category (category)}
							<div>
								<div class="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-4 ml-1 flex items-center">
									<span class="bg-slate-50 px-2.5 py-1 rounded-md text-slate-500 mr-3">
										{category === 'Primer' ? m.onb_cat_primer() : category === 'Sekunder' ? m.onb_cat_sekunder() : m.onb_cat_tersier()}
									</span>
									<div class="h-[1px] flex-1 bg-slate-100"></div>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{#each sectors.filter(s => s.category === category) as sector (sector.id)}
										{@const SectorIcon = sector.icon}
										<button 
											onclick={() => toggleSector(sector.id)}
											class="relative px-5 py-3 rounded-xl border-2 transition-all text-left group flex items-center space-x-4 cursor-pointer
											{selectedSectors.includes(sector.id) 
												? 'border-bkpm-blue bg-bkpm-blue/5 shadow-[0_12px_24px_rgba(0,92,171,0.1)]' 
												: 'border-slate-50 hover:border-slate-200 bg-slate-50/40'}"
										>
											<div class="transition-transform group-hover:scale-110 shrink-0 {selectedSectors.includes(sector.id) ? 'text-bkpm-blue' : 'text-slate-400'}">
												<SectorIcon size={18} strokeWidth={2.5} />
											</div>
											<div class="flex-1 min-w-0">
												<div class="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight truncate">{sector.name}</div>
												<div class="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{sector.stats}</div>
											</div>
											
											<div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ml-2
												{selectedSectors.includes(sector.id) ? 'border-bkpm-blue bg-bkpm-blue' : 'border-slate-200 bg-white'}">
												{#if selectedSectors.includes(sector.id)}
													<Check size={12} strokeWidth={4} class="text-white" />
												{/if}
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else if currentStep === 2}
				<div class="pt-4" in:fly={{ x: 20, duration: 500 }} out:fly={{ x: -20, duration: 500 }}>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each scales as scale (scale.id)}
							<button 
								onclick={() => selectedScale = scale.id}
								class="p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group cursor-pointer
								{selectedScale === scale.id 
									? 'border-bkpm-blue bg-bkpm-blue/5 shadow-[0_12px_24px_rgba(0,92,171,0.12)]' 
									: 'border-slate-50 hover:border-slate-200 bg-slate-50/40'}"
							>
								<div class="min-w-0">
									<div class="text-base font-black text-slate-900 leading-tight">{scale.label}</div>
									<div class="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">{scale.description}</div>
								</div>
								<div class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ml-4
									{selectedScale === scale.id ? 'border-bkpm-blue bg-bkpm-blue' : 'border-slate-200'}">
									{#if selectedScale === scale.id}
										<ArrowRight size={12} strokeWidth={4} class="text-white" />
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{:else if currentStep === 3}
				<div class="flex flex-col items-center justify-center text-center py-12" in:fly={{ y: 20, duration: 500 }} out:fly={{ y: -20, duration: 500 }}>
					<div class="space-y-6" in:fade={{ duration: 300 }}>
						<div class="relative w-24 h-24 mx-auto">
							<div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
							<div class="absolute inset-0 border-4 border-bkpm-blue rounded-full border-t-transparent animate-spin"></div>
							<div class="absolute inset-0 flex items-center justify-center">
								<ShieldCheck size={48} strokeWidth={2} class="text-bkpm-blue" />
							</div>
						</div>
						<div>
							<h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">{m.onb_title_setup()}</h2>
							<p class="text-sm font-bold text-logo-green uppercase tracking-tight">{m.onb_sub_setup()}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer Actions -->
		{#if currentStep < 3}
			<div class="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0 rounded-b-[32px]" transition:slide={{ duration: 400, easing: cubicOut }}>
				<button 
					onclick={prevStep}
					disabled={currentStep === 1 || isFinalizing}
					class="px-8 py-3 rounded-xl font-black uppercase text-xs tracking-tight text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all cursor-pointer"
				>
					{m.onb_btn_back()}
				</button>

				<div class="flex items-center space-x-5">
					<button 
						onclick={nextStep}
						disabled={(currentStep === 1 && selectedSectors.length === 0) || (currentStep === 2 && !selectedScale)}
						class="px-12 py-4 bg-bkpm-blue text-white rounded-2xl font-black uppercase text-xs tracking-tight shadow-xl shadow-bkpm-blue/20 hover:bg-bkpm-blue/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
					>
						{m.onb_btn_continue()}
					</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-8 h-1 w-full"></div>
</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}
</style>
