import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:duitkenceng@db.ycsinvblndfgotmpjbfg.supabase.co:5432/postgres";

async function checkColumns() {
    const sql = postgres(DATABASE_URL);
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'regional_infrastructure_items'
        `;
        console.log('Columns for regional_infrastructure_items:');
        console.table(columns);

        const dataSample = await sql`
            SELECT * FROM regional_infrastructure_items LIMIT 1
        `;
        console.log('Sample data:');
        console.log(dataSample[0]);
    } catch (e) {
        console.error('Error checking columns:', e);
    } finally {
        await sql.end();
    }
}

checkColumns();
