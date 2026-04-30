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
import { sql, eq, and, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { enrichProjectWithMockData, getMockProvinces, getMockProjects, enrichInfraWithMockData } from '$lib/server/mock';

export const load: PageServerLoad = async () => {
    try {
        if (!db) return { provinces: getMockProvinces().map(p => ({ ...p, projects: getMockProjects(2) })) };

        // Fire ALL queries in parallel to minimize total round-trip time
        const [
            provResult,
            countResult,
            popResult,
            umrResult,
            pdrbResult,
            profileResult,
            officeResult,
            infraResult,
            sectorResult,
            projectResult
        ] = await Promise.allSettled([
            db.query.admProvinces.findMany({
                orderBy: (provinces, { asc }) => [asc(provinces.nama)]
            }),
            db.select({
                id_adm_provinsi: investmentOpportunities.id_adm_provinsi,
                count: sql<number>`count(*)::int`
            }).from(investmentOpportunities).groupBy(investmentOpportunities.id_adm_provinsi),
            db.select().from(regionalPopulation)
                .where(and(eq(regionalPopulation.region_type, 'province'), eq(regionalPopulation.tahun, 2024))),
            db.select().from(regionalUmr)
                .where(and(eq(regionalUmr.region_type, 'province'), eq(regionalUmr.tahun, 2025))),
            db.select().from(regionalPdrb)
                .where(and(eq(regionalPdrb.region_type, 'province'), eq(regionalPdrb.tahun, 2024))),
            db.select().from(regionalProfiles)
                .where(eq(regionalProfiles.region_type, 'province')),
            db.query.regionalOffices.findMany(),
            db.query.regionalInfrastructureItems.findMany(),
            db.query.regionalInvestmentBySector.findMany(),
            db.query.investmentOpportunities.findMany({ with: { details: true } })
        ]);

        // Process results with graceful fallbacks
        const provinces = provResult.status === 'fulfilled' ? provResult.value : getMockProvinces();

        const countMap: Record<number, number> = {};
        if (countResult.status === 'fulfilled') {
            countResult.value.forEach((c: any) => { countMap[c.id_adm_provinsi] = c.count; });
        }

        const popMap: Record<number, number> = {};
        if (popResult.status === 'fulfilled') {
            popResult.value.forEach((p: any) => { popMap[p.id_adm_provinsi] = (p.jumlah_pria || 0) + (p.jumlah_wanita || 0); });
        }

        const umrMap: Record<number, any> = {};
        if (umrResult.status === 'fulfilled') {
            umrResult.value.forEach((u: any) => { umrMap[u.id_adm_provinsi] = u.nilai; });
        }

        const pdrbMap: Record<number, any> = {};
        if (pdrbResult.status === 'fulfilled') {
            pdrbResult.value.forEach((p: any) => { pdrbMap[p.id_adm_provinsi] = p.nilai; });
        }

        const profileMap: Record<number, any> = {};
        if (profileResult.status === 'fulfilled') {
            profileResult.value.forEach((p: any) => {
                profileMap[p.id_adm_provinsi] = {
                    deskripsi: p.deskripsi, profil: p.profil,
                    banner_url: p.banner_url, icon_url: p.icon_url
                };
            });
        }

        const officeMap: Record<number, any[]> = {};
        if (officeResult.status === 'fulfilled') {
            officeResult.value.forEach((o: any) => {
                if (o.id_adm_provinsi) {
                    if (!officeMap[o.id_adm_provinsi]) officeMap[o.id_adm_provinsi] = [];
                    officeMap[o.id_adm_provinsi].push({ nama: o.nama, alamat: o.alamat, telepon: o.no_telp });
                }
            });
        }

        const infraMap: Record<number, any[]> = {};
        if (infraResult.status === 'fulfilled') {
            infraResult.value.forEach((i: any) => {
                if (i.id_adm_provinsi) {
                    if (!infraMap[i.id_adm_provinsi]) infraMap[i.id_adm_provinsi] = [];
                    infraMap[i.id_adm_provinsi].push(i);
                }
            });
        }

        const sectorInvMap: Record<number, any[]> = {};
        if (sectorResult.status === 'fulfilled') {
            sectorResult.value.forEach((s: any) => {
                if (s.id_adm_provinsi) {
                    if (!sectorInvMap[s.id_adm_provinsi]) sectorInvMap[s.id_adm_provinsi] = [];
                    sectorInvMap[s.id_adm_provinsi].push({ sektor: s.nama_sektor, nilai: s.jumlah_investasi });
                }
            });
        }

        const projectsByProvince: Record<number, any[]> = {};
        if (projectResult.status === 'fulfilled') {
            projectResult.value.forEach((p: any) => {
                if (p.id_adm_provinsi) {
                    if (!projectsByProvince[p.id_adm_provinsi]) projectsByProvince[p.id_adm_provinsi] = [];
                    const enriched = enrichProjectWithMockData(p);
                    projectsByProvince[p.id_adm_provinsi].push({
                        id: enriched.id_peluang,
                        title: enriched.nama,
                        category: enriched.nama_sektor_peluang,
                        capex: enriched.nilai_investasi,
                        npv: enriched.nilai_npv || 'TBD',
                        irr: enriched.nilai_irr || 'TBD',
                        image: enriched.image_url,
                        details: enriched.details
                    });
                }
            });
        } else {
            provinces.forEach((p: any) => {
                projectsByProvince[p.id_adm_provinsi] = getMockProjects(2);
            });
        }

        return {
            provinces: provinces.map((p: any) => ({
                id_adm_provinsi: p.id_adm_provinsi,
                nama: p.nama,
                wilayah_group: p.wilayah_group,
                luas_wilayah: p.luas_wilayah,
                image_url: profileMap[p.id_adm_provinsi]?.banner_url || p.image_url,
                logo_url: profileMap[p.id_adm_provinsi]?.icon_url || null,
                count: countMap[p.id_adm_provinsi] || projectsByProvince[p.id_adm_provinsi]?.length || 0,
                population: popMap[p.id_adm_provinsi] || 0,
                umr: umrMap[p.id_adm_provinsi] || 0,
                pdrb: pdrbMap[p.id_adm_provinsi] || 0,
                deskripsi: profileMap[p.id_adm_provinsi]?.deskripsi || profileMap[p.id_adm_provinsi]?.profil || null,
                projects: projectsByProvince[p.id_adm_provinsi] || [],
                offices: officeMap[p.id_adm_provinsi] || [],
                infrastructure: (infraMap[p.id_adm_provinsi] || []).map(i => enrichInfraWithMockData(i, p)),
                sectorInvestment: sectorInvMap[p.id_adm_provinsi] || [],
                lon: p.lon,
                lat: p.lat
            }))
        };
    } catch (e: any) {
        console.error('Regions load error:', e);
        return { 
            provinces: getMockProvinces().map(p => ({ ...p, projects: getMockProjects(2) })), 
            error: e.message
        };
    }
};
