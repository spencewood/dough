import { defineEventHandler } from "nitro/h3";
import { config } from "@/lib/api/config";
import { getAlerts } from "@/lib/api/octez";

export default defineEventHandler(async () => {
	// Return empty alerts if not configured
	if (!config.isConfigured) {
		return { alerts: [], unreadCount: 0 };
	}

	try {
		const alertsResponse = await getAlerts();
		return alertsResponse;
	} catch (error) {
		console.error("Failed to get alerts:", error);
		throw createError({
			statusCode: 502,
			message:
				error instanceof Error ? error.message : "Failed to fetch alerts",
		});
	}
});

function createError(opts: { statusCode: number; message: string }) {
	const error = new Error(opts.message) as Error & { statusCode: number };
	error.statusCode = opts.statusCode;
	return error;
}
