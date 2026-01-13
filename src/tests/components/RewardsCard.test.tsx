import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RewardsCard } from "@/components/dashboard/RewardsCard";
import type { RewardsHistory } from "@/lib/types";

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
	ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="responsive-container">{children}</div>
	),
	BarChart: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="bar-chart">{children}</div>
	),
	Bar: () => <div data-testid="bar" />,
	XAxis: () => <div data-testid="x-axis" />,
	YAxis: () => <div data-testid="y-axis" />,
	Tooltip: () => <div data-testid="tooltip" />,
	CartesianGrid: () => <div data-testid="cartesian-grid" />,
	Legend: () => <div data-testid="legend" />,
	Cell: () => <div data-testid="cell" />,
}));

const mockRewardsHistory: RewardsHistory = {
	delegate: "tz1TestBaker",
	cycles: [
		{
			cycle: 750,
			bakingRewards: "6000000000", // 6 XTZ
			attestationRewards: "9000000000", // 9 XTZ
			totalRewards: "15000000000", // 15 XTZ
			missedBakingRewards: "0",
			missedAttestationRewards: "0",
			ownStakingBalance: "1000000000000",
			externalStakingBalance: "4000000000000",
		},
		{
			cycle: 749,
			bakingRewards: "5500000000",
			attestationRewards: "8500000000",
			totalRewards: "14000000000",
			missedBakingRewards: "500000000", // 0.5 XTZ missed
			missedAttestationRewards: "0",
			ownStakingBalance: "1000000000000",
			externalStakingBalance: "4000000000000",
		},
	],
	totalEarned: "29000000000", // 29 XTZ
	totalMissed: "500000000", // 0.5 XTZ
};

describe("RewardsCard", () => {
	it("renders loading state", () => {
		render(<RewardsCard isLoading />);

		expect(screen.getByText("Rewards History")).toBeInTheDocument();
		expect(screen.getByText("Earnings by cycle")).toBeInTheDocument();
	});

	it("renders empty state when no data", () => {
		render(<RewardsCard />);

		expect(screen.getByText("No rewards data available")).toBeInTheDocument();
	});

	it("renders empty state when cycles array is empty", () => {
		render(
			<RewardsCard
				data={{
					delegate: "tz1TestBaker",
					cycles: [],
					totalEarned: "0",
					totalMissed: "0",
				}}
			/>,
		);

		expect(screen.getByText("No rewards data available")).toBeInTheDocument();
	});

	it("renders rewards data with chart", () => {
		render(<RewardsCard data={mockRewardsHistory} />);

		expect(screen.getByText("Rewards History")).toBeInTheDocument();
		expect(
			screen.getByText("Earnings by cycle (last 10 cycles)"),
		).toBeInTheDocument();
		expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
	});

	it("displays total earned", () => {
		render(<RewardsCard data={mockRewardsHistory} />);

		expect(screen.getByText("Total Earned:")).toBeInTheDocument();
		// 29000000000 mutez = 29,000 XTZ
		expect(screen.getByText("29,000 XTZ")).toBeInTheDocument();
	});

	it("displays total missed when greater than zero", () => {
		render(<RewardsCard data={mockRewardsHistory} />);

		expect(screen.getByText("Total Missed:")).toBeInTheDocument();
		// 500000000 mutez = 500 XTZ
		expect(screen.getByText("500 XTZ")).toBeInTheDocument();
	});

	it("hides total missed when zero", () => {
		const dataWithNoMissed: RewardsHistory = {
			...mockRewardsHistory,
			totalMissed: "0",
		};

		render(<RewardsCard data={dataWithNoMissed} />);

		expect(screen.queryByText("Total Missed:")).not.toBeInTheDocument();
	});

	it("displays legend items", () => {
		render(<RewardsCard data={mockRewardsHistory} />);

		expect(screen.getByText("Baking")).toBeInTheDocument();
		expect(screen.getByText("Attestation")).toBeInTheDocument();
	});
});
