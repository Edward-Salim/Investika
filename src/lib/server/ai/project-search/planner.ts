import { createAiClient, getAiModel } from '$lib/server/ai/client';
import { buildProjectSearchPrompt } from './prompt';
import { validateProjectSearchPlan } from './validator';

function getResponseText(content: unknown) {
	if (typeof content === 'string') {
		return content.trim();
	}

	if (Array.isArray(content)) {
		return content
			.map(part => {
				if (typeof part === 'string') {
					return part;
				}

				if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
					return part.text;
				}

				return '';
			})
			.join('')
			.trim();
	}

	return '';
}

export async function planProjectSearch(query: string) {
	const client = createAiClient();
	const prompt = buildProjectSearchPrompt(query);

	const response = await client.chat.completions.create({
		model: getAiModel(),
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'user',
				content: prompt
			}
		],
		stream: false
	});

	const content = getResponseText(response.choices[0]?.message?.content);

	if (!content) {
		throw new Error('AI project search returned an empty plan response.');
	}

	let parsed: unknown;

	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error('AI project search could not interpret the model response.');
	}

	try {
		return validateProjectSearchPlan(parsed);
	} catch {
		throw new Error('AI project search could not interpret the model response.');
	}
}
