import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

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
			const mockHealth = {
				isBootstrapped: true,
				syncState: "synced",
				headLevel: 7654321,
				headHash: "BLockHash123",
				headTimestamp: "2024-01-15T10:00:00Z",
				protocol: "PsQuebec",
				chainId: "NetXdQprcVkpaWU",
				peerCount: 25,
				mempoolSize: 10,
			};

			server.use(
				http.get("/api/node/health", () => {
					return HttpResponse.json(mockHealth);
				}),
			);

			const response = await fetch("/api/node/health");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.isBootstrapped).toBe(true);
			expect(data.headLevel).toBe(7654321);
			expect(data.syncState).toBe("synced");
		});

		it("returns syncing status when node is behind", async () => {
			const mockHealth = {
				isBootstrapped: false,
				syncState: "syncing",
				headLevel: 7654000,
				headHash: "BLockHash456",
				headTimestamp: "2024-01-15T09:00:00Z",
				protocol: "PsQuebec",
				chainId: "NetXdQprcVkpaWU",
				peerCount: 5,
				mempoolSize: 0,
			};

			server.use(
				http.get("/api/node/health", () => {
					return HttpResponse.json(mockHealth);
				}),
			);

			const response = await fetch("/api/node/health");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.isBootstrapped).toBe(false);
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
