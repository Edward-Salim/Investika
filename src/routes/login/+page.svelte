<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { setLocale, getLocale, localizeUrl } from '$lib/paraglide/runtime.js';
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Loader2, ShieldCheck, TrendingUp, Landmark, ChevronDown, ArrowRight, Check } from 'lucide-svelte';
	import { Gb, Id, Cn, Jp, Kr } from 'svelte-flag-icons';
	import logoWhite from '$lib/assets/investika-white.png';
	import bkpmEmblem from '$lib/assets/logos/bkpm-emblem.png';
	import aiIncubation from '$lib/assets/logos/ai-incubation.png';
	import bkpmLogo from '$lib/assets/logos/bkpm-logo.png';
	import britishEmbassy from '$lib/assets/logos/british-embassy.png';
	import ukDev from '$lib/assets/logos/uk-dev.png';
	import ukIdTechHub from '$lib/assets/logos/uk-id-tech-hub.png';
	
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let isLangMenuOpen = $state(false);

	function changeLanguage(lang: "en" | "id" | "zh" | "ja" | "ko") {
		setLocale(lang);
		// Localize current URL to preserve page
		const newUrl = localizeUrl(window.location.href, { locale: lang });
		window.location.href = newUrl.href;
	}

	function handleLogin(e: Event) {
		e.preventDefault();
		isLoading = true;
		
		// Set a mock cookie for prototype persistence across refreshes
		document.cookie = "proto_auth=true; path=/; max-age=2592000";
		
		// Simulate login
		setTimeout(() => {
			goto('/onboarding');
		}, 1500);
	}
</script>

<svelte:head>
	<title>Login | Investika</title>
</svelte:head>

