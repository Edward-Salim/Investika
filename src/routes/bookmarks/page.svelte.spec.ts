import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { bookmarkStore } from '$lib/state/bookmark.svelte';
import BookmarksPage from './+page.svelte';

describe('/bookmarks +page.svelte', () => {
	beforeEach(() => {
		bookmarkStore.clear();
		window.localStorage.clear();
	});

	it('shows an empty state when there are no saved bookmarks', async () => {
		render(BookmarksPage);

		await expect.element(page.getByText(/No bookmarked projects yet\./i)).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: /browse/i })).toBeInTheDocument();
	});

	it('renders saved bookmarked projects', async () => {
		bookmarkStore.projects = [
			{
				id: '12',
				title: 'Nusantara Green Port',
				category: 'Logistics',
				status: 'Ready to Offer',
				location: 'East Kalimantan',
				investment: '$180M',
				npv: '$62M',
				irr: '17%',
				image: null,
				provinceId: 64,
				investmentNum: 180,
				irrNum: 17,
				npvNum: 62,
				wilayah: 'wilayah indonesia bagian tengah'
			}
		];
		bookmarkStore.save();

		render(BookmarksPage);

		await expect.element(page.getByText('Nusantara Green Port')).toBeInTheDocument();
		await expect.element(page.getByText(/1 saved projects/i)).toBeInTheDocument();
	});
});
