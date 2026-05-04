import { json } from '@sveltejs/kit';
import { analyzeProjectCompare, type CompareProjectInput } from '$lib/server/ai/project-compare/analyzer';

function sanitizeProject(project: unknown): CompareProjectInput | null {
	if (!project || typeof project !== 'object') return null;

	const candidate = project as Record<string, unknown>;
	const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
	const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';

	if (!id || !title) return null;

	return {
		id,
		title,
		category: typeof candidate.category === 'string' ? candidate.category : null,
		location: typeof candidate.location === 'string' ? candidate.location : null,
		province: typeof candidate.province === 'string' ? candidate.province : null,
		city: typeof candidate.city === 'string' ? candidate.city : null,
		status: typeof candidate.status === 'string' ? candidate.status : null,
		agency: typeof candidate.agency === 'string' ? candidate.agency : null,
		scheme: typeof candidate.scheme === 'string' ? candidate.scheme : null,
		landArea: typeof candidate.landArea === 'string' ? candidate.landArea : null,
		kbli: typeof candidate.kbli === 'string' ? candidate.kbli : null,
		capex:
			typeof candidate.capex === 'string' || typeof candidate.capex === 'number'
				? candidate.capex
				: null,
		investment:
			typeof candidate.investment === 'string' || typeof candidate.investment === 'number'
				? candidate.investment
				: null,
		irr: typeof candidate.irr === 'string' || typeof candidate.irr === 'number' ? candidate.irr : null,
		npv: typeof candidate.npv === 'string' || typeof candidate.npv === 'number' ? candidate.npv : null,
		payback:
			typeof candidate.payback === 'string' || typeof candidate.payback === 'number'
				? candidate.payback
				: null,
		docStatus: typeof candidate.docStatus === 'string' ? candidate.docStatus : null,
		isPsn: typeof candidate.isPsn === 'boolean' ? candidate.isPsn : null,
		isKek: typeof candidate.isKek === 'boolean' ? candidate.isKek : null,
		riskLabel: typeof candidate.riskLabel === 'string' ? candidate.riskLabel : null,
		investmentNum: typeof candidate.investmentNum === 'number' ? candidate.investmentNum : null,
		irrNum: typeof candidate.irrNum === 'number' ? candidate.irrNum : null,
		npvNum: typeof candidate.npvNum === 'number' ? candidate.npvNum : null
	};
}

export async function POST({ request }: { request: Request }) {
	const body = await request.json().catch(() => null);
	const locale = typeof body?.locale === 'string' ? body.locale : undefined;
	const rawProjects: unknown[] = Array.isArray(body?.projects) ? body.projects : [];
	const projects = rawProjects
		.map(sanitizeProject)
		.filter((project): project is CompareProjectInput => Boolean(project));

	if (projects.length === 0) {
		return json({ error: 'Projects are required.' }, { status: 400 });
	}

	try {
		const analysis = await analyzeProjectCompare(projects, locale);
		return json(analysis);
	} catch {
		return json({ error: 'Compare failed. Please try again.' }, { status: 500 });
	}
}
