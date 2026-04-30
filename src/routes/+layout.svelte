<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { setLocale, getLocale, localizeUrl } from '$lib/paraglide/runtime.js';
	
	function changeLanguage(lang: "en" | "id" | "zh" | "ja" | "ko") {
		setLocale(lang);
		// Localize the current URL and navigate to it to preserve the page
		const newUrl = localizeUrl(window.location.href, { locale: lang });
		window.location.href = newUrl.href;
	}

	import './layout.css';
	import { Gb, Id, Cn, Jp, Kr } from 'svelte-flag-icons';
	import { Home, Menu, User, ChevronDown, ChevronRight, BookOpen, Map, LogOut, ArrowRight, BrainCircuit, Plus, BookText, Pickaxe, Factory } from 'lucide-svelte';
	import { page } from '$app/state';
	import { settingsStore } from '$lib/state/settings.svelte.js';
	import { resetSearchStore, searchStore } from '$lib/state/search.svelte.js';
	import { compareStore } from '$lib/state/compare.svelte';
	import logoWhite from '$lib/assets/investika-white.png';
	import investikaBlue from '$lib/assets/investika-blue.png';
	import aiIncubation from '$lib/assets/logos/ai-incubation.png';
	import bkpmLogo from '$lib/assets/logos/bkpm-logo.png';
	import britishEmbassy from '$lib/assets/logos/british-embassy.png';
	import ukDev from '$lib/assets/logos/uk-dev.png';
	import ukIdTechHub from '$lib/assets/logos/uk-id-tech-hub.png';
	
	let { data, children } = $props();

	const user = $derived(data.user);
	const isAuthenticated = $derived(!!data.session || data.isProtoAuth);

	let isSidebarOpen = $state(true);
	let isLangMenuOpen = $state(false);
	let isProfileMenuOpen = $state(false);
	let isAuthPage = $derived(
		page.url.pathname === '/login' || 
		page.url.pathname === '/onboarding' ||
		/^\/(en|id|zh|ja|ko)\/(login|onboarding)$/.test(page.url.pathname)
	);
	let pathSegments = $derived(page.url.pathname.split('/').filter(Boolean));
	let isOverviewPage = $derived(
		page.url.pathname === '/' ||
		/^\/(id|zh|ja|ko)$/.test(page.url.pathname) ||
		/^\/(id|zh|ja|ko)?\/?project\/[^/]+$/.test(page.url.pathname) ||
		/^\/project\/[^/]+$/.test(page.url.pathname)
	);

	let isRegionsPage = $derived(page.url.pathname.endsWith('/regions') || page.url.pathname === '/regions');
	let isComparePage = $derived(page.url.pathname.endsWith('/compare') || page.url.pathname === '/compare');
	let isPoliciesPage = $derived(page.url.pathname.endsWith('/policies') || page.url.pathname === '/policies');
	let isWikiPage = $derived(page.url.pathname.endsWith('/wiki') || page.url.pathname === '/wiki');
	let isSubmitPage = $derived(page.url.pathname.endsWith('/submit') || page.url.pathname === '/submit');

	let displaySegments = $derived(pathSegments.filter(s => !['en', 'id', 'zh', 'ja', 'ko'].includes(s.toLowerCase())));
</script>

<svelte:head>
	<title>Investika</title>
	<link rel="icon" type="image/png" href={investikaBlue} />
	<link rel="apple-touch-icon" href={investikaBlue} />
</svelte:head>

