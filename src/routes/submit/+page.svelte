<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import {
		ArrowRight,
		Check,
		ChevronDown,
		Bot,
		Globe,
		Image as ImageIcon
	} from 'lucide-svelte';
	import { Gb, Id, Cn, Jp, Kr } from 'svelte-flag-icons';
	import vestiAITranslate from '$lib/assets/logos/vestiAI-translate.png';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	type LangId = 'en' | 'id' | 'zh' | 'ja' | 'ko';

	let title = $state('');
	let sector = $state('Energy');
	let location = $state('');
	let description = $state('');

	let investment = $state(0);
	let npv = $state(0);
	let irr = $state(0);
	let payback = $state(0);

	let scheme = $state('Public-Private Partnership (PPP)');
	let landArea = $state('');
	let kbli = $state('');

	let isSubmitting = $state(false);
	let showSuccess = $state(false);
	let activePreviewLang = $state<LangId>('en');

	const languages: Array<{ id: LangId; name: string; flag: any }> = [
		{ id: 'en', name: 'English', flag: Gb },
		{ id: 'id', name: 'Bahasa Indonesia', flag: Id },
		{ id: 'zh', name: 'Chinese (Mandarin)', flag: Cn },
		{ id: 'ja', name: 'Japanese', flag: Jp },
		{ id: 'ko', name: 'Korean', flag: Kr }
	];

	const translations = $derived({
		en: {
			title: title || m.submit_label_title(),
			description: description || m.submit_placeholder_desc()
		},
		id: {
			title: title ? `[ID] ${title}` : m.submit_label_title(),
			description: description ? `[ID] ${description}` : m.submit_placeholder_desc()
		},
		zh: {
			title: title ? `[ZH] ${title}` : m.submit_label_title(),
			description: description ? `[ZH] ${description}` : m.submit_placeholder_desc()
		},
		ja: {
			title: title ? `[JA] ${title}` : m.submit_label_title(),
			description: description ? `[JA] ${description}` : m.submit_placeholder_desc()
		},
		ko: {
			title: title ? `[KO] ${title}` : m.submit_label_title(),
			description: description ? `[KO] ${description}` : m.submit_placeholder_desc()
		}
	} satisfies Record<LangId, { title: string; description: string }>);

	function handleSubmit() {
		isSubmitting = true;

		setTimeout(() => {
			isSubmitting = false;
			showSuccess = true;
		}, 2000);
	}
</script>

