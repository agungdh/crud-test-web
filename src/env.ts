import { defineEnvVars } from '@sveltejs/kit/env';

/** Environment variables for the app. Public vars are inlined into the client bundle. */
export const variables = defineEnvVars({
	PUBLIC_API_BASE_URL: {
		public: true,
		static: true,
		description: 'Base URL of the crud-test-api backend.',
		schema: (value) => value ?? 'http://localhost:8787'
	}
});
