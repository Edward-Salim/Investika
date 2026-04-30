import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { admProvinces, investmentOpportunities } from '$lib/server/db/schema';
import { mapProjectToCard } from '$lib/projects/project-card';
import { asc, desc, ilike, or } from 'drizzle-orm';

export async function GET({ url }) {
	const query = url.searchParams.get('q')?.trim() ?? '';

	if (!query) {
		return json({ projects: [] });
	}

	if (!db) {
		return json({ projects: [] }, { status: 503 });
	}

	try {
		const [provinces, projects] = await Promise.all([
			db
				.select({
					id_adm_provinsi: admProvinces.id_adm_provinsi,
					wilayah_group: admProvinces.wilayah_group
				})
				.from(admProvinces),
			db
				.select({
					id_peluang: investmentOpportunities.id_peluang,
					id_adm_provinsi: investmentOpportunities.id_adm_provinsi,
					nama: investmentOpportunities.nama,
					nama_provinsi: investmentOpportunities.nama_provinsi,
					nama_kabkot: investmentOpportunities.nama_kabkot,
					nama_sektor_peluang: investmentOpportunities.nama_sektor_peluang,
					status: investmentOpportunities.status,
					status_proyek: investmentOpportunities.status_proyek,
					nilai_investasi: investmentOpportunities.nilai_investasi,
					nilai_irr: investmentOpportunities.nilai_irr,
					nilai_npv: investmentOpportunities.nilai_npv,
					nilai_investasi_amount: investmentOpportunities.nilai_investasi_amount,
					nilai_irr_percent: investmentOpportunities.nilai_irr_percent,
					nilai_npv_amount: investmentOpportunities.nilai_npv_amount,
					image_url: investmentOpportunities.image_url
				})
				.from(investmentOpportunities)
				.where(
					or(
						ilike(investmentOpportunities.nama, `%${query}%`),
						ilike(investmentOpportunities.nama_sektor_peluang, `%${query}%`),
						ilike(investmentOpportunities.nama_provinsi, `%${query}%`),
						ilike(investmentOpportunities.nama_kabkot, `%${query}%`)
					)
				)
				.orderBy(
					desc(investmentOpportunities.id_peluang),
					asc(investmentOpportunities.nama)
				)
				.limit(60)
		]);

		const wilayahMap = Object.fromEntries(
			provinces.map((province) => [province.id_adm_provinsi, province.wilayah_group ?? null])
		);

		return json({
			projects: projects.map((project) =>
				mapProjectToCard({
					...project,
					wilayah_group: wilayahMap[project.id_adm_provinsi] || null
				})
			)
		});
	} catch (error) {
		console.error('Catalog search failed:', error);
		return json({ error: 'Search failed.' }, { status: 500 });
	}
}
