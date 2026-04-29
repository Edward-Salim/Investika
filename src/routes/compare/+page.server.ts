import { db } from '$lib/server/db';
import { investmentOpportunities } from '$lib/server/db/schema';
import { desc, isNotNull, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        if (!db) return { projects: [] };

        // Fetch top 3 actual projects from the database to simulate "favorites"
        const topProjects = await db.select()
            .from(investmentOpportunities)
            .where(
				and(
					isNotNull(investmentOpportunities.nilai_investasi_amount),
					isNotNull(investmentOpportunities.nilai_irr_percent)
				)
			)
            .orderBy(desc(investmentOpportunities.nilai_investasi_amount))
            .limit(3);

        return { projects: topProjects };
    } catch (e) {
        console.error("Error loading projects for comparison:", e);
        return { projects: [] };
    }
};
