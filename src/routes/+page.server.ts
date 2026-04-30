import { db } from '$lib/server/db';
import { admProvinces } from '$lib/server/db/schema';
import { mapProjectToCard } from '$lib/projects/project-card';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!db) return { projects: [] };

	// Fetch provinces to build a wilayah_group lookup
	const provinces = await db.select({
		id_adm_provinsi: admProvinces.id_adm_provinsi,
		wilayah_group: admProvinces.wilayah_group
	}).from(admProvinces);

	const wilayahMap = Object.fromEntries(
		provinces.map(p => [p.id_adm_provinsi, p.wilayah_group])
	);

	const projects = await db.query.investmentOpportunities.findMany({
		limit: 200
	});

	// Attach wilayah_group to each project
	const projectsWithWilayah = projects.map((p: any) => ({
		...p,
		wilayah_group: wilayahMap[p.id_adm_provinsi] || null
	}));

	return {
		projects: projectsWithWilayah.map(mapProjectToCard)
	};
};
