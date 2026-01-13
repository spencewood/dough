import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

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
			const mockStatus = {
				isConnected: true,
				nodeVersion: "v20.0",
				attestedSlots: 148,
				publishedSlots: 150,
				missedSlots: 2,
			};

			server.use(
				http.get("/api/dal/status", () => {
					return HttpResponse.json(mockStatus);
				}),
			);

			const response = await fetch("/api/dal/status");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.isConnected).toBe(true);
			expect(data.nodeVersion).toBe("v20.0");
			expect(data.attestedSlots).toBe(148);
		});

		it("returns disconnected status when DAL node unavailable", async () => {
			const mockStatus = {
				isConnected: false,
				nodeVersion: null,
				attestedSlots: 0,
				publishedSlots: 0,
				missedSlots: 0,
			};

			server.use(
				http.get("/api/dal/status", () => {
					return HttpResponse.json(mockStatus);
				}),
			);

			const response = await fetch("/api/dal/status");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.isConnected).toBe(false);
			expect(data.nodeVersion).toBeNull();
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
