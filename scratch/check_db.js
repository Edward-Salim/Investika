
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDb() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is missing in .env');
        process.exit(1);
    }

    console.log('Connecting to:', url.split('@')[1]); // Log host only for safety

    const sql = postgres(url, { ssl: 'require' });

    try {
        const provinces = await sql`SELECT count(*) FROM adm_provinces`;
        console.log('Provinces count:', provinces[0].count);

        const projects = await sql`SELECT count(*) FROM investment_opportunities`;
        console.log('Projects count:', projects[0].count);

        if (provinces[0].count > 0) {
            const sample = await sql`SELECT nama FROM adm_provinces LIMIT 5`;
            console.log('Sample provinces:', sample.map(p => p.nama));
        }

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await sql.end();
    }
}

checkDb();
