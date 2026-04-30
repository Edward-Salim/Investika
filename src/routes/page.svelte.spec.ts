import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { resetSearchStore } from '$lib/state/search.svelte.js';
import HomePage from './+page.svelte';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

describe('+page.svelte', () => {
	beforeEach(() => {
		mockFetch.mockReset();
		resetSearchStore();
		window.localStorage.clear();
	});

	async function fillSearch(value: string) {
		const input = page.getByRole('textbox').first();
		await input.fill(value);
		await page.getByRole('button', { name: 'Send message' }).click();
		return input;
	}

	it('submitting text calls the AI endpoint and updates summary and cards', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				summary: 'Found energy projects in Sulawesi.',
				appliedPlan: {
					intent: 'find_projects',
					base_table: 'investment_opportunities',
					joins: [],
					filters: [],
					sort: [],
					limit: 20,
					select_strategy: 'project_cards',
					explanation: 'Found energy projects in Sulawesi.'
				},
				projects: [
					{
						id: '99',
						title: 'Sulawesi Solar Hub',
						category: 'Energy',
						status: 'Ready to Offer',
						location: 'Central Sulawesi',
						investment: '$120M',
						npv: '$40M',
						irr: '18%',
						image: null,
						provinceId: 72,
						investmentNum: 120,
						irrNum: 18,
						npvNum: 40,
						wilayah: null
					}
				]
			})
		});

		render(HomePage, {
			data: {
				user: null,
				session: null,
				isProtoAuth: false,
				projects: [
					{
						id: '1',
						title: 'Existing Project',
						category: 'Tourism',
						status: 'Active',
						location: 'Bali',
						investment: '$10M',
						npv: '$2M',
						irr: '12%',
						image: null,
						provinceId: 51,
						investmentNum: 10,
						irrNum: 12,
						npvNum: 2,
						wilayah: null
					}
				]
			}
		});

		await fillSearch('energy projects in Sulawesi');

		expect(mockFetch).toHaveBeenCalledWith('/api/ai-search-projects', expect.objectContaining({ method: 'POST' }));
		await expect.element(page.getByText(/Found energy projects in Sulawesi\./)).toBeInTheDocument();
		await expect.element(page.getByText('Sulawesi Solar Hub')).toBeInTheDocument();
	});

	it('shows a safe fallback summary when the request fails', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: 'boom' })
		});

		render(HomePage, {
			data: {
				user: null,
				session: null,
				isProtoAuth: false,
				projects: []
			}
		});

		await fillSearch('energy projects');

		await expect.element(page.getByText(/couldn't complete that AI search/i)).toBeInTheDocument();
	});

	it('does not trigger a request for empty input', async () => {
		render(HomePage, {
			data: {
				user: null,
				session: null,
				isProtoAuth: false,
				projects: []
			}
		});

		await fillSearch('   ');

		expect(mockFetch).not.toHaveBeenCalled();
	});
});
