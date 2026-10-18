import { browser } from '$app/env';

/** Name of the (JS-readable) cookie that stores the JWT. */
export const AUTH_COOKIE = 'auth_token';

export function getToken(): string | undefined {
	if (!browser) return undefined;

	const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`));

	return match ? decodeURIComponent(match[1]) : undefined;
}

export function setToken(token: string, maxAgeSeconds: number): void {
	document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function clearToken(): void {
	document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
