import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 10_000, // 10 seconds
				refetchOnWindowFocus: true,
				retry: 1,
			},
		},
	});
}
