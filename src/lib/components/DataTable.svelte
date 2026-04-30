<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Column {
		key: string;
		label: string;
		align?: 'left' | 'right' | 'center';
		class?: string;
	}

	let { 
		data = [], 
		columns = [], 
		pageSize = 5,
		title = "",
		cell
	} = $props<{
		data: any[];
		columns: Column[];
		pageSize?: number;
		title?: string;
		cell?: import('svelte').Snippet<[any, Column]>;
	}>();

	let currentPage = $state(0);

	// Reset page when data changes (e.g. region switch)
	$effect(() => {
		if (data) currentPage = 0;
	});

	let pagination = $derived({
		total: data.length,
		totalPages: Math.ceil(data.length / pageSize),
		items: data.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
		start: currentPage * pageSize + 1,
		end: Math.min((currentPage + 1) * pageSize, data.length)
	});
</script>

<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
	<div class="overflow-x-auto custom-scrollbar">
		<table class="w-full text-left border-collapse">
			<thead>
				<tr class="border-b border-slate-100">
					{#each columns as col}
						<th 
							class="py-3 px-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest {col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} {col.class || ''}"
						>
							{col.label}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-50">
				{#each pagination.items as item, i (i)}
					<tr class="hover:bg-slate-50/50 transition-all group">
						{#each columns as col}
							<td class="py-3 px-5 align-top {col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} {col.class || ''}">
								{#if cell}
									{@render cell(item, col)}
								{:else}
									<span class="text-xs font-medium text-slate-600">
										{item[col.key] || '—'}
									</span>
								{/if}
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={columns.length} class="py-12 text-center text-xs text-slate-400 font-medium italic">
							{(m as any).table_no_records()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination Controls -->
	{#if pagination.totalPages > 1}
		<div class="flex items-center justify-between px-8 py-4 border-t border-slate-100 bg-slate-50/30">
			<span class="text-xs text-slate-400">
				{(m as any).table_total()} <span class="font-semibold text-slate-600">{pagination.total}</span>
			</span>
			<div class="flex items-center gap-2">
				<button
					onclick={() => currentPage = Math.max(0, currentPage - 1)}
					disabled={currentPage === 0}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {currentPage === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}"
				>
					<ChevronLeft size={14} />
					{(m as any).table_prev()}
				</button>
				<span class="text-xs font-semibold text-slate-500 px-2">{currentPage + 1} / {pagination.totalPages}</span>
				<button
					onclick={() => currentPage = Math.min(pagination.totalPages - 1, currentPage + 1)}
					disabled={currentPage >= pagination.totalPages - 1}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {currentPage >= pagination.totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}"
				>
					{(m as any).table_next()}
					<ChevronRight size={14} />
				</button>
			</div>
		</div>
	{/if}
</div>
