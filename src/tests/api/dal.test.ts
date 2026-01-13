import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { DalStatus } from "@/lib/api/types";
import { server } from "@/tests/setup";

describe("DAL API", () => {
	describe("GET /api/dal/status", () => {
		it("returns 503 when not configured", async () => {
			server.use(
				http.get("/api/dal/status", () => {
					return new HttpResponse(JSON.stringify({ error: "Not configured" }), {
						status: 503,
					});
				}),
			);

			const response = await fetch("/api/dal/status");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(503);
		});

		it("returns DAL status when configured", async () => {
			const mockStatus: DalStatus = {
				connected: true,
				nodeVersion: "v20.0",
				slotsPublished: 150,
				slotsAttested: 148,
				attestationRate: 98.67,
				lastPublishedSlot: {
					level: 7654300,
					index: 0,
					status: "attested",
				},
			};

			server.use(
				http.get("/api/dal/status", () => {
					return HttpResponse.json(mockStatus);
				}),
			);

			const response = await fetch("/api/dal/status");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.connected).toBe(true);
			expect(data.nodeVersion).toBe("v20.0");
			expect(data.attestationRate).toBe(98.67);
		});

		it("returns disconnected status when DAL node unavailable", async () => {
			const mockStatus: DalStatus = {
				connected: false,
				nodeVersion: null,
				slotsPublished: 0,
				slotsAttested: 0,
				attestationRate: 0,
				lastPublishedSlot: null,
			};

			server.use(
				http.get("/api/dal/status", () => {
					return HttpResponse.json(mockStatus);
				}),
			);

			const response = await fetch("/api/dal/status");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.connected).toBe(false);
			expect(data.nodeVersion).toBeNull();
		});

		it("handles low attestation rate", async () => {
			const mockStatus: DalStatus = {
				connected: true,
				nodeVersion: "v20.0",
				slotsPublished: 100,
				slotsAttested: 75,
				attestationRate: 75.0,
				lastPublishedSlot: {
					level: 7654250,
					index: 2,
					status: "missed",
				},
			};

			server.use(
				http.get("/api/dal/status", () => {
					return HttpResponse.json(mockStatus);
				}),
			);

			const response = await fetch("/api/dal/status");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.attestationRate).toBe(75.0);
			expect(data.lastPublishedSlot.status).toBe("missed");
		});

		it("handles connection errors", async () => {
			server.use(
				http.get("/api/dal/status", () => {
					return new HttpResponse(
						JSON.stringify({ error: "Failed to fetch DAL status" }),
						{ status: 502 },
					);
				}),
			);

			const response = await fetch("/api/dal/status");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(502);
		});
	});
});
