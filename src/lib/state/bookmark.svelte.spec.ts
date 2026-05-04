import { beforeEach, describe, expect, it } from 'vitest';
import { bookmarkStore } from './bookmark.svelte';

describe('bookmarkStore', () => {
	beforeEach(() => {
		bookmarkStore.clear();
		window.localStorage.clear();
	});

	it('normalizes project detail records before saving bookmarks', () => {
		bookmarkStore.toggle({
			id_peluang: 928,
			nama: 'Strategic Energy Corridor',
			nama_provinsi: 'Central Sulawesi',
			nama_sektor_peluang: 'Energi',
			status: 'Ready to Offer',
			nilai_investasi: '1,5 T',
			nilai_irr: '18,4%',
			nilai_npv: '250 B',
			image_url: null,
			id_adm_provinsi: 72,
			wilayah_group: 'wilayah indonesia bagian tengah'
		});

		expect(bookmarkStore.projects).toHaveLength(1);
		expect(bookmarkStore.projects[0]).toMatchObject({
			id: '928',
			title: 'Strategic Energy Corridor',
			category: 'Energy',
			location: 'Central Sulawesi',
			provinceId: 72,
			wilayah: 'wilayah indonesia bagian tengah'
		});
		expect(bookmarkStore.projects[0].investmentNum).toBe(1500);
		expect(bookmarkStore.projects[0].irrNum).toBe(18.4);
		expect(window.localStorage.getItem('investika_bookmarked_projects')).toContain(
			'Strategic Energy Corridor'
		);
	});
});
