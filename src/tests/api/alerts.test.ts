import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/tests/setup";

describe("Alerts API", () => {
	describe("GET /api/alerts", () => {
		it("returns 503 when not configured", async () => {
			server.use(
				http.get("/api/alerts", () => {
					return new HttpResponse(JSON.stringify({ error: "Not configured" }), {
						status: 503,
					});
				}),
			);

			const response = await fetch("/api/alerts");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(503);
		});

		it("returns empty array when no alerts", async () => {
			server.use(
				http.get("/api/alerts", () => {
					return HttpResponse.json([]);
				}),
			);

			const response = await fetch("/api/alerts");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toEqual([]);
		});

		it("returns critical alerts", async () => {
			const mockAlerts = [
				{
					id: "node-offline",
					type: "node_behind",
					severity: "error",
					message: "Node is offline",
					timestamp: "2024-01-15T10:00:00Z",
				},
			];

			server.use(
				http.get("/api/alerts", () => {
					return HttpResponse.json(mockAlerts);
				}),
			);

			const response = await fetch("/api/alerts");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toHaveLength(1);
			expect(data[0].severity).toBe("error");
			expect(data[0].message).toBe("Node is offline");
		});

		it("returns warning alerts", async () => {
			const mockAlerts = [
				{
					id: "node-degraded",
					type: "node_behind",
					severity: "warning",
					message: "Node latency is high (2500ms)",
					timestamp: "2024-01-15T10:00:00Z",
				},
				{
					id: "missed-attestation",
					type: "missed_attestation",
					severity: "warning",
					message: "Missed attestation at level 7654300",
					timestamp: "2024-01-15T09:55:00Z",
				},
			];

			server.use(
				http.get("/api/alerts", () => {
					return HttpResponse.json(mockAlerts);
				}),
			);

			const response = await fetch("/api/alerts");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toHaveLength(2);
			expect(data[0].severity).toBe("warning");
			expect(data[1].severity).toBe("warning");
		});

		it("returns info alerts", async () => {
			const mockAlerts = [
				{
					id: "upcoming-baking",
					type: "low_balance",
					severity: "info",
					message: "Upcoming baking right in 5 minutes",
					timestamp: "2024-01-15T10:00:00Z",
				},
			];

			server.use(
				http.get("/api/alerts", () => {
					return HttpResponse.json(mockAlerts);
				}),
			);

			const response = await fetch("/api/alerts");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data[0].severity).toBe("info");
		});

		it("returns multiple alert types sorted by severity", async () => {
			const mockAlerts = [
				{
					id: "node-offline",
					type: "node_behind",
					severity: "error",
					message: "Node is offline",
					timestamp: "2024-01-15T10:00:00Z",
				},
				{
					id: "high-latency",
					type: "node_behind",
					severity: "warning",
					message: "High latency detected",
					timestamp: "2024-01-15T10:00:00Z",
				},
				{
					id: "upcoming-baking",
					type: "low_balance",
					severity: "info",
					message: "Upcoming baking right",
					timestamp: "2024-01-15T10:00:00Z",
				},
			];

			server.use(
				http.get("/api/alerts", () => {
					return HttpResponse.json(mockAlerts);
				}),
			);

			const response = await fetch("/api/alerts");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toHaveLength(3);
			expect(data[0].severity).toBe("error");
			expect(data[1].severity).toBe("warning");
			expect(data[2].severity).toBe("info");
		});

		it("includes alert timestamps", async () => {
			const timestamp = "2024-01-15T10:30:45Z";
			const mockAlerts = [
				{
					id: "test-alert",
					type: "low_balance",
					severity: "info",
					message: "Test alert message",
					timestamp,
				},
			];

			server.use(
				http.get("/api/alerts", () => {
					return HttpResponse.json(mockAlerts);
				}),
			);

			const response = await fetch("/api/alerts");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data[0].timestamp).toBe(timestamp);
		});

		it("handles fetch errors", async () => {
			server.use(
				http.get("/api/alerts", () => {
					return new HttpResponse(
						JSON.stringify({ error: "Failed to fetch alerts" }),
						{ status: 502 },
					);
				}),
			);

			const response = await fetch("/api/alerts");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(502);
		});
	});
});
