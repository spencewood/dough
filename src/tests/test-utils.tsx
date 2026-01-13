import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterContextProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

// Create a minimal router context for testing components that use Link
function createTestRouter() {
	const rootRoute = createRootRoute({});

	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => null,
	});

	const settingsRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/settings",
		component: () => null,
	});

	const routeTree = rootRoute.addChildren([indexRoute, settingsRoute]);

	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	return router;
}

export function renderWithProviders(ui: ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	const router = createTestRouter();

	const result = render(
		<RouterContextProvider router={router}>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>
			</QueryClientProvider>
		</RouterContextProvider>,
	);

	return {
		...result,
		queryClient,
	};
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
