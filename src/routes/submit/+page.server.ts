import { db } from '$lib/server/db';
import { admProvinces } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    if (!db) {
        return {
            provinces: []
        };
    }

    const provinces = await db.select({
        id: admProvinces.id_adm_provinsi,
        nama: admProvinces.nama
    }).from(admProvinces).orderBy(asc(admProvinces.nama));

    return {
        provinces
    };
};
