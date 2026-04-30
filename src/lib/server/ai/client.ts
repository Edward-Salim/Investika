import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

export function getAiModel() {
	return env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export function createAiClient() {
	if (!env.GEMINI_API_KEY) {
		throw new Error('GEMINI_API_KEY is required for AI project search.');
	}

	return new OpenAI({
		apiKey: env.GEMINI_API_KEY,
		baseURL: env.GEMINI_BASE_URL || DEFAULT_GEMINI_BASE_URL
	});
}
