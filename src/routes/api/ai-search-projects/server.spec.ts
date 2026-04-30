import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbState = vi.hoisted(() => ({ current: {} as object | null }));
const planProjectSearch = vi.hoisted(() => vi.fn());
const executeProjectSearchPlan = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/db', () => ({
	get db() {
		return dbState.current;
	}
}));

vi.mock('$lib/server/ai/project-search/planner', () => ({
	planProjectSearch
}));

vi.mock('$lib/server/ai/project-search/query', () => ({
	executeProjectSearchPlan
}));

describe('POST /api/ai-search-projects', () => {
	beforeEach(() => {
		dbState.current = {};
		planProjectSearch.mockReset();
		executeProjectSearchPlan.mockReset();
	});

	it('rejects missing or empty query', async () => {
		const { POST } = await import('./+server');
		const response = await POST({
			request: new Request('http://localhost/api/ai-search-projects', {
				method: 'POST',
				body: JSON.stringify({ query: '' })
			})
		} as never);

		expect(response.status).toBe(400);
	});

	it('returns 503 when db is unavailable', async () => {
		dbState.current = null;
		const { POST } = await import('./+server');
		const response = await POST({
			request: new Request('http://localhost/api/ai-search-projects', {
				method: 'POST',
				body: JSON.stringify({ query: 'energy projects' })
			})
		} as never);

		expect(response.status).toBe(503);
	});

	it('returns 200 with summary, appliedPlan, and projects on success', async () => {
		const plan = {
			intent: 'find_projects',
			base_table: 'investment_opportunities',
			joins: [],
			filters: [],
			sort: [],
			limit: 20,
			select_strategy: 'project_cards',
			explanation: 'Searching energy projects.'
		};
		const projects = [{ id: '1', title: 'Geothermal Expansion' }];
		planProjectSearch.mockResolvedValueOnce(plan);
		executeProjectSearchPlan.mockResolvedValueOnce(projects);

		const { POST } = await import('./+server');
		const response = await POST({
			request: new Request('http://localhost/api/ai-search-projects', {
				method: 'POST',
				body: JSON.stringify({ query: 'energy projects' })
			})
		} as never);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			summary: 'Searching energy projects.',
			appliedPlan: plan,
			projects
		});
	});

	it('returns a safe 422 when the AI plan cannot be interpreted', async () => {
		planProjectSearch.mockRejectedValueOnce(new Error('AI project search could not interpret the model response.'));

		const { POST } = await import('./+server');
		const response = await POST({
			request: new Request('http://localhost/api/ai-search-projects', {
				method: 'POST',
				body: JSON.stringify({ query: 'energy projects' })
			})
		} as never);
		const body = await response.json();

		expect(response.status).toBe(422);
		expect(body).toEqual({
			error: 'The AI search plan could not be interpreted.'
		});
	});
});
