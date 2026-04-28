import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

export const db = env.DATABASE_URL ? drizzle(postgres(env.DATABASE_URL), { schema }) : null;

if (!db) {
	console.warn('DATABASE_URL is not set. Database features will be unavailable.');
}
