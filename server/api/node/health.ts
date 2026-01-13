import { defineEventHandler } from "nitro/h3";
import { config } from "@/lib/api/config";
import { getNodeHealth } from "@/lib/api/octez";

export default defineEventHandler(async () => {
	if (!config.isConfigured) {
		throw createError({
			statusCode: 503,
			message: "Not configured",
		});
	}

	try {
		const health = await getNodeHealth();
		return health;
	} catch (error) {
		console.error("Failed to get node health:", error);
		throw createError({
			statusCode: 502,
			message:
				error instanceof Error ? error.message : "Failed to fetch node health",
		});
	}
});

function createError(opts: { statusCode: number; message: string }) {
	const error = new Error(opts.message) as Error & { statusCode: number };
	error.statusCode = opts.statusCode;
	return error;
}
