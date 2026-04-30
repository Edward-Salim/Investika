import { afterEach, describe, expect, it, vi } from 'vitest';

const envState = vi.hoisted(() => ({
	GEMINI_API_KEY: '',
	GEMINI_MODEL: 'gemini-2.5-flash',
	GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
}));

const openAiMock = vi.hoisted(() => vi.fn());

vi.mock('$env/dynamic/private', () => ({
	env: envState
}));

vi.mock('openai', () => ({
	default: openAiMock
}));

describe('createAiClient', () => {
	afterEach(() => {
		envState.GEMINI_API_KEY = '';
		envState.GEMINI_MODEL = 'gemini-2.5-flash';
		envState.GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
		openAiMock.mockClear();
		vi.resetModules();
	});

	it('fails clearly when GEMINI_API_KEY is missing', async () => {
		const { createAiClient } = await import('./client');

		expect(() => createAiClient()).toThrow(/GEMINI_API_KEY/);
	});

	it('uses the configured model name from environment', async () => {
		envState.GEMINI_API_KEY = 'test-key';
		envState.GEMINI_MODEL = 'gemini-2.5-pro';

		const { getAiModel } = await import('./client');

		expect(getAiModel()).toBe('gemini-2.5-pro');
	});

	it('does not make network calls during construction', async () => {
		envState.GEMINI_API_KEY = 'test-key';

		const { createAiClient } = await import('./client');

		createAiClient();

		expect(openAiMock).toHaveBeenCalledTimes(1);
		expect(openAiMock).toHaveBeenCalledWith({
			apiKey: 'test-key',
			baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
		});
	});
});
