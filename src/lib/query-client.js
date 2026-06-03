import { QueryClient } from '@tanstack/react-query';

/**
 * Global React Query defaults.
 *
 * - Smart retry: retry up to 2× on transient errors, but skip 4xx (auth/permission/not-found)
 *   to avoid hammering the API with requests that will never succeed.
 * - Exponential backoff with cap at 8s to play nice with Base44 rate limits.
 * - 5-minute gcTime so cached data stays available when users navigate between pages
 *   (prevents flash-of-loading on common back-and-forth flows).
 */
export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				const status = error?.response?.status ?? error?.status;
				// Don't retry client errors (auth, permission, validation, not found)
				if (status >= 400 && status < 500) return false;
				return failureCount < 2;
			},
			retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
			gcTime: 5 * 60 * 1000,
		},
		mutations: {
			retry: false,
		},
	},
});