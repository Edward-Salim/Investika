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

		let provinces: any[] = [];
		try {
			provinces = await db
				.select({
					id_adm_provinsi: admProvinces.id_adm_provinsi,
					wilayah_group: admProvinces.wilayah_group
				})
				.from(admProvinces);
		} catch (error) {
			console.error('Failed to fetch provinces:', error);
		}

		const wilayahMap = Object.fromEntries(provinces.map((province) => [province.id_adm_provinsi, province.wilayah_group]));

		let projects: any[] = [];
		try {
			projects = await db.query.investmentOpportunities.findMany({
				limit: 200,
				with: {
					details: true
				}
			});
		} catch (error) {
			console.error('Failed to fetch projects from DB, falling back to mock data:', error);
			projects = getMockProjects();
		}

		if (projects.length === 0) {
			projects = getMockProjects();
		}

		return {
			projects: projects
				.map((project: any) => ({
					...enrichProjectWithMockData(project),
					wilayah_group: wilayahMap[project.id_adm_provinsi] || null
				}))
				.map(mapProjectToCard)
		};
	} catch (error) {
		console.error('Main load error:', error);
		return {
			projects: getMockProjects().map(mapProjectToCard)
		};
	}
};
