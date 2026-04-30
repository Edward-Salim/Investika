import { db } from '$lib/server/db';
import { investmentOpportunities, admProvinces } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { enrichProjectWithMockData, getMockProjects } from '$lib/server/mock';

export const load: PageServerLoad = async () => {
	try {
		if (!db) return { projects: getMockProjects() };

		// Fetch provinces to build a wilayah_group lookup
		let provinces: any[] = [];
		try {
			provinces = await db.select({
				id_adm_provinsi: admProvinces.id_adm_provinsi,
				wilayah_group: admProvinces.wilayah_group
			}).from(admProvinces);
		} catch (e) {
			console.error('Failed to fetch provinces:', e);
		}

		const wilayahMap = Object.fromEntries(
			provinces.map(p => [p.id_adm_provinsi, p.wilayah_group])
		);

		let projects: any[] = [];
		try {
			projects = await db.query.investmentOpportunities.findMany({
				limit: 200,
				with: {
					details: true
				}
			});
		} catch (e) {
			console.error('Failed to fetch projects from DB, falling back to mock data:', e);
			projects = getMockProjects();
		}

		// If DB query succeeded but returned no projects, also provide mocks for better UX
		if (projects.length === 0) {
			projects = getMockProjects();
		}

		// Attach wilayah_group to each project and enrich with mock data
		const enrichedProjects = projects.map((p: any) => {
			const enriched = enrichProjectWithMockData(p);
			return {
				...enriched,
				wilayah_group: wilayahMap[p.id_adm_provinsi] || null
			};
		});

		return {
			projects: enrichedProjects
		};
	} catch (error) {
		console.error('Main load error:', error);
		return {
			projects: getMockProjects()
		};
	}
};
