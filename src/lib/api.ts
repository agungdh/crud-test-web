import { PUBLIC_API_BASE_URL } from '$app/env/public';
import { getToken } from './auth.js';
import type { LoginResult, Task, TaskInput, User } from './types.js';

const API_BASE_URL = PUBLIC_API_BASE_URL;

/** Error thrown for any non-2xx API response, carrying the HTTP status. */
export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

interface ApiFetchOptions {
	method?: string;
	body?: unknown;
	auth?: boolean;
	searchParams?: Record<string, string | number | boolean | undefined>;
}

async function readErrorMessage(response: Response): Promise<string> {
	try {
		const data = await response.json();

		if (data?.error?.message) return data.error.message;
		if (Array.isArray(data?.errors) && data.errors[0]?.message) return data.errors[0].message;
	} catch {
		// body was empty or not JSON
	}

	return `Permintaan gagal (${response.status}).`;
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
	const { method = 'GET', body, auth = true, searchParams } = options;

	const url = new URL(path, API_BASE_URL);
	if (searchParams) {
		for (const [key, value] of Object.entries(searchParams)) {
			if (value !== undefined) url.searchParams.set(key, String(value));
		}
	}

	const headers: Record<string, string> = {};
	if (auth) {
		const token = getToken();
		if (token) headers.Authorization = `Bearer ${token}`;
	}
	if (body !== undefined) headers['Content-Type'] = 'application/json';

	let response: Response;
	try {
		response = await fetch(url, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body)
		});
	} catch {
		throw new ApiError(503, 'Tidak dapat menghubungi server. Coba lagi.');
	}

	if (!response.ok) {
		throw new ApiError(response.status, await readErrorMessage(response));
	}

	const text = await response.text();

	return (text ? JSON.parse(text) : undefined) as T;
}

export function login(email: string, password: string): Promise<LoginResult> {
	return apiFetch<LoginResult>('/api/auth/login', {
		method: 'POST',
		auth: false,
		body: { email, password }
	});
}

export function me(): Promise<User> {
	return apiFetch<User>('/api/auth/me');
}

export function listTasks(params: { page?: number; isCompleted?: boolean } = {}): Promise<Task[]> {
	return apiFetch<Task[]>('/api/tasks', {
		searchParams: { page: params.page ?? 0, isCompleted: params.isCompleted }
	});
}

export function getTask(id: number): Promise<Task> {
	return apiFetch<Task>(`/api/tasks/${id}`);
}

export function createTask(task: TaskInput): Promise<void> {
	return apiFetch<void>('/api/tasks', { method: 'POST', body: task });
}

export function deleteTask(id: number): Promise<void> {
	return apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' });
}
