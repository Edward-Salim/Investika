import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/ai/client', () => ({
	createAiClient: () => ({
		chat: {
			completions: {
				create: createMock
			}
		}
	}),
	getAiModel: () => 'gemini-2.5-flash'
}));

describe('planProjectSearch', () => {
	beforeEach(() => {
		createMock.mockReset();
	});

	it('parses a valid AI response into a validated plan', async () => {
		createMock.mockResolvedValueOnce({
			choices: [
				{
					message: {
						content: JSON.stringify({
							intent: 'find_projects',
							base_table: 'investment_opportunities',
							joins: [],
							filters: [],
							sort: [],
							limit: 20,
							select_strategy: 'project_cards',
							explanation: 'Searching all projects.'
						})
					}
				}
			]
		});

		const { planProjectSearch } = await import('./planner');
		const plan = await planProjectSearch('all projects');

		expect(plan.intent).toBe('find_projects');
		expect(plan.explanation).toBe('Searching all projects.');
	});

	it('throws a clear error for invalid JSON responses', async () => {
		createMock.mockResolvedValueOnce({
			choices: [
				{
					message: {
						content: '{not valid json'
					}
				}
			]
		});

		const { planProjectSearch } = await import('./planner');

		await expect(planProjectSearch('all projects')).rejects.toThrow(/could not interpret/i);
	});

	it('throws a clear error for empty content responses', async () => {
		createMock.mockResolvedValueOnce({
			choices: [
				{
					message: {
						content: ''
					}
				}
			]
		});

		const { planProjectSearch } = await import('./planner');

		await expect(planProjectSearch('all projects')).rejects.toThrow(/empty/i);
	});

	it('preserves the plan explanation after validation', async () => {
		createMock.mockResolvedValueOnce({
			choices: [
				{
					message: {
						content: JSON.stringify({
							intent: 'find_projects',
							base_table: 'investment_opportunities',
							joins: [],
							filters: [],
							sort: [],
							limit: 20,
							select_strategy: 'project_cards',
							explanation: ' Focus on Sulawesi energy projects. '
						})
					}
				}
			]
		});

		const { planProjectSearch } = await import('./planner');
		const plan = await planProjectSearch('energy projects in Sulawesi');

		expect(plan.explanation).toBe('Focus on Sulawesi energy projects.');
	});
});
