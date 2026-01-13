import { describe, expect, it } from "vitest";

import { Header } from "@/components/dashboard/Header";
import type { AlertsResponse, NodeHealth } from "@/lib/types";
import { render, screen } from "@/tests/test-utils";

const mockNodeHealth: NodeHealth = {
	isBootstrapped: true,
	syncState: "synced",
	headLevel: 5_432_100,
	headHash: "BLockHashExampleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	headTimestamp: new Date().toISOString(),
	protocol: "PsQuebecnLByd3JwTiGadoG4nGWi3HYiLXUjkibeFV8dCFeVMUg",
	chainId: "NetXdQprcVkpaWU",
	peerCount: 42,
	mempoolSize: 15,
};

describe("Header", () => {
	it("renders default title when no baker alias", () => {
		render(<Header />);

		expect(screen.getByText("Dough")).toBeInTheDocument();
	});

	it("renders baker alias as title", () => {
		render(
			<Header
				bakerAlias="My Baker"
				bakerAddress="tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"
			/>,
		);

		expect(screen.getByText("My Baker")).toBeInTheDocument();
	});

	it("renders truncated baker address", () => {
		render(
			<Header
				bakerAlias="My Baker"
				bakerAddress="tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"
			/>,
		);

		expect(screen.getByText("tz1VSUr8...jcjb")).toBeInTheDocument();
	});

	it("does not render address if not provided", () => {
		render(<Header bakerAlias="My Baker" />);

		expect(screen.queryByText(/tz1/)).not.toBeInTheDocument();
	});

	it("renders loading badge when no node health", () => {
		render(<Header />);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("renders synced badge when node is synced", () => {
		render(<Header nodeHealth={mockNodeHealth} />);

		expect(screen.getByText("Synced")).toBeInTheDocument();
	});

	it("renders syncing badge when node is syncing", () => {
		const syncingHealth: NodeHealth = {
			...mockNodeHealth,
			syncState: "syncing",
		};

		render(<Header nodeHealth={syncingHealth} />);

		expect(screen.getByText("Syncing")).toBeInTheDocument();
	});

	it("renders stale badge when node is stale", () => {
		const staleHealth: NodeHealth = {
			...mockNodeHealth,
			syncState: "stale",
		};

		render(<Header nodeHealth={staleHealth} />);

		expect(screen.getByText("Stale")).toBeInTheDocument();
	});

	it("renders settings button", () => {
		render(<Header />);

		// Settings button should be present
		const settingsButton = screen.getByRole("button", { name: /settings/i });
		expect(settingsButton).toBeInTheDocument();
	});

	it("renders cookie icon (logo)", () => {
		render(<Header />);

		// The logo link to home should exist
		const homeLink = screen.getAllByRole("link")[0];
		expect(homeLink).toHaveAttribute("href", "/");
	});

	it("renders baker domain when provided", () => {
		render(<Header bakerDomain="mybaker.tez" />);

		expect(screen.getByText("mybaker.tez")).toBeInTheDocument();
	});

	it("renders domain instead of address when both provided", () => {
		render(
			<Header
				bakerAddress="tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"
				bakerDomain="mybaker.tez"
			/>,
		);

		expect(screen.getByText("mybaker.tez")).toBeInTheDocument();
		expect(screen.queryByText("tz1VSUr8...jcjb")).not.toBeInTheDocument();
	});

	it("renders alerts button", () => {
		render(<Header />);

		const alertsButton = screen.getByRole("button", { name: /alerts/i });
		expect(alertsButton).toBeInTheDocument();
	});

	it("renders alert badge count when there are unread alerts", () => {
		const mockAlerts: AlertsResponse = {
			alerts: [
				{
					id: "1",
					type: "missed_bake",
					severity: "error",
					message: "Missed a bake!",
					timestamp: new Date().toISOString(),
				},
			],
			unreadCount: 3,
		};

		render(<Header alerts={mockAlerts} />);

		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("does not render badge when no unread alerts", () => {
		const mockAlerts: AlertsResponse = {
			alerts: [],
			unreadCount: 0,
		};

		render(<Header alerts={mockAlerts} />);

		// Should not have a badge number
		expect(screen.queryByText("0")).not.toBeInTheDocument();
	});
});
