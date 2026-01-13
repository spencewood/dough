import { describe, expect, it } from "vitest";

import { Header } from "@/components/dashboard/Header";
import type { NodeHealth } from "@/lib/types";
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

	it("renders head level when node health available", () => {
		render(<Header nodeHealth={mockNodeHealth} />);

		expect(screen.getByText("Level 5,432,100")).toBeInTheDocument();
	});

	it("renders chain ID badge", () => {
		render(<Header nodeHealth={mockNodeHealth} />);

		expect(screen.getByText("NetXdQprcVkpaWU")).toBeInTheDocument();
	});

	it("renders default chain ID when not available", () => {
		const noChainId: NodeHealth = {
			...mockNodeHealth,
			chainId: undefined as unknown as string,
		};

		render(<Header nodeHealth={noChainId} />);

		expect(screen.getByText("mainnet")).toBeInTheDocument();
	});

	it("renders settings icon link", () => {
		render(<Header />);

		// Settings link should be present
		const settingsLink = screen.getByRole("link", { name: "" });
		expect(settingsLink).toHaveAttribute("href", "/settings");
	});

	it("renders cookie icon (logo)", () => {
		render(<Header />);

		// The logo link to home should exist
		const homeLink = screen.getAllByRole("link")[0];
		expect(homeLink).toHaveAttribute("href", "/");
	});
});
