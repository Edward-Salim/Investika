import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { redirect, type Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// Skip auth logic if auth is not initialized (e.g. missing DATABASE_URL)
	if (!auth) {
		return resolve(event);
	}

	const session = await auth.api.getSession({ headers: event.request.headers });
	const isProtoAuth = event.cookies.get('proto_auth') === 'true';

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const hasAccess = !!session || isProtoAuth;

	// Protected routes logic
	const pathname = event.url.pathname;
	const isPublicPath = pathname === '/' ||
						 pathname === '/id' ||
						 pathname === '/zh' ||
						 pathname === '/ja' ||
						 pathname === '/ko' ||
						 pathname.endsWith('/login') || 
						 pathname.includes('/api/auth') || 
						 pathname.includes('.') || // Static files
						 pathname.startsWith('/_app');

	if (!hasAccess && !isPublicPath) {
		throw redirect(302, '/login');
	}

	// If logged in and on login page, redirect to home
	if (hasAccess && pathname.endsWith('/login')) {
		throw redirect(302, '/');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth);
