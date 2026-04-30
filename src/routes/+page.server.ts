import { db } from '$lib/server/db';
import { admProvinces } from '$lib/server/db/schema';
import { mapProjectToCard } from '$lib/projects/project-card';
import type { PageServerLoad } from './$types';
import { enrichProjectWithMockData, getMockProjects } from '$lib/server/mock';

export const load: PageServerLoad = async () => {
	try {
		if (!db) {
			return { projects: getMockProjects().map(mapProjectToCard) };
		}

		// Run both queries in parallel for speed
		const [provResult, projResult] = await Promise.allSettled([
			db.select({
				id_adm_provinsi: admProvinces.id_adm_provinsi,
				wilayah_group: admProvinces.wilayah_group
			}).from(admProvinces),
			db.query.investmentOpportunities.findMany({
				limit: 100,
				with: {
					details: true
				}
			})
		]);

		const provinces = provResult.status === 'fulfilled' ? provResult.value : [];
		let projects = projResult.status === 'fulfilled' ? projResult.value : getMockProjects();

		if (projects.length === 0) {
			projects = getMockProjects();
		}

		const wilayahMap = Object.fromEntries(
			provinces.map((p) => [p.id_adm_provinsi, p.wilayah_group])
		);

		return {
			projects: projects
				.map((project: any) => ({
					...enrichProjectWithMockData(project),
					wilayah_group: wilayahMap[project.id_adm_provinsi] || null
				}))
				.map(mapProjectToCard)
		};
	} catch (error: any) {
		console.error('Main load error:', error);
		return {
			projects: getMockProjects().map(mapProjectToCard)
		};
	}
};

