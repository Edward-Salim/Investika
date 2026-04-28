<script lang="ts">
	let inputValue = $state('');
	let isSearching = $state(false);

	const quickLinks = [
		'Show renewable energy projects',
		'Explain Tax Holiday policy',
		'Check logistics connectivity in IKN',
		'Connect with a BKPM representative'
	];

	const mockProjects = [
		{
			title: 'Nusa Penida Wind Farm',
			category: 'Renewable Energy',
			status: 'Ready to Offer',
			location: 'Bali, Indonesia',
			investment: '$120M',
			image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400'
		},
		{
			title: 'IKN Smart Logistics Hub',
			category: 'Infrastructure',
			status: 'MoU Signed',
			location: 'East Kalimantan',
			investment: '$450M',
			image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400'
		},
		{
			title: 'Java Sea Seaweed Farm',
			category: 'Blue Economy',
			status: 'Preliminary',
			location: 'West Java',
			investment: '$45M',
			image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400'
		},
		{
			title: 'Surabaya Port Expansion',
			category: 'Logistics',
			status: 'In Progress',
			location: 'East Java',
			investment: '$2.1B',
			image: 'https://images.unsplash.com/photo-1577705998148-ebbd7a31962e?auto=format&fit=crop&q=80&w=400'
		}
	];

	function handleSearch() {
		if (inputValue.trim()) {
			isSearching = true;
		}
	}

	function autosize(node: HTMLTextAreaElement) {
		const update = () => {
			node.style.height = 'auto';
			node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
		};
		node.addEventListener('input', update);
		update();
		return {
			destroy() {
				node.removeEventListener('input', update);
			}
		};
	}
</script>

<div class="w-full h-full flex flex-col items-center px-4 md:px-8 transition-all duration-700 overflow-x-hidden {isSearching ? 'pt-8' : 'justify-center pb-24'}">
	
	<!-- BKPM Emblem and Branded Greeting -->
	{#if !isSearching}
		<div class="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div class="mb-2 flex justify-center">
				<img 
					src="/assets/logos/bkpm-emblem.png" 
					alt="BKPM Emblem" 
					class="h-24 w-auto transition-transform hover:scale-105"
				/>
			</div>
			<h1 class="text-4xl font-black tracking-tighter text-slate-900 sm:text-6xl leading-[1.1]">
				Investment <span class="text-bkpm-blue underline decoration-logo-green/40 underline-offset-8 decoration-8">Concierge</span>
			</h1>
			<p class="mt-4 text-lg font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
				How can I help you navigate the Indonesian investment landscape today?
			</p>
		</div>
	{:else}
		<div class="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-500 max-w-[1400px]">
			<!-- AI Summary (More robust text wrapping) -->
			<div class="rounded-2xl bg-slate-50/40 border border-slate-100 p-6 shadow-sm backdrop-blur-sm">
				<div class="flex items-center space-x-2 mb-3">
					<div class="h-6 w-6 rounded-lg bg-bkpm-blue flex items-center justify-center shadow-lg shadow-bkpm-blue/20">
						<svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<span class="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">AI Intelligence</span>
				</div>
				<div class="text-sm font-semibold text-slate-600 leading-relaxed max-w-5xl break-words">
					Based on your interest in <span class="text-bkpm-blue font-black break-all">"{inputValue}"</span>, I've identified key strategic projects. The current investment climate for this sector is highly favorable, with new <span class="text-logo-green">Tax Holiday</span> incentives available for projects exceeding $100M.
				</div>
			</div>
		</div>
	{/if}

	<!-- Refined AI Input Box -->
	<div class="w-full transition-all duration-500 {isSearching ? 'mb-8 max-w-4xl' : 'max-w-2xl'}">
		<div class="group relative flex items-start rounded-3xl bg-white p-2 shadow-2xl shadow-slate-200/50 transition-all border border-slate-100 focus-within:border-bkpm-blue/30 focus-within:ring-4 focus-within:ring-bkpm-blue/5">
			
			<textarea
				use:autosize
				bind:value={inputValue}
				onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
				placeholder="Ask anything about investment..."
				class="flex-1 resize-none border-0 bg-transparent px-5 py-3 text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 min-h-[48px] overflow-y-auto scrollbar-hide break-words"
				rows="1"
			></textarea>

			<button 
				onclick={handleSearch}
				aria-label="Send message"
				class="mt-1 mr-1 rounded-2xl p-3.5 transition-all duration-300 shadow-sm shrink-0
				{inputValue ? 'bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20 scale-100' : 'bg-slate-50 text-slate-200'}"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</div>

		{#if !isSearching}
			<div class="mt-8 flex flex-wrap justify-center gap-2 animate-in fade-in duration-700">
				{#each quickLinks as link}
					<button 
						onclick={() => { inputValue = link; handleSearch(); }}
						class="rounded-xl border border-slate-100 bg-white px-4 py-1.5 text-[10px] font-bold text-slate-400 transition-all hover:border-logo-green/30 hover:text-bkpm-blue hover:shadow-md hover:-translate-y-0.5"
					>
						{link}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if isSearching}
		<!-- Project Cards Grid (Better column control to prevent overflow) -->
		<div class="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-[1400px] mb-12">
			{#each mockProjects as project}
				<div class="group relative bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
					<div class="flex space-x-4">
						<div class="h-16 w-16 rounded-xl overflow-hidden shrink-0 shadow-inner bg-slate-50">
							<img src={project.image} alt={project.title} class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
						</div>
						<div class="flex-1 min-w-0 flex flex-col justify-center">
							<div class="flex items-center justify-between mb-0.5">
								<span class="text-[7px] font-black text-logo-green uppercase tracking-widest">{project.category}</span>
								<span class="text-[7px] font-bold px-1.5 py-0.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">{project.status}</span>
							</div>
							<h3 class="text-sm font-black text-slate-900 truncate mb-1">{project.title}</h3>
							<div class="flex items-center space-x-3 text-[9px] font-bold text-slate-400">
								<div class="flex items-center">
									<svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									</svg>
									<span class="truncate">{project.location}</span>
								</div>
								<div class="flex items-center text-bkpm-blue/70 shrink-0">
									<svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15" />
									</svg>
									{project.investment}
								</div>
							</div>
						</div>
					</div>
					<button class="mt-4 w-full py-2.5 bg-slate-50 group-hover:bg-bkpm-blue group-hover:text-white rounded-xl text-[9px] font-black text-slate-400 transition-all uppercase tracking-wider">
						Detailed Prospectus
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
