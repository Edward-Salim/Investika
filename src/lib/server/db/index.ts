import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const client = env.DATABASE_URL
	? postgres(env.DATABASE_URL, {
			max: 5,
			idle_timeout: 30,
			connect_timeout: 10,
			prepare: false,
			ssl: 'require'
		})
	: null;


export const db = client ? drizzle(client, { schema }) : null;

if (!db) {
	console.warn('DATABASE_URL is not set. Database features will be unavailable.');
}