{#snippet SectionTitle(label: string)}
	<div class="flex items-center gap-4">
		<h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
			{label}
		</h3>
		<div class="h-px w-full bg-slate-100"></div>
	</div>
{/snippet}

{#snippet RangeField(id: string, label: string, value: number, min: number, max: number, step: number, suffix = '', prefix = '', colorClass = '', oninput: (v: number) => void)}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<label for={id} class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
				{label}
			</label>
			<span class="text-xs font-semibold tabular-nums text-slate-900">
				{prefix}{value}{suffix}
			</span>
		</div>
		<input
			{id}
			type="range"
			{min}
			{max}
			{step}
			{value}
			oninput={(e) => oninput(Number(e.currentTarget.value))}
			class="h-1 w-full appearance-none rounded-full bg-slate-100 outline-none {colorClass}"
		/>
	</div>
{/snippet}

<div class="min-h-screen bg-white" in:fade={{ duration: 250 }}>
	<div class="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
		<header class="mb-10 flex flex-col gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-end md:justify-between">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
					{m.submit_title()}
				</h1>
				<p class="mt-2 max-w-xl text-sm text-slate-500">
					{m.submit_subtitle()}
				</p>
			</div>

			<div class="flex items-center gap-3">
				<button
					onclick={() => (window.location.href = '/')}
					class="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
				>
					{m.submit_btn_cancel()}
				</button>

				<button
					onclick={handleSubmit}
					disabled={isSubmitting || !title}
					class="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting}
						<span class="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
						{m.submit_btn_publishing()}
					{:else}
						{m.submit_btn_publish()}
						<ArrowRight size={14} />
					{/if}
				</button>
			</div>
		</header>

		{#if showSuccess}
			<section
				class="mx-auto max-w-xl py-24 text-center"
				in:fly={{ y: 12, duration: 350, easing: cubicOut }}
			>
				<div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
					<Check size={28} strokeWidth={2.5} />
				</div>

				<h2 class="text-2xl font-semibold tracking-tight text-slate-950">
					{m.submit_success_title()}
				</h2>

				<p class="mt-4 text-sm leading-6 text-slate-500">
					{m.submit_success_desc()}
				</p>

				<div class="mt-8 flex justify-center gap-3">
					<button
						onclick={() => (window.location.href = '/')}
						class="rounded-lg bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
					>
						{m.submit_success_btn()}
					</button>

					<button
						onclick={() => (showSuccess = false)}
						class="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
					>
						{m.submit_btn_add()}
					</button>
				</div>
			</section>
		{:else}
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
				<main class="space-y-10 lg:col-span-7">
					<section class="space-y-6">
						{@render SectionTitle(m.submit_sec_general())}

						<div class="space-y-6">
							<div>
								<label for="title" class="form-label">{m.submit_label_title()}</label>
								<input
									type="text"
									id="title"
									bind:value={title}
									placeholder={m.submit_placeholder_title()}
									class="title-input"
								/>
							</div>

							<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
								<div>
									<label for="sector" class="form-label">{m.submit_label_sector()}</label>
									<div class="relative">
										<select id="sector" bind:value={sector} class="field appearance-none pr-10">
											<option>{m.sector_energy()}</option>
											<option>{m.sector_mfg()}</option>
											<option>{m.sector_log()}</option>
											<option>{m.sector_agri()}</option>
											<option>{m.sector_tour()}</option>
											<option>{m.sector_serv()}</option>
										</select>
										<ChevronDown
											size={16}
											class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
										/>
									</div>
								</div>

								<div>
									<label for="location" class="form-label">{m.submit_label_location()}</label>
									<div class="relative">
										<select
											id="location"
											bind:value={location}
											class="field appearance-none pr-10"
										>
											<option value="" disabled selected>{m.submit_placeholder_location()}</option>
											{#each data.provinces as prov}
												<option value={prov.nama}>{prov.nama}</option>
											{/each}
										</select>
										<ChevronDown
											size={16}
											class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
										/>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section class="space-y-6">
						{@render SectionTitle(m.submit_sec_financials())}

						<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
							{@render RangeField(
								"investment",
								m.submit_label_capex(),
								investment,
								0,
								5000,
								50,
								"M",
								"$",
								"text-bkpm-blue",
								(value) => (investment = value)
							)}

							{@render RangeField(
								"npv",
								m.submit_label_npv(),
								npv,
								0,
								2000,
								10,
								"M",
								"$",
								"text-bkpm-blue",
								(value) => (npv = value)
							)}

							{@render RangeField(
								"irr",
								m.submit_label_irr(),
								irr,
								0,
								40,
								1,
								"%",
								"",
								"text-logo-green",
								(value) => (irr = value)
							)}

							{@render RangeField(
								"payback",
								m.submit_label_payback(),
								payback,
								0,
								25,
								1,
								" yrs",
								"",
								"text-slate-950",
								(value) => (payback = value)
							)}
						</div>
					</section>

					<section class="space-y-6">
						{@render SectionTitle(m.submit_sec_technical())}

						<div class="grid grid-cols-1 gap-5 md:grid-cols-3">
							<div>
								<label for="scheme" class="form-label">{m.submit_label_scheme()}</label>
								<div class="relative">
									<select id="scheme" bind:value={scheme} class="field appearance-none pr-10">
										<option>{m.submit_opt_ppp()}</option>
										<option>{m.submit_opt_direct()}</option>
										<option>{m.submit_opt_bumn()}</option>
										<option>{m.submit_opt_jv()}</option>
									</select>
									<ChevronDown
										size={16}
										class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
									/>
								</div>
							</div>

							<div>
								<label for="landArea" class="form-label">{m.submit_label_land()}</label>
								<input
									id="landArea"
									type="text"
									bind:value={landArea}
									placeholder={m.submit_placeholder_land()}
									class="field"
								/>
							</div>

							<div>
								<label for="kbli" class="form-label">{m.submit_label_kbli()}</label>
								<input
									id="kbli"
									type="text"
									bind:value={kbli}
									placeholder={m.submit_placeholder_kbli()}
									class="field"
								/>
							</div>
						</div>
					</section>

					<section>
						<label for="description" class="form-label">{m.submit_label_desc()}</label>
						<textarea
							id="description"
							bind:value={description}
							placeholder={m.submit_placeholder_desc()}
							rows="5"
							class="field min-h-36 resize-none p-4 leading-6"
						></textarea>
					</section>
				</main>

				<aside class="lg:col-span-5">
					<div class="sticky top-10 space-y-5">
						<div class="rounded-2xl bg-gradient-to-r from-bkpm-blue to-cyan-400 p-[3px] shadow-sm">
							<section class="rounded-[calc(1rem-2px)] bg-white p-6 h-full">
								<div class="mb-6 flex items-start justify-between gap-4">
									<div class="flex items-center gap-3">
										<img src={vestiAITranslate} alt="VestiAI" class="h-14 w-14 object-contain scale-125" />

										<div>
											<h2 class="text-sm font-semibold text-slate-950">{m.submit_hub_title()}</h2>
											<p class="text-xs text-slate-500">{m.submit_hub_subtitle()}</p>
										</div>
									</div>

									<div class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
										Active
									</div>
								</div>

								<p class="mb-6 text-sm leading-6 text-slate-500">
									{m.submit_hub_desc()}
								</p>

								<div class="mb-6 grid grid-cols-5 gap-2 rounded-xl bg-slate-50 p-1">
									{#each languages as lang (lang.id)}
										<button
											onclick={() => (activePreviewLang = lang.id)}
											aria-label={`Preview ${lang.name}`}
											class="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition
												{activePreviewLang === lang.id
													? 'bg-white text-slate-950 shadow-sm'
													: 'text-slate-400 hover:text-slate-700'}"
										>
											<lang.flag size="17" class="rounded-sm" />
											<span class="text-[10px] font-medium">{lang.id.toUpperCase()}</span>
										</button>
									{/each}
								</div>

								<div class="space-y-5 rounded-xl border border-slate-200 p-5">
									<div>
										<p class="preview-label">{m.submit_hub_translated_name()}</p>
										<h3 class="mt-1 text-lg font-semibold leading-snug text-slate-950">
											{translations[activePreviewLang].title}
										</h3>
									</div>

									<div class="border-t border-slate-100 pt-5">
										<p class="preview-label">{m.submit_hub_summary_snippet()}</p>
										<p class="mt-1 line-clamp-3 text-sm leading-6 text-slate-500">
											{translations[activePreviewLang].description}
										</p>
									</div>
								</div>

								<div class="mt-6 flex items-center gap-2 text-xs text-slate-500">
									<Globe size={14} />
									<span>{m.submit_hub_compliance()}</span>
								</div>
							</section>
						</div>

						<section class="rounded-2xl border border-slate-200 bg-white p-5">
							<div class="flex gap-4">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
									<ImageIcon size={20} />
								</div>

								<div>
									<h3 class="text-sm font-semibold text-slate-950">Visual asset</h3>
									<p class="mt-1 text-sm leading-6 text-slate-500">
										Adding a simple masterplan or site render can improve investor clarity.
									</p>
								</div>
							</div>
						</section>
					</div>
				</aside>
			</div>
		{/if}
	</div>
</div>



<style>
	:global(body) {
		background: #ffffff;
	}

	.form-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: #64748b;
	}

	.title-input {
		width: 100%;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		background: #ffffff;
		padding: 0.875rem 1rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: #020617;
		outline: none;
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}

	.title-input::placeholder {
		color: #cbd5e1;
	}

	.title-input:focus {
		border-color: #0f172a;
	}

	.field {
		width: 100%;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		background: #ffffff;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #334155;
		outline: none;
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}

	.field::placeholder {
		color: #cbd5e1;
	}

	.field:focus {
		border-color: #94a3b8;
		box-shadow: 0 0 0 3px rgb(148 163 184 / 0.12);
	}

	.preview-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: #94a3b8;
	}

	input[type='range'] {
		color: currentColor;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 16px;
		width: 16px;
		border-radius: 999px;
		background: #ffffff;
		cursor: pointer;
		border: 2px solid currentColor;
		box-shadow: 0 2px 4px rgb(15 23 42 / 0.1);
		margin-top: -6px;
	}

	input[type='range']::-webkit-slider-runnable-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		background: #f1f5f9;
		border-radius: 999px;
	}

	textarea::-webkit-scrollbar {
		width: 6px;
	}

	textarea::-webkit-scrollbar-thumb {
		background-color: #e2e8f0;
		border-radius: 999px;
	}
</style>