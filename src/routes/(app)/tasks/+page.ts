import { redirect } from '@sveltejs/kit';
import { ApiError, listTasks } from '#lib/api.js';
import { clearToken, getToken } from '#lib/auth.js';
import type { PageLoad } from './$types';

const PER_PAGE = 50;

export const load: PageLoad = async ({ url, depends }) => {
	depends('app:tasks');

	if (!getToken()) redirect(307, '/login');

	const page = Math.max(0, Number(url.searchParams.get('page') ?? '0') || 0);
	const status = url.searchParams.get('status') ?? 'semua';
	const isCompleted = status === 'selesai' ? true : status === 'belum' ? false : undefined;

	try {
		const tasks = await listTasks({ page, isCompleted });

		return { tasks, page, status, canPrev: page > 0, canNext: tasks.length === PER_PAGE };
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			clearToken();
			redirect(307, '/login');
		}
		throw error;
	}
};
