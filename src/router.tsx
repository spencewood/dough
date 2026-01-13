import type { QueryClient } from "@tanstack/react-query";
import { createRouter, ErrorComponent, Link } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createQueryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export interface RouterContext {
	queryClient: QueryClient;
}

// Create a singleton query client
let queryClientSingleton: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always create a new query client
		return createQueryClient();
	}
	// Browser: use singleton pattern
	if (!queryClientSingleton) {
		queryClientSingleton = createQueryClient();
	}
	return queryClientSingleton;
}

function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-foreground mb-4">
					404 - Not Found
				</h1>
				<p className="text-muted-foreground mb-4">
					The page you're looking for doesn't exist.
				</p>
				<Link to="/" className="text-primary hover:underline">
					Go Home
				</Link>
			</div>
		</div>
	);
}

export const getRouter = () => {
	const queryClient = getQueryClient();

	const router = createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: ErrorComponent,
		defaultNotFoundComponent: NotFound,
	});

	setupRouterSsrQueryIntegration({ router, queryClient, wrapQueryClient: false });

	return router;
};

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