<div class="fixed inset-0 flex overflow-hidden bg-white">
	<!-- Left Side: Visual / Branding -->
	<div class="hidden lg:flex lg:w-1/2 relative bg-bkpm-blue items-center justify-center overflow-hidden">
		<!-- Decorative Elements -->
		<div class="absolute inset-0 opacity-20">
			<div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-logo-green blur-3xl"></div>
			<div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
		</div>
		
		<div class="relative z-10 p-12 text-white max-w-xl">
			<div class="flex items-center space-x-2 mb-8">
				<img 
					src={logoWhite} 
					alt="Investika" 
					class="h-12 w-auto brightness-0 invert"
				/>
				<span class="text-2xl font-black tracking-tighter text-white uppercase">Investika</span>
			</div>
			<h1 class="text-5xl font-black tracking-tighter leading-tight mb-6">
				{m.login_hero_title1()} <span class="text-logo-green">{m.login_hero_title2()}</span> {m.login_hero_title3()}
			</h1>
			<p class="text-xl font-medium text-white/80 leading-relaxed mb-12">
				{m.login_hero_subtitle()}
			</p>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
					<div class="flex items-center space-x-3 mb-2 opacity-60">
						<TrendingUp size={16} strokeWidth={2.5} />
						<div class="text-[10px] font-black uppercase tracking-tight leading-none">{m.login_stat1_title()}</div>
					</div>
					<div class="text-2xl font-bold leading-none">$21.4B+</div>
				</div>
				<div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
					<div class="flex items-center space-x-3 mb-2 opacity-60">
						<Landmark size={16} strokeWidth={2.5} />
						<div class="text-[10px] font-black uppercase tracking-tight leading-none">{m.login_stat2_title()}</div>
					</div>
					<div class="text-2xl font-bold leading-none">140+</div>
				</div>
			</div>
		</div>

		<!-- Subtle pattern overlay -->
		<div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');"></div>
	</div>

	<!-- Right Side: Login Form -->
	<div class="w-full lg:w-1/2 flex flex-col bg-slate-50/50 relative">
		
		<!-- Language Dropdown Selector (Absolute Top Right) -->
		<div class="absolute top-8 right-8 z-50">
			<div class="relative z-50" role="group" aria-label="Language Selector">
				<button 
					onclick={() => isLangMenuOpen = !isLangMenuOpen}
					class="flex items-center bg-white hover:bg-slate-50 rounded-full px-4 py-2 space-x-2 border border-slate-200 transition-colors cursor-pointer shadow-sm"
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
					<ChevronDown size={14} class="text-slate-400 ml-1 transition-transform {isLangMenuOpen ? 'rotate-180' : ''}" strokeWidth={3} />
				</button>

				{#if isLangMenuOpen}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fixed inset-0 z-40" onclick={() => isLangMenuOpen = false}></div>
					<div 
						class="absolute right-0 top-full pt-2 w-32 z-50 animate-in fade-in zoom-in-95 duration-200"
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
		</div>

		<!-- Main Form Content (Absolute Centered) -->
		<div class="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none">
			<div class="max-w-md w-full mx-auto pointer-events-auto" in:fly={{ y: 20, duration: 800 }}>
				<div class="lg:hidden mb-12">
					<div class="flex items-center space-x-1.5">
						<img src={logoWhite} alt="Investika" class="h-10 w-auto brightness-0" />
						<span class="text-xl font-black tracking-tighter text-slate-900 uppercase">Investika</span>
					</div>
				</div>

				<div class="mb-10">
					<h2 class="text-3xl font-black text-slate-900 tracking-tight mb-1">{m.login_welcome()}</h2>
					<p class="text-slate-500 font-medium">{m.login_subtitle()}</p>
				</div>

				<form onsubmit={handleLogin} class="space-y-5" novalidate>
					<div class="space-y-1.5">
						<label for="email" class="text-[10px] font-black uppercase tracking-tight block px-1 text-slate-400">{m.login_email_label()}</label>
						<input 
							id="email"
							type="email" 
							bind:value={email}
							placeholder={m.login_email_placeholder()}
							class="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-bkpm-blue focus:ring-4 focus:ring-bkpm-blue/5 transition-all outline-none font-bold text-slate-800 text-sm cursor-text placeholder:text-slate-300"
						/>
					</div>

					<div class="space-y-1.5">
						<div class="flex justify-between items-end px-1">
							<label for="password" class="text-[10px] font-black uppercase tracking-tight text-slate-400">{m.login_pass_label()}</label>
							<a href="/forgot-password" class="text-[10px] font-black uppercase tracking-tight text-bkpm-blue hover:text-logo-green transition-colors cursor-pointer">{m.login_forgot()}</a>
						</div>
						<input 
							id="password"
							type="password" 
							bind:value={password}
							placeholder="••••••••"
							class="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-bkpm-blue focus:ring-4 focus:ring-bkpm-blue/5 transition-all outline-none font-bold text-slate-800 tracking-wide text-sm cursor-text placeholder:text-slate-300"
						/>
					</div>

					<div class="flex items-center space-x-3 px-1 group cursor-pointer">
						<div class="relative w-5 h-5 flex items-center justify-center shrink-0">
							<input 
								type="checkbox" 
								id="remember" 
								class="peer appearance-none w-full h-full rounded-md border-2 border-slate-200 checked:bg-bkpm-blue checked:border-bkpm-blue transition-all cursor-pointer" 
							/>
							<Check 
								size={12} 
								strokeWidth={4} 
								class="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" 
							/>
						</div>
						<label for="remember" class="text-xs font-bold text-slate-500 cursor-pointer select-none group-hover:text-slate-700 transition-colors">{m.login_remember()}</label>
					</div>

					<button 
						type="submit" 
						class="w-full relative py-4 mt-4 bg-bkpm-blue text-white rounded-xl font-black uppercase text-xs tracking-wide shadow-xl shadow-bkpm-blue/30 hover:bg-bkpm-blue/90 hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer"
						disabled={isLoading}
					>
						{#if isLoading}
							<div class="flex items-center justify-center space-x-2" in:fade>
								<Loader2 size={16} class="animate-spin" />
								<span>{m.login_btn_loading()}</span>
							</div>
						{:else}
							<div class="flex items-center justify-center space-x-2" in:fade>
								<span>{m.login_btn_submit()}</span>
								<ArrowRight size={16} strokeWidth={3} />
							</div>
						{/if}
					</button>
				</form>

				<div class="mt-4 flex items-center justify-center space-x-2">
					<span class="text-xs font-bold text-slate-400">{m.login_new_to()}</span>
					<a href="/register" class="text-xs font-black text-bkpm-blue hover:underline cursor-pointer">{m.login_req_access()}</a>
				</div>
			</div>
		</div>

		<!-- Partners Section (Absolute Bottom) -->
		<div class="absolute bottom-0 left-0 right-0 py-8 border-t border-slate-100/60 overflow-hidden bg-slate-50/50">
			<div class="max-w-4xl mx-auto px-8 overflow-hidden flex items-center space-x-8">
				<span class="text-[9px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap shrink-0">{m.nav_partnership()}</span>
				<div class="relative flex-1 overflow-hidden">
					<div class="flex items-center space-x-12 animate-carousel grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 whitespace-nowrap">
						{#each [
							{ src: aiIncubation, alt: 'AI Incubation', h: 'h-6' },
							{ src: bkpmLogo, alt: 'BKPM', h: 'h-10' },
							{ src: britishEmbassy, alt: 'British Embassy', h: 'h-12' },
							{ src: ukDev, alt: 'UK Development', h: 'h-6' },
							{ src: ukIdTechHub, alt: 'UK-ID Tech Hub', h: 'h-8' },
							{ src: aiIncubation, alt: 'AI Incubation', h: 'h-6' },
							{ src: bkpmLogo, alt: 'BKPM', h: 'h-10' },
							{ src: britishEmbassy, alt: 'British Embassy', h: 'h-12' },
							{ src: ukDev, alt: 'UK Development', h: 'h-6' },
							{ src: ukIdTechHub, alt: 'UK-ID Tech Hub', h: 'h-8' }
						] as logo}
							<img src={logo.src} alt={logo.alt} class="{logo.h} w-auto inline-block shrink-0" />
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes carousel {
		0% { transform: translateX(0); }
		100% { transform: translateX(-50%); }
	}
	.animate-carousel {
		display: flex;
		width: fit-content;
		animation: carousel 10s linear infinite;
	}
	.animate-carousel:hover {
		animation-play-state: paused;
	}
</style>
