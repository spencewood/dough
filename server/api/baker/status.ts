import { defineEventHandler } from "nitro/h3";
import { config } from "@/lib/api/config";
import { getBakerStatus } from "@/lib/api/octez";

export default defineEventHandler(async () => {
	if (!config.isConfigured) {
		throw createError({
			statusCode: 503,
			message: "Not configured",
		});
	}

	try {
		const status = await getBakerStatus();
		return status;
	} catch (error) {
		console.error("Failed to get baker status:", error);
		throw createError({
			statusCode: 502,
			message:
				error instanceof Error ? error.message : "Failed to fetch baker status",
		});
	}
});

function createError(opts: { statusCode: number; message: string }) {
	const error = new Error(opts.message) as Error & { statusCode: number };
	error.statusCode = opts.statusCode;
	return error;
}
