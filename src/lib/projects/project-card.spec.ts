import { describe, expect, it } from 'vitest';
import { mapProjectToCard } from './project-card';

describe('mapProjectToCard', () => {
	it('maps Indonesian sector labels to UI labels', () => {
		const result = mapProjectToCard({
			id_peluang: 1,
			nama: 'Eco Resort',
			nama_sektor_peluang: 'Pariwisata'
		});

		expect(result.category).toBe('Tourism');
	});

	it('parses investment and IRR numeric values', () => {
		const result = mapProjectToCard({
			id_peluang: 1,
			nama: 'Solar Plant',
			nilai_investasi: '1,5 T',
			nilai_irr: '18,4%'
		});

		expect(result.investmentNum).toBe(1500);
		expect(result.irrNum).toBe(18.4);
	});

	it('uses fallback title and location values', () => {
		const result = mapProjectToCard({
			id_peluang: 1,
			nama: null,
			nama_provinsi: null,
			nama_kabkot: null
		});

		expect(result.title).toBe('Untitled Project');
		expect(result.location).toBe('Indonesia');
	});
});
