import { describe, expect, it } from "vitest";
import { RightsCard } from "@/components/dashboard/RightsCard";
import type { AttestationRight, BakingRight } from "@/lib/types";
import { render, screen } from "@/tests/test-utils";

const mockBakingRights: BakingRight[] = [
	{
		level: 5432150,
		delegate: "tz1TestBaker",
		round: 0,
		estimatedTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
	},
	{
		level: 5432280,
		delegate: "tz1TestBaker",
		round: 1,
		estimatedTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
	},
];

const mockAttestationRights: AttestationRight[] = [
	{
		level: 5432101,
		delegate: "tz1TestBaker",
		firstSlot: 42,
		attestationPower: 5,
	},
	{
		level: 5432102,
		delegate: "tz1TestBaker",
		firstSlot: 128,
		attestationPower: 3,
	},
];

describe("RightsCard", () => {
	it("renders loading state", () => {
		render(<RightsCard isLoading />);

		expect(screen.getByText("Upcoming Rights")).toBeInTheDocument();
		expect(
			screen.getByText("Baking & attestation schedule"),
		).toBeInTheDocument();
	});

	it("renders baking rights", () => {
		render(<RightsCard bakingRights={mockBakingRights} />);

		expect(screen.getByText("Baking Rights")).toBeInTheDocument();
		expect(screen.getByText("5,432,150")).toBeInTheDocument();
		expect(screen.getByText("5,432,280")).toBeInTheDocument();
		expect(screen.getByText("R1")).toBeInTheDocument(); // Round badge for second right
	});

	it("renders attestation rights", () => {
		render(<RightsCard attestationRights={mockAttestationRights} />);

		expect(screen.getByText("Attestation Rights")).toBeInTheDocument();
		expect(screen.getByText("5,432,101")).toBeInTheDocument();
		expect(screen.getByText("Slot 42")).toBeInTheDocument();
		expect(screen.getByText("Power 5")).toBeInTheDocument();
	});

	it("renders empty state when no rights", () => {
		render(<RightsCard bakingRights={[]} attestationRights={[]} />);

		expect(screen.getByText("No upcoming baking rights")).toBeInTheDocument();
		expect(
			screen.getByText("No upcoming attestation rights"),
		).toBeInTheDocument();
	});

	it("renders both rights together", () => {
		render(
			<RightsCard
				bakingRights={mockBakingRights}
				attestationRights={mockAttestationRights}
			/>,
		);

		expect(screen.getByText("Baking Rights")).toBeInTheDocument();
		expect(screen.getByText("Attestation Rights")).toBeInTheDocument();
		expect(screen.getByText("5,432,150")).toBeInTheDocument();
		expect(screen.getByText("5,432,101")).toBeInTheDocument();
	});
});
