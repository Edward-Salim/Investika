import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { planProjectSearch } from '$lib/server/ai/project-search/planner';
import { executeProjectSearchPlan } from '$lib/server/ai/project-search/query';

export async function POST({ request }: { request: Request }) {
	const body = await request.json().catch(() => null);
	const query = typeof body?.query === 'string' ? body.query.trim() : '';

	if (!query) {
		return json({ error: 'Query is required.' }, { status: 400 });
	}

	if (!db) {
		return json({ error: 'Search is temporarily unavailable.' }, { status: 503 });
	}

	try {
		const plan = await planProjectSearch(query);
		const projects = await executeProjectSearchPlan(db, plan);

		return json({
			summary: plan.explanation,
			appliedPlan: plan,
			projects
		});
	} catch (error) {
		if (error instanceof Error && /could not interpret/i.test(error.message)) {
			return json({ error: 'The AI search plan could not be interpreted.' }, { status: 422 });
		}

		return json({ error: 'Search failed. Please try again.' }, { status: 500 });
	}
}
