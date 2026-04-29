import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const imageUrl = url.searchParams.get('url');

	if (!imageUrl) {
		throw error(400, 'Missing image URL');
	}

	try {
		const response = await fetch(imageUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Referer': 'https://regionalinvestment.bkpm.go.id/'
			}
		});

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch image');
		}

		const contentType = response.headers.get('content-type') || 'image/jpeg';
		const arrayBuffer = await response.arrayBuffer();

		return new Response(arrayBuffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
			}
		});
	} catch (e) {
		console.error('Proxy image error:', e);
		throw error(500, 'Internal server error');
	}
};
