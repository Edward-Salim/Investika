<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { setLocale, getLocale } from '$lib/paraglide/runtime.js';
	
	function changeLanguage(lang: "en" | "id" | "zh" | "ja" | "ko") {
		setLocale(lang);
		// Simple reload to apply Paraglide JS changes across the app
		window.location.reload();
	}

	import './layout.css';
	import { Gb, Id, Cn, Jp, Kr } from 'svelte-flag-icons';
	import { Home, Menu, User, ChevronDown, BookOpen, Map } from 'lucide-svelte';
	import { page } from '$app/state';
	import logoWhite from '$lib/assets/investika-white.png';
	import aiIncubation from '$lib/assets/logos/ai-incubation.png';
	
	let { children } = $props();

	let isSidebarOpen = $state(true);
	let isLangMenuOpen = $state(false);
	let isAuthPage = $derived(page.url.pathname === '/login' || page.url.pathname === '/onboarding');
</script>

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
			<div class="flex items-center">
				<img 
					src={logoWhite} 
					alt="Investika" 
					class="h-11 w-auto brightness-0 invert transition-all duration-300"
					class:mr-2.5={isSidebarOpen}
				/>
				<span class="text-xl font-black tracking-tighter text-white transition-opacity duration-300 overflow-hidden uppercase" 
					class:opacity-0={!isSidebarOpen}
					class:w-0={!isSidebarOpen}>Investika</span>
			</div>
		</div>

		<!-- Nav -->
		<nav class="mt-1 flex-1 space-y-1 px-2.5 overflow-hidden">
			<a
				href="/"
				title="Home"
				class="group flex items-center rounded-xl bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 whitespace-nowrap"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Home
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors text-white/70 group-hover:text-white {!isSidebarOpen ? '' : 'mr-3'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_overview()}
				</span>
			</a>
			<a
				href="/policies"
				title="Policies"
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white whitespace-nowrap"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<BookOpen
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors text-white/50 group-hover:text-white {!isSidebarOpen ? '' : 'mr-3'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					{m.nav_policies()}
				</span>
			</a>
			<a
				href="/regions"
				title="Regions"
				class="group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white whitespace-nowrap"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<Map
					size={18}
					strokeWidth={2.5}
					class="shrink-0 transition-colors text-white/50 group-hover:text-white {!isSidebarOpen ? '' : 'mr-3'}"
				/>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					Regions
				</span>
			</a>
		</nav>

		<!-- Partnership Branding (Tightened) -->
		<div class="border-t border-white/10 p-4 mb-0 overflow-hidden bg-white/5">
			<div class="flex flex-col space-y-2" class:items-center={!isSidebarOpen}>
				<span class="text-[7px] font-black text-white/30 uppercase tracking-wide whitespace-nowrap"
					class:opacity-0={!isSidebarOpen}
					class:h-0={!isSidebarOpen}>{m.nav_partnership()}</span>
				
				<div class="group relative flex items-center transition-all">
					<img 
						src={aiIncubation} 
						alt="AI Incubation" 
						class="h-auto w-full max-w-[85px] brightness-0 invert opacity-60 group-hover:opacity-100 transition-all"
						class:max-w-[24px]={!isSidebarOpen}
					/>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Body -->
	<div class="flex flex-1 flex-col relative overflow-hidden bg-white">
		<!-- Topbar -->
		<header class="flex h-16 items-center justify-between bg-white pl-8 pr-4 z-10 border-b border-slate-50">
			<div class="flex items-center space-x-4">
				<button
					onclick={() => (isSidebarOpen = !isSidebarOpen)}
					aria-label="Toggle sidebar"
					class="group rounded-xl p-2 hover:bg-slate-50 text-slate-400 transition-colors"
				>
					<Menu size={20} strokeWidth={2.5} class="transition-transform group-hover:scale-110" />
				</button>
			</div>

			<div class="flex items-center space-x-4">
				<!-- Language Dropdown Selector -->
				<div class="relative">
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
						<div 
							class="absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
							role="menu"
							onmouseleave={() => isLangMenuOpen = false}
						>
							<button onclick={() => { changeLanguage('en'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors {getLocale() === 'en' ? 'bg-slate-50' : ''}">
								<Gb size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'en' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">English</span>
							</button>
							<button onclick={() => { changeLanguage('id'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors {getLocale() === 'id' ? 'bg-slate-50' : ''}">
								<Id size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'id' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">Bahasa</span>
							</button>
							<button onclick={() => { changeLanguage('zh'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors {getLocale() === 'zh' ? 'bg-slate-50' : ''}">
								<Cn size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'zh' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">中文</span>
							</button>
							<button onclick={() => { changeLanguage('ja'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors {getLocale() === 'ja' ? 'bg-slate-50' : ''}">
								<Jp size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'ja' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">日本語</span>
							</button>
							<button onclick={() => { changeLanguage('ko'); isLangMenuOpen = false; }} class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-slate-50 transition-colors {getLocale() === 'ko' ? 'bg-slate-50' : ''}">
								<Kr size="16" class="rounded-sm shadow-sm" />
								<span class="text-xs font-bold {getLocale() === 'ko' ? 'text-bkpm-blue font-black' : 'text-slate-600'}">한국어</span>
							</button>
						</div>
					{/if}
				</div>

				<!-- Profile Section -->
				<div class="flex items-center space-x-4 pl-4 border-l border-slate-100">
					<div class="flex flex-col items-end">
						<a href="/login" class="text-xs font-black text-bkpm-blue hover:text-logo-green transition-colors">{m.nav_sign_in()}</a>
						<span class="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{m.nav_guest()}</span>
					</div>
					<div class="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
						<User size={20} strokeWidth={2.5} />
					</div>
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
