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

export const load: PageServerLoad = async () => {
    try {
        if (!db) return { provinces: [] };

        // Fetch provinces
        const provinces = await db.query.admProvinces.findMany({
            orderBy: (provinces, { asc }) => [asc(provinces.nama)]
        });

        // Project counts
        const counts = await db
            .select({
                id_adm_provinsi: investmentOpportunities.id_adm_provinsi,
                count: sql<number>`count(*)::int`
            })
            .from(investmentOpportunities)
            .groupBy(investmentOpportunities.id_adm_provinsi);

        const countMap = Object.fromEntries(counts.map(c => [c.id_adm_provinsi, c.count]));

        // Latest Population (2024)
        const populations = await db
            .select()
            .from(regionalPopulation)
            .where(and(eq(regionalPopulation.region_type, 'province'), eq(regionalPopulation.tahun, 2024)));
        
        const popMap = Object.fromEntries(populations.map(p => [p.id_adm_provinsi, (p.jumlah_pria || 0) + (p.jumlah_wanita || 0)]));

        // Latest UMR (2025)
        const umrs = await db
            .select()
            .from(regionalUmr)
            .where(and(eq(regionalUmr.region_type, 'province'), eq(regionalUmr.tahun, 2025)));
        
        const umrMap = Object.fromEntries(umrs.map(u => [u.id_adm_provinsi, u.nilai]));

        // Latest PDRB (2024)
        const pdrbs = await db
            .select()
            .from(regionalPdrb)
            .where(and(eq(regionalPdrb.region_type, 'province'), eq(regionalPdrb.tahun, 2024)));
        
        const pdrbMap = Object.fromEntries(pdrbs.map(p => [p.id_adm_provinsi, p.nilai]));

        // Regional Profiles
        const profiles = await db
            .select()
            .from(regionalProfiles)
            .where(eq(regionalProfiles.region_type, 'province'));
        
        const profileMap = Object.fromEntries(profiles.map(p => [p.id_adm_provinsi, { 
            deskripsi: p.deskripsi, 
            profil: p.profil,
            banner_url: p.banner_url,
            icon_url: p.icon_url
        }]));

        // Regional Offices
        const offices = await db.query.regionalOffices.findMany();
        const officeMap: Record<number, any[]> = {};
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

        // Infrastructure
        const infra = await db.query.regionalInfrastructureItems.findMany();
        const infraMap: Record<number, any[]> = {};
        infra.forEach((i: any) => {
            if (i.id_adm_provinsi) {
                if (!infraMap[i.id_adm_provinsi]) infraMap[i.id_adm_provinsi] = [];
                infraMap[i.id_adm_provinsi].push(i);
            }
        });

        // Sector Investment
        const sectorInv = await db.query.regionalInvestmentBySector.findMany();
        const sectorInvMap: Record<number, any[]> = {};
        sectorInv.forEach((s: any) => {
            if (s.id_adm_provinsi) {
                if (!sectorInvMap[s.id_adm_provinsi]) sectorInvMap[s.id_adm_provinsi] = [];
                sectorInvMap[s.id_adm_provinsi].push({
                    sektor: s.nama_sektor,
                    nilai: s.jumlah_investasi
                });
            }
        });

        // Projects grouped by province
        const allProjects = await db.query.investmentOpportunities.findMany();
        const projectsByProvince: Record<number, any[]> = {};
        allProjects.forEach((p: any) => {
            if (p.id_adm_provinsi) {
                if (!projectsByProvince[p.id_adm_provinsi]) projectsByProvince[p.id_adm_provinsi] = [];
                projectsByProvince[p.id_adm_provinsi].push({
                    id: p.id_peluang,
                    title: p.nama,
                    category: p.nama_sektor_peluang,
                    capex: p.nilai_investasi,
                    npv: p.nilai_npv || 'TBD',
                    irr: p.nilai_irr || 'TBD',
                    image: p.image_url
                });
            }
        });

        return {
            provinces: provinces.map((p: any) => ({
                id_adm_provinsi: p.id_adm_provinsi,
                nama: p.nama,
                wilayah_group: p.wilayah_group,
                luas_wilayah: p.luas_wilayah,
                image_url: profileMap[p.id_adm_provinsi]?.banner_url || p.image_url,
                logo_url: profileMap[p.id_adm_provinsi]?.icon_url || null,
                count: countMap[p.id_adm_provinsi] || 0,
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
            provinces: [], 
            error: e.message,
            stack: e.stack
        };
    }
};
