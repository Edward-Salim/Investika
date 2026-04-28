<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
		showRadialGradient = true
	} = $props<{
		children: Snippet;
		class?: string;
		showRadialGradient?: boolean;
	}>();
</script>

<div class="relative flex flex-col items-center justify-center bg-zinc-50 text-slate-950 transition-colors {className}">
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div
			class="
				[--white-gradient:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)]
				[--aurora:repeating-linear-gradient(100deg,var(--color-blue-500)_10%,var(--color-indigo-300)_15%,var(--color-blue-300)_20%,var(--color-violet-200)_25%,var(--color-blue-400)_30%)]
				[background-image:var(--white-gradient),var(--aurora)]
				[background-size:300%,_200%]
				[background-position:50%_50%,50%_50%]
				blur-[10px] invert
				after:content-[''] after:absolute after:inset-0 
				after:[background-image:var(--white-gradient),var(--aurora)] 
				after:[background-size:200%,_100%] 
				after:animate-[aurora_60s_linear_infinite] 
				after:[background-attachment:fixed] 
				after:mix-blend-difference
				absolute -inset-[10px] opacity-50 will-change-transform
				{showRadialGradient ? '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]' : ''}
			"
		></div>
	</div>
	{@render children()}
</div>

