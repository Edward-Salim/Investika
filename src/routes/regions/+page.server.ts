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
import { enrichProjectWithMockData, getMockProvinces, getMockProjects } from '$lib/server/mock';

export const load: PageServerLoad = async () => {
    try {
        if (!db) return { provinces: getMockProvinces().map(p => ({ ...p, projects: getMockProjects(2) })) };

        // Fetch provinces
        let provinces: any[] = [];
        try {
            provinces = await db.query.admProvinces.findMany({
                orderBy: (provinces, { asc }) => [asc(provinces.nama)]
            });
        } catch (e) {
            console.error('Failed to fetch provinces, using mocks:', e);
            provinces = getMockProvinces();
        }

        // Project counts
        let countMap: Record<number, number> = {};
        try {
            const counts = await db
                .select({
                    id_adm_provinsi: investmentOpportunities.id_adm_provinsi,
                    count: sql<number>`count(*)::int`
                })
                .from(investmentOpportunities)
                .groupBy(investmentOpportunities.id_adm_provinsi);
            countMap = Object.fromEntries(counts.map(c => [c.id_adm_provinsi, c.count]));
        } catch (e) {
            console.error('Failed to fetch project counts:', e);
        }

        // Latest Population (2024)
        let popMap: Record<number, number> = {};
        try {
            const populations = await db
                .select()
                .from(regionalPopulation)
                .where(and(eq(regionalPopulation.region_type, 'province'), eq(regionalPopulation.tahun, 2024)));
            popMap = Object.fromEntries(populations.map(p => [p.id_adm_provinsi, (p.jumlah_pria || 0) + (p.jumlah_wanita || 0)]));
        } catch (e) {}

        // Latest UMR (2025)
        let umrMap: Record<number, any> = {};
        try {
            const umrs = await db
                .select()
                .from(regionalUmr)
                .where(and(eq(regionalUmr.region_type, 'province'), eq(regionalUmr.tahun, 2025)));
            umrMap = Object.fromEntries(umrs.map(u => [u.id_adm_provinsi, u.nilai]));
        } catch (e) {}

        // Latest PDRB (2024)
        let pdrbMap: Record<number, any> = {};
        try {
            const pdrbs = await db
                .select()
                .from(regionalPdrb)
                .where(and(eq(regionalPdrb.region_type, 'province'), eq(regionalPdrb.tahun, 2024)));
            pdrbMap = Object.fromEntries(pdrbs.map(p => [p.id_adm_provinsi, p.nilai]));
        } catch (e) {}

        // Regional Profiles
        let profileMap: Record<number, any> = {};
        try {
            const profiles = await db
                .select()
                .from(regionalProfiles)
                .where(eq(regionalProfiles.region_type, 'province'));
            profileMap = Object.fromEntries(profiles.map(p => [p.id_adm_provinsi, { 
                deskripsi: p.deskripsi, 
                profil: p.profil,
                banner_url: p.banner_url,
                icon_url: p.icon_url
            }]));
        } catch (e) {}

        // Regional Offices
        const officeMap: Record<number, any[]> = {};
        try {
            const offices = await db.query.regionalOffices.findMany();
            offices.forEach((o: any) => {
                if (o.id_adm_provinsi) {
                    if (!officeMap[o.id_adm_provinsi]) officeMap[o.id_adm_provinsi] = [];
                    officeMap[o.id_adm_provinsi].push({
                        nama: o.nama,
                        alamat: o.alamat,
                        telepon: o.no_telp
                    });
                }
            });
        } catch (e) {}

        // Infrastructure
        const infraMap: Record<number, any[]> = {};
        try {
            const infra = await db.query.regionalInfrastructureItems.findMany();
            infra.forEach((i: any) => {
                if (i.id_adm_provinsi) {
                    if (!infraMap[i.id_adm_provinsi]) infraMap[i.id_adm_provinsi] = [];
                    infraMap[i.id_adm_provinsi].push(i);
                }
            });
        } catch (e) {}

        // Sector Investment
        const sectorInvMap: Record<number, any[]> = {};
        try {
            const sectorInv = await db.query.regionalInvestmentBySector.findMany();
            sectorInv.forEach((s: any) => {
                if (s.id_adm_provinsi) {
                    if (!sectorInvMap[s.id_adm_provinsi]) sectorInvMap[s.id_adm_provinsi] = [];
                    sectorInvMap[s.id_adm_provinsi].push({
                        sektor: s.nama_sektor,
                        nilai: s.jumlah_investasi
                    });
                }
            });
        } catch (e) {}

        // Projects grouped by province
        const projectsByProvince: Record<number, any[]> = {};
        try {
            const allProjects = await db.query.investmentOpportunities.findMany({
                with: {
                    details: true
                }
            });
            allProjects.forEach((p: any) => {
                if (p.id_adm_provinsi) {
                    if (!projectsByProvince[p.id_adm_provinsi]) projectsByProvince[p.id_adm_provinsi] = [];
                    
                    // Enrich with mock data
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
        } catch (e) {
            console.error('Failed to fetch projects for regions:', e);
            // If DB failed, we can populate with some mock projects for the mock provinces
            provinces.forEach(p => {
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
                infrastructure: infraMap[p.id_adm_provinsi] || [],
                sectorInvestment: sectorInvMap[p.id_adm_provinsi] || []
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
