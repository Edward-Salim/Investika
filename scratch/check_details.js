import { db } from './src/lib/server/db/index.js';
import { investmentOpportunityDetails } from './src/lib/server/db/schema.js';

async function checkData() {
    if (!db) {
        console.log('No DB');
        return;
    }
    const details = await db.select().from(investmentOpportunityDetails).limit(10);
    console.log(JSON.stringify(details, null, 2));
}

checkData();
