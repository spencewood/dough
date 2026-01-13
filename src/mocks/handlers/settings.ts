import { HttpResponse, http } from "msw";
import type { Settings, SettingsInput } from "@/lib/db";

// Pre-populated settings for dev mode
let mockSettings: Settings | null = {
	id: 1,
	nodeUrl: "http://localhost:8732",
	dalNodeUrl: "http://localhost:10732",
	bakerAddress: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
	bakerAlias: "My Baker",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const settingsHandlers = [
	// GET /api/settings
	http.get("/api/settings", () => {
		return HttpResponse.json(mockSettings);
	}),

	// POST /api/settings
	http.post("/api/settings", async ({ request }) => {
		const input = (await request.json()) as SettingsInput;

		const now = new Date().toISOString();
		mockSettings = {
			id: 1,
			nodeUrl: input.nodeUrl,
			dalNodeUrl: input.dalNodeUrl ?? null,
			bakerAddress: input.bakerAddress,
			bakerAlias: input.bakerAlias ?? null,
			createdAt: mockSettings?.createdAt ?? now,
			updatedAt: now,
		};

		return HttpResponse.json(mockSettings);
	}),
];
