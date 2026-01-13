import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useSaveSettings, useSettings } from "@/hooks/useSettings";
import type { Settings, SettingsInput } from "@/lib/db";
import { server } from "@/tests/setup";

const mockSettings: Settings = {
	id: 1,
	nodeUrl: "http://localhost:8732",
	dalNodeUrl: "http://localhost:10732",
	bakerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
	bakerAlias: "My Baker",
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
};

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};
}

describe("useSettings", () => {
	it("fetches settings successfully", async () => {
		server.use(
			http.get("/api/settings", () => {
				return HttpResponse.json(mockSettings);
			}),
		);

		const { result } = renderHook(() => useSettings(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockSettings);
		expect(result.current.error).toBeNull();
	});

	it("returns null when no settings configured", async () => {
		server.use(
			http.get("/api/settings", () => {
				return HttpResponse.json(null);
			}),
		);

		const { result } = renderHook(() => useSettings(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBeNull();
	});

	it("handles fetch error", async () => {
		server.use(
			http.get("/api/settings", () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		const { result } = renderHook(() => useSettings(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toBeInstanceOf(Error);
	});
});

describe("useSaveSettings", () => {
	it("saves settings successfully", async () => {
		const inputSettings: SettingsInput = {
			nodeUrl: "http://localhost:8732",
			dalNodeUrl: "http://localhost:10732",
			bakerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
			bakerAlias: "My Baker",
		};

		server.use(
			http.post("/api/settings", async ({ request }) => {
				const body = (await request.json()) as SettingsInput;
				return HttpResponse.json({
					id: 1,
					...body,
					dalNodeUrl: body.dalNodeUrl ?? null,
					bakerAlias: body.bakerAlias ?? null,
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: new Date().toISOString(),
				});
			}),
		);

		const { result } = renderHook(() => useSaveSettings(), {
			wrapper: createWrapper(),
		});

		result.current.mutate(inputSettings);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data?.nodeUrl).toBe(inputSettings.nodeUrl);
		expect(result.current.data?.bakerAddress).toBe(inputSettings.bakerAddress);
	});

	it("handles save error", async () => {
		server.use(
			http.post("/api/settings", () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		const { result } = renderHook(() => useSaveSettings(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			nodeUrl: "http://localhost:8732",
			bakerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toBeInstanceOf(Error);
	});

	it("saves settings without optional fields", async () => {
		const inputSettings: SettingsInput = {
			nodeUrl: "http://localhost:8732",
			bakerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
		};

		server.use(
			http.post("/api/settings", async ({ request }) => {
				const body = (await request.json()) as SettingsInput;
				return HttpResponse.json({
					id: 1,
					...body,
					dalNodeUrl: null,
					bakerAlias: null,
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: new Date().toISOString(),
				});
			}),
		);

		const { result } = renderHook(() => useSaveSettings(), {
			wrapper: createWrapper(),
		});

		result.current.mutate(inputSettings);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data?.dalNodeUrl).toBeNull();
		expect(result.current.data?.bakerAlias).toBeNull();
	});
});
