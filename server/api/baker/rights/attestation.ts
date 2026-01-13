import { defineEventHandler } from "nitro/h3";
import { config } from "@/lib/api/config";
import { getAttestationRights } from "@/lib/api/octez";

export default defineEventHandler(async () => {
	if (!config.isConfigured) {
		throw createError({
			statusCode: 503,
			message: "Not configured",
		});
	}

	try {
		const rights = await getAttestationRights();
		return rights;
	} catch (error) {
		console.error("Failed to get attestation rights:", error);
		throw createError({
			statusCode: 502,
			message:
				error instanceof Error
					? error.message
					: "Failed to fetch attestation rights",
		});
	}
});

function createError(opts: { statusCode: number; message: string }) {
	const error = new Error(opts.message) as Error & { statusCode: number };
	error.statusCode = opts.statusCode;
	return error;
}
