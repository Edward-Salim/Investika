import { admProvinces, investmentOpportunities } from '$lib/server/db/schema';
import { mapProjectToCard } from '$lib/projects/project-card';
import { count, desc } from 'drizzle-orm';
import { getMockProjects } from '$lib/server/mock';

export const HOME_PROJECTS_PAGE_SIZE = 18;

type Database = NonNullable<typeof import('$lib/server/db').db>;
let provinceMapPromise: Promise<Record<number, string | null>> | null = null;

async function getProvinceMap(db: Database) {
	if (!provinceMapPromise) {
		provinceMapPromise = db
			.select({
				id_adm_provinsi: admProvinces.id_adm_provinsi,
				wilayah_group: admProvinces.wilayah_group
			})
			.from(admProvinces)
			.then((provinces) =>
				Object.fromEntries(
					provinces.map((province) => [province.id_adm_provinsi, province.wilayah_group ?? null])
				)
			)
			.catch((error) => {
				provinceMapPromise = null;
				throw error;
			});
	}

	return provinceMapPromise;
}

async function getProvinceMapSafe(db: Database) {
	try {
		return await getProvinceMap(db);
	} catch (error) {
		console.error('Province map query failed:', error);
		return {};
	}
}

export async function getHomeProjectsPage(
	db: Database,
	offset = 0,
	limit = HOME_PROJECTS_PAGE_SIZE
) {
	const [provinceMapResult, projectsResult] = await Promise.allSettled([
		getProvinceMapSafe(db),
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
			.orderBy(desc(investmentOpportunities.id_peluang))
			.limit(limit)
			.offset(offset)
	]);

	const provinceMap =
		provinceMapResult.status === 'fulfilled' ? provinceMapResult.value : {};

	if (projectsResult.status !== 'fulfilled') {
		console.error('Homepage projects query failed:', projectsResult.reason);
		return getMockProjects(limit).map(mapProjectToCard);
	}

	const projects = projectsResult.value;

	return projects.map((project) =>
		mapProjectToCard({
			...project,
			wilayah_group: provinceMap[project.id_adm_provinsi] || null
		})
	);
}

export async function getHomeProjectsTotal(db: Database) {
	try {
		const result = await db.select({ total: count() }).from(investmentOpportunities);
		return Number(result[0]?.total ?? 0);
	} catch (error) {
		console.error('Homepage project count query failed:', error);
		return 0;
	}
}
