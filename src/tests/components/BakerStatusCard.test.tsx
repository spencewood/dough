import { render, screen } from "@/tests/test-utils";
import { describe, expect, it } from "vitest";

import { BakerStatusCard } from "@/components/dashboard/BakerStatusCard";
import type { BakerStatus } from "@/lib/types";

const mockBakerStatus: BakerStatus = {
	address: "tz1TestBakerAddressXXXXXXXXXXXXXXXXXXX",
	alias: "My Baker",
	fullBalance: "1500000000000", // 1.5M XTZ
	frozenDeposits: "500000000000", // 500K XTZ
	stakingBalance: "2000000000000", // 2M XTZ
	delegatedBalance: "1000000000000", // 1M XTZ
	delegatorCount: 150,
	gracePeriod: 5,
	isDeactivated: false,
	stakingCapacityUsed: 75.5,
	hasPendingDenunciations: false,
};

describe("BakerStatusCard", () => {
	it("renders loading state", () => {
		render(<BakerStatusCard isLoading />);

		expect(screen.getByText("Baker Status")).toBeInTheDocument();
		expect(screen.getByText("Delegate information")).toBeInTheDocument();
	});

	it("renders empty state when no data", () => {
		render(<BakerStatusCard />);

		expect(screen.getByText("No data available")).toBeInTheDocument();
	});

	it("renders baker alias in description", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		expect(screen.getByText("My Baker...")).toBeInTheDocument();
	});

	it("renders truncated address when no alias", () => {
		const noAliasStatus: BakerStatus = {
			...mockBakerStatus,
			alias: undefined,
		};

		render(<BakerStatusCard data={noAliasStatus} />);

		expect(screen.getByText("tz1abc12...")).toBeInTheDocument();
	});

	it("renders active status badge", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		expect(screen.getByText("Active")).toBeInTheDocument();
	});

	it("renders deactivated status badge", () => {
		const deactivatedStatus: BakerStatus = {
			...mockBakerStatus,
			isDeactivated: true,
		};

		render(<BakerStatusCard data={deactivatedStatus} />);

		expect(screen.getByText("Deactivated")).toBeInTheDocument();
	});

	it("formats large balances with M suffix", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		// 1.5M XTZ for full balance
		expect(screen.getByText("1.50M XTZ")).toBeInTheDocument();
		// 2M XTZ for staking balance
		expect(screen.getByText("2.00M XTZ")).toBeInTheDocument();
	});

	it("formats medium balances with K suffix", () => {
		const mediumBalance: BakerStatus = {
			...mockBakerStatus,
			fullBalance: "50000000000", // 50K XTZ
		};

		render(<BakerStatusCard data={mediumBalance} />);

		expect(screen.getByText("50.00K XTZ")).toBeInTheDocument();
	});

	it("formats small balances without suffix", () => {
		const smallBalance: BakerStatus = {
			...mockBakerStatus,
			fullBalance: "500000000", // 500 XTZ
		};

		render(<BakerStatusCard data={smallBalance} />);

		expect(screen.getByText("500.00 XTZ")).toBeInTheDocument();
	});

	it("renders delegator count", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		expect(screen.getByText("150")).toBeInTheDocument();
	});

	it("renders grace period", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		expect(screen.getByText("5 cycles")).toBeInTheDocument();
	});

	it("renders capacity used percentage", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		expect(screen.getByText("75.5%")).toBeInTheDocument();
	});

	it("caps capacity bar at 100%", () => {
		const overCapacity: BakerStatus = {
			...mockBakerStatus,
			stakingCapacityUsed: 120,
		};

		render(<BakerStatusCard data={overCapacity} />);

		// The percentage text should still show actual value
		expect(screen.getByText("120.0%")).toBeInTheDocument();
	});

	it("renders zero delegators correctly", () => {
		const zeroDelegators: BakerStatus = {
			...mockBakerStatus,
			delegatorCount: 0,
		};

		render(<BakerStatusCard data={zeroDelegators} />);

		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("renders zero balance correctly", () => {
		const zeroBalance: BakerStatus = {
			...mockBakerStatus,
			fullBalance: "0",
		};

		render(<BakerStatusCard data={zeroBalance} />);

		expect(screen.getByText("0.00 XTZ")).toBeInTheDocument();
	});

	it("does not show denunciation warning when none pending", () => {
		render(<BakerStatusCard data={mockBakerStatus} />);

		expect(
			screen.queryByText(/pending denunciations/i),
		).not.toBeInTheDocument();
	});

	it("shows denunciation warning when pending", () => {
		const withDenunciations: BakerStatus = {
			...mockBakerStatus,
			hasPendingDenunciations: true,
		};

		render(<BakerStatusCard data={withDenunciations} />);

		expect(
			screen.getByText(/pending denunciations/i),
		).toBeInTheDocument();
	});
});
