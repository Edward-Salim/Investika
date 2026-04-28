<script lang="ts">
	import { Map, ChevronDown, BarChart2, Briefcase, Users, DollarSign, Activity, Factory } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
</script>



<div class="flex-1 flex min-h-0 bg-[#fbfbfb] overflow-y-auto p-8 lg:p-16 items-center justify-center">
	
	<div class="w-full max-w-[1200px] flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative">
		
		<!-- LEFT PANEL -->
		<div class="relative w-full max-w-[340px] rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] bg-white flex flex-col shrink-0 z-10" in:fly={{ x: -20, duration: 800 }}>
			
			<!-- Floating Map Icon -->
			<div class="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-[#2a348b] border-4 border-white flex items-center justify-center shadow-lg z-20">
				<Map size={20} strokeWidth={2.5} class="text-white" />
			</div>

			<!-- Blue Header -->
			<div class="bg-[#2a348b] rounded-t-xl pt-6 pb-6 px-8 flex items-center justify-between cursor-pointer hover:bg-[#2a348b]/90 transition-colors">
				<h2 class="text-lg font-medium text-white tracking-wide">Sulawesi Barat</h2>
				<ChevronDown size={16} strokeWidth={2.5} class="text-white/60" />
			</div>

			<!-- Stats List -->
			<div class="p-8 flex flex-col gap-6">
				<!-- Item 1 -->
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 shrink-0 rounded-full bg-[#2a348b] flex items-center justify-center shadow-md">
						<Briefcase size={14} class="text-white" strokeWidth={2.5} />
					</div>
					<div class="flex flex-col -mt-0.5">
						<span class="text-[13px] font-bold text-[#2a348b]">Peluang</span>
						<span class="text-[12px] font-medium text-slate-400">2 Proyek</span>
					</div>
				</div>

				<!-- Item 2 -->
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 shrink-0 rounded-full bg-[#2a348b] flex items-center justify-center shadow-md">
						<DollarSign size={14} class="text-white" strokeWidth={2.5} />
					</div>
					<div class="flex flex-col -mt-0.5">
						<span class="text-[13px] font-bold text-[#2a348b]">UMR 2025</span>
						<span class="text-[12px] font-medium text-slate-400">Rp 3.104.430</span>
					</div>
				</div>

				<!-- Item 3 -->
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 shrink-0 rounded-full bg-[#2a348b] flex items-center justify-center shadow-md">
						<Users size={14} class="text-white" strokeWidth={2.5} />
					</div>
					<div class="flex flex-col -mt-0.5">
						<span class="text-[13px] font-bold text-[#2a348b]">Jumlah Penduduk</span>
						<span class="text-[12px] font-medium text-slate-400">2.292.862 Jiwa</span>
					</div>
				</div>

				<!-- Item 4 -->
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 shrink-0 rounded-full bg-[#2a348b] flex items-center justify-center shadow-md">
						<BarChart2 size={14} class="text-white" strokeWidth={2.5} />
					</div>
					<div class="flex flex-col -mt-0.5">
						<span class="text-[13px] font-bold text-[#2a348b]">PDRB 2024</span>
						<span class="text-[12px] font-medium text-slate-400">Rp 27.339.810.000.000</span>
					</div>
				</div>

				<!-- Item 5 -->
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 shrink-0 rounded-full bg-[#2a348b] flex items-center justify-center shadow-md">
						<Activity size={14} class="text-white" strokeWidth={2.5} />
					</div>
					<div class="flex flex-col -mt-0.5">
						<span class="text-[13px] font-bold text-[#2a348b] mb-0.5">Realisasi Investasi</span>
						<span class="text-[11px] font-medium text-slate-400 leading-tight">PMA (US$ Ribu) :<br/>8.994.488.248<br/>PMDN (Rp Juta) :<br/>1.954.860.069.170,6</span>
					</div>
				</div>

				<!-- Item 6 -->
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 shrink-0 rounded-full bg-[#2a348b] flex items-center justify-center shadow-md">
						<Factory size={14} class="text-white" strokeWidth={2.5} />
					</div>
					<div class="flex flex-col -mt-0.5">
						<span class="text-[13px] font-bold text-[#2a348b]">Kawasan Industri</span>
						<span class="text-[12px] font-medium text-slate-400">0 Kawasan</span>
					</div>
				</div>
			</div>
		</div>

		<!-- RIGHT MAP AREA -->
		<div class="relative w-full max-w-[700px] aspect-square rounded-full bg-[#f6f6f6] shadow-inner flex items-center justify-center overflow-hidden" in:fly={{ opacity: 0, x: 20, duration: 1000, delay: 200 }}>
			<!-- Abstract world map backdrop (light grey shapes) -->
			<div class="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/1024px-World_map_blank_without_borders.svg.png')] bg-cover bg-center bg-no-repeat grayscale" style="background-size: 150%; background-position: 70% 60%;"></div>

			<!-- Indonesia Map SVG overlay -->
			<div class="relative w-[85%] h-auto z-10 drop-shadow-xl" style="filter: hue-rotate(60deg) saturate(1.5);">
				<!-- We use a highly detailed Indonesia map from wikimedia -->
				<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Indonesia_blank_map.svg/1024px-Indonesia_blank_map.svg.png" alt="Indonesia Map" class="w-full h-auto opacity-90 object-contain drop-shadow-lg" />
				
				<!-- Mock Tooltip for Riau -->
				<div class="absolute top-[35%] left-[23%] bg-white rounded-md shadow-lg px-2 py-1.5 border border-slate-100 flex flex-col items-center z-20 cursor-pointer hover:scale-105 transition-transform" in:fly={{ y: -10, duration: 400, delay: 1200 }}>
					<span class="text-[10px] font-black text-slate-700 leading-none">Riau</span>
					<!-- Tooltip pointer -->
					<div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45"></div>
				</div>

				<!-- Mock Tooltip for Sulawesi Barat -->
				<div class="absolute top-[48%] left-[58%] bg-white rounded-md shadow-lg px-2 py-1.5 border border-slate-100 flex flex-col items-center z-20 cursor-pointer hover:scale-105 transition-transform" in:fly={{ y: -10, duration: 400, delay: 1400 }}>
					<span class="text-[10px] font-black text-slate-700 leading-none">Sulawesi Barat</span>
					<div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45"></div>
				</div>
			</div>
			
			<!-- Decorative edge shadow for the globe -->
			<div class="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] pointer-events-none"></div>
		</div>

	</div>
</div>
