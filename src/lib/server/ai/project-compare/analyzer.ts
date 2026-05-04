import { createAiClient, getAiModel } from '$lib/server/ai/client';
import { getLocale, toLocale } from '$lib/paraglide/runtime';

export type CompareLocale = 'en' | 'id' | 'zh' | 'ja' | 'ko';

export type CompareProjectInput = {
	id: string;
	title: string;
	category?: string | null;
	location?: string | null;
	province?: string | null;
	city?: string | null;
	status?: string | null;
	agency?: string | null;
	scheme?: string | null;
	landArea?: string | null;
	kbli?: string | null;
	capex?: string | number | null;
	investment?: string | number | null;
	irr?: string | number | null;
	npv?: string | number | null;
	payback?: string | number | null;
	docStatus?: string | null;
	isPsn?: boolean | null;
	isKek?: boolean | null;
	riskLabel?: string | null;
	investmentNum?: number | null;
	irrNum?: number | null;
	npvNum?: number | null;
};

export type ProjectCompareAnalysis = {
	summary: string;
	keyTakeaways: [string, string];
	synergySummary: string;
	averageIrr: number | null;
	recommendedProjectId: string | null;
};

const LOCALE_LABELS: Record<CompareLocale, string> = {
	en: 'English',
	id: 'Bahasa Indonesia',
	zh: 'Simplified Chinese',
	ja: 'Japanese',
	ko: 'Korean'
};

const FALLBACK_COPY: Record<
	CompareLocale,
	{
		summary: (project: string) => string;
		takeaway1: (project: string) => string;
		takeaway2: (count: number) => string;
		synergyHigh: string;
		synergyMedium: string;
		synergyLow: string;
	}
> = {
	en: {
		summary: (project) =>
			`${project} stands out as the clearest lead option based on the available commercial and readiness data.`,
		takeaway1: (project) =>
			`${project} currently shows the strongest blend of scale, return, and execution visibility among the selected projects.`,
		takeaway2: (count) =>
			`This comparison covers ${count} selected projects and should be treated as a directional portfolio view while deeper diligence is still required.`,
		synergyHigh: 'High fit',
		synergyMedium: 'Moderate fit',
		synergyLow: 'Selective fit'
	},
	id: {
		summary: (project) =>
			`${project} paling menonjol sebagai opsi utama berdasarkan data komersial dan kesiapan yang tersedia.`,
		takeaway1: (project) =>
			`${project} saat ini menunjukkan kombinasi skala, imbal hasil, dan visibilitas eksekusi yang paling kuat di antara proyek terpilih.`,
		takeaway2: (count) =>
			`Perbandingan ini mencakup ${count} proyek terpilih dan sebaiknya dibaca sebagai pandangan portofolio awal sambil menunggu due diligence yang lebih dalam.`,
		synergyHigh: 'Kecocokan tinggi',
		synergyMedium: 'Kecocokan menengah',
		synergyLow: 'Kecocokan selektif'
	},
	zh: {
		summary: (project) => `${project} 依据现有商业与成熟度数据，最适合作为优先项目。`,
		takeaway1: (project) =>
			`${project} 目前在项目规模、回报水平与执行可见性之间呈现最强的综合平衡。`,
		takeaway2: (count) =>
			`本次比较涵盖 ${count} 个已选项目，应视为初步组合判断，后续仍需更深入的尽职调查。`,
		synergyHigh: '高度协同',
		synergyMedium: '中度协同',
		synergyLow: '选择性协同'
	},
	ja: {
		summary: (project) =>
			`${project} は、利用可能な商業性と準備状況のデータに基づくと最有力候補です。`,
		takeaway1: (project) =>
			`${project} は、規模、収益性、実行確度のバランスが選定案件の中で最も良好です。`,
		takeaway2: (count) =>
			`この比較は選択中の ${count} 件の案件を対象とした初期的なポートフォリオ評価であり、追加のデューデリジェンスが必要です。`,
		synergyHigh: '高い適合度',
		synergyMedium: '中程度の適合度',
		synergyLow: '選択的な適合度'
	},
	ko: {
		summary: (project) =>
			`${project}은(는) 현재 उपलब्ध한 사업성과 준비도 데이터를 기준으로 가장 유력한 선도 후보입니다.`,
		takeaway1: (project) =>
			`${project}은(는) 선택된 프로젝트 가운데 규모, 수익성, 실행 가시성의 균형이 가장 뛰어납니다.`,
		takeaway2: (count) =>
			`이번 비교는 선택된 ${count}개 프로젝트에 대한 초기 포트폴리오 관점이며, 추가 실사가 필요합니다.`,
		synergyHigh: '높은 적합도',
		synergyMedium: '중간 적합도',
		synergyLow: '선별적 적합도'
	}
};

