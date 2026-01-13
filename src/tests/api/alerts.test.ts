import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { Alert } from "@/lib/api/types";
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
			const mockAlerts: Alert[] = [
				{
					id: "node-offline",
					type: "critical",
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
			expect(data[0].type).toBe("critical");
			expect(data[0].message).toBe("Node is offline");
		});

		it("returns warning alerts", async () => {
			const mockAlerts: Alert[] = [
				{
					id: "node-degraded",
					type: "warning",
					message: "Node latency is high (2500ms)",
					timestamp: "2024-01-15T10:00:00Z",
				},
				{
					id: "missed-attestation",
					type: "warning",
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
			expect(data[0].type).toBe("warning");
			expect(data[1].type).toBe("warning");
		});

		it("returns info alerts", async () => {
			const mockAlerts: Alert[] = [
				{
					id: "upcoming-baking",
					type: "info",
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
			expect(data[0].type).toBe("info");
		});

		it("returns multiple alert types sorted by severity", async () => {
			const mockAlerts: Alert[] = [
				{
					id: "node-offline",
					type: "critical",
					message: "Node is offline",
					timestamp: "2024-01-15T10:00:00Z",
				},
				{
					id: "high-latency",
					type: "warning",
					message: "High latency detected",
					timestamp: "2024-01-15T10:00:00Z",
				},
				{
					id: "upcoming-baking",
					type: "info",
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
			expect(data[0].type).toBe("critical");
			expect(data[1].type).toBe("warning");
			expect(data[2].type).toBe("info");
		});

		it("includes alert timestamps", async () => {
			const timestamp = "2024-01-15T10:30:45Z";
			const mockAlerts: Alert[] = [
				{
					id: "test-alert",
					type: "info",
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
