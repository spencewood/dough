import { getSettings } from "@/lib/db";

/** API configuration from database settings with env fallbacks */
export const config = {
	/** Octez Node RPC URL */
	get nodeUrl(): string {
		const settings = getSettings();
		return (
			settings?.nodeUrl || process.env.OCTEZ_NODE_URL || "http://localhost:8732"
		);
	},

	/** DAL Node RPC URL */
	get dalNodeUrl(): string {
		const settings = getSettings();
		return (
			settings?.dalNodeUrl ||
			process.env.DAL_NODE_URL ||
			"http://localhost:10732"
		);
	},

	/** Baker/Delegate address */
	get bakerAddress(): string {
		const settings = getSettings();
		return settings?.bakerAddress || process.env.BAKER_ADDRESS || "";
	},

	/** Baker alias for display */
	get bakerAlias(): string | undefined {
		const settings = getSettings();
		return settings?.bakerAlias || process.env.BAKER_ALIAS;
	},

	/** TzKT API URL for enriched data */
	get tzktApiUrl(): string {
		return process.env.TZKT_API_URL || "https://api.tzkt.io";
	},

	/** Check if the app is configured */
	get isConfigured(): boolean {
		const settings = getSettings();
		return (
			settings !== null &&
			settings.nodeUrl !== "" &&
			settings.bakerAddress !== ""
		);
	},
};
