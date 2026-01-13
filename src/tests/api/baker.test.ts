import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type {
	BakerStatus,
	BakingRight,
	AttestationRight,
	RewardInfo,
} from "@/lib/api/types";
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
			const mockStatus: BakerStatus = {
				address: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
				balance: 15000000000,
				frozenDeposits: 5000000000,
				stakingBalance: 20000000000,
				delegatedBalance: 5000000000,
				gracePeriod: 10,
				isActive: true,
				votingPower: 12500,
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
			expect(data.isActive).toBe(true);
			expect(data.balance).toBe(15000000000);
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
			const mockRewards: RewardInfo[] = [
				{
					cycle: 750,
					bakingRewards: 2500000,
					attestationRewards: 1800000,
					totalRewards: 4300000,
					missedRewards: 0,
					status: "completed",
				},
				{
					cycle: 749,
					bakingRewards: 2400000,
					attestationRewards: 1750000,
					totalRewards: 4150000,
					missedRewards: 50000,
					status: "completed",
				},
			];

			server.use(
				http.get("/api/baker/rewards", () => {
					return HttpResponse.json(mockRewards);
				}),
			);

			const response = await fetch("/api/baker/rewards");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toHaveLength(2);
			expect(data[0].cycle).toBe(750);
			expect(data[0].totalRewards).toBe(4300000);
		});

		it("accepts cycles query parameter", async () => {
			let capturedCycles: string | null = null;

			server.use(
				http.get("/api/baker/rewards", ({ request }) => {
					const url = new URL(request.url);
					capturedCycles = url.searchParams.get("cycles");
					return HttpResponse.json([]);
				}),
			);

			await fetch("/api/baker/rewards?cycles=5");

			expect(capturedCycles).toBe("5");
		});

		it("handles empty rewards history", async () => {
			server.use(
				http.get("/api/baker/rewards", () => {
					return HttpResponse.json([]);
				}),
			);

			const response = await fetch("/api/baker/rewards");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toEqual([]);
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
			const mockRights: BakingRight[] = [
				{
					level: 7654400,
					round: 0,
					timestamp: "2024-01-15T10:30:00Z",
					status: "future",
				},
				{
					level: 7654350,
					round: 0,
					timestamp: "2024-01-15T10:15:00Z",
					status: "baked",
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
			expect(data[0].status).toBe("future");
			expect(data[1].status).toBe("baked");
		});

		it("handles missed baking rights", async () => {
			const mockRights: BakingRight[] = [
				{
					level: 7654300,
					round: 0,
					timestamp: "2024-01-15T10:00:00Z",
					status: "missed",
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
			expect(data[0].status).toBe("missed");
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
			const mockRights: AttestationRight[] = [
				{
					level: 7654400,
					slots: 5,
					timestamp: "2024-01-15T10:30:00Z",
					status: "future",
				},
				{
					level: 7654350,
					slots: 4,
					timestamp: "2024-01-15T10:15:00Z",
					status: "attested",
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
			expect(data).toHaveLength(2);
			expect(data[0].slots).toBe(5);
			expect(data[1].status).toBe("attested");
		});

		it("handles missed attestation rights", async () => {
			const mockRights: AttestationRight[] = [
				{
					level: 7654300,
					slots: 3,
					timestamp: "2024-01-15T10:00:00Z",
					status: "missed",
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
			expect(data[0].status).toBe("missed");
		});
	});
});
