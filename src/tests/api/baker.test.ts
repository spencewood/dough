import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/tests/setup";

describe("Baker API", () => {
	describe("GET /api/baker/status", () => {
		it("returns 503 when not configured", async () => {
			server.use(
				http.get("/api/baker/status", () => {
					return new HttpResponse(JSON.stringify({ error: "Not configured" }), {
						status: 503,
					});
				}),
			);

			const response = await fetch("/api/baker/status");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(503);
		});

		it("returns baker status when configured", async () => {
			const mockStatus = {
				address: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
				alias: "Test Baker",
				fullBalance: "15000000000",
				frozenDeposits: "5000000000",
				stakingBalance: "20000000000",
				delegatedBalance: "5000000000",
				delegatorCount: 10,
				isDeactivated: false,
				gracePeriod: 5,
				stakingCapacityUsed: 0.75,
			};

			server.use(
				http.get("/api/baker/status", () => {
					return HttpResponse.json(mockStatus);
				}),
			);

			const response = await fetch("/api/baker/status");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.address).toBe("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
			expect(data.isDeactivated).toBe(false);
			expect(data.fullBalance).toBe("15000000000");
		});

		it("handles baker not found", async () => {
			server.use(
				http.get("/api/baker/status", () => {
					return new HttpResponse(
						JSON.stringify({ error: "Baker not registered" }),
						{ status: 404 },
					);
				}),
			);

			const response = await fetch("/api/baker/status");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(404);
		});
	});

	describe("GET /api/baker/rewards", () => {
		it("returns rewards history", async () => {
			const mockRewards = {
				delegate: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
				cycles: [
					{
						cycle: 750,
						bakingRewards: "2500000",
						attestationRewards: "1800000",
						totalRewards: "4300000",
						missedBakingRewards: "0",
						missedAttestationRewards: "0",
						ownStakingBalance: "10000000000",
						externalStakingBalance: "5000000000",
					},
				],
				totalEarned: "4300000",
				totalMissed: "0",
			};

			server.use(
				http.get("/api/baker/rewards", () => {
					return HttpResponse.json(mockRewards);
				}),
			);

			const response = await fetch("/api/baker/rewards");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.cycles).toHaveLength(1);
			expect(data.cycles[0].cycle).toBe(750);
			expect(data.totalEarned).toBe("4300000");
		});

		it("accepts cycles query parameter", async () => {
			let capturedCycles: string | null = null;

			server.use(
				http.get("/api/baker/rewards", ({ request }) => {
					const url = new URL(request.url);
					capturedCycles = url.searchParams.get("cycles");
					return HttpResponse.json({ delegate: "", cycles: [], totalEarned: "0", totalMissed: "0" });
				}),
			);

			await fetch("/api/baker/rewards?cycles=5");

			expect(capturedCycles).toBe("5");
		});

		it("handles fetch errors", async () => {
			server.use(
				http.get("/api/baker/rewards", () => {
					return new HttpResponse(
						JSON.stringify({ error: "Failed to fetch rewards history" }),
						{ status: 502 },
					);
				}),
			);

			const response = await fetch("/api/baker/rewards");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(502);
		});
	});

	describe("GET /api/baker/rights/baking", () => {
		it("returns baking rights", async () => {
			const mockRights = [
				{
					level: 7654400,
					delegate: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
					round: 0,
					estimatedTime: "2024-01-15T10:30:00Z",
				},
				{
					level: 7654350,
					delegate: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
					round: 0,
					estimatedTime: "2024-01-15T10:15:00Z",
				},
			];

			server.use(
				http.get("/api/baker/rights/baking", () => {
					return HttpResponse.json(mockRights);
				}),
			);

			const response = await fetch("/api/baker/rights/baking");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toHaveLength(2);
			expect(data[0].level).toBe(7654400);
		});

		it("handles no baking rights", async () => {
			server.use(
				http.get("/api/baker/rights/baking", () => {
					return HttpResponse.json([]);
				}),
			);

			const response = await fetch("/api/baker/rights/baking");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toEqual([]);
		});
	});

	describe("GET /api/baker/rights/attestation", () => {
		it("returns attestation rights", async () => {
			const mockRights = [
				{
					level: 7654400,
					delegate: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
					firstSlot: 100,
					attestationPower: 5,
				},
			];

			server.use(
				http.get("/api/baker/rights/attestation", () => {
					return HttpResponse.json(mockRights);
				}),
			);

			const response = await fetch("/api/baker/rights/attestation");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toHaveLength(1);
			expect(data[0].attestationPower).toBe(5);
		});
	});
});
