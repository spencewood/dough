import { render, screen } from "@/tests/test-utils";
import { describe, expect, it } from "vitest";

import { AlertsCard } from "@/components/dashboard/AlertsCard";
import type { AlertsResponse } from "@/lib/types";

const mockAlertsResponse: AlertsResponse = {
	alerts: [
		{
			id: "alert-1",
			type: "missed_attestation",
			severity: "warning",
			message: "Missed attestation at level 5,432,100",
			timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			level: 5432100,
		},
		{
			id: "alert-2",
			type: "low_balance",
			severity: "error",
			message: "Baker balance critically low",
			timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "alert-3",
			type: "node_behind",
			severity: "info",
			message: "Node was 3 blocks behind, now synced",
			timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
		},
	],
	unreadCount: 2,
};

describe("AlertsCard", () => {
	it("renders loading state", () => {
		render(<AlertsCard isLoading />);

		expect(screen.getByText("Alerts")).toBeInTheDocument();
		expect(
			screen.getByText("Recent alerts and notifications"),
		).toBeInTheDocument();
	});

	it("renders empty state when no alerts", () => {
		const emptyResponse: AlertsResponse = {
			alerts: [],
			unreadCount: 0,
		};

		render(<AlertsCard data={emptyResponse} />);

		expect(screen.getByText("No recent alerts")).toBeInTheDocument();
	});

	it("renders alerts with messages", () => {
		render(<AlertsCard data={mockAlertsResponse} />);

		expect(screen.getByText("Alerts")).toBeInTheDocument();
		expect(
			screen.getByText("Missed attestation at level 5,432,100"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Baker balance critically low"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Node was 3 blocks behind, now synced"),
		).toBeInTheDocument();
	});

	it("renders unread count badge when there are unread alerts", () => {
		render(<AlertsCard data={mockAlertsResponse} />);

		expect(screen.getByText("2 new")).toBeInTheDocument();
	});

	it("does not render unread badge when count is zero", () => {
		const noUnread: AlertsResponse = {
			...mockAlertsResponse,
			unreadCount: 0,
		};

		render(<AlertsCard data={noUnread} />);

		expect(screen.queryByText(/new/)).not.toBeInTheDocument();
	});

	it("renders alert type badges with formatted text", () => {
		render(<AlertsCard data={mockAlertsResponse} />);

		expect(screen.getByText("missed attestation")).toBeInTheDocument();
		expect(screen.getByText("low balance")).toBeInTheDocument();
		expect(screen.getByText("node behind")).toBeInTheDocument();
	});

	it("renders time ago for recent alerts", () => {
		const recentAlert: AlertsResponse = {
			alerts: [
				{
					id: "alert-1",
					type: "missed_bake",
					severity: "error",
					message: "Just happened",
					timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
				},
			],
			unreadCount: 1,
		};

		render(<AlertsCard data={recentAlert} />);

		expect(screen.getByText("30m ago")).toBeInTheDocument();
	});

	it("renders hours ago for older alerts", () => {
		const hourOldAlert: AlertsResponse = {
			alerts: [
				{
					id: "alert-1",
					type: "missed_bake",
					severity: "error",
					message: "Happened hours ago",
					timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
				},
			],
			unreadCount: 0,
		};

		render(<AlertsCard data={hourOldAlert} />);

		expect(screen.getByText("5h ago")).toBeInTheDocument();
	});

	it("renders days ago for old alerts", () => {
		const dayOldAlert: AlertsResponse = {
			alerts: [
				{
					id: "alert-1",
					type: "missed_bake",
					severity: "error",
					message: "Happened days ago",
					timestamp: new Date(
						Date.now() - 3 * 24 * 60 * 60 * 1000,
					).toISOString(), // 3 days ago
				},
			],
			unreadCount: 0,
		};

		render(<AlertsCard data={dayOldAlert} />);

		expect(screen.getByText("3d ago")).toBeInTheDocument();
	});
});
