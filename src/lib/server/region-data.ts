import { db } from '$lib/server/db';
import {
	admProvinces,
	investmentOpportunities,
	regionalPopulation,
	regionalUmr,
	regionalProfiles,
	regionalPdrb,
	regionalOffices,
	regionalInfrastructureItems,
	regionalInvestmentBySector
} from '$lib/server/db/schema';
import { sql, eq, and, asc, desc } from 'drizzle-orm';
import {
	enrichProjectWithMockData,
	getMockProvinces,
	getMockProjects,
	enrichInfraWithMockData
} from '$lib/server/mock';

function hasUsefulValue(value: unknown) {
	if (value === null || value === undefined) return false;
	if (typeof value === 'number') return Number.isFinite(value) && value > 0;
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		return normalized !== '' && normalized !== 'tbd' && normalized !== 'nan' && normalized !== 'no data';
	}
	if (typeof value === 'boolean') return value;
	return true;
}

function getProjectCompletenessScore(project: any) {
	let score = 0;
	const details = project?.details;

	if (hasUsefulValue(project.image_url)) score += 5;
	if (hasUsefulValue(project.nilai_investasi_amount) || hasUsefulValue(project.nilai_investasi)) score += 4;
	if (hasUsefulValue(project.nilai_irr_percent) || hasUsefulValue(project.nilai_irr)) score += 3;
	if (hasUsefulValue(project.nilai_npv_amount) || hasUsefulValue(project.nilai_npv)) score += 2;
	if (hasUsefulValue(project.nama_kabkot) || hasUsefulValue(project.nama_provinsi)) score += 2;
	if (hasUsefulValue(project.status) || hasUsefulValue(project.status_proyek)) score += 1;
	if (hasUsefulValue(project.nama_sektor_peluang)) score += 1;
	if (hasUsefulValue(details?.alamat)) score += 2;
	if (hasUsefulValue(details?.lokasi_kawasan)) score += 1;
	if (hasUsefulValue(details?.skema_kerja_sama)) score += 1;
	if (hasUsefulValue(details?.readiness_status)) score += 1;
	if (hasUsefulValue(details?.contact_name)) score += 1;
	if (hasUsefulValue(details?.contact_email)) score += 1;
	if (hasUsefulValue(details?.contact_phone)) score += 1;
	if (hasUsefulValue(details?.lat) && hasUsefulValue(details?.lon)) score += 1;

	return score;
}

export function getMockSelectedRegion(selectedId?: number) {
	const mockProvince = getMockProvinces().find((p) => p.id_adm_provinsi === selectedId) ?? getMockProvinces()[0];
	return {
		...mockProvince,
		count: 2,
		population: 0,
		umr: 0,
		pdrb: 0,
		deskripsi: null,
		logo_url: null,
		projects: getMockProjects(2),
		offices: [],
		infrastructure: [],
		sectorInvestment: []
	};
}

let provinceSummariesPromise: Promise<any[]> | null = null;
const REGION_DETAIL_CACHE_TTL_MS = 5 * 60 * 1000;
const regionDetailCache = new Map<number, { value: any; expiresAt: number }>();
const regionDetailInflight = new Map<number, Promise<any>>();

export async function getProvinceSummaries() {
	if (!db) {
		return getMockProvinces().map((p) => ({ ...p, count: 2 }));
	}

	if (!provinceSummariesPromise) {
		provinceSummariesPromise = Promise.all([
			db.query.admProvinces.findMany({
				orderBy: (province, { asc }) => [asc(province.nama)]
			}),
			db
				.select({
					id_adm_provinsi: investmentOpportunities.id_adm_provinsi,
					count: sql<number>`count(*)::int`
				})
				.from(investmentOpportunities)
				.groupBy(investmentOpportunities.id_adm_provinsi)
		])
			.then(([provinces, counts]) => {
				const countMap = Object.fromEntries(counts.map((row) => [row.id_adm_provinsi, row.count]));

				return provinces.map((province) => ({
					id_adm_provinsi: province.id_adm_provinsi,
					nama: province.nama,
					wilayah_group: province.wilayah_group,
					luas_wilayah: province.luas_wilayah,
					lon: province.lon,
					lat: province.lat,
					count: countMap[province.id_adm_provinsi] ?? 0,
					image_url: province.image_url,
					logo_url: null,
					deskripsi: null,
					population: 0,
					umr: 0,
					pdrb: 0
				}));
			})
			.catch((error) => {
				provinceSummariesPromise = null;
				throw error;
			});
	}

	return provinceSummariesPromise;
}

