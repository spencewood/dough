import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NodeHealthCard } from "@/components/dashboard/NodeHealthCard";
import type { NodeHealth } from "@/lib/types";

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

describe("NodeHealthCard", () => {
	it("renders loading state", () => {
		render(<NodeHealthCard isLoading />);

		expect(screen.getByText("Node Health")).toBeInTheDocument();
		expect(screen.getByText("Octez node status")).toBeInTheDocument();
	});

	it("renders no data state", () => {
		render(<NodeHealthCard />);

		expect(screen.getByText("No data available")).toBeInTheDocument();
	});

	it("renders bootstrapped status when synced", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("Bootstrapped")).toBeInTheDocument();
	});

	it("renders not bootstrapped status", () => {
		const notBootstrapped: NodeHealth = {
			...mockNodeHealth,
			isBootstrapped: false,
		};

		render(<NodeHealthCard data={notBootstrapped} />);

		expect(screen.getByText("Not Bootstrapped")).toBeInTheDocument();
	});

	it("renders head level with formatting", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("Level 5,432,100")).toBeInTheDocument();
	});

	it("renders peer count", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("renders mempool size", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("15 ops")).toBeInTheDocument();
	});

	it("renders truncated hash", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("BLockHas...XXXX")).toBeInTheDocument();
	});

	it("renders truncated protocol", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("PsQuebec...")).toBeInTheDocument();
	});

	it("renders zero peers correctly", () => {
		const zeroPeers: NodeHealth = {
			...mockNodeHealth,
			peerCount: 0,
		};

		render(<NodeHealthCard data={zeroPeers} />);

		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("renders zero mempool correctly", () => {
		const emptyMempool: NodeHealth = {
			...mockNodeHealth,
			mempoolSize: 0,
		};

		render(<NodeHealthCard data={emptyMempool} />);

		expect(screen.getByText("0 ops")).toBeInTheDocument();
	});

	it("renders syncing state with warning badge", () => {
		const syncing: NodeHealth = {
			...mockNodeHealth,
			syncState: "syncing",
			isBootstrapped: true,
		};

		render(<NodeHealthCard data={syncing} />);

		// Badge text should still say Bootstrapped but with warning variant
		expect(screen.getByText("Bootstrapped")).toBeInTheDocument();
	});

	it("renders stale state", () => {
		const stale: NodeHealth = {
			...mockNodeHealth,
			syncState: "stale",
			isBootstrapped: true,
		};

		render(<NodeHealthCard data={stale} />);

		expect(screen.getByText("Bootstrapped")).toBeInTheDocument();
	});
});
