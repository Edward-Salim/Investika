import { db } from '$lib/server/db';
import { mapProjectToCard } from '$lib/projects/project-card';
import type { PageServerLoad } from './$types';
import { getMockProjects } from '$lib/server/mock';
import { getHomeProjectsPage, getHomeProjectsTotal, HOME_PROJECTS_PAGE_SIZE } from '$lib/server/home-projects';

export const load: PageServerLoad = async () => {
	try {
		if (!db) {
			const projects = getMockProjects(HOME_PROJECTS_PAGE_SIZE).map(mapProjectToCard);
			return { projects, totalProjects: projects.length };
		}

		const [projects, totalProjects] = await Promise.all([
			getHomeProjectsPage(db, 0, HOME_PROJECTS_PAGE_SIZE),
			getHomeProjectsTotal(db)
		]);

		return {
			projects,
			totalProjects
		};
	} catch (error: any) {
		console.error('Main load error:', error);
		const projects = getMockProjects(HOME_PROJECTS_PAGE_SIZE).map(mapProjectToCard);
		return {
			projects,
			totalProjects: projects.length
		};
	}
};

