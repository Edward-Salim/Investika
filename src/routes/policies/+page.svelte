<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { 
		ArrowLeft, 
		Search,
		FileText,
		ShieldCheck,
		Scale,
		Landmark,
		Download,
		ChevronRight,
		BookOpen
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	
	let searchQuery = $state('');
</script>



<div class="min-h-screen bg-slate-50 font-sans pb-24" in:fade={{ duration: 300 }}>
	<!-- Hero Header -->
	<div class="bg-white border-b border-slate-200 relative overflow-hidden">
		<!-- Decorative Background -->
		<div class="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none bg-gradient-to-l from-bkpm-blue to-transparent"></div>
		
		<div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-16 relative z-10">
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
					{m.policy_title()}
				</h1>
				<p class="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-2xl">
					{m.policy_subtitle()}
				</p>
			</div>

			<!-- Search Bar -->
			<div class="mt-10 max-w-2xl relative" in:fly={{ y: 10, duration: 600, delay: 100 }}>
				<div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
					<Search size={20} class="text-slate-400" strokeWidth={2.5} />
				</div>
				<input 
					type="text" 
					bind:value={searchQuery}
					placeholder={m.policy_search()}
					class="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-bkpm-blue focus:ring-4 focus:ring-bkpm-blue/10 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 shadow-sm shadow-slate-200/50"
				/>
			</div>
		</div>

	<!-- Main Content Area -->
	<div class="max-w-7xl mx-auto px-6 lg:px-8 mt-12 md:mt-16">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
			
			<!-- Sidebar Navigation -->
			<div class="lg:col-span-1 hidden lg:block">
				<div class="sticky top-8 space-y-2">
					<button class="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-bkpm-blue font-black transition-colors cursor-pointer">
						<div class="flex items-center space-x-3">
							<Landmark size={18} strokeWidth={2.5} />
							<span>{m.policy_cat1()}</span>
						</div>
					</button>
					<button class="w-full flex items-center justify-between px-5 py-4 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer group">
						<div class="flex items-center space-x-3">
							<Scale size={18} strokeWidth={2.5} class="group-hover:text-logo-green transition-colors" />
							<span>{m.policy_cat2()}</span>
						</div>
					</button>
					<button class="w-full flex items-center justify-between px-5 py-4 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer group">
						<div class="flex items-center space-x-3">
							<ShieldCheck size={18} strokeWidth={2.5} class="group-hover:text-purple-500 transition-colors" />
							<span>{m.policy_cat3()}</span>
						</div>
					</button>
				</div>
			</div>

			<!-- Policy List -->
			<div class="lg:col-span-3 space-y-6">
				
				<!-- Policy Item 1 (Tax Holiday) -->
				<div class="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all p-8 group overflow-hidden relative cursor-pointer">
					<div class="absolute right-0 top-0 w-32 h-32 bg-logo-green/5 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
					
					<div class="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
						<div class="flex items-start space-x-5">
							<div class="w-14 h-14 rounded-2xl bg-logo-green/10 flex items-center justify-center text-logo-green shrink-0 group-hover:scale-110 transition-transform">
								<Landmark size={28} strokeWidth={2.5} />
							</div>
							<div>
								<div class="flex items-center space-x-3 mb-2">
									<h2 class="text-xl md:text-2xl font-black text-slate-900 group-hover:text-logo-green transition-colors tracking-tight">
										{m.policy_1_title()}
									</h2>
									<span class="px-2.5 py-0.5 rounded-md bg-logo-green text-white text-[10px] font-black uppercase tracking-wide">{m.policy_1_status()}</span>
								</div>
								<p class="text-slate-500 font-medium leading-relaxed max-w-2xl">
									{m.policy_1_desc()}
								</p>
							</div>
						</div>
						
						<button class="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-50 hover:bg-bkpm-blue hover:text-white text-slate-600 font-bold text-xs uppercase tracking-wide transition-colors shrink-0 border border-slate-100">
							<Download size={16} strokeWidth={2.5} />
							<span>{m.policy_download()}</span>
						</button>
					</div>
				</div>

				<!-- Policy Item 2 (SEZ) -->
				<div class="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all p-8 group overflow-hidden relative cursor-pointer">
					<div class="absolute right-0 top-0 w-32 h-32 bg-bkpm-blue/5 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
					
					<div class="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
						<div class="flex items-start space-x-5">
							<div class="w-14 h-14 rounded-2xl bg-bkpm-blue/10 flex items-center justify-center text-bkpm-blue shrink-0 group-hover:scale-110 transition-transform">
								<BookOpen size={28} strokeWidth={2.5} />
							</div>
							<div>
								<div class="flex items-center space-x-3 mb-2">
									<h2 class="text-xl md:text-2xl font-black text-slate-900 group-hover:text-bkpm-blue transition-colors tracking-tight">
										{m.policy_2_title()}
									</h2>
									<span class="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wide">{m.policy_2_status()}</span>
								</div>
								<p class="text-slate-500 font-medium leading-relaxed max-w-2xl">
									{m.policy_2_desc()}
								</p>
							</div>
						</div>
						
						<button class="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-50 hover:bg-bkpm-blue hover:text-white text-slate-600 font-bold text-xs uppercase tracking-wide transition-colors shrink-0 border border-slate-100">
							<Download size={16} strokeWidth={2.5} />
							<span>{m.policy_download()}</span>
						</button>
					</div>
				</div>

				<!-- Policy Item 3 (FDI Law - Core) -->
				<div class="bg-slate-900 rounded-[24px] shadow-xl shadow-bkpm-blue/20 transition-all p-8 group overflow-hidden relative cursor-pointer mt-4">
					<!-- BG Decor -->
					<div class="absolute -right-20 -top-20 w-64 h-64 bg-bkpm-blue blur-[100px] opacity-30 rounded-full"></div>
					<div class="absolute -left-20 -bottom-20 w-64 h-64 bg-logo-green blur-[100px] opacity-20 rounded-full"></div>
					
					<div class="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
						<div class="flex items-start space-x-5">
							<div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform border border-white/20 backdrop-blur-md">
								<Scale size={28} strokeWidth={2.5} />
							</div>
							<div>
								<div class="flex items-center space-x-3 mb-2">
									<h2 class="text-xl md:text-2xl font-black text-white group-hover:text-bkpm-blue transition-colors tracking-tight">
										{m.policy_3_title()}
									</h2>
									<span class="px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wide">{m.policy_3_status()}</span>
								</div>
								<p class="text-slate-300 font-medium leading-relaxed max-w-2xl">
									{m.policy_3_desc()}
								</p>
							</div>
						</div>
						
						<button class="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wide transition-colors shrink-0 shadow-lg">
							<FileText size={16} strokeWidth={2.5} />
							<span>{m.policy_download()}</span>
						</button>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
