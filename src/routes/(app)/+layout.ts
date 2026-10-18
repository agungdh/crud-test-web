import { redirect } from '@sveltejs/kit';
import { me } from '#lib/api.js';
import { clearToken, getToken } from '#lib/auth.js';
import type { LayoutLoad } from './$types';

/** Client-side auth guard for every route inside the (app) group. */
export const load: LayoutLoad = async () => {
	if (!getToken()) redirect(307, '/login');

	try {
		return { user: await me() };
	} catch {
		clearToken();
		redirect(307, '/login');
	}
};
