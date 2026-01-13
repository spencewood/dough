/** API configuration from environment variables */
export const config = {
	/** Octez Node RPC URL */
	get nodeUrl() {
		return process.env.OCTEZ_NODE_URL || "http://localhost:8732";
	},

	/** DAL Node RPC URL */
	get dalNodeUrl() {
		return process.env.DAL_NODE_URL || "http://localhost:10732";
	},

	/** Baker/Delegate address */
	get bakerAddress() {
		return process.env.BAKER_ADDRESS || "";
	},

	/** Baker alias for display */
	get bakerAlias() {
		return process.env.BAKER_ALIAS;
	},

	/** TzKT API URL for enriched data */
	get tzktApiUrl() {
		return process.env.TZKT_API_URL || "https://api.tzkt.io";
	},
};