function getResponseText(content: unknown) {
	if (typeof content === 'string') {
		return content.trim();
	}

	if (Array.isArray(content)) {
		return content
			.map((part) => {
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

function normalizeLocale(locale?: string): CompareLocale {
	return (toLocale(locale) ?? toLocale(getLocale()) ?? 'en') as CompareLocale;
}

function getRecommendedProject(projects: CompareProjectInput[]) {
	return [...projects].sort((a, b) => {
		const irrDelta = (b.irrNum ?? -1) - (a.irrNum ?? -1);
		if (irrDelta !== 0) return irrDelta;

		const investDelta = (b.investmentNum ?? -1) - (a.investmentNum ?? -1);
		if (investDelta !== 0) return investDelta;

		return a.title.localeCompare(b.title);
	})[0];
}

function buildFallbackAnalysis(
	projects: CompareProjectInput[],
	locale: CompareLocale
): ProjectCompareAnalysis {
	const fallback = FALLBACK_COPY[locale];
	const recommended = getRecommendedProject(projects);
	const averageIrr =
		projects.filter((project) => typeof project.irrNum === 'number' && Number.isFinite(project.irrNum))
			.reduce((sum, project, _, arr) => sum + (project.irrNum ?? 0) / arr.length, 0) || null;

	let synergySummary = fallback.synergyLow;

	if (projects.length >= 3) {
		synergySummary = fallback.synergyHigh;
	} else if (projects.length === 2) {
		synergySummary = fallback.synergyMedium;
	}

	const leadProject = recommended?.title ?? projects[0]?.title ?? 'Selected project';

	return {
		summary: fallback.summary(leadProject),
		keyTakeaways: [fallback.takeaway1(leadProject), fallback.takeaway2(projects.length)],
		synergySummary,
		averageIrr: averageIrr ? Number(averageIrr.toFixed(1)) : null,
		recommendedProjectId: recommended?.id ?? null
	};
}

function buildPrompt(projects: CompareProjectInput[], locale: CompareLocale) {
	const language = LOCALE_LABELS[locale];

	return `
You are analyzing shortlisted investment projects for Investika.

Return valid JSON only with this exact shape:
{
  "summary": string,
  "keyTakeaways": [string, string],
  "synergySummary": string,
  "averageIrr": number | null,
  "recommendedProjectId": string | null
}

Rules:
- Write all explanatory text in ${language}.
- Keep project titles exactly as provided.
- Base the comparison only on the provided project data.
- Do not invent guarantees, financing structures, or unavailable metrics.
- If data is incomplete, be explicit but concise.
- "summary" should be 2 to 3 sentences.
- Each item in "keyTakeaways" should be a single sentence.
- "synergySummary" must be a short label of at most 4 words in ${language}.
- "averageIrr" must reflect the selected projects when enough data exists, otherwise null.
- "recommendedProjectId" must be one of the provided ids or null.

Projects:
${JSON.stringify(projects, null, 2)}
`.trim();
}

function isAnalysis(value: unknown): value is ProjectCompareAnalysis {
	if (!value || typeof value !== 'object') return false;

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.summary === 'string' &&
		Array.isArray(candidate.keyTakeaways) &&
		candidate.keyTakeaways.length >= 2 &&
		typeof candidate.keyTakeaways[0] === 'string' &&
		typeof candidate.keyTakeaways[1] === 'string' &&
		typeof candidate.synergySummary === 'string' &&
		(candidate.averageIrr === null || typeof candidate.averageIrr === 'number') &&
		(candidate.recommendedProjectId === null || typeof candidate.recommendedProjectId === 'string')
	);
}

export async function analyzeProjectCompare(
	projects: CompareProjectInput[],
	locale?: string
): Promise<ProjectCompareAnalysis> {
	const targetLocale = normalizeLocale(locale);
	const safeProjects = projects.slice(0, 3);

	if (safeProjects.length === 0) {
		throw new Error('At least one project is required for comparison.');
	}

	try {
		const client = createAiClient();
		const response = await client.chat.completions.create({
			model: getAiModel(),
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'user',
					content: buildPrompt(safeProjects, targetLocale)
				}
			],
			stream: false
		});

		const content = getResponseText(response.choices[0]?.message?.content);

		if (!content) {
			return buildFallbackAnalysis(safeProjects, targetLocale);
		}

		const parsed = JSON.parse(content) as unknown;

		if (!isAnalysis(parsed)) {
			return buildFallbackAnalysis(safeProjects, targetLocale);
		}

		return {
			summary: parsed.summary.trim(),
			keyTakeaways: [parsed.keyTakeaways[0].trim(), parsed.keyTakeaways[1].trim()],
			synergySummary: parsed.synergySummary.trim(),
			averageIrr:
				typeof parsed.averageIrr === 'number' && Number.isFinite(parsed.averageIrr)
					? Number(parsed.averageIrr.toFixed(1))
					: null,
			recommendedProjectId: parsed.recommendedProjectId
		};
	} catch {
		return buildFallbackAnalysis(safeProjects, targetLocale);
	}
}
