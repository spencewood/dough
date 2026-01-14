import { describe, expect, it } from "vitest";
import { DalStatusCard } from "@/components/dashboard/DalStatusCard";
import type { DALNodeStatus } from "@/lib/types";
import { render, screen } from "@/tests/test-utils";

const mockDalStatus: DALNodeStatus = {
	isConnected: true,
	peerCount: 8,
	subscribedSlots: [0, 1, 2, 3],
};

describe("DalStatusCard", () => {
	it("renders loading state", () => {
		render(<DalStatusCard isLoading />);

		expect(screen.getByText("DAL Node")).toBeInTheDocument();
		expect(
			screen.getByText("Data Availability Layer status"),
		).toBeInTheDocument();
	});

	it("renders empty state when no data", () => {
		render(<DalStatusCard />);

		expect(screen.getByText("No DAL node configured")).toBeInTheDocument();
	});

	it("renders connected status", () => {
		render(<DalStatusCard data={mockDalStatus} />);

		expect(screen.getByText("DAL Node")).toBeInTheDocument();
		expect(screen.getByText("Connected")).toBeInTheDocument();
		expect(screen.getByText("8")).toBeInTheDocument(); // peer count
	});

	it("renders disconnected status", () => {
		const disconnectedStatus: DALNodeStatus = {
			...mockDalStatus,
			isConnected: false,
		};

		render(<DalStatusCard data={disconnectedStatus} />);

		expect(screen.getByText("Disconnected")).toBeInTheDocument();
	});

	it("renders subscribed slots", () => {
		render(<DalStatusCard data={mockDalStatus} />);

		expect(screen.getByText("0")).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("renders empty slots message when none subscribed", () => {
		const noSlotsStatus: DALNodeStatus = {
			...mockDalStatus,
			subscribedSlots: [],
		};

		render(<DalStatusCard data={noSlotsStatus} />);

		expect(screen.getByText("None")).toBeInTheDocument();
	});

	it("truncates slots when more than 6", () => {
		const manySlots: DALNodeStatus = {
			...mockDalStatus,
			subscribedSlots: [0, 1, 2, 3, 4, 5, 6, 7, 8],
		};

		render(<DalStatusCard data={manySlots} />);

		// Should show first 6 and a +3 badge
		expect(screen.getByText("+3")).toBeInTheDocument();
	});
});
