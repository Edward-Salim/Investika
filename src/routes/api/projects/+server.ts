import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { getHomeProjectsPage, HOME_PROJECTS_PAGE_SIZE } from '$lib/server/home-projects';
import { getMockProjects } from '$lib/server/mock';
import { mapProjectToCard } from '$lib/projects/project-card';

export async function GET({ url }) {
	const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset') ?? '0', 10) || 0);
	const limit = Math.min(
		HOME_PROJECTS_PAGE_SIZE,
		Math.max(1, Number.parseInt(url.searchParams.get('limit') ?? String(HOME_PROJECTS_PAGE_SIZE), 10) || HOME_PROJECTS_PAGE_SIZE)
	);

	try {
		if (!db) {
			const projects = getMockProjects(limit).map(mapProjectToCard);
			return json({
				projects,
				hasMore: false
			});
		}

		const projects = await getHomeProjectsPage(db, offset, limit);
		return json({
			projects,
			hasMore: projects.length === limit
		});
	} catch (error) {
		console.error('Projects pagination error:', error);
		return json(
			{
				error: 'Failed to load projects'
			},
			{ status: 500 }
		);
	}
}
