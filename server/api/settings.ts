import { defineEventHandler, readBody } from "nitro/h3";
import type { SettingsInput } from "@/lib/db";
import { getSettings, saveSettings } from "@/lib/db";

export default defineEventHandler(async (event) => {
	const method = event.method;

	if (method === "GET") {
		try {
			const settings = getSettings();
			return settings;
		} catch (error) {
			console.error("Failed to get settings:", error);
			throw createError({
				statusCode: 500,
				message: "Failed to get settings",
			});
		}
	}

	if (method === "POST") {
		try {
			const input = await readBody<SettingsInput>(event);

			// Validate required fields
			if (!input || !input.nodeUrl || !input.bakerAddress) {
				throw createError({
					statusCode: 400,
					message: "nodeUrl and bakerAddress are required",
				});
			}

			const settings = saveSettings({
				nodeUrl: input.nodeUrl,
				dalNodeUrl: input.dalNodeUrl,
				bakerAddress: input.bakerAddress,
				bakerAlias: input.bakerAlias,
			});
			return settings;
		} catch (error) {
			if ((error as { statusCode?: number }).statusCode) {
				throw error;
			}
			console.error("Failed to save settings:", error);
			throw createError({
				statusCode: 500,
				message: "Failed to save settings",
			});
		}
	}

	throw createError({
		statusCode: 405,
		message: "Method not allowed",
	});
});

function createError(opts: { statusCode: number; message: string }) {
	const error = new Error(opts.message) as Error & { statusCode: number };
	error.statusCode = opts.statusCode;
	return error;
}
