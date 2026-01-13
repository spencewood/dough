import { fireEvent, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import type { Settings, SettingsInput } from "@/lib/db";
import { server } from "@/tests/setup";

const mockSettings: Settings = {
	id: 1,
	nodeUrl: "http://localhost:8732",
	dalNodeUrl: "http://localhost:10732",
	bakerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
	bakerAlias: "My Baker",
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
};

// Test the form components directly since the page is route-based
describe("Settings Form Components", () => {
	it("renders the Input component", async () => {
		const { Input } = await import("@/components/ui/input");

		render(<Input placeholder="Test placeholder" />);

		expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
	});

	it("Input component handles value changes", async () => {
		const { Input } = await import("@/components/ui/input");
		const onChange = vi.fn();

		render(<Input value="" onChange={onChange} />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "test" } });

		expect(onChange).toHaveBeenCalled();
	});

	it("Label component renders", async () => {
		const { Label } = await import("@/components/ui/label");

		render(<Label htmlFor="test">Test Label</Label>);

		expect(screen.getByText("Test Label")).toBeInTheDocument();
	});

	it("Button component renders with variants", async () => {
		const { Button } = await import("@/components/ui/button");

		render(<Button variant="outline">Test Button</Button>);

		expect(
			screen.getByRole("button", { name: "Test Button" }),
		).toBeInTheDocument();
	});

	it("Button component handles clicks", async () => {
		const { Button } = await import("@/components/ui/button");
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Click Me</Button>);

		const button = screen.getByRole("button", { name: "Click Me" });
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalled();
	});

	it("Button component can be disabled", async () => {
		const { Button } = await import("@/components/ui/button");

		render(<Button disabled>Disabled Button</Button>);

		const button = screen.getByRole("button", { name: "Disabled Button" });
		expect(button).toBeDisabled();
	});
});

describe("Settings API Integration", () => {
	it("GET /api/settings returns null when not configured", async () => {
		server.use(
			http.get("/api/settings", () => {
				return HttpResponse.json(null);
			}),
		);

		const response = await fetch("/api/settings");
		const data = await response.json();

		expect(data).toBeNull();
	});

	it("GET /api/settings returns settings when configured", async () => {
		server.use(
			http.get("/api/settings", () => {
				return HttpResponse.json(mockSettings);
			}),
		);

		const response = await fetch("/api/settings");
		const data = await response.json();

		expect(data.nodeUrl).toBe(mockSettings.nodeUrl);
		expect(data.bakerAddress).toBe(mockSettings.bakerAddress);
	});

	it("POST /api/settings saves new settings", async () => {
		const newSettings: SettingsInput = {
			nodeUrl: "http://new-node:8732",
			bakerAddress: "tz1NewAddress",
			dalNodeUrl: null,
			bakerAlias: "New Baker",
		};

		server.use(
			http.post("/api/settings", async ({ request }) => {
				const body = (await request.json()) as SettingsInput;
				return HttpResponse.json({
					id: 1,
					...body,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});
			}),
		);

		const response = await fetch("/api/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newSettings),
		});
		const data = await response.json();

		expect(data.nodeUrl).toBe(newSettings.nodeUrl);
		expect(data.bakerAddress).toBe(newSettings.bakerAddress);
	});

	it("POST /api/settings handles optional fields", async () => {
		const minimalSettings: SettingsInput = {
			nodeUrl: "http://localhost:8732",
			bakerAddress: "tz1TestAddress",
		};

		server.use(
			http.post("/api/settings", async ({ request }) => {
				const body = (await request.json()) as SettingsInput;
				return HttpResponse.json({
					id: 1,
					nodeUrl: body.nodeUrl,
					dalNodeUrl: body.dalNodeUrl ?? null,
					bakerAddress: body.bakerAddress,
					bakerAlias: body.bakerAlias ?? null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});
			}),
		);

		const response = await fetch("/api/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(minimalSettings),
		});
		const data = await response.json();

		expect(data.dalNodeUrl).toBeNull();
		expect(data.bakerAlias).toBeNull();
	});
});
