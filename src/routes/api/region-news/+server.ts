import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type RegionNewsItem = {
	title: string;
	link: string;
	source: string;
	sourceUrl: string;
	sourceIcon: string;
	date: string;
};

function decodeXml(value: string) {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

function getTagValue(item: string, tag: string) {
	const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
	return match ? decodeXml(match[1].trim()) : '';
}

function getSourceData(item: string, fallbackSource: string) {
	const match = item.match(/<source(?:\s+url="([^"]+)")?>([\s\S]*?)<\/source>/i);
	const sourceUrl = match?.[1] ? decodeXml(match[1]) : '';
	const source = match?.[2] ? decodeXml(match[2].trim()) : fallbackSource;
	const sourceIcon = sourceUrl
		? `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(sourceUrl)}`
		: '';

	return { source, sourceUrl, sourceIcon };
}

function formatRelativeDate(pubDate: string) {
	const published = new Date(pubDate).getTime();
	if (Number.isNaN(published)) return '';

	const diffMs = Date.now() - published;
	const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

	if (diffHours < 24) return `${diffHours}h ago`;

	const diffDays = Math.max(1, Math.floor(diffHours / 24));
	return `${diffDays}d ago`;
}

function parseGoogleNewsRss(xml: string): RegionNewsItem[] {
	const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

	return items
		.map((match) => {
			const item = match[1];
			const fullTitle = getTagValue(item, 'title');
			const link = getTagValue(item, 'link');
			const pubDate = getTagValue(item, 'pubDate');

			const titleParts = fullTitle.split(' - ');
			const fallbackSource = titleParts.length > 1 ? titleParts[titleParts.length - 1] : 'Google News';
			const title = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : fullTitle;
			const { source, sourceUrl, sourceIcon } = getSourceData(item, fallbackSource);

			return {
				title,
				link,
				source,
				sourceUrl,
				sourceIcon,
				date: formatRelativeDate(pubDate)
			};
		})
		.filter((item) => item.title && item.link)
		.slice(0, 4);
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const region = url.searchParams.get('region')?.trim();

	if (!region) {
		return json({ items: [] satisfies RegionNewsItem[] }, { status: 400 });
	}

	const query = encodeURIComponent(`${region} investment Indonesia`);
	const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-ID&gl=ID&ceid=ID:en`;

	try {
		const response = await fetch(rssUrl, {
			headers: {
				'user-agent': 'Mozilla/5.0 Investika/1.0'
			}
		});

		if (!response.ok) {
			throw new Error(`Google News RSS responded with ${response.status}`);
		}

		const xml = await response.text();
		return json({ items: parseGoogleNewsRss(xml) });
	} catch (error) {
		console.error('Failed to fetch region news:', error);
		return json({ items: [] satisfies RegionNewsItem[] }, { status: 200 });
	}
};
