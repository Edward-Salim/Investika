import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.warn('DATABASE_URL environment variable is missing.');
}

const client = DATABASE_URL
	? postgres(DATABASE_URL, {
			max: 5,
			idle_timeout: 30,
			connect_timeout: 10,
			prepare: false,
			ssl: 'require'
		})
	: null;

export const db = client ? drizzle(client, { schema }) : null;

if (!db) {
	console.error('Database connection could not be initialized.');
}

