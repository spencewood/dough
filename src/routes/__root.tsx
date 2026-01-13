import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";

import type { RouterContext } from "@/router";
import appCss from "@/styles.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Dough - Tezos Baker Dashboard",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const { queryClient } = Route.useRouteContext();
	const [mswReady, setMswReady] = useState(
		typeof window === "undefined" || !import.meta.env.DEV,
	);

	useEffect(() => {
		if (import.meta.env.DEV && typeof window !== "undefined") {
			import("@/mocks").then(({ initMocks }) => {
				initMocks().then(() => setMswReady(true));
			});
		}
	}, []);

	if (!mswReady) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Initializing...</p>
			</div>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
