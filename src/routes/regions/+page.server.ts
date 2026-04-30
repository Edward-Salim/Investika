import type { PageServerLoad } from './$types';
import { getProvinceSummaries, getSelectedRegionDetail, getMockSelectedRegion } from '$lib/server/region-data';
import { getMockProvinces } from '$lib/server/mock';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const selectedIdParam = Number.parseInt(url.searchParams.get('id') ?? '', 10);
		const requestedProvinceId = Number.isFinite(selectedIdParam) ? selectedIdParam : undefined;

		const provinces = await getProvinceSummaries();
		const defaultProvince =
			provinces.reduce<any | null>((best, province) => {
				if (!best) return province;
				if ((province.count ?? 0) > (best.count ?? 0)) return province;
				if ((province.count ?? 0) === (best.count ?? 0) && province.nama < best.nama) return province;
				return best;
			}, null) ?? null;
		const selectedProvince =
			provinces.find((province) => province.id_adm_provinsi === requestedProvinceId) ?? defaultProvince;

		return {
			provinces,
			selectedRegion: selectedProvince
				? {
						...selectedProvince,
						projects: [],
						offices: [],
						infrastructure: [],
						sectorInvestment: []
					}
				: null
		};
	} catch (e: any) {
		console.error('Regions load error:', e);
		return {
			provinces: getMockProvinces().map((p) => ({ ...p, count: 2 })),
			selectedRegion: getMockSelectedRegion(),
			error: e.message
		};
	}
};
