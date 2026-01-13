import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { Settings, SettingsInput } from "@/lib/db";
import { server } from "@/tests/setup";

describe("Settings API", () => {
	describe("GET /api/settings", () => {
		it("returns null when no settings configured", async () => {
			server.use(
				http.get("/api/settings", () => {
					return HttpResponse.json(null);
				}),
			);

			const response = await fetch("/api/settings");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toBeNull();
		});

		it("returns settings when configured", async () => {
			const mockSettings: Settings = {
				id: 1,
				nodeUrl: "http://localhost:8732",
				dalNodeUrl: "http://localhost:10732",
				bakerAddress: "tz1TestAddress",
				bakerAlias: "Test Baker",
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			};

			server.use(
				http.get("/api/settings", () => {
					return HttpResponse.json(mockSettings);
				}),
			);

			const response = await fetch("/api/settings");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.nodeUrl).toBe(mockSettings.nodeUrl);
			expect(data.bakerAddress).toBe(mockSettings.bakerAddress);
			expect(data.bakerAlias).toBe(mockSettings.bakerAlias);
		});

		it("handles server errors gracefully", async () => {
			server.use(
				http.get("/api/settings", () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);

			const response = await fetch("/api/settings");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(500);
		});
	});

	describe("POST /api/settings", () => {
		it("saves new settings", async () => {
			const input: SettingsInput = {
				nodeUrl: "http://localhost:8732",
				bakerAddress: "tz1NewAddress",
				dalNodeUrl: "http://localhost:10732",
				bakerAlias: "New Baker",
			};

			server.use(
				http.post("/api/settings", async ({ request }) => {
					const body = (await request.json()) as SettingsInput;
					return HttpResponse.json({
						id: 1,
						nodeUrl: body.nodeUrl,
						dalNodeUrl: body.dalNodeUrl ?? null,
						bakerAddress: body.bakerAddress,
						bakerAlias: body.bakerAlias ?? null,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					});
				}),
			);

			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.nodeUrl).toBe(input.nodeUrl);
			expect(data.bakerAddress).toBe(input.bakerAddress);
		});

		it("saves settings with only required fields", async () => {
			const input: SettingsInput = {
				nodeUrl: "http://localhost:8732",
				bakerAddress: "tz1MinimalAddress",
			};

			server.use(
				http.post("/api/settings", async ({ request }) => {
					const body = (await request.json()) as SettingsInput;
					return HttpResponse.json({
						id: 1,
						nodeUrl: body.nodeUrl,
						dalNodeUrl: null,
						bakerAddress: body.bakerAddress,
						bakerAlias: null,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					});
				}),
			);

			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.dalNodeUrl).toBeNull();
			expect(data.bakerAlias).toBeNull();
		});

		it("rejects settings without required nodeUrl", async () => {
			server.use(
				http.post("/api/settings", async ({ request }) => {
					const body = (await request.json()) as Partial<SettingsInput>;
					if (!body.nodeUrl || !body.bakerAddress) {
						return new HttpResponse(
							JSON.stringify({ error: "nodeUrl and bakerAddress are required" }),
							{ status: 400 },
						);
					}
					return HttpResponse.json({ id: 1, ...body });
				}),
			);

			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bakerAddress: "tz1Test" }),
			});

			expect(response.ok).toBe(false);
			expect(response.status).toBe(400);
		});

		it("rejects settings without required bakerAddress", async () => {
			server.use(
				http.post("/api/settings", async ({ request }) => {
					const body = (await request.json()) as Partial<SettingsInput>;
					if (!body.nodeUrl || !body.bakerAddress) {
						return new HttpResponse(
							JSON.stringify({ error: "nodeUrl and bakerAddress are required" }),
							{ status: 400 },
						);
					}
					return HttpResponse.json({ id: 1, ...body });
				}),
			);

			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nodeUrl: "http://localhost:8732" }),
			});

			expect(response.ok).toBe(false);
			expect(response.status).toBe(400);
		});

		it("handles server errors on save", async () => {
			server.use(
				http.post("/api/settings", () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);

			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nodeUrl: "http://localhost:8732",
					bakerAddress: "tz1Test",
				}),
			});

			expect(response.ok).toBe(false);
			expect(response.status).toBe(500);
		});
	});
});
