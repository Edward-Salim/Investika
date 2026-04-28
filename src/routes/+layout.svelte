<script lang="ts">
	import './layout.css';
	import { Gb, Id, Cn, Jp, Kr } from 'svelte-flag-icons';
	let { children } = $props();

	let isSidebarOpen = $state(true);
</script>

<div class="flex h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
	<!-- Sidebar (Expanded/Collapsed) -->
	<aside
		class="flex h-full flex-col bg-bkpm-blue transition-all duration-300 ease-in-out shadow-xl z-20 overflow-hidden"
		class:w-64={isSidebarOpen}
		class:w-20={!isSidebarOpen}
	>
		<!-- Logo Area -->
		<div class="flex h-16 items-center px-6 whitespace-nowrap">
			<div class="flex items-center min-w-[32px]">
				<span class="text-xl font-black tracking-tighter text-white transition-opacity duration-300" 
					class:opacity-0={!isSidebarOpen}
					class:w-0={!isSidebarOpen}>INVESTIKA</span>
				<div class="ml-1.5 h-2.5 w-2.5 rounded-full bg-logo-green shadow-[0_0_8px_rgba(68,181,73,0.8)] shrink-0"
					class:ml-1={!isSidebarOpen}></div>
			</div>
		</div>

		<!-- Nav -->
		<nav class="mt-4 flex-1 space-y-1 px-3 overflow-hidden">
			<a
				href="/"
				title="Home"
				class="group flex items-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 whitespace-nowrap"
				class:justify-center={!isSidebarOpen}
				class:px-0={!isSidebarOpen}
			>
				<svg
					class="h-5 w-5 shrink-0 transition-colors text-white/70 group-hover:text-white"
					class:mr-3={isSidebarOpen}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				<span class="transition-opacity duration-300" class:opacity-0={!isSidebarOpen} class:w-0={!isSidebarOpen}>
					Home
				</span>
			</a>
		</nav>

		<!-- Partnership Branding (Improved Spacing) -->
		<div class="border-t border-white/10 p-6 mb-2 overflow-hidden bg-white/5">
			<div class="flex flex-col space-y-3" class:items-center={!isSidebarOpen}>
				<span class="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] whitespace-nowrap"
					class:opacity-0={!isSidebarOpen}
					class:h-0={!isSidebarOpen}>In Partnership With</span>
				
				<div class="group relative flex items-center transition-all px-1">
					<img 
						src="/assets/logos/ai-incubation.png" 
						alt="AI Incubation" 
						class="h-auto w-full max-w-[120px] invert brightness-200 grayscale group-hover:grayscale-0 transition-all"
						class:max-w-[32px]={!isSidebarOpen}
					/>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Body -->
	<div class="flex flex-1 flex-col relative overflow-hidden bg-white">
		<!-- Topbar -->
		<header class="flex h-16 items-center justify-between bg-white px-8 z-10 border-b border-slate-50">
			<div class="flex items-center space-x-4">
				<button
					onclick={() => (isSidebarOpen = !isSidebarOpen)}
					aria-label="Toggle sidebar"
					class="group rounded-xl p-2 hover:bg-slate-50 text-slate-400 transition-colors"
				>
					<svg class="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>

			<div class="flex items-center space-x-8">
				<!-- Language Selector -->
				<div class="flex items-center bg-slate-50 rounded-full px-4 py-1.5 space-x-3 border border-slate-100">
					<button class="flex items-center space-x-1.5 group" aria-label="Change language to English">
						<Gb size="14" class="rounded-sm shadow-sm group-hover:scale-110 transition-transform" />
						<span class="text-[10px] font-bold text-slate-400 group-hover:text-bkpm-blue transition-colors">EN</span>
					</button>
					<div class="h-2.5 w-[1px] bg-slate-200"></div>
					<button class="flex items-center space-x-1.5 group" aria-label="Change language to Indonesian">
						<Id size="14" class="rounded-sm shadow-sm group-hover:scale-110 transition-transform" />
						<span class="text-[10px] font-black text-bkpm-blue">ID</span>
					</button>
					<div class="h-2.5 w-[1px] bg-slate-200"></div>
					<button class="flex items-center space-x-1.5 group" aria-label="Change language to Chinese">
						<Cn size="14" class="rounded-sm shadow-sm group-hover:scale-110 transition-transform" />
						<span class="text-[10px] font-bold text-slate-400 group-hover:text-bkpm-blue transition-colors">ZH</span>
					</button>
					<div class="h-2.5 w-[1px] bg-slate-200"></div>
					<button class="flex items-center space-x-1.5 group" aria-label="Change language to Japanese">
						<Jp size="14" class="rounded-sm shadow-sm group-hover:scale-110 transition-transform" />
						<span class="text-[10px] font-bold text-slate-400 group-hover:text-bkpm-blue transition-colors">JA</span>
					</button>
					<div class="h-2.5 w-[1px] bg-slate-200"></div>
					<button class="flex items-center space-x-1.5 group" aria-label="Change language to Korean">
						<Kr size="14" class="rounded-sm shadow-sm group-hover:scale-110 transition-transform" />
						<span class="text-[10px] font-bold text-slate-400 group-hover:text-bkpm-blue transition-colors">KO</span>
					</button>
				</div>

				<!-- Profile Section -->
				<div class="flex items-center space-x-4 pl-4 border-l border-slate-100">
					<div class="flex flex-col items-end">
						<span class="text-xs font-bold text-slate-900 leading-tight">Guest User</span>
						<span class="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Visitor</span>
					</div>
					<div class="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
						</svg>
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
