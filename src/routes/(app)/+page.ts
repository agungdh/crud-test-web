import { redirect } from '@sveltejs/kit';
import { ApiError, listTasks } from '#lib/api.js';
import { clearToken, getToken } from '#lib/auth.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (!getToken()) redirect(307, '/login');

	try {
		const tasks = await listTasks({ page: 0 });

		return {
			total: tasks.length,
			completed: tasks.filter((task) => task.completed).length,
			pending: tasks.filter((task) => !task.completed).length,
			recent: tasks.slice(0, 5)
		};
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			clearToken();
			redirect(307, '/login');
		}
		throw error;
	}
};
