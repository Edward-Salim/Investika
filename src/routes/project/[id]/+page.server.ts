import { db } from '$lib/server/db';
import { investmentOpportunities, investmentOpportunityDetails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { enrichProjectWithMockData, generateMockProject } from '$lib/server/mock';

function compareRecordId(a: { id?: bigint | number | string | null }, b: { id?: bigint | number | string | null }) {
	const aId = a?.id == null ? 0n : BigInt(a.id);
	const bId = b?.id == null ? 0n : BigInt(b.id);
	if (aId === bId) return 0;
	return aId < bId ? -1 : 1;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	
	if (isNaN(id)) {
		throw error(400, 'Invalid project ID');
	}

	if (!db) {
		return {
			project: enrichProjectWithMockData(generateMockProject(id))
		};
	}

	let project;

	try {
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

	if (Array.isArray(project.galleries)) {
		project.galleries = [...project.galleries].sort(compareRecordId);
	}

	if (Array.isArray(project.infos)) {
		project.infos = [...project.infos].sort(compareRecordId);
	}

	return {
		project
	};
};
