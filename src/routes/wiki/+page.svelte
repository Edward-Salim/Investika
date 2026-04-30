<script lang="ts">
	import { BookOpenText, Search, Sigma, BriefcaseBusiness, Landmark, TrendingUp, FileText } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let searchQuery = $state('');

	type GlossaryItem = {
		term: string;
		category: 'Project' | 'Financial' | 'Policy' | 'Regional' | 'Document';
		short: string;
		meaning: string;
		whyItMatters: string;
	};

	const glossaryItems: GlossaryItem[] = [
		{
			term: 'PPI',
			category: 'Project',
			short: 'Project profile or preliminary project information.',
			meaning: 'Used in Investika as a shorthand project-status style label for an early project information package, not yet a fully investment-ready opportunity.',
			whyItMatters: 'If a project is still labeled PPI, the commercial package is likely thinner and an investor should expect more diligence questions.'
		},
		{
			term: 'IPRO',
			category: 'Project',
			short: 'Investment Project Ready to Offer.',
			meaning: 'A project packaged far enough for investor review, usually with clearer sponsor, location, and commercial details.',
			whyItMatters: 'This typically signals a more mature opportunity than a basic profile and a better starting point for investor outreach.'
		},
		{
			term: 'KPBU / PPP',
			category: 'Policy',
			short: 'Public-private partnership scheme.',
			meaning: 'A cooperation model where government and private sector share responsibility for financing, building, or operating infrastructure and public services.',
			whyItMatters: 'It affects project structure, revenue model, risk allocation, and how returns are negotiated.'
		},
		{
			term: 'KBLI',
			category: 'Policy',
			short: 'Indonesia’s standard business classification code.',
			meaning: 'Indonesia’s official business activity classification code used for licensing and regulatory mapping.',
			whyItMatters: 'It helps determine what a project is legally allowed to do and what permits, incentives, or restrictions may apply.'
		},
		{
			term: 'CAPEX',
			category: 'Financial',
			short: 'Capital expenditure required upfront.',
			meaning: 'The upfront capital needed to build or launch the project, including land, machinery, construction, utilities, and setup costs.',
			whyItMatters: 'CAPEX shapes funding needs, financing structure, and the scale of investor commitment required at entry.'
		},
		{
			term: 'IRR',
			category: 'Financial',
			short: 'Expected annual return rate of the project.',
			meaning: 'Internal Rate of Return estimates the annualized percentage return a project is expected to generate over time.',
			whyItMatters: 'Investors use IRR as a fast benchmark for attractiveness when comparing multiple opportunities.'
		},
		{
			term: 'NPV',
			category: 'Financial',
			short: 'Present value of future project cash flows.',
			meaning: 'Net Present Value converts future project cash flows into today’s value after discounting for time and risk.',
			whyItMatters: 'Positive NPV suggests the project creates value beyond its cost of capital.'
		},
		{
			term: 'Payback Period',
			category: 'Financial',
			short: 'How long until the initial investment is recovered.',
			meaning: 'The number of years required for cumulative project cash flows to recover the initial investment.',
			whyItMatters: 'Shorter payback usually means quicker capital recovery and lower duration risk.'
		},
		{
			term: 'FDI',
			category: 'Policy',
			short: 'Foreign Direct Investment.',
			meaning: 'Capital invested by a foreign investor into an Indonesian business or project with long-term ownership or operating interest.',
			whyItMatters: 'FDI status often changes regulatory treatment, ownership rules, reporting, and incentive eligibility.'
		},
		{
			term: 'PDRB / GRDP',
			category: 'Regional',
			short: 'Regional economic output.',
			meaning: 'Gross Regional Domestic Product measures the total value of goods and services produced in a province or region.',
			whyItMatters: 'It gives investors a quick read on local economic scale, activity level, and market depth.'
		},
		{
			term: 'UMR',
			category: 'Regional',
			short: 'Regional minimum wage benchmark.',
			meaning: 'A regional minimum wage benchmark used as a high-level labor cost signal.',
			whyItMatters: 'It helps estimate baseline workforce cost differences across provinces.'
		},
		{
			term: 'Readiness Status',
			category: 'Project',
			short: 'How mature the project is for investor engagement.',
			meaning: 'A maturity indicator showing whether a project is conceptual, under study, ready to offer, under construction, or operational.',
			whyItMatters: 'It tells investors how much development risk and execution uncertainty still remain.'
		},
		{
			term: 'Feasibility Study',
			category: 'Document',
			short: 'A study testing whether the project makes sense commercially and technically.',
			meaning: 'A structured study testing whether a project is viable commercially, technically, and operationally.',
			whyItMatters: 'It is often one of the first serious diligence documents investors ask for.'
		},
		{
			term: 'Executive Summary / Factsheet',
			category: 'Document',
			short: 'A short investor-facing brief about the project.',
			meaning: 'A short investor-facing brief summarizing the project opportunity, commercial metrics, location, structure, and contacts.',
			whyItMatters: 'It is the quickest way for an investor to decide whether a project deserves deeper review.'
		},
		{
			term: 'Sector Dominance',
			category: 'Regional',
			short: 'Leading sectors attracting investment in a region.',
			meaning: 'A summary of which industries receive the largest share of investment or economic activity in a province.',
			whyItMatters: 'It helps investors see whether a region already has momentum, supply chains, and policy support in a given sector.'
		},
		{
			term: 'Key Infrastructure',
			category: 'Regional',
			short: 'Strategic transport, utility, or industrial assets nearby.',
			meaning: 'Major supporting assets such as ports, roads, power, industrial estates, and logistics links around the project or region.',
			whyItMatters: 'Infrastructure quality directly affects execution speed, logistics cost, and long-term competitiveness.'
		},
		{
			term: 'Investment Incentives',
			category: 'Policy',
			short: 'Benefits offered to improve project economics.',
			meaning: 'Government fiscal or non-fiscal support such as tax holidays, duty exemptions, facilitation, or licensing support.',
			whyItMatters: 'Incentives can materially improve returns, reduce costs, and shorten administrative friction.'
		},
		{
			term: 'Land Area',
			category: 'Project',
			short: 'The site size allocated to a project.',
			meaning: 'The amount of land available or required for the project, commonly shown in hectares or square kilometers.',
			whyItMatters: 'Land area affects scalability, layout planning, permitting complexity, and acquisition cost.'
		},
		{
			term: 'Economic Zone Status',
			category: 'Policy',
			short: 'Whether the project sits in a special policy zone.',
			meaning: 'Indicates if a project is located in a special economic zone, industrial estate, tourism zone, or other priority area.',
			whyItMatters: 'Zone status can affect incentives, permitting process, customs treatment, and infrastructure access.'
		},
		{
			term: 'Readiness Phase',
			category: 'Project',
			short: 'Specific stage within project development.',
			meaning: 'A more granular progression label such as pre-feasibility, feasibility, ready to offer, construction, or operational.',
			whyItMatters: 'It helps distinguish a concept-stage project from one already nearing transaction readiness.'
		}
	];

	const categoryTone: Record<GlossaryItem['category'], string> = {
		Project: 'bg-bkpm-blue/10 text-bkpm-blue border-bkpm-blue/10',
		Financial: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/10',
		Policy: 'bg-amber-500/10 text-amber-700 border-amber-500/10',
		Regional: 'bg-violet-500/10 text-violet-700 border-violet-500/10',
		Document: 'bg-slate-200/70 text-slate-700 border-slate-200'
	};

	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	let sortedItems = $derived.by(() =>
		[...glossaryItems].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))
	);

	let availableLetters = $derived.by(() =>
		new Set(sortedItems.map((item) => item.term.charAt(0).toUpperCase()))
	);

	let filteredItems = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return sortedItems;
		return sortedItems.filter((item) =>
			[item.term, item.category, item.short, item.meaning, item.whyItMatters].some((value) => value.toLowerCase().includes(query))
		);
	});

	const categoryCounts = $derived.by(() =>
		glossaryItems.reduce<Record<string, number>>((acc, item) => {
			acc[item.category] = (acc[item.category] || 0) + 1;
			return acc;
		}, {})
	);