{#if isAuthPage}
	<main class="min-h-screen w-full bg-white font-sans text-slate-900">
		{@render children()}
	</main>
{:else}
	<div class="flex h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
	<!-- Sidebar (Expanded/Collapsed) -->
	<aside
		class="flex h-full flex-col bg-bkpm-blue transition-all duration-300 ease-in-out shadow-xl z-20 overflow-hidden shrink-0"
		class:w-56={isSidebarOpen}
		class:w-16={!isSidebarOpen}
	>
		<!-- Logo Area -->
		<div class="flex h-16 items-center px-4 whitespace-nowrap mb-2 mt-2">
			<button 
				class="flex items-center group cursor-pointer border-none bg-transparent p-0 focus:outline-none" 
				onclick={() => { 
					resetSearchStore();
					if (window.location.pathname !== '/') window.location.href = '/';
				}}
			>
				<img 
					src={logoWhite} 
					alt="Investika" 
					class="h-11 w-auto brightness-0 invert transition-all duration-300 group-hover:scale-105"
					class:mr-2.5={isSidebarOpen}
				/>
				<span class="text-xl font-black tracking-tighter text-white transition-opacity duration-300 overflow-hidden uppercase" 
					class:opacity-0={!isSidebarOpen}
					class:w-0={!isSidebarOpen}>Investika</span>
			</button>
		</div>

		<!-- Nav -->
		<nav class="mt-1 flex-1 space-y-1 px-2.5 overflow-hidden">
			<!-- 1. Overview -->
			<a
				href={localizeUrl('/', { locale: getLocale() }).pathname}
				title={m.nav_home_tooltip()}
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
					{isOverviewPage ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Home
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors {!isSidebarOpen ? '' : 'mr-3'}
						{isOverviewPage ? 'text-white' : 'text-white/70 group-hover:text-white'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_overview()}
				</span>
			</a>

			<!-- 2. Regions -->
			<a
				href="/regions"
				title={m.nav_regions_tooltip()}
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
					{isRegionsPage ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Map
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors {!isSidebarOpen ? '' : 'mr-3'}
						{isRegionsPage ? 'text-white' : 'text-white/50 group-hover:text-white'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_regions()}
				</span>
			</a>

			<!-- 3. AI Compare -->
			<a
				href="/compare"
				title={m.nav_compare_tooltip()}
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
					{isComparePage ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<div class="relative {!isSidebarOpen ? '' : 'mr-3'} shrink-0">
					<BrainCircuit
						size={18}
						strokeWidth={2.5}
						class="transition-colors {isComparePage ? 'text-white' : 'text-white/50 group-hover:text-white'}"
					/>
				</div>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_compare()}
					{#if compareStore.projects.length > 0}
						<span class="ml-1.5 inline-flex items-center justify-center h-4 px-1.5 rounded-full font-black {isComparePage ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50 group-hover:bg-white/20 group-hover:text-white'} text-[8px]">{compareStore.projects.length}/3</span>
					{/if}
				</span>
			</a>

			<div class="py-1 px-4 opacity-10"><div class="h-px bg-white/50"></div></div>

			<!-- 2.1 Commodities (Coming Soon) -->
			<div
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap opacity-30 cursor-not-allowed select-none"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Pickaxe
					size={18}
					strokeWidth={2.5}
					class="shrink-0 text-white/50 {!isSidebarOpen ? '' : 'mr-3'}"
				/>
				<span class="transition-opacity duration-300 flex items-center gap-2" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_commodities()}
					<span class="text-[7px] bg-white/20 text-white px-1 py-0.5 rounded font-black uppercase tracking-tighter">Soon</span>
				</span>
			</div>

			<!-- 2.2 Downstreaming (Coming Soon) -->
			<div
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap opacity-30 cursor-not-allowed select-none"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Factory
					size={18}
					strokeWidth={2.5}
					class="shrink-0 text-white/50 {!isSidebarOpen ? '' : 'mr-3'}"
				/>
				<span class="transition-opacity duration-300 flex items-center gap-2" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_downstreaming()}
					<span class="text-[7px] bg-white/20 text-white px-1 py-0.5 rounded font-black uppercase tracking-tighter">Soon</span>
				</span>
			</div>

			<div class="py-2 opacity-10"><div class="h-px bg-white"></div></div>

			<!-- 4. Policies -->
			<a
				href="/policies"
				title={m.nav_policies_tooltip()}
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
					{isPoliciesPage ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<BookOpen
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors {!isSidebarOpen ? '' : 'mr-3'}
						{isPoliciesPage ? 'text-white' : 'text-white/50 group-hover:text-white'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_policies()}
				</span>
			</a>

			<!-- 5. Wiki -->
			<a
				href="/wiki"
				title={m.nav_wiki_tooltip()}
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
					{isWikiPage ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<BookText
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors {!isSidebarOpen ? '' : 'mr-3'}
						{isWikiPage ? 'text-white' : 'text-white/50 group-hover:text-white'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_wiki()}
				</span>
			</a>

			<!-- 6. Submit Project -->
			<a
				href="/submit"
				title={m.nav_submit_tooltip()}
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
					{isSubmitPage ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Plus
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors {!isSidebarOpen ? '' : 'mr-3'}
						{isSubmitPage ? 'text-white' : 'text-white/70 group-hover:text-white'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_submit()}
				</span>
			</a>
		</nav>

		<!-- Partnership Branding - Auto Carousel -->
		<div class="border-t border-white/10 p-3 mb-0 bg-white/5 overflow-hidden">
			{#if isSidebarOpen}
				<span class="text-[7px] font-black text-white/30 uppercase tracking-wide whitespace-nowrap block mb-2">{m.nav_partnership()}</span>
				<div class="overflow-hidden">
					<div class="logo-carousel flex items-center gap-6">
						<!-- Duplicate set for seamless loop -->
						{#each [
							{ src: aiIncubation, alt: 'AI Incubation', cls: 'h-6 max-w-[72px]' },
							{ src: bkpmLogo, alt: 'BKPM', cls: 'h-9 max-w-[96px]' },
							{ src: britishEmbassy, alt: 'British Embassy', cls: 'h-9 max-w-[96px]' },
							{ src: ukDev, alt: 'UK Development', cls: 'h-6 max-w-[72px]' },
							{ src: ukIdTechHub, alt: 'UK-ID Tech Hub', cls: 'h-7 max-w-[80px]' },
							{ src: aiIncubation, alt: 'AI Incubation', cls: 'h-6 max-w-[72px]' },
							{ src: bkpmLogo, alt: 'BKPM', cls: 'h-9 max-w-[96px]' },
							{ src: britishEmbassy, alt: 'British Embassy', cls: 'h-9 max-w-[96px]' },
							{ src: ukDev, alt: 'UK Development', cls: 'h-6 max-w-[72px]' },
							{ src: ukIdTechHub, alt: 'UK-ID Tech Hub', cls: 'h-7 max-w-[80px]' },
						] as logo}
							<img src={logo.src} alt={logo.alt} class="w-auto object-contain shrink-0 brightness-0 invert opacity-50 hover:opacity-100 transition-opacity {logo.cls}" />
						{/each}
					</div>
				</div>
			{:else}
				<div class="flex justify-center">
					<img src={aiIncubation} alt="Partner" class="h-5 w-5 object-contain brightness-0 invert opacity-50" />
				</div>
			{/if}
		</div>
	</aside>

	<!-- Main Body -->
	<div class="flex flex-1 flex-col relative bg-white">
		<!-- Topbar -->
		<header class="flex h-16 items-center justify-between bg-white pl-8 pr-4 z-50 border-b border-slate-50 relative">
			<div class="flex items-center">
				<button
					onclick={() => (isSidebarOpen = !isSidebarOpen)}
					aria-label="Toggle sidebar"
					class="group rounded-xl p-2 hover:bg-slate-50 text-slate-400 transition-colors mr-3"
				>
					<Menu size={20} strokeWidth={2.5} class="transition-transform group-hover:scale-110" />
				</button>

				<!-- Breadcrumbs -->
				<div class="hidden md:flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
					<!-- Always show Dashboard first -->
					<a href="/?view=catalog" class="hover:text-bkpm-blue transition-colors underline decoration-bkpm-blue/30 underline-offset-4 {pathSegments.length === 0 || (pathSegments.length === 1 && ['en','id','zh','ja','ko'].includes(pathSegments[0])) ? 'text-bkpm-blue' : 'text-slate-400'}">
						{m.nav_dashboard()}
					</a>
					
					{#each displaySegments as segment, i}
						<ChevronRight size={12} class="mx-1.5 text-slate-300" strokeWidth={3} />
						
						{@const isLast = i === displaySegments.length - 1}
						{@const segmentHref = segment === 'project' ? '/?view=catalog' : `/${displaySegments.slice(0, i + 1).join('/')}`}
						
						{#if isLast}
							<span class="text-bkpm-blue truncate max-w-[300px]">
								{#if i === displaySegments.length - 1 && displaySegments[i-1] === 'project' && page.data.project?.nama}
									{page.data.project.nama}
								{:else if segment === 'regions'}
									{m.nav_regions()}
								{:else if segment === 'compare'}
									{m.nav_compare()}
								{:else if segment === 'policies'}
									{m.nav_policies()}
								{:else if segment === 'wiki'}
									{m.nav_wiki()}
								{:else if segment === 'submit'}
									{m.nav_submit()}
								{:else}
									{segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
								{/if}
							</span>
						{:else}
							<a 
								href={segmentHref} 
								class="text-slate-400 hover:text-bkpm-blue transition-colors underline decoration-bkpm-blue/0 hover:decoration-bkpm-blue/30 underline-offset-4"
							>
								{#if segment === 'regions'}
									{m.nav_regions()}
								{:else if segment === 'compare'}
									{m.nav_compare()}
								{:else if segment === 'policies'}
									{m.nav_policies()}
								{:else if segment === 'wiki'}
									{m.nav_wiki()}
								{:else if segment === 'submit'}
									{m.nav_submit()}
								{:else if segment === 'project'}
									{m.nav_projects()}
								{:else}
									{segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
								{/if}
							</a>
						{/if}
					{/each}
				</div>
			</div>

			<div class="flex items-center space-x-4">
				<!-- Language Dropdown Selector -->
				<div class="relative" role="group" aria-label="Language Selector">
					<button 
						onclick={() => isLangMenuOpen = !isLangMenuOpen}
						class="flex items-center bg-slate-50 hover:bg-slate-100 rounded-full pl-3 pr-2.5 py-1.5 space-x-2 border border-slate-200 transition-colors cursor-pointer"
						aria-label="Select Language"
					>
						{#if getLocale() === 'id'}
							<Id size="16" class="rounded-sm shadow-sm" />
							<span class="text-xs font-bold text-slate-700">ID</span>
						{:else if getLocale() === 'zh'}
							<Cn size="16" class="rounded-sm shadow-sm" />
							<span class="text-xs font-bold text-slate-700">ZH</span>
						{:else if getLocale() === 'ja'}
							<Jp size="16" class="rounded-sm shadow-sm" />
							<span class="text-xs font-bold text-slate-700">JA</span>
						{:else if getLocale() === 'ko'}
							<Kr size="16" class="rounded-sm shadow-sm" />
							<span class="text-xs font-bold text-slate-700">KO</span>
						{:else}
							<Gb size="16" class="rounded-sm shadow-sm" />
							<span class="text-xs font-bold text-slate-700">EN</span>
						{/if}
						<ChevronDown size={14} class="text-slate-400 ml-0.5 transition-transform {isLangMenuOpen ? 'rotate-180' : ''}" strokeWidth={3} />
					</button>

					{#if isLangMenuOpen}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-40" onclick={() => isLangMenuOpen = false}></div>
						<div 
							class="absolute right-0 top-full pt-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-200"
							role="menu"
							tabindex="-1"
						>
							<div class="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2">
							<button onclick={() => { changeLanguage('en'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer {getLocale() === 'en' ? 'bg-slate-50' : ''}">
								<Gb size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'en' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">English</span>
							</button>
							<button onclick={() => { changeLanguage('id'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer {getLocale() === 'id' ? 'bg-slate-50' : ''}">
								<Id size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'id' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">Bahasa</span>
							</button>
							<button onclick={() => { changeLanguage('zh'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer {getLocale() === 'zh' ? 'bg-slate-50' : ''}">
								<Cn size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'zh' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">中文</span>
							</button>
							<button onclick={() => { changeLanguage('ja'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer {getLocale() === 'ja' ? 'bg-slate-50' : ''}">
								<Jp size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'ja' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">日本語</span>
							</button>
							<button onclick={() => { changeLanguage('ko'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer {getLocale() === 'ko' ? 'bg-slate-50' : ''}">
								<Kr size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'ko' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">한국어</span>
							</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- Profile Section -->
				<div class="relative" role="group" aria-label="Profile Menu">
					<button 
						onclick={() => isProfileMenuOpen = !isProfileMenuOpen}
						class="flex items-center space-x-4 pl-4 border-l border-slate-100 group cursor-pointer"
					>
						<div class="flex flex-col items-end">
							<span class="text-xs font-black text-bkpm-blue group-hover:text-logo-green transition-colors">
								{isAuthenticated ? (user?.name || m.auth_default_user()) : m.nav_guest()}
							</span>
							<span class="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
								{isAuthenticated ? m.auth_authenticated() : m.auth_public()}
							</span>
						</div>
						<div class="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-bkpm-blue/20 group-hover:bg-bkpm-blue/5 group-hover:text-bkpm-blue transition-all">
							<User size={20} strokeWidth={2.5} />
						</div>
					</button>

					{#if isProfileMenuOpen}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-40" onclick={() => isProfileMenuOpen = false}></div>
						<div 
							class="absolute right-0 top-full pt-2 w-64 z-50 animate-in fade-in zoom-in-95 duration-200"
							role="menu"
							tabindex="-1"
						>
							<div class="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 py-3 overflow-hidden">
								<!-- Profile Link -->
								<a href="/profile" class="flex items-center space-x-3 px-5 py-2.5 hover:bg-slate-50 transition-colors group">
									<div class="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-bkpm-blue/10 group-hover:text-bkpm-blue transition-colors">
										<User size={14} strokeWidth={2.5} />
									</div>
									<span class="text-xs font-bold text-slate-600">{m.profile_details()}</span>
								</a>

								<div class="h-[1px] bg-slate-50 my-2 mx-5"></div>

								<!-- Settings Section -->
								<div class="px-5 py-2">
									<!-- Follow Language Currency -->
									<div class="flex items-center justify-between mb-4">
										<div class="flex flex-col">
											<span class="text-[11px] font-black text-slate-700">{m.settings_currency_title()}</span>
											<span class="text-[9px] font-medium text-slate-400">{m.settings_currency_desc()}</span>
										</div>
										<button 
											onclick={() => settingsStore.followLanguageCurrency = !settingsStore.followLanguageCurrency}
											class="w-8 h-4.5 rounded-full relative transition-colors cursor-pointer {settingsStore.followLanguageCurrency ? 'bg-bkpm-blue' : 'bg-slate-200'}"
											aria-label="Toggle Auto-Currency"
										>
											<div class="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform {settingsStore.followLanguageCurrency ? 'translate-x-3.5' : 'translate-x-0'}"></div>
										</button>
									</div>

									<!-- Disable Personalization -->
									<div class="flex items-center justify-between">
										<div class="flex flex-col">
											<span class="text-[11px] font-black text-slate-700">{m.settings_privacy_title()}</span>
											<span class="text-[9px] font-medium text-slate-400">{m.settings_privacy_desc()}</span>
										</div>
										<button 
											onclick={() => settingsStore.disablePersonalization = !settingsStore.disablePersonalization}
											class="w-8 h-4.5 rounded-full relative transition-colors cursor-pointer {settingsStore.disablePersonalization ? 'bg-bkpm-blue' : 'bg-slate-200'}"
											aria-label="Toggle Privacy Mode"
										>
											<div class="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform {settingsStore.disablePersonalization ? 'translate-x-3.5' : 'translate-x-0'}"></div>
										</button>
									</div>
								</div>

								<div class="h-[1px] bg-slate-50 my-2 mx-5"></div>

								<!-- Logout -->
								<div class="px-2">
									{#if isAuthenticated}
										<button 
											onclick={() => {
												document.cookie = "proto_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
												window.location.href = '/login';
											}}
											class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors group cursor-pointer"
										>
											<div class="p-1.5 rounded-lg bg-red-50 text-red-400 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
												<LogOut size={14} strokeWidth={2.5} />
											</div>
											<span class="text-xs font-black uppercase tracking-wide">{m.nav_logout()}</span>
										</button>
									{:else}
										<a 
											href="/login" 
											class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-bkpm-blue/5 text-bkpm-blue transition-colors group cursor-pointer"
										>
											<div class="p-1.5 rounded-lg bg-bkpm-blue/5 text-bkpm-blue group-hover:bg-bkpm-blue/10 transition-colors">
												<ArrowRight size={14} strokeWidth={2.5} />
											</div>
											<span class="text-xs font-black uppercase tracking-wide">{m.nav_sign_in()}</span>
										</a>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto overflow-x-hidden bg-white">
			{@render children()}
		</main>
	</div>
</div>
{/if}
