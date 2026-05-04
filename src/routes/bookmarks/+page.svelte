<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Bookmark, ChevronRight, Trash2 } from 'lucide-svelte';
	import { bookmarkStore } from '$lib/state/bookmark.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	const bookmarkedProjects = $derived(
		bookmarkStore.projects.filter((project: any) => typeof project?.id !== 'undefined')
	);
	const hasBookmarks = $derived(bookmarkedProjects.length > 0);
</script>

<svelte:head>
	<title>Bookmarks | Investika</title>
</svelte:head>

<div class="flex h-full flex-col bg-slate-50/50">
	<div class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-8 py-10">
		{#if hasBookmarks}
			<div class="mb-8 flex items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-[22px] bg-bkpm-blue text-white shadow-lg shadow-bkpm-blue/20"
					>
						<Bookmark size={22} strokeWidth={2.5} fill="currentColor" />
					</div>
					<div>
						<h1 class="text-xl font-black tracking-tight text-slate-900">
							{m.nav_bookmarks()}
						</h1>
						<p class="text-sm font-medium text-slate-500">
							{m.bookmark_saved_count({ count: bookmarkedProjects.length })}
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={() => bookmarkStore.clear()}
					class="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase shadow-sm transition-colors hover:border-red-200 hover:text-red-500"
				>
					<Trash2 size={14} strokeWidth={2.5} />
					{m.bookmark_clear_all()}
				</button>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each bookmarkedProjects as project (project.id)}
					<ProjectCard {project} />
				{/each}
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center py-12">
				<div class="flex max-w-4xl flex-col items-center gap-8 text-center">
					<div class="relative">
						<div class="absolute -inset-10 -z-10 rounded-full bg-slate-100/80 blur-3xl"></div>
						<div
							class="flex h-36 w-36 items-center justify-center rounded-[32px] border border-slate-200 bg-white text-bkpm-blue shadow-xl shadow-slate-200/60"
						>
							<Bookmark size={52} strokeWidth={1.9} />
						</div>
					</div>

					<div>
						<h2 class="text-3xl font-black tracking-tight text-slate-900">
							{m.bookmark_empty_title()}
						</h2>
						<p class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed font-medium text-slate-500">
							{m.bookmark_empty_desc()}
						</p>
					</div>

					<a
						href="/?view=catalog"
						class="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[11px] font-black tracking-widest text-white uppercase transition-all hover:bg-slate-800 hover:shadow-lg"
					>
						{m.comp_btn_browse()}
						<ChevronRight size={14} />
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