</script>

<div class="min-h-screen bg-slate-50 pb-16 font-sans" in:fade={{ duration: 300 }}>
	<div class="border-b border-slate-200 bg-white">
		<div class="mx-auto max-w-7xl px-6 py-6 lg:px-8">
			<div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
				<div class="max-w-2xl">
					<h1 class="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Investment terms, decoded</h1>
					<p class="mt-1 text-sm font-medium text-slate-500">
						Quick definitions for project, finance, policy, and regional terminology used across Investika.
					</p>
				</div>

				<div class="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
					<div class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
						<Sigma size={12} />
						<span>{filteredItems.length} terms</span>
					</div>
					<div class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
						<BriefcaseBusiness size={12} />
						<span>{categoryCounts.Project || 0} project</span>
					</div>
					<div class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
						<TrendingUp size={12} />
						<span>{categoryCounts.Financial || 0} financial</span>
					</div>
					<div class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
						<Landmark size={12} />
						<span>{categoryCounts.Policy || 0} policy</span>
					</div>
					<div class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
						<FileText size={12} />
						<span>{categoryCounts.Document || 0} document</span>
					</div>
				</div>
			</div>

			<div class="relative mt-4 max-w-xl">
				<div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
					<Search size={16} class="text-slate-400" strokeWidth={2.5} />
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search IRR, KPBU, UMR..."
					class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-bkpm-blue focus:bg-white focus:ring-4 focus:ring-bkpm-blue/10"
				/>
			</div>
		</div>
	</div>

	<div class="mx-auto mt-6 max-w-7xl px-6 lg:px-8">
		{#if filteredItems.length > 0}
			<div class="mb-3 flex flex-wrap gap-1.5">
				{#each alphabet as letter}
					{@const hasLetter = availableLetters.has(letter)}
					<span class="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border px-2 text-[10px] font-black uppercase tracking-widest {hasLetter ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-300'}">
						{letter}
					</span>
				{/each}
			</div>
			<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div class="overflow-x-auto">
					<table class="min-w-full border-collapse">
						<thead class="bg-slate-50">
							<tr class="border-b border-slate-200">
								<th class="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Term</th>
								<th class="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
								<th class="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Short</th>
								<th class="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Meaning</th>
								<th class="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Why It Matters</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each filteredItems as item}
								<tr class="align-top transition-colors hover:bg-slate-50/70">
									<td class="px-5 py-4">
										<div class="text-sm font-black tracking-tight text-slate-900">{item.term}</div>
									</td>
									<td class="px-5 py-4">
										<span class={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${categoryTone[item.category]}`}>
											{item.category}
										</span>
									</td>
									<td class="px-5 py-4 text-[13px] font-semibold leading-6 text-slate-600">{item.short}</td>
									<td class="px-5 py-4 text-[13px] leading-6 text-slate-600">{item.meaning}</td>
									<td class="px-5 py-4 text-[13px] leading-6 text-slate-600">{item.whyItMatters}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<div class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
				<h2 class="text-lg font-black text-slate-900">No matching term</h2>
				<p class="mt-1 text-sm font-medium text-slate-500">Try `IRR`, `PDRB`, or `KPBU`.</p>
			</div>
		{/if}
	</div>
</div>
