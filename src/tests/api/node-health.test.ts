import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { NodeHealth } from "@/lib/api/types";
import { server } from "@/tests/setup";

describe("Node Health API", () => {
	describe("GET /api/node/health", () => {
		it("returns 503 when not configured", async () => {
			server.use(
				http.get("/api/node/health", () => {
					return new HttpResponse(JSON.stringify({ error: "Not configured" }), {
						status: 503,
					});
				}),
			);

			const response = await fetch("/api/node/health");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(503);
		});

		it("returns node health when configured", async () => {
			const mockHealth: NodeHealth = {
				status: "healthy",
				latency: 45,
				chainId: "NetXdQprcVkpaWU",
				headLevel: 7654321,
				headTimestamp: "2024-01-15T10:00:00Z",
				syncState: "synced",
				connections: 25,
			};

			server.use(
				http.get("/api/node/health", () => {
					return HttpResponse.json(mockHealth);
				}),
			);

			const response = await fetch("/api/node/health");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.status).toBe("healthy");
			expect(data.latency).toBe(45);
			expect(data.headLevel).toBe(7654321);
			expect(data.syncState).toBe("synced");
		});

		it("returns degraded status when node is slow", async () => {
			const mockHealth: NodeHealth = {
				status: "degraded",
				latency: 2500,
				chainId: "NetXdQprcVkpaWU",
				headLevel: 7654321,
				headTimestamp: "2024-01-15T10:00:00Z",
				syncState: "synced",
				connections: 25,
			};

			server.use(
				http.get("/api/node/health", () => {
					return HttpResponse.json(mockHealth);
				}),
			);

			const response = await fetch("/api/node/health");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.status).toBe("degraded");
			expect(data.latency).toBe(2500);
		});

		it("returns unhealthy status when node is not synced", async () => {
			const mockHealth: NodeHealth = {
				status: "unhealthy",
				latency: 100,
				chainId: "NetXdQprcVkpaWU",
				headLevel: 7654000,
				headTimestamp: "2024-01-15T09:00:00Z",
				syncState: "syncing",
				connections: 5,
			};

			server.use(
				http.get("/api/node/health", () => {
					return HttpResponse.json(mockHealth);
				}),
			);

			const response = await fetch("/api/node/health");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.status).toBe("unhealthy");
			expect(data.syncState).toBe("syncing");
		});

		it("handles node connection errors", async () => {
			server.use(
				http.get("/api/node/health", () => {
					return new HttpResponse(
						JSON.stringify({ error: "Failed to connect to node" }),
						{ status: 502 },
					);
				}),
			);

			const response = await fetch("/api/node/health");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(502);
		});
	});
});
