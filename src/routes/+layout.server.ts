import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	return {
		session: locals.session,
		user: locals.user,
		isProtoAuth: cookies.get('proto_auth') === 'true'
	};
};
