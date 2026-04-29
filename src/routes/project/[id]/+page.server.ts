import { db } from '$lib/server/db';
import { investmentOpportunities, investmentOpportunityDetails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	
	if (isNaN(id)) {
		throw error(400, 'Invalid project ID');
	}

	if (!db) {
		throw error(500, 'Database connection unavailable');
	}

	// Fetch project with its details using Drizzle relational query
	const project = await db.query.investmentOpportunities.findFirst({
		where: eq(investmentOpportunities.id_peluang, id),
		with: {
			details: true
		}
	});

	if (!project) {
		throw error(404, 'Project not found');
	}

	return {
		project
	};
};
