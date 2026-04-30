import postgres from 'postgres';
const sql = postgres('postgresql://postgres:duitkenceng@db.ycsinvblndfgotmpjbfg.supabase.co:5432/postgres');
async function run() {
  const res = await sql`SELECT id_peluang, image_url FROM investment_opportunities LIMIT 10`;
  console.log(res);
  process.exit(0);
}
run();
