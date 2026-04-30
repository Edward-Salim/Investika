import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProvinceSummaries, getSelectedRegionDetail } from '$lib/server/region-data';

export const GET: RequestHandler = async ({ url }) => {
	const selectedIdParam = Number.parseInt(url.searchParams.get('id') ?? '', 10);
	if (!Number.isFinite(selectedIdParam)) {
		return json({ error: 'Invalid region id' }, { status: 400 });
	}

	try {
		const provinces = await getProvinceSummaries();
		const selectedProvince = provinces.find((province) => province.id_adm_provinsi === selectedIdParam);

		if (!selectedProvince) {
			return json({ error: 'Region not found' }, { status: 404 });
		}

		return json({ region: await getSelectedRegionDetail(selectedProvince) });
	} catch (e: any) {
		console.error('Region detail api error:', e);
		return json({ error: e.message || 'Failed to load region detail' }, { status: 500 });
	}
};

