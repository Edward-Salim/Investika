import { db } from '$lib/server/db';
import { investmentOpportunities, investmentOpportunityDetails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { enrichProjectWithMockData, generateMockProject } from '$lib/server/mock';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	
	if (isNaN(id)) {
		throw error(400, 'Invalid project ID');
	}

	let project;

	try {
		if (!db) throw new Error('DB connection unavailable');

		// Fetch project with its details using Drizzle relational query
		project = await db.query.investmentOpportunities.findFirst({
			where: eq(investmentOpportunities.id_peluang, id),
			with: {
				details: true,
				contacts: true,
				galleries: true,
				incentives: true,
				infos: true
			}
		});

		if (!project) {
			// If not found in DB, we could either 404 or provide a mock
			// Let's provide a mock for ID 1000+ for demo purposes
			if (id >= 1000) {
				project = generateMockProject(id);
			} else {
				throw error(404, 'Project not found');
			}
		}
	} catch (e: any) {
		console.error('Failed to fetch project detail:', e);
		if (e.status === 404) throw e;
		
		// Fallback to mock for any DB error
		project = generateMockProject(id);
	}

	// Enrich with mock data for missing fields
	project = enrichProjectWithMockData(project);

	return {
		project
	};
};
