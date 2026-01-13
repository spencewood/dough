import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NodeHealthCard } from "@/components/dashboard/NodeHealthCard";
import { mockNodeHealth } from "@/mocks/data";

describe("NodeHealthCard", () => {
	it("renders loading state", () => {
		render(<NodeHealthCard isLoading />);

		expect(screen.getByText("Node Health")).toBeInTheDocument();
	});

	it("renders node health data", () => {
		render(<NodeHealthCard data={mockNodeHealth} />);

		expect(screen.getByText("Node Health")).toBeInTheDocument();
		expect(screen.getByText("Bootstrapped")).toBeInTheDocument();
		expect(screen.getByText("42")).toBeInTheDocument(); // peer count
	});

	it("renders no data state", () => {
		render(<NodeHealthCard />);

		expect(screen.getByText("No data available")).toBeInTheDocument();
	});
});
