import { defineEventHandler, getQuery } from "nitro/h3";
import { config } from "@/lib/api/config";
import { getRewardsHistory } from "@/lib/api/octez";

export default defineEventHandler(async (event) => {
	if (!config.isConfigured) {
		throw createError({
			statusCode: 503,
			message: "Not configured",
		});
	}

	const query = getQuery(event);
	const cycles = Number.parseInt(String(query.cycles || "10"), 10);

	try {
		const rewards = await getRewardsHistory(cycles);
		return rewards;
	} catch (error) {
		console.error("Failed to get rewards history:", error);
		throw createError({
			statusCode: 502,
			message:
				error instanceof Error
					? error.message
					: "Failed to fetch rewards history",
		});
	}
});

function createError(opts: { statusCode: number; message: string }) {
	const error = new Error(opts.message) as Error & { statusCode: number };
	error.statusCode = opts.statusCode;
	return error;
}
