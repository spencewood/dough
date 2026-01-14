import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	CardErrorBoundary,
	ErrorBoundary,
	ErrorFallback,
} from "@/components/ui/error-boundary";

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error("Test error message");
	}
	return <div>No error</div>;
}

describe("ErrorBoundary", () => {
	beforeEach(() => {
		// Suppress console.error for cleaner test output
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("renders children when no error occurs", () => {
		render(
			<ErrorBoundary>
				<div>Child content</div>
			</ErrorBoundary>,
		);

		expect(screen.getByText("Child content")).toBeInTheDocument();
	});

	it("renders error fallback when error occurs", () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(screen.getByText("Test error message")).toBeInTheDocument();
	});

	it("renders custom fallback when provided", () => {
		render(
			<ErrorBoundary fallback={<div>Custom fallback</div>}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Custom fallback")).toBeInTheDocument();
	});

	it("renders custom title and description", () => {
		render(
			<ErrorBoundary title="Custom Title" description="Custom description text">
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Custom Title")).toBeInTheDocument();
		expect(screen.getByText("Custom description text")).toBeInTheDocument();
	});

	it("calls onReset when try again is clicked", () => {
		const onReset = vi.fn();

		render(
			<ErrorBoundary onReset={onReset}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		fireEvent.click(screen.getByRole("button", { name: /try again/i }));

		expect(onReset).toHaveBeenCalledTimes(1);
	});

	it("clears error state internally when try again is clicked", () => {
		const onReset = vi.fn();

		render(
			<ErrorBoundary onReset={onReset}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		// Error is displayed
		expect(screen.getByText("Test error message")).toBeInTheDocument();
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();

		// Click try again
		fireEvent.click(screen.getByRole("button", { name: /try again/i }));

		// onReset callback was invoked
		expect(onReset).toHaveBeenCalledTimes(1);
	});
});

describe("ErrorFallback", () => {
	it("renders default title and description", () => {
		render(<ErrorFallback />);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(
			screen.getByText("An error occurred while rendering this component."),
		).toBeInTheDocument();
	});

	it("renders error message when provided", () => {
		render(<ErrorFallback error={new Error("Specific error")} />);

		expect(screen.getByText("Specific error")).toBeInTheDocument();
	});

	it("renders custom title and description", () => {
		render(
			<ErrorFallback
				title="Custom Error"
				description="Something specific went wrong."
			/>,
		);

		expect(screen.getByText("Custom Error")).toBeInTheDocument();
		expect(
			screen.getByText("Something specific went wrong."),
		).toBeInTheDocument();
	});

	it("renders try again button when onReset is provided", () => {
		const onReset = vi.fn();
		render(<ErrorFallback onReset={onReset} />);

		expect(
			screen.getByRole("button", { name: /try again/i }),
		).toBeInTheDocument();
	});

	it("does not render try again button when onReset is not provided", () => {
		render(<ErrorFallback />);

		expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
	});

	it("calls onReset when try again is clicked", () => {
		const onReset = vi.fn();
		render(<ErrorFallback onReset={onReset} />);

		fireEvent.click(screen.getByRole("button", { name: /try again/i }));

		expect(onReset).toHaveBeenCalledTimes(1);
	});
});

describe("CardErrorBoundary", () => {
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("renders children when no error occurs", () => {
		render(
			<CardErrorBoundary cardTitle="Test Card">
				<div>Card content</div>
			</CardErrorBoundary>,
		);

		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("renders error with card title when error occurs", () => {
		render(
			<CardErrorBoundary cardTitle="Node Health">
				<ThrowError shouldThrow={true} />
			</CardErrorBoundary>,
		);

		expect(screen.getByText("Node Health Error")).toBeInTheDocument();
		expect(screen.getByText("Failed to load node health.")).toBeInTheDocument();
	});

	it("calls onRetry when provided and try again is clicked", () => {
		const onRetry = vi.fn();

		render(
			<CardErrorBoundary cardTitle="Test Card" onRetry={onRetry}>
				<ThrowError shouldThrow={true} />
			</CardErrorBoundary>,
		);

		fireEvent.click(screen.getByRole("button", { name: /try again/i }));

		expect(onRetry).toHaveBeenCalledTimes(1);
	});
});