export async function getSelectedRegionDetail(selectedProvince: any) {
	if (!selectedProvince) return null;
	if (!db) return getMockSelectedRegion(selectedProvince?.id_adm_provinsi);

	const selectedProvinceId = selectedProvince.id_adm_provinsi;
	const cached = regionDetailCache.get(selectedProvinceId);

	if (cached && cached.expiresAt > Date.now()) {
		return cached.value;
	}

	const inflight = regionDetailInflight.get(selectedProvinceId);
	if (inflight) {
		return inflight;
	}

	const detailPromise = Promise.all([
		db.query.investmentOpportunities.findMany({
			where: eq(investmentOpportunities.id_adm_provinsi, selectedProvinceId),
			with: { details: true },
			orderBy: (project, { desc }) => [desc(project.id_peluang)],
			limit: 24
		}),
		db
			.select()
			.from(regionalOffices)
			.where(
				and(
					eq(regionalOffices.region_type, 'province'),
					eq(regionalOffices.id_adm_provinsi, selectedProvinceId)
				)
			),
		db
			.select()
			.from(regionalInfrastructureItems)
			.where(
				and(
					eq(regionalInfrastructureItems.region_type, 'province'),
					eq(regionalInfrastructureItems.id_adm_provinsi, selectedProvinceId)
				)
			)
			.orderBy(asc(regionalInfrastructureItems.nama))
			.limit(250),
		db
			.select()
			.from(regionalInvestmentBySector)
			.where(
				and(
					eq(regionalInvestmentBySector.region_type, 'province'),
					eq(regionalInvestmentBySector.id_adm_provinsi, selectedProvinceId)
				)
			),
		db
			.select()
			.from(regionalProfiles)
			.where(
				and(
					eq(regionalProfiles.region_type, 'province'),
					eq(regionalProfiles.id_adm_provinsi, selectedProvinceId)
				)
			)
			.limit(1),
		db
			.select()
			.from(regionalPopulation)
			.where(
				and(
					eq(regionalPopulation.region_type, 'province'),
					eq(regionalPopulation.id_adm_provinsi, selectedProvinceId),
					eq(regionalPopulation.tahun, 2024)
				)
			)
			.limit(1),
		db
			.select()
			.from(regionalUmr)
			.where(
				and(
					eq(regionalUmr.region_type, 'province'),
					eq(regionalUmr.id_adm_provinsi, selectedProvinceId),
					eq(regionalUmr.tahun, 2025)
				)
			)
			.limit(1),
		db
			.select()
			.from(regionalPdrb)
			.where(
				and(
					eq(regionalPdrb.region_type, 'province'),
					eq(regionalPdrb.id_adm_provinsi, selectedProvinceId),
					eq(regionalPdrb.tahun, 2024)
				)
			)
			.limit(1)
	])
		.then(([projectRows, officeRows, infraRows, sectorRows, profileRows, populationRows, umrRows, pdrbRows]) => {
			const profile = profileRows[0];
			const population = populationRows[0];
			const umr = umrRows[0];
			const pdrb = pdrbRows[0];

			const detail = {
				...selectedProvince,
				image_url: profile?.banner_url || selectedProvince.image_url || null,
				logo_url: profile?.icon_url || null,
				deskripsi: profile?.deskripsi ?? profile?.profil ?? null,
				population: population ? (population.jumlah_pria || 0) + (population.jumlah_wanita || 0) : 0,
				umr: umr?.nilai ?? 0,
				pdrb: pdrb?.nilai ?? 0,
				projects: projectRows
					.map((project) => {
						const enriched = enrichProjectWithMockData(project);
						return {
							id: enriched.id_peluang,
							title: enriched.nama,
							category: enriched.nama_sektor_peluang,
							capex: enriched.nilai_investasi,
							total_capex: enriched.nilai_investasi_amount ?? 0,
							npv: enriched.nilai_npv || 'TBD',
							irr: enriched.nilai_irr || 'TBD',
							image: enriched.image_url,
							details: enriched.details,
							completenessScore: getProjectCompletenessScore(enriched)
						};
					})
					.sort((a, b) => {
						const completenessDelta = b.completenessScore - a.completenessScore;
						if (completenessDelta !== 0) return completenessDelta;

						const irrA = Number.parseFloat(String(a.irr).replace(/[^0-9.-]/g, '')) || 0;
						const irrB = Number.parseFloat(String(b.irr).replace(/[^0-9.-]/g, '')) || 0;
						if (irrB !== irrA) return irrB - irrA;

						const capexA = Number(a.total_capex) || 0;
						const capexB = Number(b.total_capex) || 0;
						if (capexB !== capexA) return capexB - capexA;

						return String(a.title || '').localeCompare(String(b.title || ''));
					})
					.map(({ completenessScore, ...project }) => project),
				offices: officeRows.map((office) => ({
					nama: office.nama,
					alamat: office.alamat,
					telepon: office.no_telp
				})),
				infrastructure: infraRows.map((item) => {
					const enriched = enrichInfraWithMockData(item, selectedProvince);
					return {
						nama: enriched.nama,
						kategori: enriched.kategori,
						jenis: enriched.jenis,
						infrastructure_type: enriched.infrastructure_type,
						lat: enriched.lat,
						lon: enriched.lon
					};
				}),
				sectorInvestment: sectorRows.map((row) => ({
					sektor: row.nama_sektor,
					nilai: row.jumlah_investasi
				}))
			};

			regionDetailCache.set(selectedProvinceId, {
				value: detail,
				expiresAt: Date.now() + REGION_DETAIL_CACHE_TTL_MS
			});

			return detail;
		})
		.finally(() => {
			regionDetailInflight.delete(selectedProvinceId);
		});

	regionDetailInflight.set(selectedProvinceId, detailPromise);
	return detailPromise;
}
