import { render, screen } from "@/tests/test-utils";
import { describe, expect, it } from "vitest";

import { ParticipationCard } from "@/components/dashboard/ParticipationCard";
import type { BakerParticipation } from "@/lib/types";

const mockParticipation: BakerParticipation = {
	expectedCycleActivity: 1000,
	minimalCycleActivity: 800,
	missedSlots: 5,
	missedLevels: 2,
	remainingAllowedMissedSlots: 195,
	expectedAttestingRewards: "2500000000", // 2500 XTZ
};

describe("ParticipationCard", () => {
	it("renders loading state", () => {
		render(<ParticipationCard isLoading />);

		expect(screen.getByText("Participation")).toBeInTheDocument();
		expect(
			screen.getByText("Current cycle attestation stats"),
		).toBeInTheDocument();
	});

	it("renders empty state when no data", () => {
		render(<ParticipationCard />);

		expect(screen.getByText("No data available")).toBeInTheDocument();
	});

	it("renders participation rate", () => {
		render(<ParticipationCard data={mockParticipation} />);

		// 995/1000 = 99.5%
		expect(screen.getByText("99.5%")).toBeInTheDocument();
	});

	it("renders missed slots count", () => {
		render(<ParticipationCard data={mockParticipation} />);

		expect(screen.getByText("Missed Slots")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("renders missed levels count", () => {
		render(<ParticipationCard data={mockParticipation} />);

		expect(screen.getByText("Missed Levels")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("renders remaining allowed misses", () => {
		render(<ParticipationCard data={mockParticipation} />);

		expect(screen.getByText("Allowed Misses Left")).toBeInTheDocument();
		expect(screen.getByText("195")).toBeInTheDocument();
	});

	it("renders expected activity", () => {
		render(<ParticipationCard data={mockParticipation} />);

		expect(screen.getByText("Expected Activity")).toBeInTheDocument();
		expect(screen.getByText("1000 slots")).toBeInTheDocument();
	});

	it("renders expected rewards", () => {
		render(<ParticipationCard data={mockParticipation} />);

		expect(screen.getByText("Expected Rewards")).toBeInTheDocument();
		expect(screen.getByText("2.5K XTZ")).toBeInTheDocument();
	});

	it("shows Perfect badge when no missed slots", () => {
		const perfectParticipation: BakerParticipation = {
			...mockParticipation,
			missedSlots: 0,
			missedLevels: 0,
		};

		render(<ParticipationCard data={perfectParticipation} />);

		expect(screen.getByText("Perfect")).toBeInTheDocument();
	});

	it("shows At Risk badge when remaining misses <= 10", () => {
		const atRiskParticipation: BakerParticipation = {
			...mockParticipation,
			remainingAllowedMissedSlots: 8,
		};

		render(<ParticipationCard data={atRiskParticipation} />);

		expect(screen.getByText("At Risk")).toBeInTheDocument();
	});

	it("shows Critical badge when remaining misses <= 3", () => {
		const criticalParticipation: BakerParticipation = {
			...mockParticipation,
			remainingAllowedMissedSlots: 2,
		};

		render(<ParticipationCard data={criticalParticipation} />);

		expect(screen.getByText("Critical")).toBeInTheDocument();
	});

	it("shows warning banner when at risk", () => {
		const atRiskParticipation: BakerParticipation = {
			...mockParticipation,
			remainingAllowedMissedSlots: 5,
		};

		render(<ParticipationCard data={atRiskParticipation} />);

		expect(
			screen.getByText(/only 5 missed slots remaining/i),
		).toBeInTheDocument();
	});

	it("does not show warning banner when healthy", () => {
		render(<ParticipationCard data={mockParticipation} />);

		expect(
			screen.queryByText(/missed slots remaining/i),
		).not.toBeInTheDocument();
	});

	it("handles zero expected activity", () => {
		const zeroActivity: BakerParticipation = {
			...mockParticipation,
			expectedCycleActivity: 0,
		};

		render(<ParticipationCard data={zeroActivity} />);

		// Should show 100% when no activity expected
		expect(screen.getByText("100.0%")).toBeInTheDocument();
	});
});
